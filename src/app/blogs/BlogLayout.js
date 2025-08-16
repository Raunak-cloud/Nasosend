// app/blogs/BlogLayout.js
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, TrendingUp, Tag, Clock, BookOpen } from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";

const BlogLayout = ({ children }) => {
  const [popularPosts, setPopularPosts] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        // Fetch popular posts (sorted by views)
        const popularQuery = query(
          collection(db, "blogPosts"),
          where("status", "==", "published"),
          orderBy("views", "desc"),
          limit(5)
        );

        const popularSnapshot = await getDocs(popularQuery);
        const popular = [];

        popularSnapshot.forEach((doc) => {
          const data = doc.data();
          popular.push({
            id: doc.id,
            title: data.title,
            views: data.views || 0,
            slug: data.slug || doc.id,
            category: data.category,
            // Calculate relative date
            date: data.createdAt ? getRelativeTime(data.createdAt) : "Recently",
          });
        });

        setPopularPosts(popular);

        // Fetch recent posts (sorted by creation date)
        const recentQuery = query(
          collection(db, "blogPosts"),
          where("status", "==", "published"),
          orderBy("createdAt", "desc"),
          limit(3)
        );

        const recentSnapshot = await getDocs(recentQuery);
        const recent = [];

        recentSnapshot.forEach((doc) => {
          const data = doc.data();
          recent.push({
            id: doc.id,
            title: data.title,
            excerpt: data.excerpt,
            slug: data.slug || doc.id,
            category: data.category,
            readTime: data.readTime || "5 min read",
            date: data.createdAt ? getRelativeTime(data.createdAt) : "Recently",
          });
        });

        setRecentPosts(recent);

        // Collect unique categories from all posts
        const allPostsQuery = query(
          collection(db, "blogPosts"),
          where("status", "==", "published")
        );

        const allPostsSnapshot = await getDocs(allPostsQuery);
        const uniqueCategories = new Set();
        let totalPosts = 0;

        allPostsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.category) {
            uniqueCategories.add(data.category);
          }
          totalPosts++;
        });

        // Create category objects with counts
        const categoryList = [];
        for (const cat of uniqueCategories) {
          const catQuery = query(
            collection(db, "blogPosts"),
            where("status", "==", "published"),
            where("category", "==", cat)
          );
          const catSnapshot = await getDocs(catQuery);
          categoryList.push({
            name: cat,
            count: catSnapshot.size,
          });
        }

        // Sort categories by count
        categoryList.sort((a, b) => b.count - a.count);
        setCategories(categoryList);
      } catch (error) {
        console.error("Error fetching sidebar data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSidebarData();
  }, []);

  // Helper function to calculate relative time
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return "Recently";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 172800) return "Yesterday";
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    if (diffInSeconds < 31536000)
      return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  // Get category color based on name
  const getCategoryColor = (category) => {
    const colors = {
      "Festival Guides": "from-red-500 to-orange-600",
      "Shipping Guidelines": "from-blue-500 to-indigo-600",
      "Travel Tips": "from-green-500 to-teal-600",
      "Safety & Security": "from-yellow-500 to-amber-600",
      "Platform Updates": "from-purple-500 to-pink-600",
      "Success Stories": "from-pink-500 to-rose-600",
      "International Shipping": "from-indigo-500 to-blue-600",
      "Customer Support": "from-orange-500 to-red-600",
    };
    return colors[category] || "from-gray-500 to-gray-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Main Content */}
          <main className="lg:col-span-3">{children}</main>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Popular Posts */}
            {!loading && popularPosts.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md border border-gray-100">
                <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center text-gray-900">
                  <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-md flex items-center justify-center mr-2">
                    <TrendingUp className="w-3 h-3 text-white" />
                  </div>
                  Popular Articles
                </h3>
                <div className="space-y-4">
                  {popularPosts.map((post, index) => (
                    <div
                      key={post.id}
                      className="group border-b border-gray-100 last:border-b-0 pb-3 last:pb-0"
                    >
                      <Link href={`/blogs/${post.slug}`}>
                        <h4 className="font-medium text-xs sm:text-sm mb-2 hover:text-blue-600 cursor-pointer transition-colors leading-relaxed group-hover:text-blue-600 line-clamp-2">
                          {post.title}
                        </h4>
                      </Link>
                      <div className="flex flex-col sm:flex-row sm:items-center text-xs text-gray-500 space-y-1 sm:space-y-0 sm:space-x-3">
                        <span className="flex items-center bg-gray-50 px-2 py-1 rounded-md w-fit">
                          <Calendar className="w-2.5 h-2.5 mr-1 text-blue-500" />
                          {post.date}
                        </span>
                        <span className="flex items-center bg-gray-50 px-2 py-1 rounded-md w-fit">
                          <TrendingUp className="w-2.5 h-2.5 mr-1 text-green-500" />
                          {post.views} views
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {!loading && categories.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md border border-gray-100">
                <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center text-gray-900">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-md flex items-center justify-center mr-2">
                    <Tag className="w-3 h-3 text-white" />
                  </div>
                  Categories
                </h3>
                <div className="space-y-2">
                  {categories.map((category, index) => (
                    <Link
                      key={index}
                      href={`/blogs?category=${encodeURIComponent(
                        category.name
                      )}`}
                    >
                      <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                        <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">
                          {category.name}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {category.count}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Posts */}
            {!loading && recentPosts.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md border border-gray-100">
                <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center text-gray-900">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-teal-600 rounded-md flex items-center justify-center mr-2">
                    <Clock className="w-3 h-3 text-white" />
                  </div>
                  Recent Posts
                </h3>
                <div className="space-y-4">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="group">
                      <Link href={`/blogs/${post.slug}`}>
                        <div className="space-y-2">
                          <h4 className="font-medium text-xs sm:text-sm hover:text-blue-600 cursor-pointer transition-colors leading-relaxed group-hover:text-blue-600 line-clamp-2">
                            {post.title}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 space-x-2">
                            <span className="flex items-center">
                              <Clock className="w-2.5 h-2.5 mr-1 text-blue-500" />
                              {post.readTime}
                            </span>
                            <span>•</span>
                            <span>{post.date}</span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md border border-gray-100">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogLayout;
