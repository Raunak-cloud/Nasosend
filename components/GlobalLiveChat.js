// components/GlobalLiveChat.js
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LiveChat from "./LiveChat";

const GlobalLiveChat = () => {
  const { user, userProfile } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    console.log("GlobalLiveChat mounted, user:", user ? "exists" : "null");
  }, [user]);

  // Don't render on server side
  if (!isMounted) {
    return null;
  }

  // Don't render if no user
  if (!user) {
    console.log("No user, not rendering LiveChat");
    return null;
  }

  return (
    <LiveChat
      userId={user.uid}
      userName={
        userProfile?.displayName ||
        userProfile?.verification?.fullName ||
        user.email?.split("@")[0] ||
        "User"
      }
      userEmail={user.email || ""}
    />
  );
};

export default GlobalLiveChat;
