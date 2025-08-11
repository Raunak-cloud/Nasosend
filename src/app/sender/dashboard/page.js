"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import BuyTokens from "@/components/BuyTokens";
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

export default function SenderDashboardPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const [availableTrips, setAvailableTrips] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [activeTab, setActiveTab] = useState("available");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestData, setRequestData] = useState({
    itemDescription: "",
    weight: "",
    quantity: 1,
    recipientName: "",
    recipientPhone: "",
    recipientAddress: "",
    notes: "",
  });
  const [showBuyTokens, setShowBuyTokens] = useState(false);

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

  // Token information
  const [tokenInfo, setTokenInfo] = useState({
    availableTokens: 5,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const fetchAvailableTrips = useCallback(async () => {
    if (!user) return;

    try {
      console.log("🔍 Fetching trips for user:", user.uid);

      // Fetch all active trips except those created by the current user
      const q = query(
        collection(db, "trips"),
        where("status", "==", "active"),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      console.log("📊 Raw snapshot size:", querySnapshot.size);

      const tripsData = [];

      querySnapshot.forEach((doc) => {
        const tripData = { id: doc.id, ...doc.data() };
        console.log("🎯 Processing trip:", {
          id: tripData.id,
          travelerName: tripData.travelerName,
          travelerId: tripData.travelerId,
          currentUserId: user.uid,
          isOwnTrip: tripData.travelerId === user.uid,
        });

        // Exclude trips created by the current user
        if (tripData.travelerId !== user.uid) {
          tripsData.push(tripData);
        }
      });

      console.log("✅ Final trips data:", tripsData);
      console.log("📈 Number of available trips:", tripsData.length);

      setAvailableTrips(tripsData);
    } catch (error) {
      console.error("❌ Error fetching trips:", error);
    }
  }, [user?.uid]);

  const fetchMyRequests = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const q = query(
        collection(db, "shipmentRequests"),
        where("senderId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const requestsData = [];
      querySnapshot.forEach((doc) => {
        requestsData.push({ id: doc.id, ...doc.data() });
      });
      setMyRequests(requestsData);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user) {
      fetchAvailableTrips();
      fetchMyRequests();
    }
  }, [user, fetchAvailableTrips, fetchMyRequests]);

  // If still loading or no user, don't render anything (AuthWrapper handles loading)
  if (loading || !user) {
    return null;
  }

  const handleSendRequest = async () => {
    if (!selectedTrip) return;

    console.log("📤 Sending request:", {
      trip: selectedTrip.id,
      traveler: selectedTrip.travelerName,
      requestData,
    });

    setIsSubmitting(true);
    try {
      // Check if user has available tokens
      if (tokenInfo.availableTokens <= 0) {
        console.log("❌ No tokens available");
        alert(
          "You have no available tokens. Please purchase more tokens to send requests."
        );
        return;
      }

      // Validate required fields
      if (
        !requestData.itemDescription ||
        !requestData.weight ||
        !requestData.recipientName ||
        !requestData.recipientPhone ||
        !requestData.recipientAddress
      ) {
        console.log("❌ Missing required fields");
        alert("Please fill in all required fields.");
        return;
      }

      // Create shipment request in Firestore
      const shipmentRequest = {
        ...requestData,
        senderId: user.uid,
        senderName:
          userProfile?.displayName ||
          user.email?.split("@")[0] ||
          "Unknown Sender",
        senderEmail: user.email,
        tripId: selectedTrip.id,
        travelerId: selectedTrip.travelerId,
        travelerName: selectedTrip.travelerName,
        travelerPhone: selectedTrip.travelerPhone,
        status: "pending",
        totalCost:
          parseFloat(requestData.weight) * parseFloat(selectedTrip.pricePerKg),
        departureDate: selectedTrip.departureDate,
        arrivalDate: selectedTrip.arrivalDate,
        departureCity: selectedTrip.departureCity,
        arrivalCity: selectedTrip.arrivalCity,
        airline: selectedTrip.airline || "",
        flightNumber: selectedTrip.flightNumber || "",
        weight: parseFloat(requestData.weight),
        quantity: parseInt(requestData.quantity),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      console.log("💾 Saving shipment request:", shipmentRequest);

      // Save to Firestore
      const docRef = await addDoc(
        collection(db, "shipmentRequests"),
        shipmentRequest
      );
      console.log("✅ Shipment request saved with ID:", docRef.id);

      // Add to local state for immediate UI update
      const newRequest = {
        ...shipmentRequest,
        id: docRef.id,
        createdAt: new Date(),
      };
      setMyRequests([newRequest, ...myRequests]);

      // Decrease available tokens
      setTokenInfo((prev) => ({
        ...prev,
        availableTokens: prev.availableTokens - 1,
      }));

      setShowRequestModal(false);
      setSelectedTrip(null);
      setRequestData({
        itemDescription: "",
        weight: "",
        quantity: 1,
        recipientName: "",
        recipientPhone: "",
        recipientAddress: "",
        notes: "",
      });

      console.log("🎉 Request sent successfully!");
      alert("Request sent successfully! The traveler will contact you soon.");

      // Refresh data
      await fetchMyRequests();
    } catch (error) {
      console.error("❌ Error sending request:", error);
      alert("Failed to send request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      accepted: "bg-blue-100 text-blue-800 border border-blue-200",
      delivered: "bg-green-100 text-green-800 border border-green-200",
      cancelled: "bg-red-100 text-red-800 border border-red-200",
    };
    return badges[status] || "bg-gray-100 text-gray-800 border border-gray-200";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.lightGray }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Compact Header */}
        <div className="mb-6 sm:mb-8">
          <h1
            className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2"
            style={{ color: colors.darkGray }}
          >
            Sender Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your shipments and connect with trusted travelers
          </p>
        </div>

        {/* Verification Status Banner */}
        {!userProfile?.verified && (
          <div
            className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-lg sm:rounded-xl border"
            style={{
              background: `linear-gradient(to right, ${colors.goldLight}, ${colors.goldLight})`,
              borderColor: colors.gold,
            }}
          >
            <div className="flex items-start">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mr-4 flex-shrink-0"
                style={{ backgroundColor: colors.gold }}
              >
                <svg
                  className="w-5 h-5 text-white"
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
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: colors.goldDark }}
                >
                  Identity Verification Required
                </h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  You need to verify your identity before sending shipment
                  requests. This helps ensure the safety and security of all
                  users on our platform.
                </p>
                <button
                  onClick={() => router.push("/sender/verification")}
                  className="px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors text-sm"
                  style={{
                    backgroundColor: colors.gold,
                    color: colors.darkGray,
                  }}
                >
                  Complete Verification
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Token Information Banner */}
        <div
          className="relative overflow-hidden rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 text-white shadow-lg"
          style={{
            background: `linear-gradient(to right, ${colors.primaryBlue}, ${colors.primaryRed})`,
          }}
        >
          <div className="absolute inset-0 bg-black opacity-8"></div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-8 rounded-full -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-5 rounded-full -ml-8 -mb-8"></div>

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between">
            <div className="mb-4 lg:mb-0">
              <div className="flex items-center mb-3 sm:mb-4">
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center mr-3"
                  style={{ backgroundColor: `rgba(255, 255, 255, 0.2)` }}
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">
                    Matching Tokens
                  </h2>
                  <p
                    className="opacity-90 text-xs sm:text-sm"
                    style={{ color: colors.lighterBlue }}
                  >
                    Connect with up to 5 travelers per request
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-8">
              <div className="text-center sm:text-right">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1">
                  {tokenInfo.availableTokens}
                </div>
                <div
                  className="text-xs sm:text-sm opacity-90"
                  style={{ color: colors.lighterBlue }}
                >
                  Available Tokens
                </div>
              </div>
              <div className="text-center sm:text-right">
                <div className="text-sm sm:text-base lg:text-lg font-semibold mb-1">
                  {formatDate(tokenInfo.expiryDate)}
                </div>
                <div
                  className="text-xs sm:text-sm opacity-90"
                  style={{ color: colors.lighterBlue }}
                >
                  Expiry Date
                </div>
              </div>
              <button
                onClick={() => setShowBuyTokens(true)}
                className="bg-white px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl font-medium sm:font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-md text-sm sm:text-base"
                style={{ color: colors.darkGray }}
              >
                Buy More Tokens
              </button>
            </div>
          </div>
        </div>

        <BuyTokens
          isOpen={showBuyTokens}
          onClose={() => setShowBuyTokens(false)}
          currentTokens={tokenInfo.availableTokens}
          onTokensPurchased={(tokens, amount) => {
            setTokenInfo((prev) => ({
              ...prev,
              availableTokens: prev.availableTokens + tokens,
              expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Reset expiry
            }));
            alert(`Successfully purchased ${tokens} tokens for $${amount}!`);
          }}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div
            className="bg-white rounded-lg sm:rounded-xl shadow-md border p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-all duration-300"
            style={{ borderColor: colors.borderGray }}
          >
            <div className="flex items-center">
              <div
                className="flex-shrink-0 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 shadow-md"
                style={{ backgroundColor: colors.primaryBlue }}
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white"
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
              <div className="ml-3 sm:ml-4 lg:ml-6 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                  Available Travelers
                </p>
                <p
                  className="text-xl sm:text-2xl lg:text-3xl font-bold"
                  style={{ color: colors.darkGray }}
                >
                  {availableTrips.length}
                </p>
                <p className="text-xs text-green-600 font-medium">Active now</p>
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-lg sm:rounded-xl shadow-md border p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-all duration-300"
            style={{ borderColor: colors.borderGray }}
          >
            <div className="flex items-center">
              <div
                className="flex-shrink-0 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 shadow-md"
                style={{ backgroundColor: colors.gold }}
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4 lg:ml-6 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                  Pending Requests
                </p>
                <p
                  className="text-xl sm:text-2xl lg:text-3xl font-bold"
                  style={{ color: colors.darkGray }}
                >
                  {myRequests.filter((r) => r.status === "pending").length}
                </p>
                <p className="text-xs text-yellow-600 font-medium">
                  Awaiting response
                </p>
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-lg sm:rounded-xl shadow-md border p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-all duration-300"
            style={{ borderColor: colors.borderGray }}
          >
            <div className="flex items-center">
              <div
                className="flex-shrink-0 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 shadow-md"
                style={{ backgroundColor: colors.primaryRed }}
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white"
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
              <div className="ml-3 sm:ml-4 lg:ml-6 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                  Accepted Requests
                </p>
                <p
                  className="text-xl sm:text-2xl lg:text-3xl font-bold"
                  style={{ color: colors.darkGray }}
                >
                  {myRequests.filter((r) => r.status === "accepted").length}
                </p>
                <p className="text-xs text-green-600 font-medium">
                  Ready for delivery
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div
          className="bg-white rounded-lg sm:rounded-xl shadow-lg border overflow-hidden"
          style={{ borderColor: colors.borderGray }}
        >
          {/* Tabs */}
          <div
            className="border-b"
            style={{
              borderColor: colors.borderGray,
              backgroundColor: colors.lightGray,
            }}
          >
            <div className="flex">
              <button
                onClick={() => setActiveTab("available")}
                className={`relative px-4 sm:px-6 lg:px-8 py-3 sm:py-4 font-medium sm:font-semibold transition-all duration-200 text-sm sm:text-base ${
                  activeTab === "available"
                    ? "bg-white border-b-2"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                style={{
                  color:
                    activeTab === "available" ? colors.primaryBlue : "inherit",
                  borderColor:
                    activeTab === "available"
                      ? colors.primaryBlue
                      : "transparent",
                }}
              >
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{
                      color:
                        activeTab === "available"
                          ? colors.primaryBlue
                          : "inherit",
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Available Travelers</span>
                  <span className="sm:hidden">Travelers</span>
                  <span
                    className="ml-2 px-2 py-1 text-xs rounded-full"
                    style={{
                      backgroundColor: colors.lighterBlue,
                      color: colors.primaryBlue,
                    }}
                  >
                    {availableTrips.length}
                  </span>
                </span>
              </button>
              <button
                onClick={() => setActiveTab("requests")}
                className={`relative px-4 sm:px-6 lg:px-8 py-3 sm:py-4 font-medium sm:font-semibold transition-all duration-200 text-sm sm:text-base ${
                  activeTab === "requests"
                    ? "bg-white border-b-2"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                style={{
                  color:
                    activeTab === "requests" ? colors.primaryRed : "inherit",
                  borderColor:
                    activeTab === "requests"
                      ? colors.primaryRed
                      : "transparent",
                }}
              >
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{
                      color:
                        activeTab === "requests"
                          ? colors.primaryRed
                          : "inherit",
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <span className="hidden sm:inline">My Requests</span>
                  <span className="sm:hidden">Requests</span>
                  <span
                    className="ml-2 px-2 py-1 text-xs rounded-full"
                    style={{
                      backgroundColor: colors.lighterRed,
                      color: colors.primaryRed,
                    }}
                  >
                    {myRequests.length}
                  </span>
                </span>
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            {activeTab === "available" ? (
              <div>
                {availableTrips.length > 0 ? (
                  <div className="mb-4 sm:mb-6">
                    <h3
                      className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2"
                      style={{ color: colors.darkGray }}
                    >
                      Find Your Perfect Travel Partner
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      Choose from {availableTrips.length} verified travelers
                      heading to your destination
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-12 sm:py-16">
                    <div
                      className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-lg sm:rounded-xl lg:rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center"
                      style={{ backgroundColor: colors.lighterBlue }}
                    >
                      <svg
                        className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ color: colors.primaryBlue }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 919-9"
                        />
                      </svg>
                    </div>
                    <h3
                      className="text-lg sm:text-xl font-semibold mb-2"
                      style={{ color: colors.darkGray }}
                    >
                      No available travelers yet
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                      Check back soon as more travelers post their trips
                    </p>
                    <button
                      onClick={() => fetchAvailableTrips()}
                      className="text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium sm:font-semibold transition-colors text-sm sm:text-base"
                      style={{
                        backgroundColor: colors.primaryBlue,
                        hoverBackgroundColor: colors.primaryBlueHover,
                      }}
                    >
                      Refresh Travelers
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {availableTrips.map((trip) => (
                    <div
                      key={trip.id}
                      className="group bg-white border rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                      style={{
                        borderColor: colors.borderGray,
                        hoverBorderColor: colors.primaryBlue,
                      }}
                    >
                      <div className="p-4 sm:p-6">
                        {/* Traveler Info */}
                        <div className="flex items-center mb-4 sm:mb-6">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                              <h4
                                className="font-bold text-sm sm:text-base lg:text-lg truncate mr-2"
                                style={{ color: colors.darkGray }}
                              >
                                {trip.travelerName}
                              </h4>
                              {trip.verified && (
                                <div
                                  className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                  style={{ backgroundColor: colors.gold }}
                                >
                                  <svg
                                    className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 text-white"
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
                              )}
                            </div>
                            <div className="flex items-center text-xs sm:text-sm text-gray-600 mt-1">
                              <span
                                className="px-2 py-1 rounded-full text-xs font-medium"
                                style={{ backgroundColor: colors.lightGray }}
                              >
                                {trip.verified
                                  ? "Verified traveler"
                                  : "New traveler"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Route Info */}
                        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                          <div
                            className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg sm:rounded-xl"
                            style={{ backgroundColor: colors.lightGray }}
                          >
                            <span className="text-xs sm:text-sm font-medium text-gray-600">
                              Route
                            </span>
                            <span
                              className="font-bold flex items-center text-sm sm:text-base"
                              style={{ color: colors.darkGray }}
                            >
                              {trip.departureCity}
                              <svg
                                className="w-3 h-3 sm:w-4 sm:h-4 mx-1.5 sm:mx-2 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                                />
                              </svg>
                              {trip.arrivalCity}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            <div
                              className="text-center p-2 sm:p-3 rounded-lg sm:rounded-xl"
                              style={{ backgroundColor: colors.lighterBlue }}
                            >
                              <p
                                className="text-xs font-medium mb-1"
                                style={{ color: colors.primaryBlue }}
                              >
                                Departure
                              </p>
                              <p
                                className="text-xs sm:text-sm font-bold"
                                style={{ color: colors.primaryBlue }}
                              >
                                {new Date(
                                  trip.departureDate
                                ).toLocaleDateString("en-AU", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                            <div
                              className="text-center p-2 sm:p-3 rounded-lg sm:rounded-xl"
                              style={{ backgroundColor: colors.lighterRed }}
                            >
                              <p
                                className="text-xs font-medium mb-1"
                                style={{ color: colors.primaryRed }}
                              >
                                Arrival
                              </p>
                              <p
                                className="text-xs sm:text-sm font-bold"
                                style={{ color: colors.primaryRed }}
                              >
                                {new Date(trip.arrivalDate).toLocaleDateString(
                                  "en-AU",
                                  {
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-3">
                            <div
                              className="text-center p-2 sm:p-3 rounded-lg sm:rounded-xl"
                              style={{ backgroundColor: colors.lighterBlue }}
                            >
                              <p
                                className="text-xs font-medium mb-1"
                                style={{ color: colors.primaryBlue }}
                              >
                                Capacity
                              </p>
                              <p
                                className="text-xs sm:text-sm font-bold"
                                style={{ color: colors.primaryBlue }}
                              >
                                {trip.availableWeight}kg
                              </p>
                            </div>
                            <div
                              className="text-center p-2 sm:p-3 rounded-lg sm:rounded-xl"
                              style={{ backgroundColor: colors.lighterRed }}
                            >
                              <p
                                className="text-xs font-medium mb-1"
                                style={{ color: colors.primaryRed }}
                              >
                                Duration
                              </p>
                              <p
                                className="text-xs sm:text-sm font-bold"
                                style={{ color: colors.primaryRed }}
                              >
                                {Math.ceil(
                                  (new Date(trip.arrivalDate) -
                                    new Date(trip.departureDate)) /
                                    (1000 * 60 * 60 * 24)
                                )}{" "}
                                days
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Price */}
                        <div
                          className="flex items-center justify-between mb-3 sm:mb-4 p-3 sm:p-4 rounded-lg sm:rounded-xl border"
                          style={{
                            background: `linear-gradient(to right, ${colors.lighterRed}, ${colors.lighterBlue})`,
                            borderColor: colors.borderGray,
                          }}
                        >
                          <span className="text-xs sm:text-sm font-medium text-gray-700">
                            Price per kg
                          </span>
                          <span
                            className="text-lg sm:text-xl lg:text-2xl font-bold text-green-700"
                            style={{ color: colors.primaryRed }}
                          >
                            ${trip.pricePerKg}
                          </span>
                        </div>

                        {/* Flight Info */}
                        {trip.airline && trip.flightNumber ? (
                          <div
                            className="rounded-lg sm:rounded-xl p-2.5 sm:p-3 mb-3 sm:mb-4"
                            style={{ backgroundColor: colors.lightGray }}
                          >
                            <div
                              className="flex items-center text-xs sm:text-sm"
                              style={{ color: colors.darkGray }}
                            >
                              <svg
                                className="w-3 h-3 sm:w-4 sm:h-4 mr-2"
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
                              <span className="font-medium">
                                {trip.airline}
                              </span>
                              <span
                                className="mx-2"
                                style={{ color: colors.borderGray }}
                              >
                                •
                              </span>
                              <span>{trip.flightNumber}</span>
                            </div>
                          </div>
                        ) : null}

                        {/* Allowed Items */}
                        {trip.allowedItems && trip.allowedItems.length > 0 && (
                          <div className="mb-4 sm:mb-6">
                            <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium">
                              Can carry:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {trip.allowedItems
                                .slice(0, 3)
                                .map((item, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 text-xs rounded-md"
                                    style={{
                                      backgroundColor: colors.lighterBlue,
                                      color: colors.primaryBlue,
                                    }}
                                  >
                                    {item}
                                  </span>
                                ))}
                              {trip.allowedItems.length > 3 && (
                                <span
                                  className="px-2 py-1 text-xs rounded-md"
                                  style={{
                                    backgroundColor: colors.lightGray,
                                    color: colors.darkGray,
                                  }}
                                >
                                  +{trip.allowedItems.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Verification Warning */}
                        {!userProfile?.verified && (
                          <div
                            className="mb-3 p-3 rounded-lg sm:rounded-xl border"
                            style={{
                              backgroundColor: colors.goldLight,
                              borderColor: colors.gold,
                            }}
                          >
                            <div className="flex items-start">
                              <div
                                className="w-5 h-5 rounded-lg flex items-center justify-center mr-2 flex-shrink-0 mt-0.5"
                                style={{ backgroundColor: colors.gold }}
                              >
                                <svg
                                  className="w-3 h-3 text-white"
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
                                <p
                                  className="text-xs sm:text-sm font-medium"
                                  style={{ color: colors.goldDark }}
                                >
                                  Verification required to send requests
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action Button */}
                        <button
                          onClick={() => {
                            if (!userProfile?.verified) {
                              alert(
                                "You need to verify your identity before sending requests. Please complete the verification process first."
                              );
                              return;
                            }

                            if (tokenInfo.availableTokens <= 0) {
                              alert(
                                "You have no available tokens. Please purchase more tokens to send requests."
                              );
                              return;
                            }
                            setSelectedTrip(trip);
                            setShowRequestModal(true);
                          }}
                          className={`w-full py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium sm:font-semibold transition-all duration-200 text-sm sm:text-base ${
                            !userProfile?.verified ||
                            tokenInfo.availableTokens <= 0
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "text-white transform hover:scale-105 shadow-md hover:shadow-lg"
                          }`}
                          style={{
                            background: `linear-gradient(to right, ${colors.primaryBlue}, ${colors.primaryRed})`,
                          }}
                          disabled={
                            !userProfile?.verified ||
                            tokenInfo.availableTokens <= 0
                          }
                        >
                          {!userProfile?.verified
                            ? "Verification Required"
                            : tokenInfo.availableTokens > 0
                            ? "Send Request"
                            : "No Tokens Available"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-4 sm:mb-6">
                  <h3
                    className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2"
                    style={{ color: colors.darkGray }}
                  >
                    Your Shipment Requests
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Track your requests and manage communications with travelers
                  </p>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {myRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-white border rounded-lg sm:rounded-xl p-4 sm:p-6 hover:shadow-md transition-all duration-200"
                      style={{ borderColor: colors.borderGray }}
                    >
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                            <h4
                              className="font-bold text-sm sm:text-base lg:text-lg"
                              style={{ color: colors.darkGray }}
                            >
                              {request.itemDescription}
                            </h4>
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium w-fit ${getStatusBadge(
                                request.status
                              )}`}
                            >
                              {request.status.charAt(0).toUpperCase() +
                                request.status.slice(1)}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-3 sm:mb-4">
                            <div
                              className="text-center p-2 sm:p-3 rounded-lg"
                              style={{ backgroundColor: colors.lightGray }}
                            >
                              <span className="block text-xs text-gray-500 font-medium mb-1">
                                Traveler
                              </span>
                              <span
                                className="text-xs sm:text-sm font-bold truncate"
                                style={{ color: colors.darkGray }}
                              >
                                {request.travelerName}
                              </span>
                            </div>
                            <div
                              className="text-center p-2 sm:p-3 rounded-lg"
                              style={{ backgroundColor: colors.lightGray }}
                            >
                              <span className="block text-xs text-gray-500 font-medium mb-1">
                                Weight
                              </span>
                              <span
                                className="text-xs sm:text-sm font-bold"
                                style={{ color: colors.darkGray }}
                              >
                                {request.weight}kg
                              </span>
                            </div>
                            <div
                              className="text-center p-2 sm:p-3 rounded-lg"
                              style={{ backgroundColor: colors.lightGray }}
                            >
                              <span className="block text-xs text-gray-500 font-medium mb-1">
                                Cost
                              </span>
                              <span className="text-xs sm:text-sm font-bold text-green-600">
                                ${request.totalCost}
                              </span>
                            </div>
                            <div
                              className="text-center p-2 sm:p-3 rounded-lg"
                              style={{ backgroundColor: colors.lightGray }}
                            >
                              <span className="block text-xs text-gray-500 font-medium mb-1">
                                Flight
                              </span>
                              <span
                                className="text-xs sm:text-sm font-bold"
                                style={{ color: colors.darkGray }}
                              >
                                {request.flightNumber}
                              </span>
                            </div>
                          </div>

                          <div className="text-xs sm:text-sm text-gray-600">
                            <p>
                              <span className="font-medium">To:</span>{" "}
                              {request.recipientName}
                            </p>
                            <p>
                              <span className="font-medium">Address:</span>{" "}
                              {request.recipientAddress}
                            </p>
                            <p>
                              <span className="font-medium">Departure:</span>{" "}
                              {new Date(
                                request.departureDate
                              ).toLocaleDateString("en-AU")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {myRequests.length === 0 && (
                    <div className="text-center py-12 sm:py-16">
                      <div
                        className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-lg sm:rounded-xl lg:rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center"
                        style={{ backgroundColor: colors.lighterRed }}
                      >
                        <svg
                          className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          style={{ color: colors.primaryRed }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                      </div>
                      <h3
                        className="text-lg sm:text-xl font-semibold mb-2"
                        style={{ color: colors.darkGray }}
                      >
                        No requests yet
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                        Start sending packages with trusted travelers
                      </p>
                      <button
                        onClick={() => setActiveTab("available")}
                        className="text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium sm:font-semibold transition-colors text-sm sm:text-base"
                        style={{
                          backgroundColor: colors.primaryBlue,
                          hoverBackgroundColor: colors.primaryBlueHover,
                        }}
                      >
                        Find Travelers
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Request Modal */}
        {showRequestModal && selectedTrip && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg sm:rounded-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto shadow-xl">
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="text-center mb-6 sm:mb-8">
                  <h3
                    className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2"
                    style={{ color: colors.darkGray }}
                  >
                    Send Shipment Request
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Fill in the details for your package delivery
                  </p>
                </div>

                <div
                  className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-lg sm:rounded-2xl border"
                  style={{
                    background: `linear-gradient(to right, ${colors.lighterBlue}, ${colors.lighterRed})`,
                    borderColor: colors.borderGray,
                  }}
                >
                  <div className="mb-3 sm:mb-4">
                    <div className="flex items-center">
                      <p
                        className="font-bold text-sm sm:text-base lg:text-lg mr-2"
                        style={{ color: colors.darkGray }}
                      >
                        {selectedTrip.travelerName}
                      </p>
                      {selectedTrip.verified && (
                        <div
                          className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: colors.gold }}
                        >
                          <svg
                            className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white"
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
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 flex items-center mt-1">
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {selectedTrip.departureCity} → {selectedTrip.arrivalCity}
                      <span className="mx-2">•</span>
                      {new Date(
                        selectedTrip.departureDate
                      ).toLocaleDateString()}{" "}
                      -{" "}
                      {new Date(selectedTrip.arrivalDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span
                      className="px-2.5 py-1 rounded-lg font-medium"
                      style={{
                        backgroundColor: colors.white,
                        color: colors.primaryRed,
                      }}
                    >
                      ${selectedTrip.pricePerKg}/kg
                    </span>
                    <span
                      className="px-2.5 py-1 rounded-lg font-medium"
                      style={{
                        backgroundColor: colors.white,
                        color: colors.primaryBlue,
                      }}
                    >
                      {selectedTrip.availableWeight}kg available
                    </span>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label
                        className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2"
                        style={{ color: colors.darkGray }}
                      >
                        Item Description *
                      </label>
                      <input
                        type="text"
                        value={requestData.itemDescription}
                        onChange={(e) =>
                          setRequestData({
                            ...requestData,
                            itemDescription: e.target.value,
                          })
                        }
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all text-sm sm:text-base"
                        style={{ borderColor: colors.borderGray }}
                        placeholder="e.g., Winter Clothes, Documents"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2"
                        style={{ color: colors.darkGray }}
                      >
                        Weight (kg) *
                      </label>
                      <input
                        type="number"
                        value={requestData.weight}
                        onChange={(e) =>
                          setRequestData({
                            ...requestData,
                            weight: e.target.value,
                          })
                        }
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all text-sm sm:text-base"
                        style={{ borderColor: colors.borderGray }}
                        placeholder="5.0"
                        max={selectedTrip.availableWeight}
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label
                        className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2"
                        style={{ color: colors.darkGray }}
                      >
                        Recipient Name *
                      </label>
                      <input
                        type="text"
                        value={requestData.recipientName}
                        onChange={(e) =>
                          setRequestData({
                            ...requestData,
                            recipientName: e.target.value,
                          })
                        }
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all text-sm sm:text-base"
                        style={{ borderColor: colors.borderGray }}
                        placeholder="Full name"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2"
                        style={{ color: colors.darkGray }}
                      >
                        Recipient Phone *
                      </label>
                      <input
                        type="tel"
                        value={requestData.recipientPhone}
                        onChange={(e) =>
                          setRequestData({
                            ...requestData,
                            recipientPhone: e.target.value,
                          })
                        }
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all text-sm sm:text-base"
                        style={{ borderColor: colors.borderGray }}
                        placeholder="+977 XXX XXX XXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2"
                      style={{ color: colors.darkGray }}
                    >
                      Delivery Address in Nepal *
                    </label>
                    <textarea
                      value={requestData.recipientAddress}
                      onChange={(e) =>
                        setRequestData({
                          ...requestData,
                          recipientAddress: e.target.value,
                        })
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all text-sm sm:text-base"
                      style={{ borderColor: colors.borderGray }}
                      rows="3"
                      placeholder="Complete address with landmarks"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2"
                      style={{ color: colors.darkGray }}
                    >
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      value={requestData.notes}
                      onChange={(e) =>
                        setRequestData({
                          ...requestData,
                          notes: e.target.value,
                        })
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all text-sm sm:text-base"
                      style={{ borderColor: colors.borderGray }}
                      rows="2"
                      placeholder="Any special handling instructions..."
                    />
                  </div>

                  {requestData.weight && (
                    <div
                      className="p-4 sm:p-6 rounded-lg sm:rounded-2xl border"
                      style={{
                        background: `linear-gradient(to right, ${colors.lighterRed}, ${colors.lighterBlue})`,
                        borderColor: colors.borderGray,
                      }}
                    >
                      <div className="text-center">
                        <p
                          className="text-xs sm:text-sm font-medium mb-2"
                          style={{ color: colors.primaryRed }}
                        >
                          Total Estimated Cost
                        </p>
                        <p
                          className="text-xl sm:text-2xl lg:text-3xl font-bold"
                          style={{ color: colors.darkGray }}
                        >
                          $
                          {(
                            parseFloat(requestData.weight) *
                            parseFloat(selectedTrip.pricePerKg)
                          ).toFixed(2)}{" "}
                          AUD
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
                  <button
                    onClick={() => {
                      setShowRequestModal(false);
                      setSelectedTrip(null);
                    }}
                    className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-gray-600 border rounded-lg sm:rounded-xl hover:bg-gray-50 font-medium transition-all text-sm sm:text-base"
                    style={{ borderColor: colors.borderGray }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendRequest}
                    className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-white rounded-lg sm:rounded-xl hover:from-blue-900 hover:to-red-700 font-medium transition-all transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    style={{
                      background: `linear-gradient(to right, ${colors.primaryBlue}, ${colors.primaryRed})`,
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Sending Request..."
                      : "Send Request (1 Token)"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
