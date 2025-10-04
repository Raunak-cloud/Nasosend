// components/GlobalNavigation.js

"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";

export default function GlobalNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, userProfile, loading } = useAuth();
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentAccountType, setCurrentAccountType] = useState("");
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const colors = {
    primaryRed: "#DC143C",
    primaryRedHover: "#B01030",
    primaryBlue: "#003366",
    primaryBlueHover: "#002244",
    green: "green",
    white: "#FFFFFF",
    darkGray: "#2E2E2E",
    lightGray: "#F5F5F5",
    borderGray: "#D9D9D9",
  };

  useEffect(() => {
    if (pathname?.includes("/sender")) {
      setCurrentAccountType("sender");
    } else if (pathname?.includes("/traveler")) {
      setCurrentAccountType("traveler");
    } else {
      setCurrentAccountType("");
    }
  }, [pathname]);

  useEffect(() => {
    if (!user) {
      setUnreadNotifications(0);
      return;
    }

    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const notifications = doc.data().notifications || [];
        const unreadCount = notifications.filter((n) => !n.read).length;
        setUnreadNotifications(unreadCount);
      } else {
        setUnreadNotifications(0);
      }
    });

    return () => unsubscribe();
  }, [user]);

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

  const MenuItems = ({ isMobile = false }) => {
    const baseClasses = isMobile
      ? "flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
      : "flex items-center px-4 sm:px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors group";

    const iconContainerClasses = isMobile
      ? "w-5 h-5 text-gray-500 mr-3"
      : "w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 group-hover:bg-gray-200 transition-colors flex-shrink-0";

    return (
      <>
        {/* Only show Profile Settings if user is verified */}
        {userProfile?.verified === true && (
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
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 919-9"
                />
              </svg>
            ) : (
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 transition-colors flex-shrink-0`}
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
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 919-9"
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
              {unreadNotifications > 0 && (
                <span
                  style={{ backgroundColor: colors.primaryRed }}
                  className="text-white text-xs rounded-full px-2 py-1 font-bold"
                >
                  {unreadNotifications}
                </span>
              )}
            </>
          ) : (
            <>
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 transition-colors flex-shrink-0`}
                style={{ backgroundColor: colors.lightGray }}
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  style={{ color: colors.green }}
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
                {unreadNotifications > 0 && (
                  <span
                    style={{ backgroundColor: colors.primaryRed }}
                    className="text-white text-xs rounded-full px-2 py-1 font-bold shadow-sm flex-shrink-0"
                  >
                    {unreadNotifications}
                  </span>
                )}
              </div>
            </>
          )}
        </Link>

        <div className={isMobile ? "" : `border-t border-gray-100 py-2`}>
          <button
            onClick={handleSignOut}
            className={
              isMobile
                ? `flex items-center w-full px-4 py-3 text-sm rounded-xl transition-colors`
                : `flex items-center w-full px-4 sm:px-6 py-3 text-sm transition-colors group`
            }
            style={{ color: colors.primaryRed }}
          >
            {isMobile ? (
              <svg
                className="w-5 h-5 mr-3"
                style={{ color: colors.primaryRed }}
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
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 transition-colors flex-shrink-0`}
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
        <span
          className="ml-2 px-2 py-1 text-xs font-semibold rounded-full border"
          style={{
            backgroundColor: "#FEEBEB",
            color: colors.primaryRed,
            borderColor: "#F0C8C8",
          }}
        >
          Sender
        </span>
      );
    } else if (currentAccountType === "traveler") {
      return (
        <span
          className="ml-2 px-2 py-1 text-xs font-semibold rounded-full border"
          style={{
            backgroundColor: "#E5E9EC",
            color: colors.primaryBlue,
            borderColor: "#C8D9E0",
          }}
        >
          Traveler
        </span>
      );
    }
    return null;
  };

  const getVerificationBadge = () => {
    if (currentAccountType === "traveler" && userProfile?.verified) {
      return (
        <div
          className="ml-2 w-4 h-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: colors.green }}
        >
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

  const getNavItems = () => {
    const items = [
      {
        href: user ? "/dashboard" : "/",
        label: "Home",
        paths: ["/dashboard", "/"],
      },
      { href: "/blogs", label: "Blog", paths: ["/blogs"] },
      {
        href: "/how-it-works",
        label: "How It Works",
        paths: ["/how-it-works"],
      },
      { href: "/help-center", label: "Support", paths: ["/help-center"] },
    ];

    if (userProfile?.role === "support") {
      items.push({
        href: "/support/dashboard",
        label: "Admin",
        paths: ["/support/dashboard"],
      });
    }

    return items;
  };

  const navItems = getNavItems();

  return (
    <nav
      className="bg-white/95 backdrop-blur-md shadow-lg border-b sticky top-0 z-50"
      style={{ borderColor: colors.borderGray }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <div className="flex items-center min-w-0">
            <Link href="/" className="flex items-center group flex-shrink-0">
              <div className="relative">
                <Image
                  src="/nasosend.png"
                  alt="Nasosend Logo"
                  width={55}
                  height={60}
                  priority
                />
              </div>
            </Link>

            <div className="hidden lg:flex items-center ml-8 xl:ml-12 space-x-1">
              {navItems.map((item) => {
                const isActive = item.paths.includes(pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-3 xl:px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-xl whitespace-nowrap ${
                      isActive
                        ? "shadow-sm"
                        : "hover:bg-[#F5F5F5] hover:text-[#003366]"
                    }`}
                    style={{
                      color: isActive ? colors.primaryBlue : colors.darkGray,
                      backgroundColor: isActive ? "#E5E9EC" : "transparent",
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4 min-w-0">
            {loading ? (
              <div className="hidden lg:flex items-center space-x-2">
                <div
                  className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent"
                  style={{ borderColor: colors.primaryBlue }}
                ></div>
                <span className="text-sm text-gray-600">Loading...</span>
              </div>
            ) : user ? (
              <div className="relative dropdown-container hidden lg:block">
                <button
                  onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                  className="flex items-center space-x-3 px-4 py-2 rounded-2xl transition-all duration-200 border hover:shadow-md bg-white/80 backdrop-blur-sm relative"
                  style={{
                    borderColor: colors.borderGray,
                    backgroundColor: colors.white,
                  }}
                >
                  <div className="flex items-center">
                    <div className="relative">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg"
                        style={{
                          background: `linear-gradient(to bottom right, ${colors.primaryBlue}, ${colors.primaryRed})`,
                        }}
                      >
                        {userProfile?.verification?.fullName?.charAt(0) ||
                          user.email?.charAt(0) ||
                          "U"}
                      </div>
                      {userProfile?.verified &&
                        currentAccountType === "traveler" && (
                          <div
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center"
                            style={{ backgroundColor: colors.green }}
                          >
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
                      <div
                        className="text-sm font-bold flex items-center"
                        style={{ color: colors.darkGray }}
                      >
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

                  {unreadNotifications > 0 && (
                    <div
                      className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-white text-xs font-bold rounded-full"
                      style={{ backgroundColor: colors.primaryRed }}
                    >
                      {unreadNotifications}
                    </div>
                  )}

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

                {showAccountDropdown && (
                  <div
                    className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border overflow-hidden animate-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-100px)] overflow-y-auto"
                    style={{ borderColor: colors.borderGray }}
                  >
                    <div
                      className="px-6 py-5 border-b"
                      style={{
                        borderColor: colors.borderGray,
                        backgroundColor: colors.lightGray,
                      }}
                    >
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
                              ? "shadow-md border"
                              : "border hover:bg-[#F0C8C8]"
                          }`}
                          style={{
                            color: colors.darkGray,
                            backgroundColor:
                              currentAccountType === "sender"
                                ? "#FEEBEB"
                                : colors.white,
                            borderColor:
                              currentAccountType === "sender"
                                ? "#F0C8C8"
                                : colors.borderGray,
                          }}
                        >
                          <div className="flex items-center">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center mr-4 shadow-lg"
                              style={{
                                background: `linear-gradient(to bottom right, ${colors.primaryRed}, ${colors.primaryRedHover})`,
                              }}
                            >
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
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center"
                              style={{
                                backgroundColor: colors.primaryRedHover,
                              }}
                            >
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
                              ? "shadow-md border"
                              : "hover:bg-[#E5E9EC] border"
                          }`}
                          style={{
                            color: colors.darkGray,
                            backgroundColor:
                              currentAccountType === "traveler"
                                ? "#E5E9EC"
                                : colors.white,
                            borderColor:
                              currentAccountType === "traveler"
                                ? "#C8D9E0"
                                : colors.borderGray,
                          }}
                        >
                          <div className="flex items-center">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center mr-4 shadow-lg"
                              style={{
                                background: `linear-gradient(to bottom right, ${colors.primaryBlue}, ${colors.primaryBlueHover})`,
                              }}
                            >
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
                                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 919-9"
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
                                <span
                                  className="text-xs text-white px-3 py-1 rounded-full mr-2 font-bold shadow-sm"
                                  style={{ backgroundColor: colors.green }}
                                >
                                  Verify
                                </span>
                              )}
                            {currentAccountType === "traveler" && (
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: colors.primaryBlue }}
                              >
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
                  className="px-8 py-3 text-white text-sm font-bold rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  style={{
                    backgroundColor: colors.primaryRed,
                    hoverBackgroundColor: colors.primaryRedHover,
                  }}
                >
                  Login
                </Link>
              </div>
            )}

            <div className="relative lg:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-3 rounded-xl transition-colors border"
                style={{
                  backgroundColor: colors.white,
                  borderColor: colors.borderGray,
                }}
              >
                <svg
                  className={`w-6 h-6 transition-transform duration-200 ${
                    showMobileMenu ? "rotate-90" : ""
                  }`}
                  style={{ color: colors.darkGray }}
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
              {unreadNotifications > 0 && user && (
                <div
                  className="absolute top-2 right-1 transform translate-x-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-white text-xs font-bold rounded-full"
                  style={{ backgroundColor: colors.primaryRed }}
                >
                  {unreadNotifications}
                </div>
              )}
            </div>
          </div>
        </div>

        {showMobileMenu && (
          <div
            className="lg:hidden border-t bg-white/95 backdrop-blur-md"
            style={{ borderColor: colors.borderGray }}
          >
            <div className="px-4 py-4 space-y-3 max-h-[calc(100vh-80px)] overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => {
                  const isActive = item.paths.includes(pathname);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block px-3 py-2 rounded-lg text-sm font-semibold text-center transition-all ${
                        isActive
                          ? `border`
                          : "hover:bg-[#F5F5F5] border border-transparent"
                      }`}
                      style={{
                        color: isActive ? colors.primaryBlue : colors.darkGray,
                        backgroundColor: isActive ? "#E5E9EC" : colors.white,
                        borderColor: isActive ? "#C8D9E0" : "transparent",
                      }}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {user ? (
                <div
                  className="border-t pt-3 space-y-3"
                  style={{ borderColor: colors.borderGray }}
                >
                  <div
                    className="flex items-center px-3 py-2 rounded-lg"
                    style={{ backgroundColor: colors.lightGray }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md relative"
                      style={{
                        background: `linear-gradient(to bottom right, ${colors.primaryBlue}, ${colors.primaryRed})`,
                      }}
                    >
                      {userProfile?.verification?.fullName?.charAt(0) ||
                        user.email?.charAt(0) ||
                        "U"}
                      {userProfile?.verified &&
                        currentAccountType === "traveler" && (
                          <div
                            className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white flex items-center justify-center"
                            style={{ backgroundColor: colors.green }}
                          >
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
                        <p
                          className="text-sm font-bold truncate"
                          style={{ color: colors.darkGray }}
                        >
                          {userProfile?.verification?.fullName || "User"}
                        </p>
                        {currentAccountType && (
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded-full`}
                            style={{
                              backgroundColor:
                                currentAccountType === "sender"
                                  ? "#FEEBEB"
                                  : "#E5E9EC",
                              color:
                                currentAccountType === "sender"
                                  ? colors.primaryRed
                                  : colors.primaryBlue,
                            }}
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

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAccountSwitch("sender")}
                      className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all ${
                        currentAccountType === "sender"
                          ? "border"
                          : "bg-white hover:bg-[#FEEBEB] border"
                      }`}
                      style={{
                        backgroundColor:
                          currentAccountType === "sender"
                            ? "#FEEBEB"
                            : colors.white,
                        color:
                          currentAccountType === "sender"
                            ? colors.primaryRed
                            : colors.darkGray,
                        borderColor:
                          currentAccountType === "sender"
                            ? "#F0C8C8"
                            : colors.borderGray,
                      }}
                    >
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center mb-1"
                        style={{ backgroundColor: colors.primaryRed }}
                      >
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
                      className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all relative ${
                        currentAccountType === "traveler"
                          ? "border"
                          : "bg-white hover:bg-[#E5E9EC] border"
                      }`}
                      style={{
                        backgroundColor:
                          currentAccountType === "traveler"
                            ? "#E5E9EC"
                            : colors.white,
                        color:
                          currentAccountType === "traveler"
                            ? colors.primaryBlue
                            : colors.darkGray,
                        borderColor:
                          currentAccountType === "traveler"
                            ? "#C8D9E0"
                            : colors.borderGray,
                      }}
                    >
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center mb-1"
                        style={{ backgroundColor: colors.primaryBlue }}
                      >
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
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 919-9"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold">Traveler</span>
                      {!userProfile?.verified &&
                        currentAccountType !== "traveler" && (
                          <div
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: colors.green }}
                          >
                            <span className="text-xs text-white font-bold">
                              !
                            </span>
                          </div>
                        )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Only show Profile if user is verified */}
                    {userProfile?.verified === true && (
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
                    )}

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
                      {unreadNotifications > 0 && (
                        <div
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: colors.primaryRed }}
                        >
                          <span className="text-xs text-white font-bold">
                            {unreadNotifications}
                          </span>
                        </div>
                      )}
                    </Link>

                    <button
                      onClick={handleSignOut}
                      className="flex flex-col items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg
                        className="w-5 h-5 mb-1"
                        style={{ color: colors.primaryRed }}
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
                <div
                  className="border-t pt-3"
                  style={{ borderColor: colors.borderGray }}
                >
                  <Link
                    href="/login"
                    className="block w-full px-6 py-3 text-white text-center font-bold rounded-xl shadow-lg transition-all"
                    style={{
                      backgroundColor: colors.primaryRed,
                    }}
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
