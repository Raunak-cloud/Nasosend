// app/sender/dashboard/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  addDoc,
  serverTimestamp,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import BuyTokens from "@/components/BuyTokens";
import {
  Users,
  CheckCircle,
  ArrowRight,
  MapPin,
  Clock,
  ChevronDown,
  X,
  AlertCircle,
  Phone,
  Mail,
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
    pickupCity: "",
    notes: "",
  });
  const [showBuyTokens, setShowBuyTokens] = useState(false);
  const [showContact, setShowContact] = useState({});

  const [showNotification, setShowNotification] = useState({
    isVisible: false,
    message: "",
    type: "info",
  });

  const [filters, setFilters] = useState({
    pricePerKg: 100,
    itemPreferences: [],
    pickupCities: [],
    genderPreference: null,
    arrivalDate: null,
  });
  const [expandedItems, setExpandedItems] = useState({});

  const legalItems = [
    "Clothing and textiles",
    "Baby formula and food",
    "Vitamins and supplements",
    "Books and educational materials",
    "Small electronics (phone accessories, chargers)",
    "Personal care items (cosmetics, toiletries)",
    "Chocolates and snacks",
    "Spices and tea",
    "Toys and games",
    "Stationery and office supplies",
    "Traditional Australian souvenirs",
    "Handicrafts and small gifts",
  ];

  const nepalCities = [
    "Kathmandu",
    "Pokhara",
    "Lalitpur",
    "Biratnagar",
    "Bharatpur",
    "Birgunj",
    "Butwal",
    "Dharan",
    "Hetauda",
    "Dhangadhi",
  ];

  const genderOptions = ["Any", "Male", "Female", "Other"];

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

  const [tokenInfo, setTokenInfo] = useState({
    availableTokens: userProfile.tokens || 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const fetchAvailableTrips = useCallback(async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, "trips"),
        where("status", "==", "active"),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const tripsData = [];
      querySnapshot.forEach((doc) => {
        const tripData = { id: doc.id, ...doc.data() };
        if (tripData.travelerId !== user.uid) {
          tripsData.push(tripData);
        }
      });

      setAvailableTrips(tripsData);
    } catch (error) {
      console.error("Error fetching trips:", error);
      setShowNotification({
        isVisible: true,
        message: "Failed to fetch available trips. Please try again later.",
        type: "error",
      });
    }
  }, [user?.uid]);

  const fetchMyRequests = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const q = query(
        collection(db, "shipmentRequests"),
        where("senderId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const requestsData = [];
      querySnapshot.forEach((doc) => {
        requestsData.push({ id: doc.id, ...doc.data() });
      });
      setMyRequests(requestsData);
    } catch (error) {
      console.error("Error fetching requests:", error);
      setShowNotification({
        isVisible: true,
        message: "Failed to fetch your requests. Please try again later.",
        type: "error",
      });
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user) {
      fetchAvailableTrips();
      fetchMyRequests();
    }
  }, [user, fetchAvailableTrips, fetchMyRequests]);

  if (loading || !user) {
    return null;
  }

  const handleSendRequest = async () => {
    if (!selectedTrip) return;

    if (tokenInfo.availableTokens <= 0) {
      setShowNotification({
        isVisible: true,
        message:
          "You have no available tokens. Please purchase more tokens to send requests. Tokens are spent only when the traveler has approved the request",
        type: "warning",
      });
      return;
    }

    if (
      !requestData.itemDescription ||
      !requestData.weight ||
      !requestData.quantity ||
      !requestData.recipientName ||
      !requestData.recipientPhone ||
      !requestData.pickupCity
    ) {
      setShowNotification({
        isVisible: true,
        message: "Please fill in all required fields.",
        type: "warning",
      });
      return;
    }

    const requestedWeight = parseFloat(requestData.weight);
    const requestedQuantity = parseInt(requestData.quantity);

    if (isNaN(requestedWeight) || requestedWeight <= 0) {
      setShowNotification({
        isVisible: true,
        message:
          "Invalid weight provided. Please enter a number greater than 0.",
        type: "warning",
      });
      return;
    }

    if (isNaN(requestedQuantity) || requestedQuantity <= 0) {
      setShowNotification({
        isVisible: true,
        message:
          "Invalid quantity provided. Please enter a number greater than 0.",
        type: "warning",
      });
      return;
    }

    if (requestedWeight > selectedTrip.availableWeight) {
      setShowNotification({
        isVisible: true,
        message: `Requested weight (${requestedWeight}kg) exceeds the available weight (${selectedTrip.availableWeight}kg). Please request a smaller weight.`,
        type: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Get the current user's profile information for the request
      const senderName =
        userProfile.verification?.fullName ||
        user.email?.split("@")[0] ||
        "Unknown Sender";
      const senderEmail = user.email;

      // Construct the shipment request payload
      const requestPayload = {
        ...requestData,
        tripId: selectedTrip.id,
        travelerId: selectedTrip.travelerId,
        travelerName: selectedTrip.travelerName,
        travelerPhone: selectedTrip.travelerPhone,
        travelerEmail: selectedTrip.travelerEmail,
        departureDate: selectedTrip.departureDate,
        arrivalDate: selectedTrip.arrivalDate,
        flightNumber: selectedTrip.flightNumber,
        pricePerKg: selectedTrip.pricePerKg,
        availableWeight: selectedTrip.availableWeight,
        senderId: user.uid,
        senderName: senderName,
        senderEmail: senderEmail,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "shipmentRequests"), requestPayload);

      // 1. Create a notification for the traveler
      const travelerRef = doc(db, "users", selectedTrip.travelerId);
      const travelerDoc = await getDoc(travelerRef);
      const currentTravelerNotifications =
        travelerDoc.data()?.notifications || [];
      const newNotificationForTraveler = {
        id: new Date().getTime(),
        type: "info",
        title: "New Shipment Request Received",
        message: `${senderName} has sent you a request for a ${requestData.weight}kg package.`,
        read: false,
        timestamp: new Date().toISOString(),
      };

      let updatedTravelerNotifications = [
        ...currentTravelerNotifications,
        newNotificationForTraveler,
      ];
      if (updatedTravelerNotifications.length > 20) {
        updatedTravelerNotifications = updatedTravelerNotifications.slice(1);
      }
      await updateDoc(travelerRef, {
        notifications: updatedTravelerNotifications,
      });

      // 2. Send an email to the traveler
      const emailPayload = {
        to: selectedTrip.travelerEmail,
        subject: "New Shipment Request on Nasosend",
        text: `Hello ${selectedTrip.travelerName},\n\nYou have a new shipment request from ${senderName} for a ${requestData.weight}kg package. Please check your dashboard for more details.\n\nBest regards,\nTeam Nasosend`,
        html: `<p>Hello ${selectedTrip.travelerName},</p><p>You have a new shipment request from **${senderName}** for a ${requestData.weight}kg package.</p><p>Please log in to your dashboard to review and respond to the request.</p><p>Best regards,<br/>Team Nasosend</p>`,
      };

      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload),
      });

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
        pickupCity: "",
        notes: "",
      });

      setShowNotification({
        isVisible: true,
        message: "Request sent successfully! The traveler has been notified.",
        type: "success",
      });

      await fetchMyRequests();
    } catch (error) {
      console.error("Error sending request:", error);
      setShowNotification({
        isVisible: true,
        message: `Failed to send request: ${error.message}`,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      accepted: "bg-green-100 text-green-800 border border-green-200",
      delivered: "bg-blue-100 text-blue-800 border border-blue-200",
      cancelled: "bg-red-100 text-red-800 border border-red-200",
    };
    return badges[status] || "bg-gray-100 text-gray-800 border border-gray-200";
  };

  const handleFilterChange = (filterName, value) => {
    if (filterName === "itemPreferences" || filterName === "pickupCities") {
      setFilters((prevFilters) => ({
        ...prevFilters,
        [filterName]: prevFilters[filterName].includes(value)
          ? prevFilters[filterName].filter((item) => item !== value)
          : [...prevFilters[filterName], value],
      }));
    } else {
      setFilters((prevFilters) => ({ ...prevFilters, [filterName]: value }));
    }
  };

  const filteredTrips = availableTrips.filter((trip) => {
    const priceMatch = trip.pricePerKg <= filters.pricePerKg;
    const itemMatch =
      filters.itemPreferences.length === 0 ||
      filters.itemPreferences.every((item) => trip.allowedItems.includes(item));
    const pickupCityMatch =
      filters.pickupCities.length === 0 ||
      filters.pickupCities.some((city) => trip.pickupCities.includes(city));

    const genderMatch =
      !filters.genderPreference ||
      filters.genderPreference === "Any" ||
      trip.travelerGender === filters.genderPreference;

    const arrivalDateMatch =
      !filters.arrivalDate ||
      new Date(trip.arrivalDate) >= new Date(filters.arrivalDate);

    return (
      priceMatch &&
      itemMatch &&
      pickupCityMatch &&
      genderMatch &&
      arrivalDateMatch
    );
  });

  const toggleItems = (tripId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [tripId]: !prev[tripId],
    }));
  };

  const toggleContactInfo = (requestId) => {
    setShowContact((prev) => ({
      ...prev,
      [requestId]: !prev[requestId],
    }));
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.lightGray }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
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
                    Tokens
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
            }));
            setShowNotification({
              isVisible: true,
              message: `Successfully purchased ${tokens} tokens for $${amount}!`,
              type: "success",
            });
          }}
        />

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
                  {filteredTrips.length}
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

        <div
          className="bg-white rounded-lg sm:rounded-xl shadow-lg border overflow-hidden"
          style={{ borderColor: colors.borderGray }}
        >
          <div
            className="border-b px-4 sm:px-6 lg:px-8"
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
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 919-9"
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
                    {filteredTrips.length}
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
                <div className="mb-6 sm:mb-8 bg-gray-50 rounded-lg p-4 space-y-4 shadow-inner">
                  <h3
                    className="text-lg sm:text-xl font-bold"
                    style={{ color: colors.darkGray }}
                  >
                    Find Your Perfect Travel Partner
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price per Kg (Max: ${filters.pricePerKg})
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={filters.pricePerKg}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            pricePerKg: parseInt(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Traveler Gender
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {genderOptions.map((gender) => (
                          <button
                            key={gender}
                            type="button"
                            onClick={() =>
                              handleFilterChange("genderPreference", gender)
                            }
                            className={`px-3 py-1 text-sm rounded-full transition-colors ${
                              filters.genderPreference === gender
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            {gender}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Arrival Date (On or after)
                      </label>
                      <input
                        type="date"
                        value={filters.arrivalDate || ""}
                        onChange={(e) =>
                          handleFilterChange("arrivalDate", e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-4 sm:mb-6">
                  {filteredTrips.length > 0 ? (
                    <p className="text-sm sm:text-base text-gray-600">
                      Showing {filteredTrips.length} matching travelers.
                    </p>
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTrips.map((trip) => (
                    <div
                      key={trip.id}
                      className="group bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="p-4 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center flex-1 min-w-0">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                              <Users className="w-5 h-5 text-gray-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center">
                                <h4 className="font-bold text-gray-900 text-sm truncate mr-2">
                                  {trip.travelerName}
                                </h4>
                                {trip.verified && (
                                  <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-2.5 h-2.5 text-white" />
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                {trip.travelerGender}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end ml-2">
                            <span className="text-lg font-bold text-blue-600">
                              ${trip.pricePerKg}
                              <span className="text-sm font-normal text-gray-500">
                                /kg
                              </span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                          <div className="flex items-center flex-1 min-w-0">
                            <MapPin className="w-3 h-3 mr-1 text-gray-400 flex-shrink-0" />
                            <span className="truncate">
                              {trip.departureCity}
                            </span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-gray-400 mx-2 flex-shrink-0" />
                          <div className="flex items-center flex-1 min-w-0">
                            <MapPin className="w-3 h-3 mr-1 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{trip.arrivalCity}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-center mb-3">
                          <div className="bg-blue-50 px-3 py-1 rounded-full">
                            <span className="text-xs font-medium text-blue-700">
                              {trip.availableWeight &&
                              !isNaN(trip.availableWeight)
                                ? `${trip.availableWeight} kg available`
                                : trip.maxWeight && !isNaN(trip.maxWeight)
                                ? `${trip.maxWeight} kg available`
                                : "Weight info unavailable"}
                            </span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-center mb-1">
                                <Clock className="w-3 h-3 mr-1 text-gray-400" />
                                <span className="font-medium text-gray-600">
                                  Departure
                                </span>
                              </div>
                              <span className="text-gray-800 font-semibold">
                                {trip.departureDate
                                  ? new Date(
                                      trip.departureDate
                                    ).toLocaleDateString("en-AU", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "TBD"}
                              </span>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-center mb-1">
                                <Clock className="w-3 h-3 mr-1 text-gray-400" />
                                <span className="font-medium text-gray-600">
                                  Arrival
                                </span>
                              </div>
                              <span className="text-gray-800 font-semibold">
                                {trip.arrivalDate
                                  ? new Date(
                                      trip.arrivalDate
                                    ).toLocaleDateString("en-AU", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "TBD"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-xs font-medium text-gray-700">
                              Can carry:
                            </p>
                            <button
                              type="button"
                              onClick={() => toggleItems(trip.id)}
                              className="text-blue-600 text-xs flex items-center"
                            >
                              {expandedItems[trip.id] ? "Hide" : "Show all"}
                              <ChevronDown
                                className={`w-3 h-3 ml-1 transform transition-transform ${
                                  expandedItems[trip.id] ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                          </div>
                          <div
                            className={`text-xs text-gray-600 transition-all duration-300 overflow-hidden ${
                              expandedItems[trip.id] ? "h-auto" : "h-6"
                            }`}
                          >
                            <div className="flex flex-wrap gap-1">
                              {trip.allowedItems &&
                              trip.allowedItems.length > 0 ? (
                                trip.allowedItems.map((item, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                                  >
                                    {item}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 italic">
                                  No items specified
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 mt-4">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-xs font-medium text-gray-700">
                              Pickup Cities:
                            </p>
                          </div>
                          <div className="text-xs text-gray-600">
                            <div className="flex flex-wrap gap-1">
                              {trip.pickupCities &&
                              trip.pickupCities.length > 0 ? (
                                trip.pickupCities.map((city, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                                  >
                                    {city}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 italic">
                                  No pickup cities specified
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (!userProfile?.verified) {
                              setShowNotification({
                                isVisible: true,
                                message:
                                  "You need to verify your identity before sending requests. Please complete the verification process first.",
                                type: "warning",
                              });
                              return;
                            }
                            setSelectedTrip(trip);
                            setShowRequestModal(true);
                          }}
                          className="mt-4 w-full py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
                          disabled={!userProfile?.verified}
                        >
                          Send Request
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
                              <span className="font-medium">Pickup City:</span>{" "}
                              {request.pickupCity}
                            </p>
                            <p>
                              <span className="font-medium">Departure:</span>{" "}
                              {new Date(
                                request.departureDate
                              ).toLocaleDateString("en-AU")}
                            </p>
                            <p>
                              <span className="font-medium">Arrival:</span>{" "}
                              {new Date(request.arrivalDate).toLocaleDateString(
                                "en-AU"
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {request.status === "accepted" && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => toggleContactInfo(request.id)}
                            className="w-full py-2.5 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors flex items-center justify-center"
                          >
                            {showContact[request.id] ? (
                              <>
                                <X className="w-4 h-4 mr-2" />
                                Hide Contact Info
                              </>
                            ) : (
                              <>
                                <Users className="w-4 h-4 mr-2" />
                                Contact Traveler
                              </>
                            )}
                          </button>
                          {showContact[request.id] && (
                            <div className="mt-4 p-4 rounded-lg bg-green-50 text-green-800">
                              <p className="flex items-center text-sm mb-2">
                                <Phone className="w-4 h-4 mr-2" />
                                <span className="font-semibold">
                                  Phone:
                                </span>{" "}
                                <a
                                  href={`tel:${request.travelerPhone}`}
                                  className="underline ml-1"
                                >
                                  {request.travelerPhone}
                                </a>
                              </p>
                              <p className="flex items-center text-sm">
                                <Mail className="w-4 h-4 mr-2" />
                                <span className="font-semibold">
                                  Email:
                                </span>{" "}
                                <a
                                  href={`mailto:${request.travelerEmail}`}
                                  className="underline ml-1"
                                >
                                  {request.travelerEmail}
                                </a>
                              </p>
                            </div>
                          )}
                        </div>
                      )}
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
                        min="0"
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
                        Quantity *
                      </label>
                      <input
                        type="number"
                        value={requestData.quantity}
                        onChange={(e) =>
                          setRequestData({
                            ...requestData,
                            quantity: e.target.value,
                          })
                        }
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all text-sm sm:text-base"
                        style={{ borderColor: colors.borderGray }}
                        placeholder="1"
                        min="1"
                      />
                    </div>
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
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                    <div>
                      <label
                        className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2"
                        style={{ color: colors.darkGray }}
                      >
                        Where will recipient pick the items from? *
                      </label>
                      <select
                        value={requestData.pickupCity}
                        onChange={(e) =>
                          setRequestData({
                            ...requestData,
                            pickupCity: e.target.value,
                          })
                        }
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all text-sm sm:text-base"
                        style={{ borderColor: colors.borderGray }}
                        required
                      >
                        <option value="" disabled>
                          Select a city
                        </option>
                        {selectedTrip.pickupCities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
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

        {showNotification.isVisible && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black opacity-50"
              onClick={() =>
                setShowNotification({ ...showNotification, isVisible: false })
              }
            ></div>
            <div
              className={`relative p-6 rounded-lg shadow-lg w-full max-w-sm text-center transform scale-100 transition-all duration-300
              ${
                showNotification.type === "success"
                  ? "bg-green-100 border-green-400 text-green-800"
                  : showNotification.type === "warning"
                  ? "bg-yellow-100 border-yellow-400 text-yellow-800"
                  : "bg-red-100 border-red-400 text-red-800"
              }`}
            >
              <button
                onClick={() =>
                  setShowNotification({ ...showNotification, isVisible: false })
                }
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
              <div className="flex justify-center mb-3">
                {showNotification.type === "success" ? (
                  <CheckCircle size={32} className="text-green-500" />
                ) : showNotification.type === "warning" ? (
                  <AlertCircle size={32} className="text-yellow-500" />
                ) : (
                  <AlertCircle size={32} className="text-red-500" />
                )}
              </div>
              <p className="font-semibold text-lg mb-2">
                {showNotification.type === "success"
                  ? "Success!"
                  : showNotification.type === "warning"
                  ? "Warning!"
                  : "Error!"}
              </p>
              <p className="text-sm">{showNotification.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
