import React from "react";
import Link from "next/link";
import { Calendar, TrendingUp } from "lucide-react";

const BlogLayout = ({ children }) => {
  const popularPosts = [
    {
      title: "Best Dashain Gifts to Send from Australia",
      views: 15,
      date: "2 days ago",
      slug: "best-dashain-gifts-from-australia",
    },
    {
      title: "How to Pack Traditional Nepali Clothes",
      views: 23,
      date: "1 week ago",
      slug: "how-to-pack-traditional-nepali-clothes",
    },
    {
      title: "Tihar Festival Shopping Guide",
      views: 18,
      date: "3 days ago",
      slug: "tihar-festival-shopping-guide",
    },
    {
      title: "Electronics Worth Bringing to Nepal",
      views: 12,
      date: "5 days ago",
      slug: "electronics-worth-bringing-to-nepal",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Compact Header */}
      <header className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-8 sm:py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-8">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full translate-x-32 translate-y-32"></div>
        </div>
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 relative z-10">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Nasosend Blog
            </h1>
            <p className="text-sm sm:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed text-blue-100 font-medium px-4">
              Discover expert guides, cultural insights, and professional tips
              for connecting Australia and Nepal through our trusted
              crowdshipping platform.
            </p>
          </div>
        </div>
      </header>

      {/* Compact Navigation Breadcrumb */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-3">
          <nav className="flex items-center space-x-2 text-xs sm:text-sm font-medium">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Home
            </Link>
            <span className="text-gray-400">→</span>
            <span className="text-gray-700 font-semibold">Blog</span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Main Content */}
          <main className="lg:col-span-3">{children}</main>

          {/* Compact Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Popular Posts */}
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
                    key={index}
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
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogLayout;
