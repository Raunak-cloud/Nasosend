// app/support/dashboard/page.js
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
  addDoc,
  serverTimestamp,
  orderBy,
  limit,
  where,
  setDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import SupportChatDashboard from "@/components/SupportChatDashboard";
import {
  Users,
  CheckCircle,
  AlertTriangle,
  X,
  FileText,
  Trash,
  Plane,
  Package,
  Send,
  Mail,
  MessageSquare,
  Globe,
  BarChart,
  Settings,
} from "lucide-react";

export default function SupportDashboard() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  // State variables
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [requests, setRequests] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [activeTab, setActiveTab] = useState("chat");
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showRejectReasonModal, setShowRejectReasonModal] = useState(false);
  const [selectedUserForDoc, setSelectedUserForDoc] = useState(null);
  const [userToReject, setUserToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [agentProfile, setAgentProfile] = useState(null);
  const [showNotification, setShowNotification] = useState({
    isVisible: false,
    message: "",
    type: "info",
  });

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

  // Check user role for access control
  useEffect(() => {
    if (!loading && (!user || userProfile?.role !== "support")) {
      router.push("/");
    }
  }, [user, userProfile, loading, router]);

  // Initialize or fetch agent profile
  useEffect(() => {
    const initializeAgent = async () => {
      if (!user || userProfile?.role !== "support") return;

      try {
        const agentRef = doc(db, "supportAgents", user.uid);
        const agentDoc = await getDoc(agentRef);

        if (!agentDoc.exists()) {
          // Create agent profile
          const newAgentProfile = {
            email: user.email,
            name: userProfile.displayName || user.email.split("@")[0],
            avatar: `https://ui-avatars.com/api/?name=${
              userProfile.displayName || "Agent"
            }&background=3b82f6&color=ffffff`,
            department: "General Support",
            status: "online",
            activeChats: 0,
            maxChats: 5,
            lastSeen: serverTimestamp(),
            rating: { average: 0, count: 0 },
            role: "support",
          };

          await setDoc(agentRef, newAgentProfile);
          setAgentProfile(newAgentProfile);
        } else {
          setAgentProfile(agentDoc.data());
        }
      } catch (error) {
        console.error("Error initializing agent:", error);
      }
    };

    initializeAgent();
  }, [user, userProfile]);

  // Fetch all users
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

  // Fetch all trips
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

  // Fetch all requests
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

  // Fetch visitors
  const fetchVisitors = useCallback(async () => {
    try {
      const q = query(
        collection(db, "siteVisitors"),
        orderBy("timestamp", "desc"),
        limit(100)
      );
      const querySnapshot = await getDocs(q);
      const visitorsData = [];
      querySnapshot.forEach((doc) => {
        visitorsData.push({ id: doc.id, ...doc.data() });
      });
      setVisitors(visitorsData);
    } catch (error) {
      console.error("Error fetching visitors:", error);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (!loading) {
      if (user && userProfile?.role === "support") {
        Promise.all([
          fetchUsers(),
          fetchTrips(),
          fetchRequests(),
          fetchVisitors(),
        ]).finally(() => setLoadingData(false));
      } else {
        setLoadingData(false);
      }
    }
  }, [
    user,
    userProfile,
    loading,
    fetchUsers,
    fetchTrips,
    fetchRequests,
    fetchVisitors,
  ]);

  // Handle user verification approval
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
        updatedAt: serverTimestamp(),
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

  // Handle user rejection
  const handleRejectUser = (user) => {
    setUserToReject(user);
    setShowRejectReasonModal(true);
  };

  // Handle user rejection with reason
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
      await updateDoc(userRef, {
        verified: false,
        verificationPending: false,
        verification: null,
        updatedAt: serverTimestamp(),
        rejectionReason: rejectionReason,
      });

      fetchUsers();
      setShowRejectReasonModal(false);
      setUserToReject(null);
      setRejectionReason("");
      setShowNotification({
        isVisible: true,
        message: "User verification rejected.",
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

  // Open document modal
  const handleOpenDocumentModal = (user) => {
    setSelectedUserForDoc(user);
    setShowDocumentModal(true);
  };

  // Close document modal
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

  // Access denied
  if (!user || userProfile?.role !== "support") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">
          Access Denied. You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.lightGray }}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold mb-8">Support Dashboard</h1>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6 space-x-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === "chat"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <MessageSquare className="inline-block w-4 h-4 mr-2" />
            Live Chat
          </button>
          <button
            onClick={() => setActiveTab("verification")}
            className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === "verification"
                ? "border-b-2 border-green-600 text-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users className="inline-block w-4 h-4 mr-2" />
            User Verification
          </button>
          <button
            onClick={() => setActiveTab("trips")}
            className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === "trips"
                ? "border-b-2 border-purple-600 text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Plane className="inline-block w-4 h-4 mr-2" />
            Trips
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === "requests"
                ? "border-b-2 border-red-600 text-red-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Package className="inline-block w-4 h-4 mr-2" />
            Requests
          </button>
          <button
            onClick={() => setActiveTab("visitors")}
            className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === "visitors"
                ? "border-b-2 border-gray-600 text-gray-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Globe className="inline-block w-4 h-4 mr-2" />
            Visitors
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === "analytics"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <BarChart className="inline-block w-4 h-4 mr-2" />
            Analytics
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "chat" && agentProfile && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <SupportChatDashboard
              agentId={user.uid}
              agentProfile={agentProfile}
            />
          </div>
        )}

        {activeTab === "verification" && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Pending Verifications (
              {users.filter((u) => u.verificationPending).length})
            </h2>
            <div className="space-y-4">
              {users
                .filter((u) => u.verificationPending)
                .map((verifyUser) => (
                  <div
                    key={verifyUser.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-semibold">{verifyUser.email}</p>
                      <p className="text-sm text-gray-500">
                        Full Name: {verifyUser.verification?.fullName || "N/A"}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenDocumentModal(verifyUser)}
                        className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        title="View documents"
                      >
                        <FileText size={20} />
                      </button>
                      <button
                        onClick={() => handleVerifyUser(verifyUser.id)}
                        className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                        title="Approve verification"
                      >
                        <CheckCircle size={20} />
                      </button>
                      <button
                        onClick={() => handleRejectUser(verifyUser)}
                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        title="Reject verification"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              {users.filter((u) => u.verificationPending).length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No pending verifications
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "trips" && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">
              All Trips ({trips.length})
            </h2>
            <div className="space-y-4">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
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
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${
                        trip.status === "active"
                          ? "bg-green-100 text-green-800"
                          : trip.status === "pending_verification"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {trip.status}
                    </span>
                  </div>
                </div>
              ))}
              {trips.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No trips available
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "requests" && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">
              All Requests ({requests.length})
            </h2>
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-semibold">
                      Request: {request.itemDescription}
                    </p>
                    <p className="text-sm text-gray-500">
                      From: {request.senderName}
                    </p>
                    <p className="text-sm text-gray-500">
                      To: {request.travelerName}
                    </p>
                  </div>
                  <div>
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
                  </div>
                </div>
              ))}
              {requests.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No requests available
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "visitors" && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Site Visitors</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800">Total Visitors</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {visitors.length}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800">Last 24 Hours</h3>
                <p className="text-2xl font-bold text-green-600">
                  {
                    visitors.filter((v) => {
                      const timestamp =
                        v.timestamp?.toDate?.() || new Date(v.timestamp);
                      return Date.now() - timestamp.getTime() < 86400000;
                    }).length
                  }
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800">Authenticated</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {visitors.filter((v) => v.isAuthenticated).length}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800">Anonymous</h3>
                <p className="text-2xl font-bold text-gray-600">
                  {visitors.filter((v) => !v.isAuthenticated).length}
                </p>
              </div>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {visitors.map((visitor) => (
                <div
                  key={visitor.id}
                  className="p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {visitor.userEmail ||
                          `Anonymous (${visitor.sessionId?.slice(-8)})`}
                      </p>
                      <p className="text-sm text-gray-500">
                        Page: {visitor.pathname}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {visitor.timestamp?.toDate?.()?.toLocaleString() ||
                        "Unknown"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Total Users</h3>
                <p className="text-3xl font-bold">{users.length}</p>
                <p className="text-sm mt-2">
                  Verified: {users.filter((u) => u.verified).length}
                </p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Active Trips</h3>
                <p className="text-3xl font-bold">
                  {trips.filter((t) => t.status === "active").length}
                </p>
                <p className="text-sm mt-2">Total: {trips.length}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Requests</h3>
                <p className="text-3xl font-bold">{requests.length}</p>
                <p className="text-sm mt-2">
                  Pending:{" "}
                  {requests.filter((r) => r.status === "pending").length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Document Modal */}
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
                    onClick={() => {
                      handleVerifyUser(selectedUserForDoc.id);
                      handleCloseDocumentModal();
                    }}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      handleRejectUser(selectedUserForDoc);
                      handleCloseDocumentModal();
                    }}
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
                  onClick={() => {
                    setShowRejectReasonModal(false);
                    setUserToReject(null);
                    setRejectionReason("");
                  }}
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

        {/* Notification */}
        {showNotification.isVisible && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black opacity-50"
              onClick={() =>
                setShowNotification({ ...showNotification, isVisible: false })
              }
            ></div>
            <div
              className={`relative p-6 rounded-lg shadow-lg w-full max-w-sm text-center transform scale-100 transition-all duration-300 ${
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
