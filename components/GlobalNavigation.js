//components/GlobalNavigation.js
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";

export default function GlobalNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, userProfile, loading } = useAuth();
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentAccountType, setCurrentAccountType] = useState("");

  useEffect(() => {
    // Determine current account type based on path
    if (pathname?.includes("/sender")) {
      setCurrentAccountType("sender");
    } else if (pathname?.includes("/traveler")) {
      setCurrentAccountType("traveler");
    } else {
      setCurrentAccountType("");
    }
  }, [pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setShowAccountDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setShowMobileMenu(false);
    setShowAccountDropdown(false);
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
      setShowAccountDropdown(false);
      setShowMobileMenu(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleMenuItemClick = () => {
    setShowAccountDropdown(false);
    setShowMobileMenu(false);
  };

  // Shared menu items component
  const MenuItems = ({ isMobile = false }) => {
    const baseClasses = isMobile
      ? "flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
      : "flex items-center px-4 sm:px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors group";

    const iconContainerClasses = isMobile
      ? "w-5 h-5 text-gray-500 mr-3"
      : "w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 group-hover:bg-gray-200 transition-colors flex-shrink-0";

    return (
      <>
        <Link
          href="/profile"
          onClick={handleMenuItemClick}
          className={baseClasses}
        >
          {isMobile ? (
            <svg
              className={iconContainerClasses}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          ) : (
            <div className={iconContainerClasses}>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}
          <div className="min-w-0">
            <span className="font-semibold">Profile Settings</span>
            {!isMobile && (
              <p className="text-xs text-gray-500">Manage your account</p>
            )}
          </div>
        </Link>

        {currentAccountType === "sender" && (
          <Link
            href="/sender/shipments"
            onClick={handleMenuItemClick}
            className={baseClasses}
          >
            {isMobile ? (
              <svg
                className={iconContainerClasses}
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
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 group-hover:bg-purple-200 transition-colors flex-shrink-0">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600"
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
            )}
            <div className="min-w-0">
              <span className="font-semibold">My Shipments</span>
              {!isMobile && (
                <p className="text-xs text-gray-500">Track your packages</p>
              )}
            </div>
          </Link>
        )}

        {currentAccountType === "traveler" && (
          <Link
            href="/traveler/trips"
            onClick={handleMenuItemClick}
            className={baseClasses}
          >
            {isMobile ? (
              <svg
                className={iconContainerClasses}
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
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 group-hover:bg-blue-200 transition-colors flex-shrink-0">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"
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
            )}
            <div className="min-w-0">
              <span className="font-semibold">My Trips</span>
              {!isMobile && (
                <p className="text-xs text-gray-500">Manage your journeys</p>
              )}
            </div>
          </Link>
        )}

        <Link
          href="/notifications"
          onClick={handleMenuItemClick}
          className={
            isMobile
              ? "flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
              : baseClasses
          }
        >
          {isMobile ? (
            <>
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-gray-500 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="font-semibold">Notifications</span>
              </div>
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold">
                3
              </span>
            </>
          ) : (
            <>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 group-hover:bg-yellow-200 transition-colors flex-shrink-0">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <div className="flex-1 flex items-center justify-between min-w-0">
                <div className="min-w-0">
                  <span className="font-semibold">Notifications</span>
                  <p className="text-xs text-gray-500">View your updates</p>
                </div>
                <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full px-2 py-1 font-bold shadow-sm flex-shrink-0">
                  3
                </span>
              </div>
            </>
          )}
        </Link>

        {/* Sign Out */}
        <div className={isMobile ? "" : "border-t border-gray-100 py-2"}>
          <button
            onClick={handleSignOut}
            className={
              isMobile
                ? "flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                : "flex items-center w-full px-4 sm:px-6 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors group"
            }
          >
            {isMobile ? (
              <svg
                className="w-5 h-5 text-red-600 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 group-hover:bg-red-200 transition-colors flex-shrink-0">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>
            )}
            <div className="min-w-0">
              <span className="font-semibold">Sign Out</span>
              {!isMobile && (
                <p className="text-xs text-gray-500">End your session</p>
              )}
            </div>
          </button>
        </div>
      </>
    );
  };

  const handleAccountSwitch = async (accountType) => {
    setShowAccountDropdown(false);
    setShowMobileMenu(false);

    // Save preference to database
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          lastActiveRole: accountType,
          updatedAt: new Date(),
        });
      } catch (error) {
        console.error("Error updating preference:", error);
      }
    }

    // Navigate to appropriate dashboard
    if (accountType === "sender") {
      router.push("/sender/dashboard");
    } else if (accountType === "traveler") {
      if (userProfile?.verified) {
        router.push("/traveler/dashboard");
      } else {
        router.push("/traveler/verification");
      }
    }
  };

  const getAccountBadge = () => {
    if (currentAccountType === "sender") {
      return (
        <span className="ml-2 px-2 py-1 text-xs font-semibold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full border border-purple-200">
          Sender
        </span>
      );
    } else if (currentAccountType === "traveler") {
      return (
        <span className="ml-2 px-2 py-1 text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full border border-blue-200">
          Traveler
        </span>
      );
    }
    return null;
  };

  const getVerificationBadge = () => {
    if (currentAccountType === "traveler" && userProfile?.verified) {
      return (
        <div className="ml-2 w-4 h-4 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center">
          <svg
            className="w-2.5 h-2.5 text-white"
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
      );
    }
    return null;
  };

  const navItems = [
    {
      href: user ? "/dashboard" : "/",
      label: "Home",
      paths: ["/dashboard", "/"],
    },
    { href: "/blogs", label: "Blog", paths: ["/blogs"] },
    { href: "/how-it-works", label: "How It Works", paths: ["/how-it-works"] },
    { href: "/support", label: "Support", paths: ["/support"] },
  ];

  // Don't show navigation on login page
  if (pathname === "/login") {
    return null;
  }

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo and Main Nav */}
          <div className="flex items-center min-w-0">
            <Link
              href="/dashboard"
              className="flex items-center group flex-shrink-0"
            >
              <div className="relative">
                <Image
                  src="/nasosend.jpg"
                  alt="Nasosend Logo"
                  width={60}
                  height={40}
                  className="h-10 sm:h-12 lg:h-14 w-auto transition-transform group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-green-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center ml-8 xl:ml-12 space-x-1">
              {navItems.map((item) => {
                const isActive = item.paths.includes(pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-3 xl:px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-xl whitespace-nowrap ${
                      isActive
                        ? "text-blue-600 bg-blue-50 shadow-sm"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Side - Desktop Account Menu / Mobile Menu Button */}
          <div className="flex items-center space-x-4 min-w-0">
            {/* Desktop Only - User Account */}
            {loading ? (
              <div className="hidden lg:flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-sm text-gray-600">Loading...</span>
              </div>
            ) : user ? (
              <div className="relative dropdown-container hidden lg:block">
                <button
                  onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                  className="flex items-center space-x-3 px-4 py-2 rounded-2xl hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:border-gray-300 hover:shadow-md bg-white/80 backdrop-blur-sm"
                >
                  <div className="flex items-center">
                    {/* Enhanced Profile Picture */}
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-green-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg">
                        {userProfile?.verification?.fullName?.charAt(0) ||
                          user.email?.charAt(0) ||
                          "U"}
                      </div>
                      {userProfile?.verified &&
                        currentAccountType === "traveler" && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <svg
                              className="w-2 h-2 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                    </div>

                    <div className="ml-3 text-left">
                      <div className="text-sm font-bold text-gray-900 flex items-center">
                        <span className="truncate max-w-32">
                          {userProfile?.verification?.fullName || "User"}
                        </span>
                        {getVerificationBadge()}
                        {getAccountBadge()}
                      </div>
                      <p className="text-xs text-gray-500 truncate max-w-32">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      showAccountDropdown ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Desktop Account Dropdown */}
                {showAccountDropdown && (
                  <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden animate-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-100px)] overflow-y-auto">
                    {/* Account Type Section */}
                    <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-blue-50/50">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
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
                            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                          />
                        </svg>
                        Switch Account
                      </p>
                      <div className="space-y-3">
                        <button
                          onClick={() => handleAccountSwitch("sender")}
                          className={`w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-200 ${
                            currentAccountType === "sender"
                              ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-md border border-purple-200"
                              : "hover:bg-gray-100 text-gray-700 border border-gray-200"
                          }`}
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                              <svg
                                className="w-5 h-5 text-white"
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
                            <div className="text-left">
                              <span className="font-bold text-lg">
                                Sender Account
                              </span>
                              <p className="text-xs text-gray-600">
                                Send packages with travelers
                              </p>
                            </div>
                          </div>
                          {currentAccountType === "sender" && (
                            <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </button>

                        <button
                          onClick={() => handleAccountSwitch("traveler")}
                          className={`w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-200 ${
                            currentAccountType === "traveler"
                              ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 shadow-md border border-blue-200"
                              : "hover:bg-gray-100 text-gray-700 border border-gray-200"
                          }`}
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                              <svg
                                className="w-5 h-5 text-white"
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
                            <div className="text-left">
                              <span className="font-bold text-lg">
                                Traveler Account
                              </span>
                              <p className="text-xs text-gray-600">
                                Earn by delivering packages
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {!userProfile?.verified &&
                              currentAccountType !== "traveler" && (
                                <span className="text-xs bg-gradient-to-r from-amber-400 to-orange-400 text-white px-3 py-1 rounded-full mr-2 font-bold shadow-sm">
                                  Verify
                                </span>
                              )}
                            {currentAccountType === "traveler" && (
                              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-4 h-4 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <MenuItems />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden lg:flex items-center space-x-3">
                <Link
                  href="/login"
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white text-sm font-bold rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Login
                </Link>
              </div>
            )}

            {/* Mobile Menu Button - Always Visible on Mobile */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-3 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <svg
                className={`w-6 h-6 transition-transform duration-200 ${
                  showMobileMenu ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {showMobileMenu ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md">
            <div className="px-4 py-4 space-y-3 max-h-[calc(100vh-80px)] overflow-y-auto">
              {/* Navigation Items - Compact */}
              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => {
                  const isActive = item.paths.includes(pathname);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block px-3 py-2 rounded-lg text-sm font-semibold transition-all text-center ${
                        isActive
                          ? "text-blue-600 bg-blue-50 border border-blue-200"
                          : "text-gray-700 hover:bg-gray-50 border border-transparent"
                      }`}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {/* User Section - Only show if user is logged in */}
              {user ? (
                <div className="border-t border-gray-200 pt-3 space-y-3">
                  {/* User Profile Display - Compact */}
                  <div className="flex items-center px-3 py-2 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-green-500 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md relative">
                      {userProfile?.verification?.fullName?.charAt(0) ||
                        user.email?.charAt(0) ||
                        "U"}
                      {userProfile?.verified &&
                        currentAccountType === "traveler" && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <svg
                              className="w-1.5 h-1.5 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                    </div>
                    <div className="ml-3 min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {userProfile?.verification?.fullName || "User"}
                        </p>
                        {currentAccountType && (
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                              currentAccountType === "sender"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {currentAccountType === "sender" ? "S" : "T"}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Account Type Switcher - Horizontal */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAccountSwitch("sender")}
                      className={`flex items-center justify-center px-3 py-2 rounded-lg transition-all ${
                        currentAccountType === "sender"
                          ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md flex items-center justify-center mr-2">
                        <svg
                          className="w-3 h-3 text-white"
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
                      <span className="text-sm font-semibold">Sender</span>
                    </button>

                    <button
                      onClick={() => handleAccountSwitch("traveler")}
                      className={`flex items-center justify-center px-3 py-2 rounded-lg transition-all relative ${
                        currentAccountType === "traveler"
                          ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-md flex items-center justify-center mr-2">
                        <svg
                          className="w-3 h-3 text-white"
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
                      <span className="text-sm font-semibold">Traveler</span>
                      {!userProfile?.verified &&
                        currentAccountType !== "traveler" && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">
                              !
                            </span>
                          </div>
                        )}
                    </button>
                  </div>

                  {/* Menu Actions - Compact Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/profile"
                      onClick={handleMenuItemClick}
                      className="flex flex-col items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-gray-500 mb-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="text-xs font-semibold">Profile</span>
                    </Link>

                    <Link
                      href="/notifications"
                      onClick={handleMenuItemClick}
                      className="flex flex-col items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors relative"
                    >
                      <svg
                        className="w-5 h-5 text-gray-500 mb-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                      <span className="text-xs font-semibold">
                        Notifications
                      </span>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">3</span>
                      </div>
                    </Link>

                    {/* Account Specific Items */}
                    {currentAccountType === "sender" && (
                      <Link
                        href="/sender/shipments"
                        onClick={handleMenuItemClick}
                        className="flex flex-col items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <svg
                          className="w-5 h-5 text-purple-500 mb-1"
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
                        <span className="text-xs font-semibold">Shipments</span>
                      </Link>
                    )}

                    {currentAccountType === "traveler" && (
                      <Link
                        href="/traveler/trips"
                        onClick={handleMenuItemClick}
                        className="flex flex-col items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <svg
                          className="w-5 h-5 text-blue-500 mb-1"
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
                        <span className="text-xs font-semibold">Trips</span>
                      </Link>
                    )}

                    <button
                      onClick={handleSignOut}
                      className="flex flex-col items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-red-600 mb-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span className="text-xs font-semibold">Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Login Section for non-authenticated users */
                <div className="border-t border-gray-200 pt-3">
                  <Link
                    href="/login"
                    className="block w-full px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white text-center font-bold rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-green-700 transition-all duration-200 shadow-lg"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
