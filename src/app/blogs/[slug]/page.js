// /app/blogs/[slug]/page.js
"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  Eye,
  ArrowLeft,
  User,
  Tag,
  Share2,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  increment,
  orderBy,
  limit,
} from "firebase/firestore";

const BlogDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!params.slug) {
        console.log("No slug parameter found");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log("Fetching post with slug/id:", params.slug);

        // First try to find by slug (for published posts)
        const slugQuery = query(
          collection(db, "blogPosts"),
          where("slug", "==", params.slug),
          where("status", "==", "published")
        );

        const slugSnapshot = await getDocs(slugQuery);
        console.log(
          "Slug query results:",
          slugSnapshot.size,
          "documents found"
        );

        let postData = null;
        let postId = null;

        if (!slugSnapshot.empty) {
          // Found by slug
          const docSnap = slugSnapshot.docs[0];
          postData = { id: docSnap.id, ...docSnap.data() };
          postId = docSnap.id;
          console.log("Post found by slug:", postData.title);
        } else {
          console.log("No post found by slug, trying by ID...");

          // Try to find by ID if slug doesn't match
          try {
            const docRef = doc(db, "blogPosts", params.slug);
            const docSnap = await getDoc(docRef);

            console.log("Document exists:", docSnap.exists());

            if (docSnap.exists()) {
              const data = docSnap.data();
              console.log("Document data:", data);
              console.log("Document status:", data.status);

              if (data.status === "published") {
                postData = { id: docSnap.id, ...data };
                postId = docSnap.id;
                console.log("Post found by ID:", postData.title);
              } else {
                console.log(
                  "Post found but not published. Status:",
                  data.status
                );
                setError(
                  `This post is currently ${
                    data.status || "unpublished"
                  } and cannot be viewed.`
                );
                return;
              }
            } else {
              console.log("No document found with ID:", params.slug);
            }
          } catch (idError) {
            console.error("Error fetching by ID:", idError);
          }
        }

        // If still no post found, try without status filter (for debugging)
        if (!postData) {
          console.log("Checking if post exists regardless of status...");
          const allPostsQuery = query(
            collection(db, "blogPosts"),
            where("slug", "==", params.slug)
          );

          const allPostsSnapshot = await getDocs(allPostsQuery);
          if (!allPostsSnapshot.empty) {
            const firstDoc = allPostsSnapshot.docs[0];
            const data = firstDoc.data();
            console.log("Found post with status:", data.status);
            setError(
              `This post exists but is currently ${
                data.status || "unpublished"
              } and cannot be viewed.`
            );
            return;
          }
        }

        if (postData) {
          // Format the date properly
          if (postData.createdAt?.seconds) {
            postData.date = new Date(
              postData.createdAt.seconds * 1000
            ).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
          } else if (!postData.date) {
            postData.date = "Recent";
          }

          setPost(postData);

          // Increment view count
          const postRef = doc(db, "blogPosts", postId);
          await updateDoc(postRef, {
            views: increment(1),
          });

          // Fetch related posts from the same category
          const relatedQuery = query(
            collection(db, "blogPosts"),
            where("category", "==", postData.category),
            where("status", "==", "published"),
            orderBy("createdAt", "desc"),
            limit(4)
          );

          const relatedSnapshot = await getDocs(relatedQuery);
          const related = [];

          relatedSnapshot.forEach((doc) => {
            if (doc.id !== postId) {
              const relatedData = { id: doc.id, ...doc.data() };
              if (relatedData.createdAt?.seconds) {
                relatedData.date = new Date(
                  relatedData.createdAt.seconds * 1000
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
              }
              related.push(relatedData);
            }
          });

          setRelatedPosts(related.slice(0, 3)); // Show max 3 related posts
        } else {
          console.log("No post found with slug/id:", params.slug);
          setError("Post not found or not published");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        setError("Failed to load the blog post: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.slug]);

  // Default image if none provided
  const getPostImage = (post) => {
    if (post?.image) return post.image;

    const defaultImages = {
      "Festival Guides":
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=600&fit=crop",
      "Shipping Guidelines":
        "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=1200&h=600&fit=crop",
      "Travel Tips":
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=600&fit=crop",
      "Safety & Security":
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=600&fit=crop",
      "Platform Updates":
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop",
      "Success Stories":
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=600&fit=crop",
      "International Shipping":
        "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1200&h=600&fit=crop",
      "Customer Support":
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop",
    };

    return (
      defaultImages[post?.category] ||
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=600&fit=crop"
    );
  };

  // Format content with basic markdown support
  const formatContent = (content) => {
    if (!content) return "";

    // Convert markdown-style formatting to HTML
    let formatted = content
      // Headers
      .replace(
        /^### (.*$)/gim,
        '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>'
      )
      .replace(
        /^## (.*$)/gim,
        '<h2 class="text-2xl font-bold mt-8 mb-4">$2</h2>'
      )
      .replace(
        /^# (.*$)/gim,
        '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>'
      )
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
      // Lists
      .replace(/^\* (.+)/gim, '<li class="ml-6 list-disc">$1</li>')
      .replace(/^- (.+)/gim, '<li class="ml-6 list-disc">$1</li>')
      // Quotes
      .replace(
        /^> (.+)/gim,
        '<blockquote class="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-700">$1</blockquote>'
      )
      // Links
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>'
      )
      // Line breaks
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, "<br />");

    // Wrap in paragraphs if not already wrapped
    if (!formatted.startsWith("<")) {
      formatted = `<p class="mb-4">${formatted}</p>`;
    }

    // Wrap consecutive <li> elements in <ul>
    formatted = formatted.replace(/(<li[^>]*>.*?<\/li>\s*)+/g, (match) => {
      return `<ul class="list-disc ml-6 mb-4">${match}</ul>`;
    });

    return formatted;
  };

  // Handle share functionality
  const handleShare = async () => {
    const shareData = {
      title: post.title,
      text: post.excerpt,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying link
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {error || "Post not found"}
          </h2>
          <p className="text-gray-600 mb-6">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/blogs">
            <button className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blogs
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header with breadcrumbs */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link
              href="/blogs"
              className="hover:text-gray-700 transition-colors"
            >
              Blogs
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-gray-900 font-medium truncate max-w-xs">
              {post.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link href="/blogs">
          <button className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to all posts
          </button>
        </Link>

        {/* Featured image */}
        <div className="relative w-full h-64 sm:h-96 lg:h-[500px] rounded-xl overflow-hidden shadow-lg mb-8">
          <Image
            src={getPostImage(post)}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>

        {/* Post header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {post.featured && (
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                ✨ Featured
              </span>
            )}
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
              {post.category}
            </span>
            {post.tags &&
              post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs"
                >
                  #{tag}
                </span>
              ))}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          <p className="text-lg text-gray-600 mb-6">{post.excerpt}</p>

          <div className="flex flex-wrap items-center justify-between border-t border-b py-4">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center">
                <User className="w-4 h-4 mr-1.5" />
                {post.authorName || "Nasosend Team"}
              </span>
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1.5" />
                {post.date}
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1.5" />
                {post.readTime || "5 min read"}
              </span>
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1.5" />
                {(post.views || 0) + 1} views
              </span>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mt-4 sm:mt-0"
            >
              <Share2 className="w-4 h-4 mr-1.5" />
              Share
            </button>
          </div>
        </header>

        {/* Post content */}
        <div
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
        />

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section className="border-t pt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Related Articles
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blogs/${relatedPost.slug || relatedPost.id}`}
                >
                  <article className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                    <div className="relative h-40 overflow-hidden">
                      <Image
                        src={getPostImage(relatedPost)}
                        alt={relatedPost.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <span className="text-xs text-blue-600 font-medium">
                        {relatedPost.category}
                      </span>
                      <h3 className="font-bold text-gray-900 mt-1 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {relatedPost.excerpt}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {relatedPost.date || "Recent"}
                        <span className="mx-2">•</span>
                        <Clock className="w-3 h-3 mr-1" />
                        {relatedPost.readTime || "5 min read"}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Call to action */}
      </article>
    </div>
  );
};

export default BlogDetailPage;
