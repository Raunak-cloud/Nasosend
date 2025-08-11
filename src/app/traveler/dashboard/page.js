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
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  Plane,
  Package,
  Users,
  AlertCircle,
  CheckCircle,
  X,
  MapPin,
  Clock,
  ArrowRight,
  Edit,
  Trash,
} from "lucide-react";

export default function TravelerDashboardPage() {
  return <TravelerDashboard />;
}

function TravelerDashboard() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [showCreateTrip, setShowCreateTrip] = useState(false);
  const [showEditTrip, setShowEditTrip] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [trips, setTrips] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("trips"); // New state for tabs
  const [showRequestDetailsModal, setShowRequestDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [tripData, setTripData] = useState({
    departureDate: "",
    arrivalDate: "",
    departureCity: "Sydney",
    arrivalCity: "Kathmandu",
    availableWeight: "",
    pricePerKg: "",
    flightNumber: "",
    airline: "",
    flightItinerary: null,
    eTicket: null,
    allowedItems: [],
  });

  // Custom modal state for alerts
  const [showNotification, setShowNotification] = useState({
    isVisible: false,
    message: "",
    type: "info",
  });

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

  // Fetch all trips for the current traveler
  const fetchTrips = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const q = query(
        collection(db, "trips"),
        where("travelerId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const tripsData = [];
      querySnapshot.forEach((doc) => {
        tripsData.push({ id: doc.id, ...doc.data() });
      });
      setTrips(tripsData);
    } catch (error) {
      console.error("Error fetching trips:", error);
      setShowNotification({
        isVisible: true,
        message: "Failed to fetch your trips. Please try again.",
        type: "error",
      });
    }
  }, [user?.uid]);

  // Fetch all incoming requests for the current traveler
  const fetchIncomingRequests = useCallback(async () => {
    if (!user?.uid) return;
    try {
      // Fetch requests where the travelerId matches the current user's UID
      const q = query(
        collection(db, "shipmentRequests"),
        where("travelerId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const requestsData = [];
      querySnapshot.forEach((doc) => {
        requestsData.push({ id: doc.id, ...doc.data() });
      });
      setIncomingRequests(requestsData);
    } catch (error) {
      console.error("Error fetching incoming requests:", error);
      setShowNotification({
        isVisible: true,
        message: "Failed to fetch incoming requests. Please try again.",
        type: "error",
      });
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user) {
      fetchTrips();
      fetchIncomingRequests();
    }
  }, [user, fetchTrips, fetchIncomingRequests]);

  const handleItemToggle = (item) => {
    setTripData((prev) => ({
      ...prev,
      allowedItems: prev.allowedItems.includes(item)
        ? prev.allowedItems.filter((i) => i !== item)
        : [...prev.allowedItems, item],
    }));
  };

  const handleFileUpload = (field, file) => {
    if (file && file.type === "application/pdf") {
      setTripData((prev) => ({
        ...prev,
        [field]: file,
      }));
    } else {
      setShowNotification({
        isVisible: true,
        message: "Please upload a PDF file.",
        type: "warning",
      });
    }
  };

  const handleEditTrip = (trip) => {
    setEditingTrip(trip);
    setTripData({
      departureDate: trip.departureDate,
      arrivalDate: trip.arrivalDate,
      departureCity: trip.departureCity,
      arrivalCity: trip.arrivalCity,
      availableWeight: trip.availableWeight.toString(),
      pricePerKg: trip.pricePerKg.toString(),
      flightNumber: trip.flightNumber,
      airline: trip.airline,
      flightItinerary: null,
      eTicket: null,
      allowedItems: trip.allowedItems || [],
    });
    setShowEditTrip(true);
  };

  const handleUpdateTrip = async () => {
    if (!editingTrip) return;

    if (!tripData.flightNumber || !tripData.airline) {
      setShowNotification({
        isVisible: true,
        message: "Please fill in all mandatory flight details.",
        type: "warning",
      });
      return;
    }
    if (tripData.allowedItems.length === 0) {
      setShowNotification({
        isVisible: true,
        message: "Please select at least one type of item you can carry.",
        type: "warning",
      });
      return;
    }

    try {
      const tripPayload = {
        departureDate: tripData.departureDate,
        arrivalDate: tripData.arrivalDate,
        departureCity: tripData.departureCity,
        arrivalCity: tripData.arrivalCity,
        availableWeight: parseFloat(tripData.availableWeight),
        pricePerKg: parseFloat(tripData.pricePerKg),
        flightNumber: tripData.flightNumber,
        airline: tripData.airline,
        allowedItems: tripData.allowedItems,
        updatedAt: serverTimestamp(),
      };

      if (tripData.flightItinerary) {
        tripPayload.flightItinerary = tripData.flightItinerary.name;
      }
      if (tripData.eTicket) {
        tripPayload.eTicket = tripData.eTicket.name;
      }

      await updateDoc(doc(db, "trips", editingTrip.id), tripPayload);

      setShowEditTrip(false);
      setEditingTrip(null);
      fetchTrips();
      resetTripData();
      setShowNotification({
        isVisible: true,
        message: "Trip updated successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating trip:", error);
      setShowNotification({
        isVisible: true,
        message: "Failed to update trip. Please try again.",
        type: "error",
      });
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this trip? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      await deleteDoc(doc(db, "trips", tripId));
      fetchTrips();
      setShowNotification({
        isVisible: true,
        message: "Trip deleted successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting trip:", error);
      setShowNotification({
        isVisible: true,
        message: "Failed to delete trip. Please try again.",
        type: "error",
      });
    }
  };

  const handleCreateTrip = async () => {
    if (
      !tripData.flightNumber ||
      !tripData.airline ||
      !tripData.flightItinerary ||
      !tripData.eTicket
    ) {
      setShowNotification({
        isVisible: true,
        message:
          "Please fill in all mandatory flight details and upload required documents.",
        type: "warning",
      });
      return;
    }
    if (tripData.allowedItems.length === 0) {
      setShowNotification({
        isVisible: true,
        message: "Please select at least one type of item you can carry.",
        type: "warning",
      });
      return;
    }

    try {
      const tripPayload = {
        ...tripData,
        flightItinerary: tripData.flightItinerary.name,
        eTicket: tripData.eTicket.name,
        travelerId: user.uid,
        travelerName: userProfile.verification?.fullName || user.phoneNumber,
        travelerPhone: user.phoneNumber,
        verified: userProfile.verified || false,
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await addDoc(collection(db, "trips"), tripPayload);
      setShowCreateTrip(false);
      fetchTrips();
      resetTripData();
      setShowNotification({
        isVisible: true,
        message: "Trip created successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error creating trip:", error);
      setShowNotification({
        isVisible: true,
        message: "Failed to create trip. Please try again.",
        type: "error",
      });
    }
  };

  const handleAcceptRequest = async (request) => {
    try {
      // Update the request status to 'accepted'
      await updateDoc(doc(db, "shipmentRequests", request.id), {
        status: "accepted",
        updatedAt: serverTimestamp(),
      });

      // Update the trip's available weight
      const newAvailableWeight = request.availableWeight - request.weight;
      await updateDoc(doc(db, "trips", request.tripId), {
        availableWeight: newAvailableWeight,
        updatedAt: serverTimestamp(),
      });

      // Refetch data to update the UI
      fetchIncomingRequests();
      fetchTrips();
      setShowRequestDetailsModal(false);
      setShowNotification({
        isVisible: true,
        message: "Request accepted successfully! The sender has been notified.",
        type: "success",
      });
    } catch (error) {
      console.error("Error accepting request:", error);
      setShowNotification({
        isVisible: true,
        message: "Failed to accept request. Please try again.",
        type: "error",
      });
    }
  };

  const handleRejectRequest = async (request) => {
    try {
      // Update the request status to 'rejected'
      await updateDoc(doc(db, "shipmentRequests", request.id), {
        status: "rejected",
        updatedAt: serverTimestamp(),
      });

      fetchIncomingRequests();
      setShowRequestDetailsModal(false);
      setShowNotification({
        isVisible: true,
        message: "Request rejected successfully. The sender has been notified.",
        type: "success",
      });
    } catch (error) {
      console.error("Error rejecting request:", error);
      setShowNotification({
        isVisible: true,
        message: "Failed to reject request. Please try again.",
        type: "error",
      });
    }
  };

  const resetTripData = () => {
    setTripData({
      departureDate: "",
      arrivalDate: "",
      departureCity: "Sydney",
      arrivalCity: "Kathmandu",
      availableWeight: "",
      pricePerKg: "",
      flightNumber: "",
      airline: "",
      flightItinerary: null,
      eTicket: null,
      allowedItems: [],
    });
  };

  if (!userProfile?.verified && userProfile?.verificationPending) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <svg
              className="mx-auto h-12 w-12 text-yellow-600 mb-4"
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Verification Pending
            </h3>
            <p className="text-gray-600">
              Your verification is under review. This usually takes 24-48 hours.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile?.verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-red-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Complete Verification
            </h3>
            <p className="text-gray-600 mb-4">
              You need to complete verification to start posting trips.
            </p>
            <button
              onClick={() => router.push("/traveler/verification")}
              className="px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900"
            >
              Start Verification
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-red-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <Plane className="w-6 h-6 text-blue-800" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Trips</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {trips.filter((t) => t.status === "active").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                <Package className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {
                    incomingRequests.filter((r) => r.status === "pending")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Accepted Requests</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {
                    incomingRequests.filter((r) => r.status === "accepted")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("trips")}
            className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === "trips"
                ? "border-b-2 border-blue-800 text-blue-800"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            My Trips
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === "requests"
                ? "border-b-2 border-red-600 text-red-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Incoming Requests
          </button>
        </div>

        {activeTab === "trips" && (
          <>
            {/* Create Trip Button */}
            <div className="mb-8">
              <button
                onClick={() => setShowCreateTrip(true)}
                className="px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 shadow-sm font-medium"
              >
                + Create New Trip
              </button>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Your Active Trips
                </h3>
              </div>
              <div className="p-6">
                {trips.filter((t) => t.status === "active").length > 0 ? (
                  <div className="space-y-4">
                    {trips
                      .filter((t) => t.status === "active")
                      .map((trip) => (
                        <div
                          key={trip.id}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-2">
                                {trip.departureCity} → {trip.arrivalCity}
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">Flight:</span>{" "}
                                  {trip.flightNumber} ({trip.airline})
                                </div>
                                <div>
                                  <span className="font-medium">
                                    Departure:
                                  </span>{" "}
                                  {new Date(
                                    trip.departureDate
                                  ).toLocaleDateString()}
                                </div>
                                <div>
                                  <span className="font-medium">
                                    Available:
                                  </span>{" "}
                                  {trip.availableWeight}kg
                                </div>
                                <div>
                                  <span className="font-medium">Price:</span> ${" "}
                                  {trip.pricePerKg}/kg
                                </div>
                              </div>
                              {trip.allowedItems &&
                                trip.allowedItems.length > 0 && (
                                  <div className="mt-2">
                                    <span className="text-sm font-medium text-gray-600">
                                      Items:{" "}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                      {trip.allowedItems.slice(0, 3).join(", ")}
                                      {trip.allowedItems.length > 3 &&
                                        ` +${
                                          trip.allowedItems.length - 3
                                        } more`}
                                    </span>
                                  </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                                Active
                              </span>
                              <button
                                onClick={() => handleEditTrip(trip)}
                                className="p-2 text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit trip"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTrip(trip.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete trip"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No active trips. Create one to start earning!
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "requests" && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Incoming Shipment Requests ({incomingRequests.length})
              </h3>
            </div>
            <div className="p-6">
              {incomingRequests.length > 0 ? (
                <div className="space-y-4">
                  {incomingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowRequestDetailsModal(true);
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">
                          From: {request.senderName}
                        </h4>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            request.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : request.status === "accepted"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Request for:{" "}
                        <span className="font-medium">
                          {request.itemDescription}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Weight:{" "}
                        <span className="font-medium">{request.weight}kg</span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No incoming shipment requests at this time.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Create/Edit Trip Modal */}
        {(showCreateTrip || showEditTrip) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingTrip ? "Edit Trip" : "Create New Trip"}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateTrip(false);
                    setShowEditTrip(false);
                    setEditingTrip(null);
                    resetTripData();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Flight Information Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Plane className="w-5 h-5 mr-2 text-blue-800" />
                    Flight Information (Mandatory)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Flight Number *
                      </label>
                      <input
                        type="text"
                        value={tripData.flightNumber}
                        onChange={(e) =>
                          setTripData({
                            ...tripData,
                            flightNumber: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                        placeholder="e.g., QF41, SQ211"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Airline *
                      </label>
                      <input
                        type="text"
                        value={tripData.airline}
                        onChange={(e) =>
                          setTripData({ ...tripData, airline: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                        placeholder="e.g., Qantas, Singapore Airlines"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Flight Itinerary (PDF){" "}
                        {editingTrip ? "(Optional - only if updating)" : "*"}
                      </label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) =>
                          handleFileUpload("flightItinerary", e.target.files[0])
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                        required={!editingTrip}
                      />
                      {tripData.flightItinerary && (
                        <p className="text-sm text-green-600 mt-1">
                          ✓ {tripData.flightItinerary.name}
                        </p>
                      )}
                      {editingTrip && !tripData.flightItinerary && (
                        <p className="text-sm text-gray-500 mt-1">
                          Current file will be kept if not replaced
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-Ticket (PDF){" "}
                        {editingTrip ? "(Optional - only if updating)" : "*"}
                      </label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) =>
                          handleFileUpload("eTicket", e.target.files[0])
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                        required={!editingTrip}
                      />
                      {tripData.eTicket && (
                        <p className="text-sm text-green-600 mt-1">
                          ✓ {tripData.eTicket.name}
                        </p>
                      )}
                      {editingTrip && !tripData.eTicket && (
                        <p className="text-sm text-gray-500 mt-1">
                          Current file will be kept if not replaced
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Travel Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departure Date *
                    </label>
                    <input
                      type="date"
                      value={tripData.departureDate}
                      onChange={(e) =>
                        setTripData({
                          ...tripData,
                          departureDate: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Arrival Date *
                    </label>
                    <input
                      type="date"
                      value={tripData.arrivalDate}
                      onChange={(e) =>
                        setTripData({
                          ...tripData,
                          arrivalDate: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                      required
                    />
                  </div>
                </div>

                {/* Baggage Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Weight (kg) *
                    </label>
                    <input
                      type="number"
                      value={tripData.availableWeight}
                      onChange={(e) =>
                        setTripData({
                          ...tripData,
                          availableWeight: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                      placeholder="e.g., 20"
                      min="1"
                      max="50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price per kg (AUD) *
                    </label>
                    <input
                      type="number"
                      value={tripData.pricePerKg}
                      onChange={(e) =>
                        setTripData({ ...tripData, pricePerKg: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                      placeholder="e.g., 25"
                      min="1"
                      required
                    />
                  </div>
                </div>

                {/* Legal Items Checklist */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Items You Can Carry (Select all that apply) *
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {legalItems.map((item) => (
                        <label
                          key={item}
                          className="flex items-center space-x-3 cursor-pointer hover:bg-white p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={tripData.allowedItems.includes(item)}
                            onChange={() => handleItemToggle(item)}
                            className="w-4 h-4 text-blue-800 border-gray-300 rounded focus:ring-blue-800"
                          />
                          <span className="text-sm text-gray-700">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    * Please only select items you are willing and legally
                    allowed to carry. Large electronics, liquids over 100ml, and
                    valuable items are generally not recommended.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                <button
                  onClick={() => {
                    setShowCreateTrip(false);
                    setShowEditTrip(false);
                    setEditingTrip(null);
                    resetTripData();
                  }}
                  className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingTrip ? handleUpdateTrip : handleCreateTrip}
                  className="px-6 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
                >
                  {editingTrip ? "Update Trip" : "Create Trip"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Incoming Request Details Modal */}
        {showRequestDetailsModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Shipment Request Details
                </h3>
                <button
                  onClick={() => {
                    setShowRequestDetailsModal(false);
                    setSelectedRequest(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">Sender:</span>{" "}
                  {selectedRequest.senderName}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">Email:</span>{" "}
                  {selectedRequest.senderEmail}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">Item:</span>{" "}
                  {selectedRequest.itemDescription}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">Weight:</span>{" "}
                  {selectedRequest.weight} kg
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">
                    Delivery Address:
                  </span>{" "}
                  {selectedRequest.recipientAddress}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">
                    Special Notes:
                  </span>{" "}
                  {selectedRequest.notes || "None"}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">Status:</span>{" "}
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      selectedRequest.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : selectedRequest.status === "accepted"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedRequest.status}
                  </span>
                </p>
              </div>

              {selectedRequest.status === "pending" && (
                <div className="flex gap-4 mt-8 pt-6 border-t">
                  <button
                    onClick={() => handleAcceptRequest(selectedRequest)}
                    className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Accept Request
                  </button>
                  <button
                    onClick={() => handleRejectRequest(selectedRequest)}
                    className="flex-1 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reject Request
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Custom Notification Modal */}
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
