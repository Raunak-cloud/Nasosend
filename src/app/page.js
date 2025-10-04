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
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

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
            className="rounded-full h-12 w-12 border-4"
            style={{
              borderColor: colors.borderGray,
              borderTopColor: colors.primaryBlue,
            }}
          ></div>
        </motion.div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Hero Section - Compact */}
      <div
        className="relative overflow-hidden bg-white border-b"
        style={{ borderColor: colors.borderGray }}
      >
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight"
            style={{ color: colors.primaryBlue }}
            variants={itemVariants}
          >
            Community Driven Shipping
          </motion.h1>

          {/* Route Display - Compact */}
          <motion.div
            className="flex items-center justify-center gap-3 sm:gap-4 mb-6"
            variants={itemVariants}
          >
            <div
              className="rounded-xl px-4 py-2 shadow-sm border"
              style={{
                backgroundColor: colors.lighterBlue,
                borderColor: colors.borderGray,
              }}
            >
              <span
                className="text-base sm:text-xl font-semibold flex items-center gap-1.5"
                style={{ color: colors.primaryBlue }}
              >
                🇦🇺 Australia
              </span>
            </div>

            <motion.div
              animate={{ rotateY: [0, 180, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div
                className="rounded-full p-1.5 shadow-sm border"
                style={{
                  backgroundColor: colors.white,
                  borderColor: colors.borderGray,
                }}
              >
                <Plane className="w-5 h-5" style={{ color: colors.darkGray }} />
              </div>
            </motion.div>

            <div
              className="rounded-xl px-4 py-2 shadow-sm border"
              style={{
                backgroundColor: colors.lighterRed,
                borderColor: colors.borderGray,
              }}
            >
              <span
                className="text-base sm:text-xl font-semibold flex items-center gap-1.5"
                style={{ color: colors.primaryRed }}
              >
                🇳🇵 Nepal
              </span>
            </div>
          </motion.div>

          {/* Description - Compact */}
          <motion.p
            className="text-sm sm:text-base text-gray-600 max-w-3xl mx-auto mb-6 leading-relaxed"
            variants={itemVariants}
          >
            Connect people wanting to send items between Australia and Nepal
            with verified travelers who have available luggage space.
          </motion.p>

          {/* Stats - Compact Inline */}
          <motion.div
            className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-6"
            variants={itemVariants}
          >
            {[
              {
                icon: CheckCircle,
                label: "Verified Senders",
                color: colors.gold,
              },
              {
                icon: CheckCircle,
                label: "Verified Travelers",
                color: colors.gold,
              },
              {
                icon: Handshake,
                label: "Community Built",
                color: colors.primaryBlue,
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-medium"
                style={{
                  backgroundColor: colors.lightGray,
                  borderColor: colors.borderGray,
                  color: colors.darkGray,
                }}
              >
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                {stat.label}
              </div>
            ))}
          </motion.div>

          {/* CTA Button - Compact */}
          <motion.button
            onClick={handleGetStarted}
            className="group px-6 sm:px-8 py-3 text-white text-sm sm:text-base font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
            style={{ backgroundColor: colors.primaryRed }}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="flex items-center gap-2">
              {user ? "Go to Dashboard" : "Get Started"}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </motion.button>
        </motion.div>
      </div>

      {/* How It Works - Compact */}
      <div className="bg-gray-50 py-10 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2
              className="text-2xl sm:text-3xl font-bold mb-2"
              style={{ color: colors.darkGray }}
            >
              How It Works
            </h2>
            <p className="text-sm text-gray-600">
              Simple and straightforward process
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 max-w-5xl mx-auto">
            {/* For Senders */}
            <motion.div
              className="bg-white rounded-xl shadow-md p-5 sm:p-6 border"
              style={{ borderColor: colors.borderGray }}
              initial={{ x: -30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                  style={{ backgroundColor: colors.lighterRed }}
                >
                  <Users
                    className="w-5 h-5"
                    style={{ color: colors.primaryRed }}
                  />
                </div>
                <div>
                  <h3
                    className="text-base font-bold"
                    style={{ color: colors.darkGray }}
                  >
                    For Senders
                  </h3>
                  <p className="text-xs text-gray-600">Send packages safely</p>
                </div>
              </div>
              <ol className="space-y-2.5">
                {[
                  "Browse verified travelers",
                  "Send package request",
                  "Connect for pickup",
                ].map((step, index) => (
                  <li
                    key={index}
                    className="flex items-start p-2.5 rounded-lg border"
                    style={{
                      backgroundColor: colors.lightGray,
                      borderColor: colors.borderGray,
                    }}
                  >
                    <div
                      className="font-bold text-white mr-2.5 flex-shrink-0 rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      style={{ backgroundColor: colors.primaryRed }}
                    >
                      {index + 1}
                    </div>
                    <span
                      className="text-xs sm:text-sm"
                      style={{ color: colors.darkGray }}
                    >
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </motion.div>

            {/* For Travelers */}
            <motion.div
              className="bg-white rounded-xl shadow-md p-5 sm:p-6 border"
              style={{ borderColor: colors.borderGray }}
              initial={{ x: 30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                  style={{ backgroundColor: colors.lighterBlue }}
                >
                  <Plane
                    className="w-5 h-5"
                    style={{ color: colors.primaryBlue }}
                  />
                </div>
                <div>
                  <h3
                    className="text-base font-bold"
                    style={{ color: colors.darkGray }}
                  >
                    For Travelers
                  </h3>
                  <p className="text-xs text-gray-600">Earn while traveling</p>
                </div>
              </div>
              <ol className="space-y-2.5">
                {[
                  "Get verified with ID",
                  "Post your trip details",
                  "Accept package requests",
                  "Deliver and earn",
                ].map((step, index) => (
                  <li
                    key={index}
                    className="flex items-start p-2.5 rounded-lg border"
                    style={{
                      backgroundColor: colors.lightGray,
                      borderColor: colors.borderGray,
                    }}
                  >
                    <div
                      className="font-bold text-white mr-2.5 flex-shrink-0 rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      style={{ backgroundColor: colors.primaryBlue }}
                    >
                      {index + 1}
                    </div>
                    <span
                      className="text-xs sm:text-sm"
                      style={{ color: colors.darkGray }}
                    >
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features - Compact */}
      <div className="bg-white py-10 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2
              className="text-2xl sm:text-3xl font-bold mb-2"
              style={{ color: colors.darkGray }}
            >
              Why Choose Nasosend?
            </h2>
            <p className="text-sm text-gray-600">
              Trusted community with security and transparency
            </p>
          </div>

          <div className="grid gap-5 sm:gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {[
              {
                icon: Shield,
                title: "Secure & Verified",
                description:
                  "All travelers verified with government ID and flight documentation.",
                badge: "100% ID Verified",
                bgColor: colors.lighterBlue,
                iconColor: colors.primaryBlue,
                badgeColor: colors.primaryBlue,
              },
              {
                icon: Handshake,
                title: "Trusted Community",
                description:
                  "Verified members with ratings and reviews for peace of mind.",
                badge: "5-Star Rating",
                bgColor: colors.gold,
                iconColor: colors.white,
                badgeColor: colors.gold,
              },
              {
                icon: DollarSign,
                title: "Fair Pricing",
                description:
                  "Transparent pricing with no hidden fees. Pay directly to travelers.",
                badge: "0% Platform Fees",
                bgColor: colors.lighterRed,
                iconColor: colors.primaryRed,
                badgeColor: colors.primaryRed,
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="text-center p-5 rounded-xl bg-white shadow-md border"
                style={{ borderColor: colors.borderGray }}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-3"
                  style={{ backgroundColor: feature.bgColor }}
                >
                  <feature.icon
                    className="w-6 h-6"
                    style={{ color: feature.iconColor }}
                  />
                </div>
                <h3
                  className="text-base font-bold mb-2"
                  style={{ color: colors.darkGray }}
                >
                  {feature.title}
                </h3>
                <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                  {feature.description}
                </p>
                <div
                  className="rounded-full px-3 py-1 inline-block border text-xs font-medium"
                  style={{
                    backgroundColor: colors.white,
                    borderColor: colors.borderGray,
                    color: feature.badgeColor,
                  }}
                >
                  {feature.badge}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
