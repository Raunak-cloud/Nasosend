// app/api/track-session-end/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const data = await request.json();
    const { sessionId, sessionEnd, totalTimeOnSite, isActive } = data;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // For now, we'll just log this data
    // The actual update will happen client-side in the VisitorTracker component
    console.log("Session ended:", {
      sessionId,
      sessionEnd,
      totalTimeOnSite,
      isActive,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error tracking session end:", error);
    return NextResponse.json(
      { error: "Failed to track session end" },
      { status: 500 }
    );
  }
}
