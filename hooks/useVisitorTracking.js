// Create a new file: /hooks/useVisitorTracking.js
"use client";
import { useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

export const useVisitorTracking = (user) => {
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        // Generate a unique session ID
        const sessionId =
          Date.now() + "-" + Math.random().toString(36).substr(2, 9);

        // Get visitor info
        const visitorData = {
          sessionId,
          timestamp: serverTimestamp(),
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          referrer: document.referrer || "direct",
          pathname: window.location.pathname,
          userId: user?.uid || null,
          userEmail: user?.email || null,
          isAuthenticated: !!user,
          lastActivity: serverTimestamp(),
        };

        // Store visitor session
        await setDoc(doc(db, "siteVisitors", sessionId), visitorData);

        // Update activity every 30 seconds while user is active
        const activityInterval = setInterval(async () => {
          try {
            await updateDoc(doc(db, "siteVisitors", sessionId), {
              lastActivity: serverTimestamp(),
              pathname: window.location.pathname,
            });
          } catch (error) {
            console.error("Error updating visitor activity:", error);
          }
        }, 30000);

        // Clean up on unmount
        return () => {
          clearInterval(activityInterval);
        };
      } catch (error) {
        console.error("Error tracking visitor:", error);
      }
    };

    trackVisitor();
  }, [user]);
};
