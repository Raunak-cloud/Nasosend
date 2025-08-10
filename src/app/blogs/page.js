// /app/blogs/page.js
"use client";
import React, { useState } from "react";
import { Calendar, Clock, Tag, ArrowRight, Eye } from "lucide-react";
import BlogLayout from "./BlogLayout";

const BlogPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const featuredPost = {
    id: 1,
    title: "Ultimate Guide to Sending Dashain Gifts from Australia to Nepal",
    excerpt:
      "Dashain is the biggest festival in Nepal, and sending the perfect gifts from Australia can make your loved ones feel closer to home. Here's everything you need to know about choosing, packing, and sending meaningful Dashain gifts through our secure crowdshipping platform.",
    image:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop",
    date: "August 5, 2025",
    readTime: "8 min read",
    category: "Festival Guides",
    views: 18,
  };

  const blogPosts = [
    {
      id: 2,
      title: "Safe Shipping Guidelines: Best Practices for Crowdshipping",
      excerpt:
        "Learn essential safety protocols, packaging requirements, and documentation needed for successful international item delivery. Our comprehensive guide ensures your packages reach their destination securely and efficiently.",
      image:
        "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400&h=250&fit=crop",
      date: "August 3, 2025",
      readTime: "6 min read",
      category: "Shipping Guidelines",
      views: 12,
    },
  ];

  const categories = [
    "all",
    "Festival Guides",
    "Shipping Guidelines",
    "Travel Tips",
  ];

  const filteredPosts =
    selectedCategory === "all"
      ? blogPosts
      : blogPosts.filter((post) => post.category === selectedCategory);

  return (
    <BlogLayout>
      {/* Compact Featured Post */}
      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-lg sm:rounded-xl shadow-md border border-blue-100 overflow-hidden mb-8 sm:mb-12 hover:shadow-lg transition-all duration-300">
        <div className="lg:flex">
          <div className="lg:w-1/2 relative">
            <img
              src={featuredPost.image}
              alt={featuredPost.title}
              className="w-full h-48 sm:h-56 lg:h-full object-cover"
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
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 text-gray-900 hover:text-blue-600 cursor-pointer transition-colors leading-tight">
              {featuredPost.title}
            </h2>
            <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base line-clamp-3 lg:line-clamp-none">
              {featuredPost.excerpt}
            </p>
            <div className="flex flex-wrap items-center text-xs text-gray-500 mb-4 sm:mb-6 gap-2 sm:gap-3">
              <span className="flex items-center bg-gray-50 px-2 py-1 rounded-md">
                <Calendar className="w-3 h-3 mr-1.5 text-blue-500" />
                {featuredPost.date}
              </span>
              <span className="flex items-center bg-gray-50 px-2 py-1 rounded-md">
                <Clock className="w-3 h-3 mr-1.5 text-green-500" />
                {featuredPost.readTime}
              </span>
              <span className="flex items-center bg-gray-50 px-2 py-1 rounded-md">
                <Eye className="w-3 h-3 mr-1.5 text-purple-500" />
                {featuredPost.views} views
              </span>
            </div>
            <button className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm">
              Read Full Article <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Compact Category Filter */}
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

      {/* Compact Blog Posts Grid */}
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {filteredPosts.map((post) => (
          <article
            key={post.id}
            className="group bg-white rounded-lg sm:rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="relative overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
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
                      : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200"
                  }`}
                >
                  📝 {post.category}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-3 text-gray-900 group-hover:text-blue-600 cursor-pointer transition-colors leading-tight line-clamp-2">
                {post.title}
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed text-sm line-clamp-3">
                {post.excerpt}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-wrap items-center text-xs text-gray-500 gap-2">
                  <span className="flex items-center bg-gray-50 px-2 py-1 rounded-md">
                    <Calendar className="w-2.5 h-2.5 mr-1 text-blue-500" />
                    {post.date}
                  </span>
                  <span className="flex items-center bg-gray-50 px-2 py-1 rounded-md">
                    <Clock className="w-2.5 h-2.5 mr-1 text-green-500" />
                    {post.readTime}
                  </span>
                  <span className="flex items-center bg-gray-50 px-2 py-1 rounded-md">
                    <Eye className="w-2.5 h-2.5 mr-1 text-purple-500" />
                    {post.views}
                  </span>
                </div>
                <button className="text-blue-600 hover:text-blue-800 font-medium text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-all duration-200 w-fit">
                  Read More →
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Compact Newsletter CTA */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-lg sm:rounded-2xl p-6 sm:p-8 lg:p-10 text-white text-center mt-12 sm:mt-16 relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-8">
          <div className="absolute top-0 left-0 w-20 h-20 bg-white rounded-full -translate-x-10 -translate-y-10"></div>
          <div className="absolute top-10 right-6 w-10 h-10 bg-white rounded-full"></div>
          <div className="absolute bottom-6 left-12 w-12 h-12 bg-white rounded-full"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
        </div>
        <div className="relative z-10">
          <div className="mb-4">
            <span className="text-3xl sm:text-4xl">📧</span>
          </div>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3">
            Stay Updated with Our Latest Guides
          </h3>
          <p className="mb-6 sm:mb-8 max-w-2xl mx-auto text-blue-100 text-sm sm:text-base leading-relaxed px-4">
            Get expert tips on international shipping, festival guides, and
            platform updates delivered directly to your inbox. Join our
            community of trusted travelers and senders.
          </p>
          <div className="max-w-lg mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 border-0 focus:ring-2 focus:ring-white/20 focus:outline-none placeholder-gray-500 font-medium text-sm"
              />
              <button className="bg-white text-blue-600 font-medium px-4 sm:px-6 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm">
                Subscribe ✨
              </button>
            </div>
          </div>
        </div>
      </div>
    </BlogLayout>
  );
};

export default BlogPage;
