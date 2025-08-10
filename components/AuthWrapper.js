// components/AuthWrapper.js
"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function AuthWrapper({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center">
          <div className="relative">
            {/* Outer spinning ring */}
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200"></div>
            {/* Inner spinning ring */}
            <div
              className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"
              style={{
                animationDirection: "reverse",
                animationDuration: "0.8s",
              }}
            ></div>
            {/* Logo or icon in center */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Nasosend
            </h2>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
            <p className="text-gray-500 mt-2 text-sm">
              Loading your experience...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
