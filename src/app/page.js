"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <motion.div
          className="relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="rounded-full h-12 w-12 border-3 border-blue-200 border-t-blue-500"></div>
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <span className="text-lg">📦</span>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="text-center">
            {/* Header */}
            <motion.div className="mb-6" variants={itemVariants}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight mb-4">
                Crowdshipping
              </h1>
            </motion.div>

            {/* Country Connection */}
            <motion.div
              className="flex items-center justify-center gap-4 sm:gap-6 mb-8"
              variants={itemVariants}
            >
              <motion.div
                className="bg-white/80 backdrop-blur-sm rounded-xl px-6 py-3 shadow-md border border-blue-200"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-blue-600 text-lg sm:text-2xl md:text-3xl font-semibold flex items-center gap-2">
                  🇦🇺 Australia
                </span>
              </motion.div>

              <motion.div
                className="flex items-center"
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <div className="bg-white/90 rounded-full p-2 shadow-md border border-purple-200">
                  <svg
                    className="w-5 h-5 sm:w-8 sm:h-8 text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16l-4-4m0 0l4-4m-4 4h18m0 0l-4-4m4 4l-4 4"
                    />
                  </svg>
                </div>
              </motion.div>

              <motion.div
                className="bg-white/80 backdrop-blur-sm rounded-xl px-6 py-3 shadow-md border border-purple-200"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-purple-600 text-lg sm:text-2xl md:text-3xl font-semibold flex items-center gap-2">
                  🇳🇵 Nepal
                </span>
              </motion.div>
            </motion.div>

            {/* Description */}
            <motion.div
              className="bg-white/70 backdrop-blur-sm rounded-xl p-6 mx-auto max-w-4xl mb-8 shadow-sm border border-white/50"
              variants={itemVariants}
            >
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                Connect with verified travelers or earn money by delivering
                packages.
                <span className="font-semibold text-gray-800 block mt-2">
                  Safe, reliable, and community-driven shipping between
                  Australia and Nepal.
                </span>
              </p>
            </motion.div>

            {/* Community Stats */}
            <motion.div
              className="flex flex-wrap justify-center gap-6 sm:gap-8 mb-10"
              variants={containerVariants}
            >
              {[
                { label: "Verified", sublabel: "Senders", color: "blue" },
                { label: "Verified", sublabel: "Travelers", color: "purple" },
                { label: "Community", sublabel: "Built", color: "green" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className={`bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-${stat.color}-200`}
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div
                    className={`text-lg sm:text-xl font-bold text-${stat.color}-600`}
                  >
                    {stat.label}
                  </div>
                  <div className={`text-xs sm:text-sm text-${stat.color}-500`}>
                    {stat.sublabel}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Get Started Button */}
            <motion.div className="mb-6" variants={itemVariants}>
              <motion.button
                onClick={handleGetStarted}
                className="px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white text-base sm:text-lg font-semibold rounded-xl shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="flex items-center gap-2">
                  Get Started
                  <svg
                    className="w-5 h-5 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </motion.button>
            </motion.div>

            <motion.div
              className="bg-white/50 backdrop-blur-sm rounded-full px-6 py-2 inline-block shadow-sm border border-white/50"
              variants={itemVariants}
            >
              <p className="text-xs sm:text-sm text-gray-600">
                Be among the first to experience seamless crowdshipping
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Subtle Background Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full mix-blend-multiply filter blur-xl opacity-50"></div>
        <div className="absolute top-40 right-10 w-40 h-40 bg-purple-200/20 rounded-full mix-blend-multiply filter blur-xl opacity-50"></div>
        <div className="absolute bottom-20 left-20 w-36 h-36 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-50"></div>
      </div>

      {/* How It Works */}
      <motion.div
        className="max-w-7xl mx-auto px-4 py-12 sm:py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <motion.div
          className="text-center mb-12"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            How It Works
          </h2>
          <p className="text-gray-600">Simple and straightforward process</p>
        </motion.div>

        <div className="grid gap-8 max-w-6xl mx-auto lg:grid-cols-2">
          {/* For Senders */}
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 sm:p-8 border border-blue-200"
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ y: -3 }}
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">For Senders</h3>
                <p className="text-sm text-blue-600 font-medium">
                  Send packages safely
                </p>
              </div>
            </div>
            <ol className="space-y-4">
              {[
                "Browse verified travelers heading to Nepal",
                "Send a request with your package details",
                "Connect with traveler for pickup",
              ].map((step, index) => (
                <motion.li
                  key={index}
                  className="flex items-start p-3 rounded-lg bg-blue-50 border border-blue-100"
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="font-bold text-white mr-3 flex-shrink-0 bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    {index + 1}
                  </div>
                  <span className="text-gray-700 text-sm">{step}</span>
                </motion.li>
              ))}
            </ol>
          </motion.div>

          {/* For Travelers */}
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 sm:p-8 border border-purple-200"
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ y: -3 }}
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  For Travelers
                </h3>
                <p className="text-sm text-purple-600 font-medium">
                  Earn while traveling
                </p>
              </div>
            </div>
            <ol className="space-y-4">
              {[
                "Get verified with ID and flight details",
                "Post your trip with available capacity",
                "Accept package requests from senders",
                "Deliver and earn money",
              ].map((step, index) => (
                <motion.li
                  key={index}
                  className="flex items-start p-3 rounded-lg bg-purple-50 border border-purple-100"
                  initial={{ x: 20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="font-bold text-white mr-3 flex-shrink-0 bg-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    {index + 1}
                  </div>
                  <span className="text-gray-700 text-sm">{step}</span>
                </motion.li>
              ))}
            </ol>
          </motion.div>
        </div>
      </motion.div>

      {/* Features */}
      <motion.div
        className="bg-gradient-to-br from-gray-50 to-white py-16 sm:py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
              Why Choose Nasosend?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join a trusted community with industry-leading security and
              transparent pricing
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: (
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                ),
                title: "Secure & Verified",
                description:
                  "All travelers are verified with government ID and flight documentation for maximum security",
                badge: "100% ID Verified",
                color: "blue",
              },
              {
                icon: (
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                ),
                title: "Trusted Community",
                description:
                  "Connect with verified members of the Australia-Nepal community with ratings and reviews",
                badge: "5-Star Rating System",
                color: "green",
              },
              {
                icon: (
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                title: "Fair Pricing",
                description:
                  "Transparent pricing with no hidden fees. Pay directly to travelers with secure payment protection",
                badge: "0% Platform Fees",
                color: "purple",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="text-center p-6 rounded-xl bg-white shadow-lg border border-gray-100"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <motion.div
                  className={`inline-flex items-center justify-center w-16 h-16 bg-${feature.color}-100 rounded-xl mb-4`}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {feature.description}
                </p>
                <div
                  className={`bg-${feature.color}-50 rounded-full px-3 py-1 inline-block border border-${feature.color}-100`}
                >
                  <span
                    className={`text-${feature.color}-700 font-medium text-xs`}
                  >
                    {feature.badge}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
