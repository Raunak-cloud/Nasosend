// app/api/documents/[tripId]/eticket/route.js

import { NextResponse } from "next/server";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebase-admin"; // You'll need to set up firebase-admin for server-side auth

export async function GET(request, { params }) {
  try {
    const { tripId } = params;
    const { searchParams } = new URL(request.url);
    const download = searchParams.get("download") === "true";

    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];

    // Verify the user's token and check if they have support role
    try {
      const decodedToken = await auth.verifyIdToken(token);
      const userId = decodedToken.uid;

      // Check if user has support role
      const userDoc = await getDoc(doc(db, "users", userId));
      if (!userDoc.exists() || userDoc.data().role !== "support") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get trip document to find the e-ticket reference
    const tripDoc = await getDoc(doc(db, "trips", tripId));
    if (!tripDoc.exists()) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const tripData = tripDoc.data();
    if (!tripData.eTicketUrl) {
      return NextResponse.json({ error: "No e-ticket found" }, { status: 404 });
    }

    // Get download URL from Firebase Storage
    const storage = getStorage();
    const fileRef = ref(storage, tripData.eTicketUrl);
    const downloadUrl = await getDownloadURL(fileRef);

    // Fetch the file
    const fileResponse = await fetch(downloadUrl);
    const fileBuffer = await fileResponse.arrayBuffer();

    // Set appropriate headers
    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");

    if (download) {
      headers.set(
        "Content-Disposition",
        `attachment; filename="${tripData.eTicket || "eticket.pdf"}"`
      );
    } else {
      headers.set(
        "Content-Disposition",
        `inline; filename="${tripData.eTicket || "eticket.pdf"}"`
      );
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error serving document:", error);
    return NextResponse.json(
      { error: "Failed to retrieve document" },
      { status: 500 }
    );
  }
}
