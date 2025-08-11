"use client";
import React, { useState } from "react";
import { Bell, CheckCircle, AlertTriangle, Info, X } from "lucide-react";

const notificationsData = [
  {
    id: 1,
    type: "success",
    title: "Shipment Request Accepted",
    message:
      "Your request for a 5kg package has been accepted by John Doe. You can now proceed to coordinate the details.",
    timestamp: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    type: "info",
    title: "Welcome to the Platform!",
    message:
      "We are thrilled to have you! Explore available trips or post your own to get started.",
    timestamp: "1 day ago",
    read: true,
  },
  {
    id: 3,
    type: "warning",
    title: "Verification Link Expired",
    message:
      "The email verification link has expired. Please resend a new one from your profile settings.",
    timestamp: "2 days ago",
    read: false,
  },
  {
    id: 4,
    type: "success",
    title: "Trip Posted Successfully",
    message:
      "Your trip from Sydney to Kathmandu on 25th Oct has been posted successfully. You will be notified when a sender requests your service.",
    timestamp: "3 days ago",
    read: true,
  },
  {
    id: 5,
    type: "info",
    title: "Profile Updated",
    message:
      "Your profile information has been updated. All changes are now live.",
    timestamp: "1 week ago",
    read: true,
  },
];

const NotificationPage = () => {
  const [notifications, setNotifications] = useState(notificationsData);
  const [filter, setFilter] = useState("all");

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

  const getColors = (type, read) => {
    if (read) {
      return {
        bg: "bg-white",
        border: "border-gray-200",
        text: "text-gray-600",
      };
    }
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

  const handleMarkAsRead = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleDeleteNotification = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((n) => n.id !== id)
    );
  };

  const filteredNotifications = notifications.filter(
    (n) => filter === "all" || n.type === filter
  );

  return (
    <div className="min-h-screen bg-gray-100 font-inter p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
          Notifications
        </h1>
        <p className="text-gray-500 mb-8">
          Stay up-to-date with your account activity.
        </p>

        <div className="flex flex-col lg:flex-row lg:space-x-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-1/4 mb-6 lg:mb-0">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Filters
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`w-full text-left py-2 px-4 rounded-lg font-medium transition-colors ${
                    filter === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Notifications
                </button>
                <button
                  onClick={() => setFilter("success")}
                  className={`w-full text-left py-2 px-4 rounded-lg font-medium transition-colors ${
                    filter === "success"
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Success
                </button>
                <button
                  onClick={() => setFilter("warning")}
                  className={`w-full text-left py-2 px-4 rounded-lg font-medium transition-colors ${
                    filter === "warning"
                      ? "bg-yellow-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Warnings
                </button>
                <button
                  onClick={() => setFilter("info")}
                  className={`w-full text-left py-2 px-4 rounded-lg font-medium transition-colors ${
                    filter === "info"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Info
                </button>
              </div>
            </div>
          </div>

          {/* Main Notification List */}
          <div className="w-full lg:w-3/4">
            {filteredNotifications.length > 0 ? (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => {
                  const { bg, border, text } = getColors(
                    notification.type,
                    notification.read
                  );
                  return (
                    <div
                      key={notification.id}
                      className={`relative flex items-start p-6 rounded-xl shadow-sm border transition-all ${bg} ${border} ${
                        notification.read ? "" : "hover:shadow-md"
                      }`}
                    >
                      <div className="flex-shrink-0 mr-4">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold text-lg mb-1 ${text}`}>
                          {notification.title}
                        </h3>
                        <p
                          className={`text-sm ${
                            notification.read
                              ? "text-gray-500"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {notification.timestamp}
                        </p>
                      </div>
                      <div className="ml-auto flex items-center space-x-2">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-gray-400 hover:text-blue-600 p-1 rounded-full transition-colors"
                            title="Mark as read"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleDeleteNotification(notification.id)
                          }
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
                <h3 className="text-xl font-semibold mb-2">
                  No new notifications
                </h3>
                <p>You're all caught up!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
