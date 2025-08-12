"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { doc, updateDoc } from "firebase/firestore"; // Import doc and updateDoc
import { db } from "@/lib/firebase";
import {
  Package,
  Plane,
  Users,
  Shield,
  CheckCircle,
  ArrowRight,
  MapPin,
  Clock,
  DollarSign,
  Star,
  CreditCard,
  Gift,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const [selectedRole, setSelectedRole] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const [mounted, setMounted] = useState(false);

  // A more professional, globally defined color palette
  const colors = {
    primaryRed: "#DC143C",
    primaryRedHover: "#B01030",
    primaryBlue: "#003366",
    primaryBlueHover: "#002A52",
    gold: "#FFD700",
    goldLight: "#FFFBEB",
    goldDark: "#A17300",
    white: "#FFFFFF",
    darkGray: "#2E2E2E",
    lightGray: "#F5F5F5",
    borderGray: "#D9D9D9",
    lighterRed: "#FFF5F5",
    lighterBlue: "#F0F4F8",
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRoleSelection = async (role) => {
    setSelectedRole(role);
    setIsNavigating(true);

    // Save preference to database if user exists
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          lastActiveRole: role,
          updatedAt: new Date(),
        });
      } catch (error) {
        console.error("Error updating preference:", error);
      }
    }

    // Navigate based on role selection
    if (role === "traveler") {
      if (userProfile?.verified) {
        router.push("/traveler/dashboard");
      } else {
        router.push("/traveler/verification");
      }
    } else if (role === "sender") {
      if (userProfile?.verified) {
        router.push("/sender/dashboard");
      } else {
        router.push("/sender/verification");
      }
    }
  };

  if (loading || !user) {
    return null;
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: colors.lightGray }}
    >
      {/* Compact Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full -mr-32 -mt-32 opacity-10"
          style={{
            background: `linear-gradient(to bottom left, ${colors.primaryBlue}, transparent)`,
          }}
        ></div>
        <div
          className="absolute bottom-0 left-0 w-56 h-56 rounded-full -ml-28 -mb-28 opacity-10"
          style={{
            background: `linear-gradient(to top right, ${colors.primaryRed}, transparent)`,
          }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full opacity-5"
          style={{
            background: `linear-gradient(to right, ${colors.primaryBlue}, ${colors.primaryRed})`,
          }}
        ></div>
      </div>

      <div className="relative mt-4 max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        {/* Compact Welcome Header */}
        <div
          className={`text-center mb-8 sm:mb-12 ${
            mounted ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <div className="mb-4 sm:mb-6">
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2"
              style={{ color: colors.primaryBlue }}
            >
              Welcome back
              {userProfile?.displayName && (
                <span
                  className="block text-xl sm:text-2xl lg:text-3xl mt-1"
                  style={{ color: colors.darkGray }}
                >
                  {userProfile.displayName}!
                </span>
              )}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
              Choose your role and connect with our trusted community
            </p>
          </div>
        </div>

        {/* Compact Role Selection Cards */}
        <div
          className={`grid lg:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto mb-8 sm:mb-12 ${
            mounted ? "animate-fade-in-up" : "opacity-0"
          } animation-delay-200`}
        >
          {/* Compact Sender Card */}
          <div
            onClick={() => !isNavigating && handleRoleSelection("sender")}
            className={`group relative rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden border ${
              isNavigating && selectedRole !== "sender" ? "opacity-50" : ""
            }`}
            style={{
              backgroundColor: colors.white,
              borderColor: colors.borderGray,
            }}
          >
            {/* Compact Red Gradient Header */}
            <div
              className="p-4 sm:p-6 text-white relative overflow-hidden"
              style={{
                background: `linear-gradient(to bottom right, ${colors.primaryRed}, ${colors.primaryRedHover})`,
              }}
            >
              <div className="absolute inset-0 bg-black opacity-5"></div>
              <div
                className="absolute top-0 right-0 w-20 h-20 rounded-full -mr-10 -mt-10"
                style={{ backgroundColor: colors.white, opacity: 0.08 }}
              ></div>

              <div className="relative">
                <div
                  className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
                  style={{ backgroundColor: `rgba(255, 255, 255, 0.2)` }}
                >
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8 text-white"
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
                <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
                  I Want to Send
                </h2>
                <p
                  className="text-sm sm:text-base leading-relaxed"
                  style={{ color: "rgba(255, 255, 255, 0.9)" }}
                >
                  Connect with verified travelers heading to your destination
                </p>
              </div>
            </div>

            {/* Compact Features */}
            <div className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex items-start group/item">
                  <div
                    className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mr-3 group-hover/item:scale-110 transition-transform"
                    style={{ backgroundColor: colors.lightGray }}
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      style={{ color: colors.primaryBlue }}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-bold text-sm sm:text-base mb-1"
                      style={{ color: colors.darkGray }}
                    >
                      Browse Verified Travelers
                    </h3>
                    <p className="text-xs sm:text-sm leading-relaxed text-gray-600">
                      All travelers are verified with ID and flight details
                    </p>
                  </div>
                </div>

                <div className="flex items-start group/item">
                  <div
                    className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mr-3 group-hover/item:scale-110 transition-transform"
                    style={{ backgroundColor: colors.lightGray }}
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      style={{ color: colors.primaryRed }}
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
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-bold text-sm sm:text-base mb-1"
                      style={{ color: colors.darkGray }}
                    >
                      Secure Payments
                    </h3>
                    <p className="text-xs sm:text-sm leading-relaxed text-gray-600">
                      Safe and transparent payment system
                    </p>
                  </div>
                </div>
              </div>

              {/* Compact Verification Status for Senders */}
              {!userProfile?.verified && (
                <div
                  className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg sm:rounded-xl border"
                  style={{
                    backgroundColor: colors.goldLight,
                    borderColor: colors.gold,
                  }}
                >
                  <div className="flex items-start">
                    <div
                      className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mr-3"
                      style={{ backgroundColor: colors.gold }}
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4
                        className="font-bold text-sm sm:text-base mb-1"
                        style={{ color: colors.goldDark }}
                      >
                        Identity Verification Required
                      </h4>
                      <p className="text-xs sm:text-sm leading-relaxed text-gray-600">
                        Verify your identity to send items with confidence
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Compact Action Button */}
              <div
                className="relative overflow-hidden rounded-lg sm:rounded-xl p-0.5 group-hover:from-purple-600 group-hover:to-pink-700 transition-all duration-300"
                style={{
                  background: `linear-gradient(to right, ${colors.primaryRed}, ${colors.primaryRedHover})`,
                }}
              >
                <div
                  className="rounded-lg sm:rounded-xl px-4 py-3 group-hover:bg-[#FDE7E7] transition-colors"
                  style={{ backgroundColor: colors.white }}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <span
                        className="font-bold text-sm sm:text-base"
                        style={{ color: colors.primaryRed }}
                      >
                        {userProfile?.verified
                          ? "Browse Travelers"
                          : "Start Verification"}
                      </span>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: colors.primaryRed }}
                      >
                        {userProfile?.verified
                          ? "Find your perfect delivery partner"
                          : "Quick 3-minute setup process"}
                      </p>
                    </div>
                    <div
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ml-3"
                      style={{ backgroundColor: colors.lighterRed }}
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform"
                        style={{ color: colors.primaryRed }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isNavigating && selectedRole === "sender" && (
              <div className="absolute inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <div className="relative">
                    <div
                      className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-3 mx-auto"
                      style={{ borderColor: colors.borderGray }}
                    ></div>
                    <div
                      className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-3 border-t-transparent absolute top-0 left-0"
                      style={{
                        borderColor: colors.primaryRed,
                        animationDirection: "reverse",
                        animationDuration: "0.8s",
                      }}
                    ></div>
                  </div>
                  <p
                    className="font-medium mt-3 text-sm sm:text-base"
                    style={{ color: colors.primaryRed }}
                  >
                    {userProfile?.verified
                      ? "Preparing your sender dashboard..."
                      : "Preparing verification process..."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Compact Traveler Card */}
          <div
            onClick={() => !isNavigating && handleRoleSelection("traveler")}
            className={`group relative rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden border ${
              isNavigating && selectedRole !== "traveler" ? "opacity-50" : ""
            }`}
            style={{
              backgroundColor: colors.white,
              borderColor: colors.borderGray,
            }}
          >
            {/* Compact Blue Gradient Header */}
            <div
              className="p-4 sm:p-6 text-white relative overflow-hidden"
              style={{
                background: `linear-gradient(to bottom right, ${colors.primaryBlue}, ${colors.primaryBlueHover})`,
              }}
            >
              <div className="absolute inset-0 bg-black opacity-5"></div>
              <div
                className="absolute top-0 right-0 w-20 h-20 rounded-full -mr-10 -mt-10"
                style={{ backgroundColor: colors.white, opacity: 0.08 }}
              ></div>

              <div className="relative">
                <div
                  className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
                  style={{ backgroundColor: `rgba(255, 255, 255, 0.2)` }}
                >
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 919-9"
                    />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
                  I'm Traveling
                </h2>
                <p
                  className="text-sm sm:text-base leading-relaxed"
                  style={{ color: "rgba(255, 255, 255, 0.9)" }}
                >
                  Turn your journey into earnings by helping others
                </p>
              </div>
            </div>

            {/* Compact Features */}
            <div className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex items-start group/item">
                  <div
                    className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mr-3 group-hover/item:scale-110 transition-transform"
                    style={{ backgroundColor: colors.lightGray }}
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      style={{ color: colors.primaryRed }}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-bold text-sm sm:text-base mb-1"
                      style={{ color: colors.darkGray }}
                    >
                      Set Your Own Rates
                    </h3>
                    <p className="text-xs sm:text-sm leading-relaxed text-gray-600">
                      Decide how much to charge per kilogram
                    </p>
                  </div>
                </div>

                <div className="flex items-start group/item">
                  <div
                    className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mr-3 group-hover/item:scale-110 transition-transform"
                    style={{ backgroundColor: colors.lightGray }}
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      style={{ color: colors.primaryBlue }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-bold text-sm sm:text-base mb-1"
                      style={{ color: colors.darkGray }}
                    >
                      Choose What to Carry
                    </h3>
                    <p className="text-xs sm:text-sm leading-relaxed text-gray-600">
                      Accept only the items you're comfortable with
                    </p>
                  </div>
                </div>

                <div className="flex items-start group/item">
                  <div
                    className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mr-3 group-hover/item:scale-110 transition-transform"
                    style={{ backgroundColor: colors.lightGray }}
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      style={{ color: colors.gold }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-bold text-sm sm:text-base mb-1"
                      style={{ color: colors.darkGray }}
                    >
                      Build Your Reputation
                    </h3>
                    <p className="text-xs sm:text-sm leading-relaxed text-gray-600">
                      Earn ratings and become a trusted traveler
                    </p>
                  </div>
                </div>
              </div>

              {/* Compact Verification Status */}
              {!userProfile?.verified && (
                <div
                  className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg sm:rounded-xl border"
                  style={{
                    backgroundColor: colors.goldLight,
                    borderColor: colors.gold,
                  }}
                >
                  <div className="flex items-start">
                    <div
                      className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mr-3"
                      style={{ backgroundColor: colors.gold }}
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4
                        className="font-bold text-sm sm:text-base mb-1"
                        style={{ color: colors.goldDark }}
                      >
                        Identity Verification Required
                      </h4>
                      <p className="text-xs sm:text-sm leading-relaxed text-gray-600">
                        You'll need to verify your identity before posting trips
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Compact Action Button */}
              <div
                className="relative overflow-hidden rounded-lg sm:rounded-xl p-0.5 group-hover:from-blue-600 group-hover:to-indigo-700 transition-all duration-300"
                style={{
                  background: `linear-gradient(to right, ${colors.primaryBlue}, ${colors.primaryBlueHover})`,
                }}
              >
                <div
                  className="rounded-lg sm:rounded-xl px-4 py-3 group-hover:bg-[#E5E9EC] transition-colors"
                  style={{ backgroundColor: colors.white }}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <span
                        className="font-bold text-sm sm:text-base"
                        style={{ color: colors.primaryBlue }}
                      >
                        {userProfile?.verified
                          ? "Go to Dashboard"
                          : "Start Verification"}
                      </span>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: colors.primaryBlue }}
                      >
                        {userProfile?.verified
                          ? "Manage your trips and earnings"
                          : "Quick 3-minute setup process"}
                      </p>
                    </div>
                    <div
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ml-3"
                      style={{ backgroundColor: colors.lighterBlue }}
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform"
                        style={{ color: colors.primaryBlue }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isNavigating && selectedRole === "traveler" && (
              <div className="absolute inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <div className="relative">
                    <div
                      className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-3 mx-auto"
                      style={{ borderColor: colors.borderGray }}
                    ></div>
                    <div
                      className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-3 border-t-transparent absolute top-0 left-0"
                      style={{
                        borderColor: colors.primaryBlue,
                        animationDirection: "reverse",
                        animationDuration: "0.8s",
                      }}
                    ></div>
                  </div>
                  <p
                    className="font-medium mt-3 text-sm sm:text-base"
                    style={{ color: colors.primaryBlue }}
                  >
                    {userProfile?.verified
                      ? "Loading your dashboard..."
                      : "Preparing verification process..."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Compact Help Section */}
        <div
          className={`text-center ${
            mounted ? "animate-fade-in-up" : "opacity-0"
          } animation-delay-400`}
        >
          <div
            className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md border max-w-xl mx-auto"
            style={{ borderColor: colors.borderGray }}
          >
            <div className="mb-4 sm:mb-6">
              <div
                className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl mb-2 sm:mb-3"
                style={{ backgroundColor: colors.lightGray }}
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3
                className="text-lg sm:text-xl font-bold mb-2"
                style={{ color: colors.darkGray }}
              >
                Have any questions?
              </h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                We're here to guide you through your journey with comprehensive
                resources and support
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/how-it-works"
                className="inline-flex items-center justify-center px-4 py-2.5 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-md text-sm"
                style={{
                  background: `linear-gradient(to right, ${colors.primaryBlue}, ${colors.primaryBlueHover})`,
                }}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                How It Works
              </a>
              <a
                href="/support"
                className="inline-flex items-center justify-center px-4 py-2.5 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-md border text-sm"
                style={{
                  backgroundColor: colors.white,
                  color: colors.darkGray,
                  borderColor: colors.borderGray,
                }}
              >
                <svg
                  className="w-4 h-4 mr-2 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
