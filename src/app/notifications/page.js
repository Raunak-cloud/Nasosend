"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { Bell, CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { useRouter } from "next/navigation";

const NotificationPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const fetchedNotifications = userData.notifications || [];
        const sortedNotifications = fetchedNotifications.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setNotifications(sortedNotifications);

        const hasUnread = fetchedNotifications.some((n) => !n.read);
        if (hasUnread) {
          const updatedNotifications = fetchedNotifications.map((n) => ({
            ...n,
            read: true,
          }));
          await updateDoc(userDocRef, { notifications: updatedNotifications });
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [user, fetchNotifications]);

  const handleNotificationClick = (notification) => {
    switch (notification.title) {
      case "Shipment Request Accepted":
        router.push("/sender/dashboard");
        break;
      case "New Shipment Request Received":
        router.push("/traveler/dashboard");
        break;
      default:
        router.push("/dashboard");
        break;
    }
  };

  const handleDeleteNotification = async (e, notificationToDelete) => {
    e.stopPropagation(); // Prevent the click from triggering navigation
    if (!user) return;

    // Optimistic update for instant UI feedback
    setNotifications((prev) =>
      prev.filter((n) => n.id !== notificationToDelete.id)
    );

    try {
      const userDocRef = doc(db, "users", user.uid);
      // Find the specific notification object in the database to remove
      const userDoc = await getDoc(userDocRef);
      const currentNotifications = userDoc.data().notifications || [];
      const notificationToRemove = currentNotifications.find(
        (n) => n.id === notificationToDelete.id
      );

      if (notificationToRemove) {
        await updateDoc(userDocRef, {
          notifications: arrayRemove(notificationToRemove),
        });
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      // Re-fetch to sync state if delete fails
      fetchNotifications();
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-50",
          border: "border-green-300",
          text: "text-green-800",
        };
      case "warning":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-300",
          text: "text-yellow-800",
        };
      case "info":
        return {
          bg: "bg-blue-50",
          border: "border-blue-300",
          text: "text-blue-800",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-300",
          text: "text-gray-800",
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        Loading notifications...
      </div>
    );
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "A few moments ago";
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-100 font-inter p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 flex items-center">
          <Bell className="h-8 w-8 text-gray-600 mr-4" />
          All Notifications
        </h1>
        <p className="text-gray-500 mb-8">Your latest updates and alerts.</p>

        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const { bg, border, text } = getColors(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`relative flex items-start p-4 rounded-lg shadow-sm border cursor-pointer 
                      transition-all duration-200 ease-in-out
                      ${bg} ${border} 
                      hover:shadow-lg hover:-translate-y-1 
                      active:scale-[0.97] active:shadow-inner active:brightness-95 active:blur-sm`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex-shrink-0 mr-3">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-sm mb-1 ${text}`}>
                      {notification.title}
                    </h3>
                    <p className={`text-xs text-gray-700`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatTimestamp(notification.timestamp)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteNotification(e, notification)}
                    className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
                    aria-label="Delete notification"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No new notifications</h3>
            <p>You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
