//app/support/dashboard/page.js

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import {
  Users,
  CheckCircle,
  AlertTriangle,
  X,
  FileText,
  Trash,
  Plane,
  Package,
} from "lucide-react";

// The SupportDashboard component acts as a central hub for platform management.
// It is intended only for authenticated users with a 'support' role.
// It allows for user verification, and the management of trips and requests.
export default function SupportDashboard() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  // State variables for managing dashboard data and UI.
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("verification");
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showRejectReasonModal, setShowRejectReasonModal] = useState(false);
  const [selectedUserForDoc, setSelectedUserForDoc] = useState(null);
  const [userToReject, setUserToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [showNotification, setShowNotification] = useState({
    isVisible: false,
    message: "",
    type: "info",
  });

  // Define a consistent color palette for styling.
  const colors = {
    primaryRed: "#DC143C",
    primaryBlue: "#003366",
    gold: "#FFD700",
    white: "#FFFFFF",
    darkGray: "#2E2E2E",
    lightGray: "#F5F5F5",
    borderGray: "#D9D9D9",
    green: "#22C55E",
    red: "#EF4444",
  };

  // Check user role for access control.
  // Redirects non-support users to the homepage.
  useEffect(() => {
    if (!loading && (!user || userProfile?.role !== "support")) {
      router.push("/");
    }
  }, [user, userProfile, loading, router]);

  // Fetch all users, including those awaiting verification.
  const fetchUsers = useCallback(async () => {
    try {
      const q = query(collection(db, "users"));
      const querySnapshot = await getDocs(q);
      const usersData = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  // Fetch all trips for management review.
  const fetchTrips = useCallback(async () => {
    try {
      const q = query(collection(db, "trips"));
      const querySnapshot = await getDocs(q);
      const tripsData = [];
      querySnapshot.forEach((doc) => {
        tripsData.push({ id: doc.id, ...doc.data() });
      });
      setTrips(tripsData);
    } catch (error) {
      console.error("Error fetching trips:", error);
    }
  }, []);

  // Fetch all shipment requests for review.
  const fetchRequests = useCallback(async () => {
    try {
      const q = query(collection(db, "shipmentRequests"));
      const querySnapshot = await getDocs(q);
      const requestsData = [];
      querySnapshot.forEach((doc) => {
        requestsData.push({ id: doc.id, ...doc.data() });
      });
      setRequests(requestsData);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  }, []);

  // Initial data fetch on component mount.
  useEffect(() => {
    // Stop the loading state once the authentication state has resolved.
    if (!loading) {
      // If the user has the 'support' role, fetch the data.
      if (user && userProfile?.role === "support") {
        Promise.all([fetchUsers(), fetchTrips(), fetchRequests()]).finally(() =>
          setLoadingData(false)
        );
      } else {
        // If the user is not a support user, we still need to stop loading
        // to show the "Access Denied" message.
        setLoadingData(false);
      }
    }
  }, [user, userProfile, loading, fetchUsers, fetchTrips, fetchRequests]);

  // Handle user verification approval.
  const handleVerifyUser = async (userId) => {
    if (
      !window.confirm(
        "Are you sure you want to approve this user's verification?"
      )
    ) {
      return;
    }
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        verified: true,
        verificationPending: false,
        updatedAt: new Date(),
      });
      fetchUsers();
      setShowNotification({
        isVisible: true,
        message: "User verification approved successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error verifying user:", error);
      setShowNotification({
        isVisible: true,
        message: "Failed to approve user verification.",
        type: "error",
      });
    }
  };

  // Handle user verification rejection.
  const handleRejectUser = (user) => {
    setUserToReject(user);
    setShowRejectReasonModal(true);
  };

  // Handle user rejection with a reason provided by support
  const handleRejectUserWithReason = async () => {
    if (!userToReject || !rejectionReason.trim()) {
      setShowNotification({
        isVisible: true,
        message: "Please provide a rejection reason.",
        type: "warning",
      });
      return;
    }

    try {
      const userRef = doc(db, "users", userToReject.id);

      // Send a notification to the user with the rejection reason
      const notificationPayload = {
        id: new Date().getTime(),
        type: "warning",
        title: "Identity Verification Rejected",
        message: `Your identity verification was rejected. Reason: ${rejectionReason}`,
        read: false,
        timestamp: new Date().toISOString(),
      };
      await updateDoc(userRef, {
        verified: false,
        verificationPending: false,
        verification: null,
        updatedAt: new Date(),
        notifications: arrayUnion(notificationPayload),
      });

      // Send an email to the user with the rejection reason
      const emailPayload = {
        to: userToReject.email,
        subject: "Your Nasosend Identity Verification Was Rejected",
        text: `Hello ${
          userToReject.verification?.fullName || "User"
        },\n\nYour recent identity verification request was rejected. Reason: ${rejectionReason}\n\nFor more information, please contact our support team.\n\nBest regards,\nTeam Nasosend`,
        html: `<p>Hello ${
          userToReject.verification?.fullName || "User"
        },</p><p>Your recent identity verification request was rejected.</p><p><b>Reason:</b> ${rejectionReason}</p><p>For more information, please contact our support team.</p><p>Best regards,<br/>Team Nasosend</p>`,
      };
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload),
      });

      fetchUsers();
      setShowRejectReasonModal(false);
      setUserToReject(null);
      setRejectionReason("");
      setShowNotification({
        isVisible: true,
        message: "User verification rejected and user notified.",
        type: "success",
      });
    } catch (error) {
      console.error("Error rejecting user:", error);
      setShowNotification({
        isVisible: true,
        message: "Failed to reject user verification.",
        type: "error",
      });
    }
  };

  // Handle trip approval
  const handleApproveTrip = async (tripId) => {
    if (!window.confirm("Are you sure you want to approve this trip?")) {
      return;
    }
    try {
      const tripRef = doc(db, "trips", tripId);
      const tripDoc = await getDoc(tripRef);
      if (!tripDoc.exists()) {
        throw new Error("Trip not found");
      }
      const tripData = tripDoc.data();

      await updateDoc(tripRef, {
        status: "active",
        updatedAt: new Date(),
      });

      // Send a notification to the traveler
      const travelerRef = doc(db, "users", tripData.travelerId);
      const notificationPayload = {
        id: new Date().getTime(),
        type: "success",
        title: "Your Trip Has Been Approved",
        message: `Your trip from ${tripData.departureCity} to ${tripData.arrivalCity} has been approved by our support team and is now live.`,
        read: false,
        timestamp: new Date().toISOString(),
      };
      await updateDoc(travelerRef, {
        notifications: arrayUnion(notificationPayload),
      });

      // Send an email to the traveler
      const emailPayload = {
        to: tripData.travelerEmail,
        subject: "Your Nasosend Trip is Live!",
        text: `Hello ${tripData.travelerName},\n\nYour trip from ${tripData.departureCity} to ${tripData.arrivalCity} has been approved by our support team and is now active. Senders can now see and request your trip.\n\nThank you for using Nasosend!\n\nBest regards,\nTeam Nasosend`,
        html: `<p>Hello ${tripData.travelerName},</p><p>Your trip from <b>${tripData.departureCity}</b> to <b>${tripData.arrivalCity}</b> has been approved by our support team and is now active. Senders can now see and request your trip.</p><p>Thank you for using Nasosend!</p><p>Best regards,<br/>Team Nasosend</p>`,
      };
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload),
      });

      fetchTrips();
      setShowNotification({
        isVisible: true,
        message: "Trip approved and is now active!",
        type: "success",
      });
    } catch (error) {
      console.error("Error approving trip:", error);
      setShowNotification({
        isVisible: true,
        message: "Failed to approve trip. Please try again.",
        type: "error",
      });
    }
  };

  // Handle deletion of a trip.
  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm("Are you sure you want to delete this trip?")) {
      return;
    }
    try {
      const tripRef = doc(db, "trips", tripId);
      const tripDoc = await getDoc(tripRef);
      if (!tripDoc.exists()) {
        throw new Error("Trip not found");
      }
      const tripData = tripDoc.data();

      await deleteDoc(tripRef);
      fetchTrips();

      // Send notification to the traveler
      const travelerRef = doc(db, "users", tripData.travelerId);
      const notificationPayload = {
        id: new Date().getTime(),
        type: "warning",
        title: "Your Trip Was Deleted",
        message: `Your trip from ${tripData.departureCity} to ${tripData.arrivalCity} has been deleted by a support agent.`,
        read: false,
        timestamp: new Date().toISOString(),
      };
      await updateDoc(travelerRef, {
        notifications: arrayUnion(notificationPayload),
      });

      setShowNotification({
        isVisible: true,
        message: "Trip deleted successfully.",
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting trip:", error);
      setShowNotification({
        isVisible: true,
        message: "Failed to delete trip.",
        type: "error",
      });
    }
  };

  // Handle deletion of a shipment request.
  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to delete this request?")) {
      return;
    }
    try {
      await deleteDoc(doc(db, "shipmentRequests", requestId));
      fetchRequests();
      setShowNotification({
        isVisible: true,
        message: "Request deleted successfully.",
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting request:", error);
      setShowNotification({
        isVisible: true,
        message: "Failed to delete request.",
        type: "error",
      });
    }
  };

  // A helper function to open the document modal.
  const handleOpenDocumentModal = (user) => {
    setSelectedUserForDoc(user);
    setShowDocumentModal(true);
  };

  // A helper function to close the document modal.
  const handleCloseDocumentModal = () => {
    setSelectedUserForDoc(null);
    setShowDocumentModal(false);
  };

  // Loading state
  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading support dashboard...</p>
      </div>
    );
  }

  // Access denied state for non-support users.
  if (!user || userProfile?.role !== "support") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">
          Access Denied. You do not have permission to view this page.
        </p>
      </div>
    );
  }

  // Filter trips into separate lists for easier display.
  const pendingTripVerifications = trips.filter(
    (t) => t.status === "pending_verification"
  );
  const activeTrips = trips.filter((t) => t.status === "active");

  // Main component JSX for the support dashboard.
  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.lightGray }}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold mb-8">Support Dashboard</h1>

        {/* Tab navigation for different sections */}
        <div className="flex border-b border-gray-200 mb-6 space-x-4">
          <button
            onClick={() => setActiveTab("verification")}
            className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === "verification"
                ? `border-b-2 border-green-600 text-green-600`
                : `text-gray-500 hover:text-gray-700`
            }`}
          >
            User Verification
          </button>
          <button
            onClick={() => setActiveTab("trips")}
            className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === "trips"
                ? `border-b-2 border-blue-600 text-blue-600`
                : `text-gray-500 hover:text-gray-700`
            }`}
          >
            Trips Management
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === "requests"
                ? `border-b-2 border-red-600 text-red-600`
                : `text-gray-500 hover:text-gray-700`
            }`}
          >
            Requests Management
          </button>
        </div>

        {/* User Verification Tab Content */}
        {activeTab === "verification" && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Pending Verifications (
              {users.filter((u) => u.verificationPending).length})
            </h2>
            <div className="space-y-4">
              {users
                .filter((u) => u.verificationPending)
                .map((supportUser) => (
                  <div
                    key={supportUser.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{supportUser.email}</p>
                      <p className="text-sm text-gray-500">
                        Full Name: {supportUser.verification?.fullName || "N/A"}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenDocumentModal(supportUser)}
                        className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        title="View documents"
                      >
                        <FileText size={20} />
                      </button>
                      <button
                        onClick={() => handleVerifyUser(supportUser.id)}
                        className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                        title="Approve verification"
                      >
                        <CheckCircle size={20} />
                      </button>
                      <button
                        onClick={() => handleRejectUser(supportUser)}
                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        title="Reject verification"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Trips Management Tab Content */}
        {activeTab === "trips" && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Pending Trip Verifications ({pendingTripVerifications.length})
            </h2>
            <div className="space-y-4 mb-8">
              {pendingTripVerifications.length > 0 ? (
                pendingTripVerifications.map((trip) => (
                  <div
                    key={trip.id}
                    className="flex items-center justify-between p-4 border border-yellow-300 bg-yellow-50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold flex items-center">
                        <Plane size={16} className="mr-2 text-yellow-600" />
                        {trip.departureCity} to {trip.arrivalCity}
                      </p>
                      <p className="text-sm text-gray-500">
                        Traveler: {trip.travelerName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Weight: {trip.availableWeight} kg
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveTrip(trip.id)}
                        className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                        title="Approve trip"
                      >
                        <CheckCircle size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteTrip(trip.id)}
                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        title="Delete trip"
                      >
                        <Trash size={20} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No trips are currently pending verification.
                </p>
              )}
            </div>

            <h2 className="text-2xl font-semibold mb-4">
              All Active Trips ({activeTrips.length})
            </h2>
            <div className="space-y-4">
              {activeTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-semibold flex items-center">
                      <Plane size={16} className="mr-2 text-gray-600" />
                      {trip.departureCity} to {trip.arrivalCity}
                    </p>
                    <p className="text-sm text-gray-500">
                      Traveler: {trip.travelerName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Weight: {trip.availableWeight} kg
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDeleteTrip(trip.id)}
                      className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      title="Delete trip"
                    >
                      <Trash size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Requests Management Tab Content */}
        {activeTab === "requests" && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">
              All Shipment Requests ({requests.length})
            </h2>
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-semibold">
                      Request for: {request.itemDescription}
                    </p>
                    <p className="text-sm text-gray-500">
                      From: {request.senderName}
                    </p>
                    <p className="text-sm text-gray-500">
                      To: {request.travelerName}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${
                        request.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : request.status === "accepted"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {request.status}
                    </span>
                    <button
                      onClick={() => handleDeleteRequest(request.id)}
                      className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      title="Delete request"
                    >
                      <Trash size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Viewing Modal */}
        {showDocumentModal && selectedUserForDoc && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">
                  Verification Documents for {selectedUserForDoc.email}
                </h3>
                <button
                  onClick={handleCloseDocumentModal}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <p>
                  Full Name:{" "}
                  {selectedUserForDoc.verification?.fullName || "N/A"}
                </p>
                <p>
                  Passport Number:{" "}
                  {selectedUserForDoc.verification?.passportNumber || "N/A"}
                </p>
                {selectedUserForDoc.verification?.stateIdUrl && (
                  <div>
                    <h4 className="font-semibold mb-2">State ID</h4>
                    <img
                      src={selectedUserForDoc.verification.stateIdUrl}
                      alt="State ID"
                      className="max-w-full h-auto rounded-lg"
                    />
                  </div>
                )}
                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={() => handleVerifyUser(selectedUserForDoc.id)}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectUser(selectedUserForDoc)}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reject Reason Modal */}
        {showRejectReasonModal && userToReject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Reject Verification</h3>
                <button
                  onClick={() => setShowRejectReasonModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full h-32 p-3 border rounded-lg focus:ring-red-600 focus:border-red-600"
                  placeholder="e.g., Document is blurry, information does not match profile..."
                />
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => {
                    setShowRejectReasonModal(false);
                    setUserToReject(null);
                    setRejectionReason("");
                  }}
                  className="py-2 px-4 rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectUserWithReason}
                  className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification component */}
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
                  <AlertTriangle size={32} className="text-yellow-500" />
                ) : (
                  <AlertTriangle size={32} className="text-red-500" />
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
