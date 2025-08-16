// /app/blogs/page.js
"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Calendar,
  Clock,
  Tag,
  ArrowRight,
  Eye,
  TrendingUp,
  Search,
} from "lucide-react";
import BlogLayout from "./BlogLayout";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  increment,
  onSnapshot,
} from "firebase/firestore";
import Link from "next/link";

const BlogPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [blogPosts, setBlogPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]); // Store all posts for debugging
  const [featuredPost, setFeaturedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState(["all"]);
  const [debugInfo, setDebugInfo] = useState("");

  // Fetch blog posts from Firebase with real-time updates
  useEffect(() => {
    console.log("Starting to fetch blog posts...");
    setDebugInfo("Fetching posts from Firebase...");

    // Use onSnapshot for real-time updates
    const q = query(collection(db, "blogPosts"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log("Snapshot received, processing posts...");
        const posts = [];
        const publishedPosts = [];
        const uniqueCategories = new Set(["all"]);

        snapshot.forEach((doc) => {
          const postData = {
            id: doc.id,
            ...doc.data(),
            // Ensure date is properly formatted
            date:
              doc.data().date ||
              (doc.data().createdAt
                ? new Date(
                    doc.data().createdAt.seconds * 1000
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Recent"),
          };

          console.log(
            "Post found:",
            postData.title,
            "Status:",
            postData.status
          );
          posts.push(postData);

          // Add to published posts if status is published
          if (postData.status === "published") {
            publishedPosts.push(postData);
          }

          if (postData.category) {
            uniqueCategories.add(postData.category);
          }
        });

        console.log(`Total posts found: ${posts.length}`);
        console.log(`Published posts: ${publishedPosts.length}`);
        setDebugInfo(
          `Found ${posts.length} total posts, ${publishedPosts.length} published`
        );

        // Store all posts for debugging
        setAllPosts(posts);

        // Set featured post (the one marked as featured or the latest published one)
        const featured =
          publishedPosts.find((post) => post.featured) || publishedPosts[0];
        if (featured) {
          console.log("Featured post:", featured.title);
          setFeaturedPost(featured);
        }

        // Set regular posts (excluding the featured one)
        setBlogPosts(publishedPosts.filter((post) => post.id !== featured?.id));

        // Update categories
        setCategories(Array.from(uniqueCategories));
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching blog posts:", error);
        setDebugInfo(`Error: ${error.message}`);
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Handle view count increment
  const handlePostClick = async (postId) => {
    try {
      const postRef = doc(db, "blogPosts", postId);
      await updateDoc(postRef, {
        views: increment(1),
      });
    } catch (error) {
      console.error("Error updating view count:", error);
    }
  };

  // Filter posts based on category and search term
  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory =
      selectedCategory === "all" || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.tags &&
        post.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ));
    return matchesCategory && matchesSearch;
  });

  // Default image if none provided
  const getPostImage = (post) => {
    if (post.image) return post.image;

    // Default images based on category
    const defaultImages = {
      "Festival Guides":
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop",
      "Shipping Guidelines":
        "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400&h=250&fit=crop",
      "Travel Tips":
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=250&fit=crop",
      "Safety & Security":
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=250&fit=crop",
      "Platform Updates":
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
      "Success Stories":
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop",
      "International Shipping":
        "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=400&h=250&fit=crop",
      "Customer Support":
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop",
    };

    return (
      defaultImages[post.category] ||
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop"
    );
  };

  // Loading state
  if (loading) {
    return (
      <BlogLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading blog posts...</p>
            <p className="text-sm text-gray-500 mt-2">{debugInfo}</p>
          </div>
        </div>
      </BlogLayout>
    );
  }

  // Debug Panel (only show in development)
  const showDebugPanel =
    process.env.NODE_ENV === "development" || allPosts.length > 0;

  return (
    <BlogLayout>
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search blog posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>

      {/* No posts state */}
      {!featuredPost && blogPosts.length === 0 && allPosts.length === 0 && (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No Blog Posts Yet
            </h2>
            <p className="text-gray-600">
              Check back soon for exciting content!
            </p>
          </div>
        </div>
      )}

      {/* No published posts but have drafts */}
      {!featuredPost && blogPosts.length === 0 && allPosts.length > 0 && (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No Published Posts
            </h2>
            <p className="text-gray-600">
              There are {allPosts.length} draft posts waiting to be published.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Posts need to be published from the support dashboard to appear
              here.
            </p>
          </div>
        </div>
      )}

      {/* Featured Post */}
      {featuredPost && !searchTerm && (
        <Link href={`/blogs/${featuredPost.slug || featuredPost.id}`}>
          <div
            className="bg-gradient-to-br from-white to-blue-50/30 rounded-lg sm:rounded-xl shadow-md border border-blue-100 overflow-hidden mb-8 sm:mb-12 hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => handlePostClick(featuredPost.id)}
          >
            <div className="lg:flex">
              <div className="lg:w-1/2 relative">
                <Image
                  src={getPostImage(featuredPost)}
                  alt={featuredPost.title}
                  width={800}
                  height={400}
                  className="w-full h-48 sm:h-56 lg:h-full object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <div className="lg:w-1/2 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
                  <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md w-fit">
                    ✨ Featured Article
                  </span>
                  <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium border border-blue-200 w-fit">
                    {featuredPost.category}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 text-gray-900 hover:text-blue-600 transition-colors leading-tight">
                  {featuredPost.title}
                </h2>
                <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base line-clamp-3 lg:line-clamp-none">
                  {featuredPost.excerpt}
                </p>
                <div className="flex flex-wrap items-center text-xs text-gray-500 mb-4 sm:mb-6 gap-2 sm:gap-3">
                  <span className="flex items-center bg-gray-50 px-2 py-1 rounded-md">
                    <Calendar className="w-3 h-3 mr-1.5 text-blue-500" />
                    {featuredPost.date || "Recent"}
                  </span>
                  <span className="flex items-center bg-gray-50 px-2 py-1 rounded-md">
                    <Clock className="w-3 h-3 mr-1.5 text-green-500" />
                    {featuredPost.readTime || "5 min read"}
                  </span>
                  <span className="flex items-center bg-gray-50 px-2 py-1 rounded-md">
                    <Eye className="w-3 h-3 mr-1.5 text-purple-500" />
                    {featuredPost.views || 0} views
                  </span>
                </div>
                {featuredPost.tags && featuredPost.tags.length > 0 && (
                  <div className="flex gap-1 mb-4 flex-wrap">
                    {featuredPost.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <button className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm">
                  Read Full Article <ArrowRight className="w-4 h-4 ml-1.5" />
                </button>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Category Filter */}
      {(featuredPost || blogPosts.length > 0) && (
        <div className="mb-8 sm:mb-12">
          <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-gray-900">
            Browse Articles by Category
          </h3>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md transform scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-blue-300 hover:shadow-sm"
                }`}
              >
                {category === "all" ? "📚 All Articles" : `📖 ${category}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Blog Posts Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {filteredPosts.map((post) => (
            <Link key={post.id} href={`/blogs/${post.slug || post.id}`}>
              <article
                className="group bg-white rounded-lg sm:rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full"
                onClick={() => handlePostClick(post.id)}
              >
                <div className="relative overflow-hidden">
                  <Image
                    src={getPostImage(post)}
                    alt={post.title}
                    width={400}
                    height={250}
                    className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex items-center mb-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium shadow-sm ${
                        post.category === "Festival Guides"
                          ? "bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200"
                          : post.category === "Shipping Guidelines"
                          ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200"
                          : post.category === "Travel Tips"
                          ? "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200"
                          : post.category === "Safety & Security"
                          ? "bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border border-yellow-200"
                          : post.category === "Platform Updates"
                          ? "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200"
                          : post.category === "Success Stories"
                          ? "bg-gradient-to-r from-pink-50 to-pink-100 text-pink-700 border border-pink-200"
                          : post.category === "International Shipping"
                          ? "bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 border border-indigo-200"
                          : post.category === "Customer Support"
                          ? "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border border-orange-200"
                          : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200"
                      }`}
                    >
                      📝 {post.category}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed text-sm line-clamp-3">
                    {post.excerpt}
                  </p>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex gap-1 mb-3 flex-wrap">
                      {post.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                      {post.tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{post.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex flex-wrap items-center text-xs text-gray-500 gap-2">
                      <span className="flex items-center bg-gray-50 px-2 py-1 rounded-md">
                        <Calendar className="w-2.5 h-2.5 mr-1 text-blue-500" />
                        {post.date || "Recent"}
                      </span>
                      <span className="flex items-center bg-gray-50 px-2 py-1 rounded-md">
                        <Clock className="w-2.5 h-2.5 mr-1 text-green-500" />
                        {post.readTime || "5 min read"}
                      </span>
                      <span className="flex items-center bg-gray-50 px-2 py-1 rounded-md">
                        <Eye className="w-2.5 h-2.5 mr-1 text-purple-500" />
                        {post.views || 0}
                      </span>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-all duration-200 w-fit">
                      Read More →
                    </button>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      ) : (
        blogPosts.length > 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm
                ? "No posts found matching your search criteria."
                : "No posts available in this category."}
            </p>
          </div>
        )
      )}
    </BlogLayout>
  );
};

export default BlogPage;
