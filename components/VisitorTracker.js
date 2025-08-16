// components/VisitorTracker.js
"use client";

import { useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

const VisitorTracker = () => {
  const { user, userProfile } = useAuth();
  const pathname = usePathname();
  const sessionIdRef = useRef(null);
  const lastPathRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const pageStartTimeRef = useRef(Date.now());
  const activityIntervalRef = useRef(null);

  // Generate or get session ID
  useEffect(() => {
    if (!sessionIdRef.current) {
      // Check if session ID exists in sessionStorage
      const existingSessionId = sessionStorage.getItem("visitorSessionId");
      if (existingSessionId) {
        sessionIdRef.current = existingSessionId;
      } else {
        // Generate new session ID
        sessionIdRef.current = `session_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        sessionStorage.setItem("visitorSessionId", sessionIdRef.current);
      }
    }
  }, []);

  // Get visitor information
  const getVisitorInfo = () => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    const screenResolution = `${window.screen.width}x${window.screen.height}`;

    // Basic device detection
    let deviceType = "Desktop";
    if (/Mobile|Android|iPhone/i.test(userAgent)) {
      deviceType = "Mobile";
    } else if (/iPad|Tablet/i.test(userAgent)) {
      deviceType = "Tablet";
    }

    // Basic browser detection
    let browser = "Unknown";
    if (userAgent.includes("Chrome")) {
      browser = "Chrome";
    } else if (userAgent.includes("Firefox")) {
      browser = "Firefox";
    } else if (userAgent.includes("Safari")) {
      browser = "Safari";
    } else if (userAgent.includes("Edge")) {
      browser = "Edge";
    }

    // Get referrer
    const referrer = document.referrer || "Direct";

    // Get country from timezone (approximation)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let country = "Unknown";
    if (timezone.includes("Australia")) {
      country = "Australia";
    } else if (timezone.includes("Asia/Kathmandu")) {
      country = "Nepal";
    } else if (timezone.includes("America")) {
      country = "United States";
    } else if (timezone.includes("Europe")) {
      country = "Europe";
    } else if (timezone.includes("Asia")) {
      country = "Asia";
    }

    return {
      sessionId: sessionIdRef.current,
      isAuthenticated: !!user,
      userId: user?.uid || null,
      userEmail: user?.email || null,
      userName: userProfile?.displayName || null,
      pathname,
      referrer,
      userAgent,
      platform,
      deviceType,
      browser,
      language,
      screenResolution,
      timezone,
      country,
      timestamp: serverTimestamp(),
      lastActivity: serverTimestamp(),
    };
  };

  // Track page view
  const trackPageView = async () => {
    if (!sessionIdRef.current) return;

    try {
      const visitorInfo = getVisitorInfo();
      const visitorRef = doc(db, "siteVisitors", sessionIdRef.current);

      // Calculate time spent on previous page
      let timeOnPreviousPage = 0;
      if (lastPathRef.current && lastPathRef.current !== pathname) {
        timeOnPreviousPage = Math.floor(
          (Date.now() - pageStartTimeRef.current) / 1000
        );
      }

      // Update or create visitor document
      const visitorData = {
        ...visitorInfo,
        pageViews: increment(1),
        totalTimeOnSite: increment(timeOnPreviousPage),
        lastPath: lastPathRef.current || pathname,
        pagesVisited: increment(1),
      };

      // If first visit in session
      if (!lastPathRef.current) {
        await setDoc(visitorRef, {
          ...visitorInfo,
          pageViews: 1,
          totalTimeOnSite: 0,
          pagesVisited: 1,
          sessionStart: serverTimestamp(),
        });
      } else {
        await updateDoc(visitorRef, visitorData);
      }

      // Track page-specific analytics
      const pageAnalyticsRef = doc(
        db,
        "pageAnalytics",
        `${pathname.replace(/\//g, "_")}_${
          new Date().toISOString().split("T")[0]
        }`
      );

      await setDoc(
        pageAnalyticsRef,
        {
          pathname,
          date: new Date().toISOString().split("T")[0],
          views: increment(1),
          uniqueVisitors: increment(1),
          lastVisit: serverTimestamp(),
        },
        { merge: true }
      );

      lastPathRef.current = pathname;
      pageStartTimeRef.current = Date.now();
    } catch (error) {
      console.error("Error tracking page view:", error);
    }
  };

  // Update activity status
  const updateActivityStatus = async () => {
    if (!sessionIdRef.current) return;

    try {
      const visitorRef = doc(db, "siteVisitors", sessionIdRef.current);
      const totalTime = Math.floor((Date.now() - startTimeRef.current) / 1000);

      await updateDoc(visitorRef, {
        lastActivity: serverTimestamp(),
        totalTimeOnSite: totalTime,
        isActive: true,
      });
    } catch (error) {
      console.error("Error updating activity:", error);
    }
  };

  // Track page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!sessionIdRef.current) return;

      if (document.hidden) {
        // User left the page
        clearInterval(activityIntervalRef.current);

        // Update visitor as inactive
        const visitorRef = doc(db, "siteVisitors", sessionIdRef.current);
        updateDoc(visitorRef, {
          isActive: false,
          lastActivity: serverTimestamp(),
        }).catch(console.error);
      } else {
        // User came back
        updateActivityStatus();

        // Restart activity tracking
        activityIntervalRef.current = setInterval(updateActivityStatus, 30000); // Every 30 seconds
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Track clicks and interactions
  useEffect(() => {
    const trackInteraction = async (event) => {
      if (!sessionIdRef.current) return;

      try {
        const target = event.target;
        const interactionData = {
          type: event.type,
          timestamp: new Date().toISOString(),
          pathname,
          elementType: target.tagName,
          elementId: target.id || null,
          elementClass: target.className || null,
        };

        // Log important interactions
        if (
          target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.type === "submit"
        ) {
          const interactionRef = doc(
            db,
            "siteVisitors",
            sessionIdRef.current,
            "interactions",
            `${Date.now()}_${event.type}`
          );

          await setDoc(interactionRef, interactionData);
        }
      } catch (error) {
        console.error("Error tracking interaction:", error);
      }
    };

    document.addEventListener("click", trackInteraction);
    return () => {
      document.removeEventListener("click", trackInteraction);
    };
  }, [pathname]);

  // Initialize tracking on mount and pathname change
  useEffect(() => {
    trackPageView();
  }, [pathname]);

  // Start activity tracking
  useEffect(() => {
    updateActivityStatus();
    activityIntervalRef.current = setInterval(updateActivityStatus, 30000); // Every 30 seconds

    return () => {
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current);
      }
    };
  }, []);

  // Track session end
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (!sessionIdRef.current) return;

      const totalTime = Math.floor((Date.now() - startTimeRef.current) / 1000);

      try {
        // Update the session end in Firestore directly
        const visitorRef = doc(db, "siteVisitors", sessionIdRef.current);
        await updateDoc(visitorRef, {
          sessionEnd: serverTimestamp(),
          totalTimeOnSite: totalTime,
          isActive: false,
          lastActivity: serverTimestamp(),
        });
      } catch (error) {
        // Fallback to beacon API if direct update fails
        const data = JSON.stringify({
          sessionId: sessionIdRef.current,
          sessionEnd: new Date().toISOString(),
          totalTimeOnSite: totalTime,
          isActive: false,
        });
        navigator.sendBeacon("/api/track-session-end", data);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Also track when user navigates away using Next.js router events
    const handleRouteChange = () => {
      updateActivityStatus();
    };

    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default VisitorTracker;
