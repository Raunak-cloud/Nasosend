// app/page.js
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plane,
  Users,
  Shield,
  Handshake,
  DollarSign,
  CheckCircle,
} from "lucide-react";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // A more professional, globally defined color palette
  const colors = {
    primaryRed: "#DC143C",
    primaryRedHover: "#B01030",
    primaryBlue: "#003366",
    primaryBlueHover: "#002244",
    gold: "#FFD700",
    white: "#FFFFFF",
    darkGray: "#2E2E2E",
    lightGray: "#F5F5F5",
    borderGray: "#D9D9D9",
    lighterRed: "#FFF5F5",
    lighterBlue: "#E5E9EC",
  };

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          className="relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div
            className="rounded-full h-12 w-12 border-4 border-gray-200 border-t-primaryBlue"
            style={{
              borderColor: colors.borderGray,
              borderTopColor: colors.primaryBlue,
            }}
          ></div>
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
    <div className="min-h-screen bg-gray-50 font-inter text-darkGray">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="mb-6" variants={itemVariants}>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primaryBlue leading-tight mb-4"
              style={{ color: colors.primaryBlue }}
            >
              Community driven shipping
            </h1>
          </motion.div>

          <motion.div
            className="flex items-center justify-center gap-4 sm:gap-6 mb-8"
            variants={itemVariants}
          >
            <motion.div
              className="bg-lighterBlue rounded-2xl px-6 py-3 shadow-md border border-borderGray"
              style={{
                backgroundColor: colors.lighterBlue,
                borderColor: colors.borderGray,
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span
                className="text-primaryBlue text-lg sm:text-2xl md:text-3xl font-semibold flex items-center gap-2"
                style={{ color: colors.primaryBlue }}
              >
                🇦🇺 Australia
              </span>
            </motion.div>

            <motion.div
              className="flex items-center"
              animate={{ rotateY: [0, 180, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div
                className="bg-white rounded-full p-2 shadow-sm border border-borderGray"
                style={{
                  backgroundColor: colors.white,
                  borderColor: colors.borderGray,
                }}
              >
                <Plane
                  className="w-5 h-5 sm:w-8 sm:h-8 text-darkGray"
                  style={{ color: colors.darkGray }}
                />
              </div>
            </motion.div>

            <motion.div
              className="bg-lighterRed rounded-2xl px-6 py-3 shadow-md border border-borderGray"
              style={{
                backgroundColor: colors.lighterRed,
                borderColor: colors.borderGray,
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span
                className="text-primaryRed text-lg sm:text-2xl md:text-3xl font-semibold flex items-center gap-2"
                style={{ color: colors.primaryRed }}
              >
                🇳🇵 Nepal
              </span>
            </motion.div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl p-6 mx-auto max-w-4xl mb-8 shadow-sm border border-borderGray"
            style={{
              backgroundColor: colors.white,
              borderColor: colors.borderGray,
            }}
            variants={itemVariants}
          >
            <p
              className="text-base sm:text-lg text-darkGray leading-relaxed"
              style={{ color: colors.darkGray }}
            >
              Nasosend is a crowdshipping platform that connects people wanting
              to send items between Australia and Nepal with verified travelers
              who have available luggage space.
            </p>
          </motion.div>

          {/* Community Stats */}
          <motion.div
            className="flex flex-wrap justify-center gap-6 sm:gap-8 mb-10"
            variants={containerVariants}
          >
            {[
              { label: "Verified", sublabel: "Senders" },
              { label: "Verified", sublabel: "Travelers" },
              { label: "Community", sublabel: "Built" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl p-4 shadow-sm border border-borderGray relative"
                style={{
                  backgroundColor: colors.white,
                  borderColor: colors.borderGray,
                }}
                variants={itemVariants}
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div
                  className="flex items-center justify-center text-lg sm:text-xl font-bold text-darkGray mb-1"
                  style={{ color: colors.darkGray }}
                >
                  {stat.label}
                  {stat.label === "Verified" && (
                    <div
                      className="w-5 h-5 ml-2 text-gold"
                      style={{ color: colors.gold }}
                    >
                      <CheckCircle className="w-full h-full" />
                    </div>
                  )}
                  {stat.label === "Community" && (
                    <div
                      className="w-5 h-5 ml-2 text-primaryBlue"
                      style={{ color: colors.primaryBlue }}
                    >
                      <Handshake className="w-full h-full" />
                    </div>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  {stat.sublabel}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Get Started Button */}
          <motion.div className="mb-6" variants={itemVariants}>
            <motion.button
              onClick={handleGetStarted}
              className="group px-8 sm:px-10 py-4 sm:py-5 bg-primaryRed text-white text-base sm:text-lg font-semibold rounded-2xl shadow-xl transition-all duration-300"
              style={{ backgroundColor: colors.primaryRed }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="flex items-center gap-2">
                {user ? "Go to Dashboard" : "Get Started"}
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
            className="bg-lighterBlue rounded-full px-6 py-2 inline-block shadow-sm border border-borderGray"
            style={{
              backgroundColor: colors.lighterBlue,
              borderColor: colors.borderGray,
            }}
            variants={itemVariants}
          >
            <p className="text-xs sm:text-sm text-gray-600">
              {user
                ? "Welcome back! Access your dashboard to continue."
                : "Be among the first to experience seamless crowdshipping"}
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* How It Works */}
      <motion.div
        className="max-w-7xl mx-auto px-4 py-16 sm:py-20"
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
          <h2
            className="text-2xl sm:text-3xl font-bold text-darkGray mb-4"
            style={{ color: colors.darkGray }}
          >
            How It Works
          </h2>
          <p className="text-gray-600">A simple and straightforward process</p>
        </motion.div>

        <div className="grid gap-8 max-w-6xl mx-auto lg:grid-cols-2">
          {/* For Senders */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-borderGray"
            style={{
              backgroundColor: colors.white,
              borderColor: colors.borderGray,
            }}
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ y: -3 }}
          >
            <div className="flex items-center mb-6">
              <div
                className="w-12 h-12 bg-lighterRed rounded-xl flex items-center justify-center mr-4 shadow-sm"
                style={{ backgroundColor: colors.lighterRed }}
              >
                <Users
                  className="w-6 h-6 text-primaryRed"
                  style={{ color: colors.primaryRed }}
                />
              </div>
              <div>
                <h3
                  className="text-lg font-bold text-darkGray"
                  style={{ color: colors.darkGray }}
                >
                  For Senders
                </h3>
                <p className="text-sm text-gray-600 font-medium">
                  Send packages safely
                </p>
              </div>
            </div>
            <ol className="space-y-4">
              {[
                "Browse verified travelers heading to Nepal",
                "Send a request with your package details",
                "Connect with a traveler for pickup",
              ].map((step, index) => (
                <motion.li
                  key={index}
                  className="flex items-start p-3 rounded-xl bg-lightGray border border-borderGray"
                  style={{
                    backgroundColor: colors.lightGray,
                    borderColor: colors.borderGray,
                  }}
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div
                    className="font-bold text-white mr-3 flex-shrink-0 bg-primaryRed rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    style={{ backgroundColor: colors.primaryRed }}
                  >
                    {index + 1}
                  </div>
                  <span
                    className="text-darkGray text-sm"
                    style={{ color: colors.darkGray }}
                  >
                    {step}
                  </span>
                </motion.li>
              ))}
            </ol>
          </motion.div>

          {/* For Travelers */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-borderGray"
            style={{
              backgroundColor: colors.white,
              borderColor: colors.borderGray,
            }}
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ y: -3 }}
          >
            <div className="flex items-center mb-6">
              <div
                className="w-12 h-12 bg-lighterBlue rounded-xl flex items-center justify-center mr-4 shadow-sm"
                style={{ backgroundColor: colors.lighterBlue }}
              >
                <Plane
                  className="w-6 h-6 text-primaryBlue"
                  style={{ color: colors.primaryBlue }}
                />
              </div>
              <div>
                <h3
                  className="text-lg font-bold text-darkGray"
                  style={{ color: colors.darkGray }}
                >
                  For Travelers
                </h3>
                <p className="text-sm text-gray-600 font-medium">
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
                  className="flex items-start p-3 rounded-xl bg-lightGray border border-borderGray"
                  style={{
                    backgroundColor: colors.lightGray,
                    borderColor: colors.borderGray,
                  }}
                  initial={{ x: 20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div
                    className="font-bold text-white mr-3 flex-shrink-0 bg-primaryBlue rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    style={{ backgroundColor: colors.primaryBlue }}
                  >
                    {index + 1}
                  </div>
                  <span
                    className="text-darkGray text-sm"
                    style={{ color: colors.darkGray }}
                  >
                    {step}
                  </span>
                </motion.li>
              ))}
            </ol>
          </motion.div>
        </div>
      </motion.div>

      {/* Features */}
      <motion.div
        className="bg-gray-50 py-16 sm:py-20"
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
            <h2
              className="text-2xl sm:text-3xl font-bold text-darkGray mb-4"
              style={{ color: colors.darkGray }}
            >
              Why Choose Nasosend?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join a trusted community with industry-leading security and
              transparent pricing
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature: Secure & Verified */}
            <motion.div
              className="text-center p-6 rounded-2xl bg-white shadow-lg border border-borderGray"
              style={{
                backgroundColor: colors.white,
                borderColor: colors.borderGray,
              }}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 bg-lighterBlue"
                style={{ backgroundColor: colors.lighterBlue }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Shield
                  className="w-8 h-8 text-primaryBlue"
                  style={{ color: colors.primaryBlue }}
                />
              </motion.div>
              <h3
                className="text-lg font-bold text-darkGray mb-3"
                style={{ color: colors.darkGray }}
              >
                Secure & Verified
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                All travelers are verified with government ID and flight
                documentation for maximum security.
              </p>
              <div
                className="rounded-full px-3 py-1 inline-block bg-white border border-borderGray"
                style={{
                  backgroundColor: colors.white,
                  borderColor: colors.borderGray,
                }}
              >
                <span className="font-medium text-xs text-primaryBlue">
                  100% ID Verified
                </span>
              </div>
            </motion.div>

            {/* Feature: Trusted Community */}
            <motion.div
              className="text-center p-6 rounded-2xl bg-white shadow-lg border border-borderGray"
              style={{
                backgroundColor: colors.white,
                borderColor: colors.borderGray,
              }}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 bg-gold"
                style={{ backgroundColor: colors.gold }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Handshake
                  className="w-8 h-8 text-white"
                  style={{ color: colors.white }}
                />
              </motion.div>
              <h3
                className="text-lg font-bold text-darkGray mb-3"
                style={{ color: colors.darkGray }}
              >
                Trusted Community
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Connect with verified members of the Australia-Nepal community
                with ratings and reviews.
              </p>
              <div
                className="rounded-full px-3 py-1 inline-block bg-white border border-borderGray"
                style={{
                  backgroundColor: colors.white,
                  borderColor: colors.borderGray,
                }}
              >
                <span
                  className="font-medium text-xs text-gold"
                  style={{ color: colors.gold }}
                >
                  5-Star Rating System
                </span>
              </div>
            </motion.div>

            {/* Feature: Fair Pricing */}
            <motion.div
              className="text-center p-6 rounded-2xl bg-white shadow-lg border border-borderGray"
              style={{
                backgroundColor: colors.white,
                borderColor: colors.borderGray,
              }}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 bg-lighterRed"
                style={{ backgroundColor: colors.lighterRed }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <DollarSign
                  className="w-8 h-8 text-primaryRed"
                  style={{ color: colors.primaryRed }}
                />
              </motion.div>
              <h3
                className="text-lg font-bold text-darkGray mb-3"
                style={{ color: colors.darkGray }}
              >
                Fair Pricing
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Transparent pricing with no hidden fees. Pay directly to
                travelers with secure payment protection.
              </p>
              <div
                className="rounded-full px-3 py-1 inline-block bg-white border border-borderGray"
                style={{
                  backgroundColor: colors.white,
                  borderColor: colors.borderGray,
                }}
              >
                <span
                  className="font-medium text-xs text-primaryRed"
                  style={{ color: colors.primaryRed }}
                >
                  0% Platform Fees
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
