//app/traveler/dashboard/page.js

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
  const [requests, setRequests] = useState([]);
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

  // Create reusable fetch functions with useCallback
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
    }
  }, [user?.uid]);

  const fetchRequests = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const q = query(
        collection(db, "requests"),
        where("travelerId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const requestsData = [];
      querySnapshot.forEach((doc) => {
        requestsData.push({ id: doc.id, ...doc.data() });
      });
      setRequests(requestsData);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  }, [user?.uid]);

  // Legal items that can be carried from Australia to Nepal
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
      alert("Please upload a PDF file");
    }
  };

  useEffect(() => {
    fetchTrips();
    fetchRequests();
  }, [fetchTrips, fetchRequests]);

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
      flightItinerary: null, // Will need to be re-uploaded
      eTicket: null, // Will need to be re-uploaded
      allowedItems: trip.allowedItems || [],
    });
    setShowEditTrip(true);
  };

  const handleUpdateTrip = async () => {
    if (!editingTrip) return;

    // Validation for mandatory fields (skip file validation for edit)
    if (!tripData.flightNumber || !tripData.airline) {
      alert("Please fill in all mandatory flight details.");
      return;
    }

    if (tripData.allowedItems.length === 0) {
      alert("Please select at least one type of item you can carry.");
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

      // Only update file fields if new files were uploaded
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

      alert("Trip updated successfully!");
    } catch (error) {
      console.error("Error updating trip:", error);
      alert("Failed to update trip. Please try again.");
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (
      !confirm(
        "Are you sure you want to delete this trip? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db, "trips", tripId));
      fetchTrips();
      alert("Trip deleted successfully!");
    } catch (error) {
      console.error("Error deleting trip:", error);
      alert("Failed to delete trip. Please try again.");
    }
  };

  const handleCreateTrip = async () => {
    // Validation for mandatory fields
    if (
      !tripData.flightNumber ||
      !tripData.airline ||
      !tripData.flightItinerary ||
      !tripData.eTicket
    ) {
      alert(
        "Please fill in all mandatory flight details and upload required documents."
      );
      return;
    }

    if (tripData.allowedItems.length === 0) {
      alert("Please select at least one type of item you can carry.");
      return;
    }

    try {
      // In a real implementation, you'd upload files to Firebase Storage first
      // For now, we'll just store the file names
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
    } catch (error) {
      console.error("Error creating trip:", error);
      alert("Failed to create trip. Please try again.");
    }
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
                <svg
                  className="w-6 h-6 text-blue-800"
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
                <svg
                  className="w-6 h-6 text-yellow-600"
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
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {requests.filter((r) => r.status === "pending").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <svg
                  className="w-6 h-6 text-green-600"
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
              <div className="ml-4">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {trips.filter((t) => t.status === "completed").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-lg p-3">
                <svg
                  className="w-6 h-6 text-red-600"
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
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-semibold text-gray-900">$0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Trip Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowCreateTrip(true)}
            className="px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 shadow-sm font-medium"
          >
            + Create New Trip
          </button>
        </div>

        {/* Create/Edit Trip Modal */}
        {(showCreateTrip || showEditTrip) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {editingTrip ? "Edit Trip" : "Create New Trip"}
              </h3>

              <div className="space-y-6">
                {/* Flight Information Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-blue-800"
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

        {/* Active Trips */}
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
                              <span className="font-medium">Departure:</span>{" "}
                              {new Date(
                                trip.departureDate
                              ).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="font-medium">Available:</span>{" "}
                              {trip.availableWeight}kg
                            </div>
                            <div>
                              <span className="font-medium">Price:</span> $
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
                                    ` +${trip.allowedItems.length - 3} more`}
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
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteTrip(trip.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete trip"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
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
      </div>
    </div>
  );
}
