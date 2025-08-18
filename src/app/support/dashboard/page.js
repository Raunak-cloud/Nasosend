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
  serverTimestamp,
  orderBy,
  limit,
  where,
  setDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import SupportChatDashboard from "@/components/SupportChatDashboard";
import BlogManagement from "@/components/BlogManagement";
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
  BookOpen,
  Eye,
  Clock,
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
  const [tripToReject, setTripToReject] = useState(null);
  const [showTripRejectModal, setShowTripRejectModal] = useState(false);
  const [tripRejectionReason, setTripRejectionReason] = useState("");
  const [showNotification, setShowNotification] = useState({
    isVisible: false,
    message: "",
    type: "info",
  });
  const [showTripDocumentModal, setShowTripDocumentModal] = useState(false);
  const [selectedTripForDoc, setSelectedTripForDoc] = useState(null);
  const [blogPostsCount, setBlogPostsCount] = useState(0);

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

  const handleViewTripDocument = (trip) => {
    console.log("Trip data:", trip); // Add this line to see what fields are available
    console.log("eTicket:", trip.eTicket);
    console.log("eTicketUrl:", trip.eTicketUrl);
    console.log("eTicketDownloadUrl:", trip.eTicketDownloadUrl);
    setSelectedTripForDoc(trip);
    setShowTripDocumentModal(true);
  };

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

  // Fetch visitors with real-time updates
  const fetchVisitors = useCallback(async () => {
    try {
      // Query visitors ordered by timestamp, get last 100
      const q = query(
        collection(db, "siteVisitors"),
        orderBy("timestamp", "desc"),
        limit(100)
      );

      // Set up real-time listener
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const visitorsData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          visitorsData.push({
            id: doc.id,
            ...data,
            // Convert Firestore timestamps to Date objects
            timestamp: data.timestamp?.toDate
              ? data.timestamp.toDate()
              : new Date(data.timestamp),
            lastActivity: data.lastActivity?.toDate
              ? data.lastActivity.toDate()
              : new Date(data.lastActivity),
            sessionStart: data.sessionStart?.toDate
              ? data.sessionStart.toDate()
              : new Date(data.sessionStart),
          });
        });
        setVisitors(visitorsData);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error fetching visitors:", error);
    }
  }, []);

  // Fetch blog posts count
  const fetchBlogPostsCount = useCallback(async () => {
    try {
      const q = query(collection(db, "blogPosts"));
      const querySnapshot = await getDocs(q);
      setBlogPostsCount(querySnapshot.size);
    } catch (error) {
      console.error("Error fetching blog posts count:", error);
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
          fetchBlogPostsCount(),
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
    fetchBlogPostsCount,
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
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      await updateDoc(userRef, {
        verified: true,
        verificationPending: false,
        updatedAt: serverTimestamp(),
      });

      // Send notification to user
      const notificationPayload = {
        id: new Date().getTime(),
        type: "success",
        title: "Identity Verification Approved",
        message:
          "Your identity has been successfully verified. We have sent 2 free tokens to your account. You can now access all features.",
        read: false,
        timestamp: new Date().toISOString(),
      };

      await updateDoc(userRef, {
        notifications: arrayUnion(notificationPayload),
      });

      // Send email to user
      const emailPayload = {
        to: userData?.verification.email,
        subject: "Your Nasosend Identity Has Been Verified!",
        text: `Hello ${
          userData?.verification?.fullName || "User"
        },\n\nYour identity verification has been successfully approved. You can now post trips and send requests on Nasosend.\n\nBest regards,\nTeam Nasosend`,
        html: `<p>Hello ${
          userData.verification?.fullName || "User"
        },</p><p>Your identity verification has been successfully approved.</p><p>You can now post trips and send requests on our platform.</p><p>Best regards,<br/>Team Nasosend</p>`,
      };

      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload),
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
      const userData = userToReject;

      // Update user verification status
      await updateDoc(userRef, {
        verified: false,
        verificationPending: false,
        verification: null,
        updatedAt: serverTimestamp(),
        rejectionReason: rejectionReason,
      });

      // Send notification to user
      const notificationPayload = {
        id: new Date().getTime(),
        type: "warning",
        title: "Identity Verification Rejected",
        message: `Your identity verification was rejected. Reason: ${rejectionReason}`,
        read: false,
        timestamp: new Date().toISOString(),
      };

      await updateDoc(userRef, {
        notifications: arrayUnion(notificationPayload),
      });
      console.log(44);
      // Send email to user
      const emailPayload = {
        to: userData.verification.email,
        subject: "Your Nasosend Identity Verification Was Rejected",
        text: `Hello ${
          userData.verification?.fullName || "User"
        },\n\nYour recent identity verification request was rejected.\n\nReason: ${rejectionReason}\n\nPlease review the requirements and submit your documents again. If you have questions, contact our support team.\n\nBest regards,\nTeam Nasosend`,
        html: `<p>Hello ${
          userData.verification?.fullName || "User"
        },</p><p>Your recent identity verification request was rejected.</p><p><strong>Reason:</strong> ${rejectionReason}</p><p>Please review the requirements and submit your documents again. If you have questions, contact our support team.</p><p>Best regards,<br/>Team Nasosend</p>`,
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
        approvedAt: serverTimestamp(),
        approvedBy: user.uid,
      });

      // Send notification to traveler
      const travelerRef = doc(db, "users", tripData.travelerId);
      const notificationPayload = {
        id: new Date().getTime(),
        type: "success",
        title: "Your Trip Has Been Approved",
        message: `Your trip from ${tripData.departureCity} to ${tripData.arrivalCity} has been approved and is now live.`,
        read: false,
        timestamp: new Date().toISOString(),
      };

      await updateDoc(travelerRef, {
        notifications: arrayUnion(notificationPayload),
      });

      // Send email to traveler
      const emailPayload = {
        to: tripData.travelerEmail,
        subject: "Your Nasosend Trip is Live!",
        text: `Hello ${tripData.travelerName},\n\nGreat news! Your trip from ${
          tripData.departureCity
        } to ${tripData.arrivalCity} on ${new Date(
          tripData.departureDate
        ).toLocaleDateString()} has been approved.\n\nSenders can now see and request your trip. You'll be notified when you receive matching requests.\n\nTrip Details:\n- Route: ${
          tripData.departureCity
        } to ${tripData.arrivalCity}\n- Date: ${new Date(
          tripData.departureDate
        ).toLocaleDateString()}\n- Available Weight: ${
          tripData.availableWeight
        } kg\n\nThank you for using Nasosend!\n\nBest regards,\nTeam Nasosend`,
        html: `<p>Hello ${
          tripData.travelerName
        },</p><p>Great news! Your trip from <strong>${
          tripData.departureCity
        }</strong> to <strong>${tripData.arrivalCity}</strong> on ${new Date(
          tripData.departureDate
        ).toLocaleDateString()} has been approved.</p><p>Senders can now see and request your trip. You'll be notified when you receive matching requests.</p><h3>Trip Details:</h3><ul><li>Route: ${
          tripData.departureCity
        } to ${tripData.arrivalCity}</li><li>Date: ${new Date(
          tripData.departureDate
        ).toLocaleDateString()}</li><li>Available Weight: ${
          tripData.availableWeight
        } kg</li></ul><p>Thank you for using Nasosend!</p><p>Best regards,<br/>Team Nasosend</p>`,
      };

      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload),
      });

      fetchTrips();
      setShowNotification({
        isVisible: true,
        message: "Trip approved and traveler notified!",
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

  // Handle trip rejection
  const handleRejectTrip = (trip) => {
    setTripToReject(trip);
    setShowTripRejectModal(true);
  };

  // Handle trip rejection with reason
  const handleRejectTripWithReason = async () => {
    if (!tripToReject || !tripRejectionReason.trim()) {
      setShowNotification({
        isVisible: true,
        message: "Please provide a rejection reason.",
        type: "warning",
      });
      return;
    }

    try {
      const tripRef = doc(db, "trips", tripToReject.id);
      const tripData = tripToReject;

      // Update trip status
      await updateDoc(tripRef, {
        status: "rejected",
        rejectedAt: serverTimestamp(),
        rejectedBy: user.uid,
        rejectionReason: tripRejectionReason,
      });

      // Send notification to traveler
      const travelerRef = doc(db, "users", tripData.travelerId);
      const notificationPayload = {
        id: new Date().getTime(),
        type: "warning",
        title: "Trip Verification Rejected",
        message: `Your trip from ${tripData.departureCity} to ${tripData.arrivalCity} was rejected. Reason: ${tripRejectionReason}`,
        read: false,
        timestamp: new Date().toISOString(),
      };

      await updateDoc(travelerRef, {
        notifications: arrayUnion(notificationPayload),
      });

      // Send email to traveler
      const emailPayload = {
        to: tripData.travelerEmail,
        subject: "Your Nasosend Trip Was Not Approved",
        text: `Hello ${tripData.travelerName},\n\nWe regret to inform you that your trip from ${tripData.departureCity} to ${tripData.arrivalCity} was not approved.\n\nReason: ${tripRejectionReason}\n\nPlease review the requirements and submit a new trip if you believe this was an error. For questions, contact our support team.\n\nBest regards,\nTeam Nasosend`,
        html: `<p>Hello ${tripData.travelerName},</p><p>We regret to inform you that your trip from <strong>${tripData.departureCity}</strong> to <strong>${tripData.arrivalCity}</strong> was not approved.</p><p><strong>Reason:</strong> ${tripRejectionReason}</p><p>Please review the requirements and submit a new trip if you believe this was an error. For questions, contact our support team.</p><p>Best regards,<br/>Team Nasosend</p>`,
      };
      console.log(emailPayload);
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload),
      });

      fetchTrips();
      setShowTripRejectModal(false);
      setTripToReject(null);
      setTripRejectionReason("");
      setShowNotification({
        isVisible: true,
        message: "Trip rejected and traveler notified.",
        type: "success",
      });
    } catch (error) {
      console.error("Error rejecting trip:", error);
      setShowNotification({
        isVisible: true,
        message: "Failed to reject trip.",
        type: "error",
      });
    }
  };

  // Handle request approval
  const handleApproveRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to approve this request?")) {
      return;
    }
    try {
      const requestRef = doc(db, "shipmentRequests", requestId);
      const requestDoc = await getDoc(requestRef);
      if (!requestDoc.exists()) {
        throw new Error("Request not found");
      }
      const requestData = requestDoc.data();

      await updateDoc(requestRef, {
        status: "approved",
        approvedAt: serverTimestamp(),
        approvedBy: user.uid,
      });

      // Send notifications to both sender and traveler
      const senderRef = doc(db, "users", requestData.senderId);
      const travelerRef = doc(db, "users", requestData.travelerId);

      const senderNotification = {
        id: new Date().getTime(),
        type: "success",
        title: "Shipment Request Approved",
        message: `Your shipment request for "${requestData.itemDescription}" has been approved.`,
        read: false,
        timestamp: new Date().toISOString(),
      };

      const travelerNotification = {
        id: new Date().getTime() + 1,
        type: "info",
        title: "New Shipment Request",
        message: `You have a new approved shipment request for "${requestData.itemDescription}" from ${requestData.senderName}.`,
        read: false,
        timestamp: new Date().toISOString(),
      };

      await updateDoc(senderRef, {
        notifications: arrayUnion(senderNotification),
      });

      await updateDoc(travelerRef, {
        notifications: arrayUnion(travelerNotification),
      });

      // Send emails
      const senderEmail = {
        to: requestData.senderEmail,
        subject: "Your Shipment Request Has Been Approved!",
        text: `Hello ${requestData.senderName},\n\nYour shipment request for "${requestData.itemDescription}" has been approved. The traveler will contact you soon to arrange pickup and delivery.\n\nBest regards,\nTeam Nasosend`,
        html: `<p>Hello ${requestData.senderName},</p><p>Your shipment request for "<strong>${requestData.itemDescription}</strong>" has been approved. The traveler will contact you soon to arrange pickup and delivery.</p><p>Best regards,<br/>Team Nasosend</p>`,
      };

      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(senderEmail),
      });

      fetchRequests();
      setShowNotification({
        isVisible: true,
        message: "Request approved and parties notified!",
        type: "success",
      });
    } catch (error) {
      console.error("Error approving request:", error);
      setShowNotification({
        isVisible: true,
        message: "Failed to approve request.",
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
            onClick={() => setActiveTab("blog")}
            className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === "blog"
                ? "border-b-2 border-purple-600 text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <BookOpen className="inline-block w-4 h-4 mr-2" />
            Blog Management
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
                ? "border-b-2 border-yellow-600 text-yellow-600"
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

        {activeTab === "blog" && (
          <BlogManagement user={user} userProfile={userProfile} />
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
              Pending Trip Verifications (
              {trips.filter((t) => t.status === "pending_verification").length})
            </h2>
            <div className="space-y-4 mb-8">
              {trips.filter((t) => t.status === "pending_verification").length >
              0 ? (
                trips
                  .filter((t) => t.status === "pending_verification")
                  .map((trip) => (
                    <div
                      key={trip.id}
                      className="flex items-center justify-between p-4 border border-yellow-300 bg-yellow-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-semibold flex items-center">
                          <Plane size={16} className="mr-2 text-yellow-600" />
                          {trip.departureCity} to {trip.arrivalCity}
                        </p>
                        <p className="text-sm text-gray-500">
                          Traveler: {trip.travelerName}
                        </p>
                        <p className="text-sm text-gray-500">
                          Date:{" "}
                          {trip.departureDate
                            ? new Date(trip.departureDate).toLocaleDateString()
                            : "N/A"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Weight: {trip.availableWeight} kg
                        </p>
                        {trip.flightNumber && (
                          <p className="text-sm text-gray-500">
                            Flight: {trip.flightNumber} ({trip.airline})
                          </p>
                        )}
                        {trip.allowedItems && trip.allowedItems.length > 0 && (
                          <p className="text-sm text-gray-500 mt-1">
                            Items: {trip.allowedItems.slice(0, 2).join(", ")}
                            {trip.allowedItems.length > 2 &&
                              ` +${trip.allowedItems.length - 2} more`}
                          </p>
                        )}
                        {trip.pickupCities && trip.pickupCities.length > 0 && (
                          <p className="text-sm text-gray-500">
                            Pickup: {trip.pickupCities.join(", ")}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {trip.eTicket && (
                          <button
                            onClick={() => handleViewTripDocument(trip)}
                            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                            title="View e-ticket"
                          >
                            <FileText size={20} />
                          </button>
                        )}
                        <button
                          onClick={() => handleApproveTrip(trip.id)}
                          className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                          title="Approve trip"
                        >
                          <CheckCircle size={20} />
                        </button>
                        <button
                          onClick={() => handleRejectTrip(trip)}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                          title="Reject trip"
                        >
                          <X size={20} />
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
              All Active Trips (
              {trips.filter((t) => t.status === "active").length})
            </h2>
            <div className="space-y-4">
              {trips
                .filter((t) => t.status === "active")
                .map((trip) => (
                  <div
                    key={trip.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <p className="font-semibold flex items-center">
                        <Plane size={16} className="mr-2 text-gray-600" />
                        {trip.departureCity} to {trip.arrivalCity}
                      </p>
                      <p className="text-sm text-gray-500">
                        Traveler: {trip.travelerName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Date:{" "}
                        {trip.departureDate
                          ? new Date(trip.departureDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Weight: {trip.availableWeight} kg
                      </p>
                      {trip.flightNumber && (
                        <p className="text-sm text-gray-500">
                          Flight: {trip.flightNumber} ({trip.airline})
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {trip.eTicket && (
                        <button
                          onClick={() => handleViewTripDocument(trip)}
                          className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                          title="View e-ticket"
                        >
                          <FileText size={20} />
                        </button>
                      )}
                      <span className="px-3 py-1 text-xs rounded-full font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this trip?"
                            )
                          ) {
                            deleteDoc(doc(db, "trips", trip.id)).then(() => {
                              fetchTrips();
                              setShowNotification({
                                isVisible: true,
                                message: "Trip deleted successfully.",
                                type: "success",
                              });
                            });
                          }
                        }}
                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        title="Delete trip"
                      >
                        <Trash size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              {trips.filter((t) => t.status === "active").length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No active trips available
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "requests" && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Pending Requests (
              {requests.filter((r) => r.status === "pending").length})
            </h2>
            <div className="space-y-4 mb-8">
              {requests
                .filter((r) => r.status === "pending")
                .map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 border border-yellow-300 bg-yellow-50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">
                        Request: {request.itemDescription}
                      </p>
                      <p className="text-sm text-gray-500">
                        From: {request.senderName} ({request.senderEmail})
                      </p>
                      <p className="text-sm text-gray-500">
                        To: {request.travelerName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Weight: {request.weight} kg
                      </p>
                      <p className="text-sm text-gray-500">
                        Budget: ${request.budget}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveRequest(request.id)}
                        className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                        title="Approve request"
                      >
                        <CheckCircle size={20} />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this request?"
                            )
                          ) {
                            deleteDoc(
                              doc(db, "shipmentRequests", request.id)
                            ).then(() => {
                              fetchRequests();
                              setShowNotification({
                                isVisible: true,
                                message: "Request deleted successfully.",
                                type: "success",
                              });
                            });
                          }
                        }}
                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        title="Delete request"
                      >
                        <Trash size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              {requests.filter((r) => r.status === "pending").length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No pending requests
                </p>
              )}
            </div>

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
                          : request.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : request.status === "accepted"
                          ? "bg-blue-100 text-blue-800"
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Site Visitors</h2>
              <button
                onClick={fetchVisitors}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Refresh
              </button>
            </div>

            {/* Real-time Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800">Total Visitors</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {visitors.length}
                </p>
                <p className="text-xs text-blue-600 mt-1">Last 100 sessions</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800">Active Now</h3>
                <p className="text-2xl font-bold text-green-600">
                  {
                    visitors.filter((v) => {
                      const lastActivity = v.lastActivity;
                      const fiveMinutesAgo = new Date(
                        Date.now() - 5 * 60 * 1000
                      );
                      return v.isActive && lastActivity >= fiveMinutesAgo;
                    }).length
                  }
                </p>
                <p className="text-xs text-green-600 mt-1">Last 5 minutes</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800">Last 24 Hours</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {
                    visitors.filter((v) => {
                      const timestamp = v.timestamp;
                      const last24Hours = new Date(
                        Date.now() - 24 * 60 * 60 * 1000
                      );
                      return timestamp >= last24Hours;
                    }).length
                  }
                </p>
                <p className="text-xs text-purple-600 mt-1">Unique sessions</p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-800">
                  Registered Users
                </h3>
                <p className="text-2xl font-bold text-orange-600">
                  {visitors.filter((v) => v.isAuthenticated).length}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  {visitors.length > 0
                    ? `${Math.round(
                        (visitors.filter((v) => v.isAuthenticated).length /
                          visitors.length) *
                          100
                      )}% of total`
                    : "0% of total"}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800">
                  Avg. Time on Site
                </h3>
                <p className="text-2xl font-bold text-gray-600">
                  {visitors.length > 0
                    ? `${Math.round(
                        visitors.reduce(
                          (acc, v) => acc + (v.totalTimeOnSite || 0),
                          0
                        ) /
                          visitors.length /
                          60
                      )}m`
                    : "0m"}
                </p>
                <p className="text-xs text-gray-600 mt-1">Per session</p>
              </div>
            </div>

            {/* Visitors List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recent Visitors</h3>
              {visitors.length > 0 ? (
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {visitors.map((visitor) => {
                    const isActive =
                      visitor.isActive &&
                      visitor.lastActivity >=
                        new Date(Date.now() - 5 * 60 * 1000);
                    const timeOnSite = visitor.totalTimeOnSite || 0;
                    const minutes = Math.floor(timeOnSite / 60);
                    const seconds = timeOnSite % 60;

                    return (
                      <div
                        key={visitor.id}
                        className={`p-4 border rounded-lg ${
                          isActive ? "bg-green-50 border-green-200" : "bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  isActive
                                    ? "bg-green-500 animate-pulse"
                                    : visitor.isAuthenticated
                                    ? "bg-blue-400"
                                    : "bg-gray-400"
                                }`}
                              ></div>
                              <span className="font-semibold text-sm">
                                {visitor.userEmail ||
                                  `Visitor ${visitor.sessionId?.slice(-8)}`}
                              </span>
                              {visitor.isAuthenticated && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  Registered
                                </span>
                              )}
                              {isActive && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                  Active Now
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
                              <div>
                                <span className="font-semibold">Page:</span>{" "}
                                {visitor.pathname}
                              </div>
                              <div>
                                <span className="font-semibold">Device:</span>{" "}
                                {visitor.deviceType}
                              </div>
                              <div>
                                <span className="font-semibold">Browser:</span>{" "}
                                {visitor.browser}
                              </div>
                              <div>
                                <span className="font-semibold">Country:</span>{" "}
                                {visitor.country}
                              </div>
                            </div>
                          </div>

                          <div className="text-right ml-4">
                            <p className="text-xs font-semibold text-gray-700">
                              {visitor.timestamp?.toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {visitor.timestamp?.toLocaleTimeString()}
                            </p>
                            {visitor.lastActivity && (
                              <p className="text-xs text-gray-400 mt-1">
                                Last:{" "}
                                {visitor.lastActivity.toLocaleTimeString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>No visitor data available yet.</p>
                  <p className="text-sm mt-2">
                    Visitor tracking will start once users visit the site.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                <h3 className="text-lg font-semibold mb-2">Blog Posts</h3>
                <p className="text-3xl font-bold">{blogPostsCount}</p>
                <p className="text-sm mt-2">Content published</p>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg">
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

        {showTripDocumentModal && selectedTripForDoc && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">
                  Trip Documents - {selectedTripForDoc.departureCity} to{" "}
                  {selectedTripForDoc.arrivalCity}
                </h3>
                <button
                  onClick={() => {
                    setShowTripDocumentModal(false);
                    setSelectedTripForDoc(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Trip Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-lg mb-3">
                    Trip Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Traveler:</span>{" "}
                      {selectedTripForDoc.travelerName}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedTripForDoc.travelerEmail || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span>{" "}
                      {selectedTripForDoc.travelerPhone || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Flight:</span>{" "}
                      {selectedTripForDoc.flightNumber} (
                      {selectedTripForDoc.airline})
                    </div>
                    <div>
                      <span className="font-medium">Departure:</span>{" "}
                      {new Date(
                        selectedTripForDoc.departureDate
                      ).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Arrival:</span>{" "}
                      {new Date(
                        selectedTripForDoc.arrivalDate
                      ).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Available Weight:</span>{" "}
                      {selectedTripForDoc.availableWeight} kg
                    </div>
                    <div>
                      <span className="font-medium">Price per kg:</span> $
                      {selectedTripForDoc.pricePerKg}
                    </div>
                  </div>

                  {selectedTripForDoc.allowedItems &&
                    selectedTripForDoc.allowedItems.length > 0 && (
                      <div className="mt-3">
                        <span className="font-medium text-sm">
                          Allowed Items:
                        </span>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {selectedTripForDoc.allowedItems.map(
                            (item, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {item}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {selectedTripForDoc.pickupCities &&
                    selectedTripForDoc.pickupCities.length > 0 && (
                      <div className="mt-3">
                        <span className="font-medium text-sm">
                          Pickup Cities:
                        </span>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {selectedTripForDoc.pickupCities.map(
                            (city, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                              >
                                {city}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>

                {/* E-Ticket Document */}
                <div>
                  <h4 className="font-semibold text-lg mb-3">
                    E-Ticket Document
                  </h4>
                  {/* Check multiple possible fields for e-ticket */}
                  {selectedTripForDoc.eTicketDownloadUrl ||
                  selectedTripForDoc.eTicketUrl ||
                  selectedTripForDoc.eTicket ? (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="w-8 h-8 text-blue-600 mr-3" />
                          <div>
                            <p className="font-medium">
                              {selectedTripForDoc.eTicket || "E-Ticket.pdf"}
                            </p>
                            <p className="text-sm text-gray-500">
                              PDF Document
                            </p>
                          </div>
                        </div>

                        {/* Show download buttons only if we have a download URL */}
                        {selectedTripForDoc.eTicketDownloadUrl ? (
                          <div className="flex gap-2">
                            <a
                              href={selectedTripForDoc.eTicketDownloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                              View PDF
                            </a>
                            <a
                              href={selectedTripForDoc.eTicketDownloadUrl}
                              download={
                                selectedTripForDoc.eTicket || "eticket.pdf"
                              }
                              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                            >
                              Download
                            </a>
                          </div>
                        ) : (
                          <div className="text-sm text-yellow-600">
                            Document uploaded but preview not available
                          </div>
                        )}
                      </div>

                      {/* Only show iframe if we have a download URL */}
                      {selectedTripForDoc.eTicketDownloadUrl && (
                        <div className="mt-4">
                          <iframe
                            src={`${selectedTripForDoc.eTicketDownloadUrl}#toolbar=0`}
                            className="w-full h-96 border border-gray-200 rounded"
                            title="E-Ticket PDF"
                            onError={(e) => {
                              console.error("Failed to load PDF in iframe");
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      )}

                      {/* Show message if document exists but no download URL */}
                      {!selectedTripForDoc.eTicketDownloadUrl &&
                        selectedTripForDoc.eTicket && (
                          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                            <p className="font-medium mb-1">
                              Legacy Upload Detected
                            </p>
                            <p>
                              This trip was created before the new upload
                              system. The e-ticket "{selectedTripForDoc.eTicket}
                              " was uploaded but needs to be re-uploaded by the
                              traveler to enable preview.
                            </p>
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4 text-center text-gray-500">
                      No e-ticket document uploaded
                    </div>
                  )}
                </div>

                {/* Action Buttons for Pending Trips */}
                {selectedTripForDoc.status === "pending_verification" && (
                  <div className="flex space-x-4 mt-6 pt-6 border-t">
                    <button
                      onClick={() => {
                        handleApproveTrip(selectedTripForDoc.id);
                        setShowTripDocumentModal(false);
                        setSelectedTripForDoc(null);
                      }}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Approve Trip
                    </button>
                    <button
                      onClick={() => {
                        handleRejectTrip(selectedTripForDoc);
                        setShowTripDocumentModal(false);
                        setSelectedTripForDoc(null);
                      }}
                      className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Reject Trip
                    </button>
                  </div>
                )}
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

        {/* Trip Rejection Modal */}
        {showTripRejectModal && tripToReject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Reject Trip</h3>
                <button
                  onClick={() => {
                    setShowTripRejectModal(false);
                    setTripToReject(null);
                    setTripRejectionReason("");
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Rejecting trip from{" "}
                  <strong>{tripToReject.departureCity}</strong> to{" "}
                  <strong>{tripToReject.arrivalCity}</strong> by{" "}
                  {tripToReject.travelerName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection
                </label>
                <textarea
                  value={tripRejectionReason}
                  onChange={(e) => setTripRejectionReason(e.target.value)}
                  className="w-full h-32 p-3 border rounded-lg focus:ring-red-600 focus:border-red-600"
                  placeholder="e.g., Invalid flight details, incomplete documentation, route not supported..."
                />
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => {
                    setShowTripRejectModal(false);
                    setTripToReject(null);
                    setTripRejectionReason("");
                  }}
                  className="py-2 px-4 rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectTripWithReason}
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
