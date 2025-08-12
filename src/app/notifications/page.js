//app/notifications/page.js

"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { Bell, CheckCircle, AlertTriangle, Info, X } from "lucide-react";

const NotificationPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
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
        setNotifications(fetchedNotifications);

        // Mark all notifications as read when the page is opened
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
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case "info":
        return <Info className="h-6 w-6 text-blue-500" />;
      default:
        return <Bell className="h-6 w-6 text-gray-500" />;
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

  const handleDeleteNotification = async (notificationToDelete) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        notifications: arrayRemove(notificationToDelete),
      });
      setNotifications((prevNotifications) =>
        prevNotifications.filter((n) => n.id !== notificationToDelete.id)
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading notifications...
      </div>
    );
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) {
      return "A few moments ago";
    }
    if (typeof timestamp.toDate === "function") {
      return timestamp.toDate().toLocaleString();
    }
    return new Date(timestamp).toLocaleString();
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
          <div className="space-y-4">
            {notifications
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .map((notification) => {
                const { bg, border, text } = getColors(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`relative flex items-start p-6 rounded-xl shadow-sm border transition-all ${bg} ${border}`}
                  >
                    <div className="flex-shrink-0 mr-4">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold text-lg mb-1 ${text}`}>
                        {notification.title}
                      </h3>
                      <p className={`text-sm text-gray-700`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                    <div className="ml-auto flex items-center space-x-2">
                      <button
                        onClick={() => handleDeleteNotification(notification)}
                        className="text-gray-400 hover:text-red-600 p-1 rounded-full transition-colors"
                        title="Dismiss"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
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
