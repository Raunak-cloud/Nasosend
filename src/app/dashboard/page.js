"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CreditCard, DollarSign, Shield, Star } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const [selectedRole, setSelectedRole] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const [mounted, setMounted] = useState(false);

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
      {/* Background decorative elements */}
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
      </div>

      <div className="relative mt-4 max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Welcome Header */}
        <div
          className={`text-center mb-4 sm:mb-8 ${
            mounted ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1.5 sm:mb-2"
            style={{ color: colors.primaryBlue }}
          >
            Welcome back
            {userProfile?.verification.fullName && (
              <span
                className="block text-xl sm:text-2xl lg:text-3xl mt-1"
                style={{ color: colors.darkGray }}
              >
                {userProfile.verification.fullName}!
              </span>
            )}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
            Choose your role and connect with our trusted community
          </p>
        </div>

        {/* Role Selection Cards */}
        <div
          className={`grid grid-cols-2 gap-3 sm:gap-6 max-w-5xl mx-auto mb-4 sm:mb-8 ${
            mounted ? "animate-fade-in-up" : "opacity-0"
          } animation-delay-200`}
        >
          {/* Sender Card */}
          <div
            onClick={() => !isNavigating && handleRoleSelection("sender")}
            className={`group relative rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border ${
              isNavigating && selectedRole !== "sender" ? "opacity-50" : ""
            }`}
            style={{
              backgroundColor: colors.white,
              borderColor: colors.borderGray,
            }}
          >
            {/* Red Gradient Header */}
            <div
              className="p-4 sm:p-5 text-white relative overflow-hidden"
              style={{
                background: `linear-gradient(to bottom right, ${colors.primaryRed}, ${colors.primaryRedHover})`,
              }}
            >
              <div className="absolute inset-0 bg-black opacity-5"></div>

              <div className="relative flex items-start justify-between">
                <div className="flex-1">
                  <div
                    className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-lg mb-3 group-hover:scale-110 transition-all duration-300"
                    style={{ backgroundColor: `rgba(255, 255, 255, 0.2)` }}
                  >
                    <svg
                      className="w-6 h-6 sm:w-7 sm:h-7 text-white"
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
                  <h2 className="text-xl sm:text-2xl font-bold mb-1.5">
                    I Want to Send
                  </h2>
                  <p
                    className="text-sm sm:text-base leading-relaxed"
                    style={{ color: "rgba(255, 255, 255, 0.95)" }}
                  >
                    Send packages to Nepal safely and affordably
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-5">
              {/* Key Features */}
              <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                <div className="flex items-start">
                  <Shield
                    className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0 mt-0.5"
                    style={{ color: colors.primaryBlue }}
                  />
                  <div className="min-w-0">
                    <h3
                      className="font-semibold text-xs sm:text-sm"
                      style={{ color: colors.darkGray }}
                    >
                      Browse Verified Travelers
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed hidden sm:block">
                      All travelers verified with government ID and flight
                      details
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CreditCard
                    className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0 mt-0.5"
                    style={{ color: colors.primaryRed }}
                  />
                  <div className="min-w-0">
                    <h3
                      className="font-semibold text-xs sm:text-sm"
                      style={{ color: colors.darkGray }}
                    >
                      Direct & Secure Payments
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed hidden sm:block">
                      Pay directly to travelers with secure transaction
                      protection
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <DollarSign
                    className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0 mt-0.5"
                    style={{ color: colors.gold }}
                  />
                  <div className="min-w-0">
                    <h3
                      className="font-semibold text-xs sm:text-sm"
                      style={{ color: colors.darkGray }}
                    >
                      Transparent Pricing
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed hidden sm:block">
                      Compare rates and choose what works for your budget
                    </p>
                  </div>
                </div>
              </div>

              {/* Verification Notice */}
              {!userProfile?.verified && (
                <div
                  className="mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg border"
                  style={{
                    backgroundColor: colors.goldLight,
                    borderColor: colors.gold,
                  }}
                >
                  <div className="flex items-start">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0 mt-0.5"
                      style={{ color: colors.goldDark }}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="min-w-0">
                      <h4
                        className="font-semibold text-xs sm:text-sm mb-0.5"
                        style={{ color: colors.goldDark }}
                      >
                        Verification Required
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Complete quick identity verification to start sending
                        packages
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div
                className="relative overflow-hidden rounded-lg p-0.5 transition-all duration-300"
                style={{
                  background: `linear-gradient(to right, ${colors.primaryRed}, ${colors.primaryRedHover})`,
                }}
              >
                <div
                  className="rounded-lg px-3 py-2 sm:px-4 sm:py-3 group-hover:bg-red-50 transition-colors"
                  style={{ backgroundColor: colors.white }}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <span
                        className="font-bold text-xs sm:text-base"
                        style={{ color: colors.primaryRed }}
                      >
                        {userProfile?.verified ? "Browse" : "Verify"}
                      </span>
                      <p
                        className="text-xs mt-0.5 hidden sm:block"
                        style={{ color: colors.primaryRed }}
                      >
                        {userProfile?.verified
                          ? "Find your delivery partner"
                          : "Takes only 3 minutes"}
                      </p>
                    </div>
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform ml-2"
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

            {isNavigating && selectedRole === "sender" && (
              <div className="absolute inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <div
                    className="animate-spin rounded-full h-12 w-12 border-4 mx-auto mb-3"
                    style={{
                      borderColor: colors.borderGray,
                      borderTopColor: colors.primaryRed,
                    }}
                  ></div>
                  <p
                    className="font-medium text-sm"
                    style={{ color: colors.primaryRed }}
                  >
                    {userProfile?.verified
                      ? "Preparing your dashboard..."
                      : "Starting verification..."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Traveler Card */}
          <div
            onClick={() => !isNavigating && handleRoleSelection("traveler")}
            className={`group relative rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border ${
              isNavigating && selectedRole !== "traveler" ? "opacity-50" : ""
            }`}
            style={{
              backgroundColor: colors.white,
              borderColor: colors.borderGray,
            }}
          >
            {/* Blue Gradient Header */}
            <div
              className="p-4 sm:p-5 text-white relative overflow-hidden"
              style={{
                background: `linear-gradient(to bottom right, ${colors.primaryBlue}, ${colors.primaryBlueHover})`,
              }}
            >
              <div className="absolute inset-0 bg-black opacity-5"></div>

              <div className="relative flex items-start justify-between">
                <div className="flex-1">
                  <div
                    className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-lg mb-3 group-hover:scale-110 transition-all duration-300"
                    style={{ backgroundColor: `rgba(255, 255, 255, 0.2)` }}
                  >
                    <svg
                      className="w-6 h-6 sm:w-7 sm:h-7 text-white"
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
                  <h2 className="text-xl sm:text-2xl font-bold mb-1.5">
                    I'm Traveling
                  </h2>
                  <p
                    className="text-sm sm:text-base leading-relaxed"
                    style={{ color: "rgba(255, 255, 255, 0.95)" }}
                  >
                    Earn money while helping others on your journey
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-5">
              {/* Key Features */}
              <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                <div className="flex items-start">
                  <DollarSign
                    className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0 mt-0.5"
                    style={{ color: colors.primaryRed }}
                  />
                  <div className="min-w-0">
                    <h3
                      className="font-semibold text-xs sm:text-sm"
                      style={{ color: colors.darkGray }}
                    >
                      Set Your Own Rates
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed hidden sm:block">
                      Decide how much to charge per kilogram based on your
                      preferences
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Shield
                    className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0 mt-0.5"
                    style={{ color: colors.primaryBlue }}
                  />
                  <div className="min-w-0">
                    <h3
                      className="font-semibold text-xs sm:text-sm"
                      style={{ color: colors.darkGray }}
                    >
                      Full Control & Safety
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed hidden sm:block">
                      Accept only items you're comfortable with and review all
                      details
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Star
                    className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0 mt-0.5"
                    style={{ color: colors.gold }}
                  />
                  <div className="min-w-0">
                    <h3
                      className="font-semibold text-xs sm:text-sm"
                      style={{ color: colors.darkGray }}
                    >
                      Build Your Reputation
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed hidden sm:block">
                      Earn reviews and ratings to become a trusted community
                      member
                    </p>
                  </div>
                </div>
              </div>

              {/* Verification Notice */}
              {!userProfile?.verified && (
                <div
                  className="mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg border"
                  style={{
                    backgroundColor: colors.goldLight,
                    borderColor: colors.gold,
                  }}
                >
                  <div className="flex items-start">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0 mt-0.5"
                      style={{ color: colors.goldDark }}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="min-w-0">
                      <h4
                        className="font-semibold text-xs sm:text-sm mb-0.5"
                        style={{ color: colors.goldDark }}
                      >
                        Verification Required
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Verify your identity and flight details to start posting
                        trips
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div
                className="relative overflow-hidden rounded-lg p-0.5 transition-all duration-300"
                style={{
                  background: `linear-gradient(to right, ${colors.primaryBlue}, ${colors.primaryBlueHover})`,
                }}
              >
                <div
                  className="rounded-lg px-3 py-2 sm:px-4 sm:py-3 group-hover:bg-blue-50 transition-colors"
                  style={{ backgroundColor: colors.white }}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <span
                        className="font-bold text-xs sm:text-base"
                        style={{ color: colors.primaryBlue }}
                      >
                        {userProfile?.verified ? "Dashboard" : "Verify"}
                      </span>
                      <p
                        className="text-xs mt-0.5 hidden sm:block"
                        style={{ color: colors.primaryBlue }}
                      >
                        {userProfile?.verified
                          ? "Manage trips & earnings"
                          : "Takes only 3 minutes"}
                      </p>
                    </div>
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform ml-2"
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

            {isNavigating && selectedRole === "traveler" && (
              <div className="absolute inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <div
                    className="animate-spin rounded-full h-12 w-12 border-4 mx-auto mb-3"
                    style={{
                      borderColor: colors.borderGray,
                      borderTopColor: colors.primaryBlue,
                    }}
                  ></div>
                  <p
                    className="font-medium text-sm"
                    style={{ color: colors.primaryBlue }}
                  >
                    {userProfile?.verified
                      ? "Loading dashboard..."
                      : "Starting verification..."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div
          className={`text-center ${
            mounted ? "animate-fade-in-up" : "opacity-0"
          } animation-delay-400`}
        >
          <div
            className="bg-white rounded-xl p-4 sm:p-5 shadow-md border max-w-2xl mx-auto"
            style={{ borderColor: colors.borderGray }}
          >
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <a
                href="/how-it-works"
                className="inline-flex items-center px-5 py-2.5 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg text-sm"
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
                href="/help-center"
                className="inline-flex items-center px-5 py-2.5 font-medium rounded-lg transition-all duration-200 hover:bg-gray-50 border text-sm"
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
