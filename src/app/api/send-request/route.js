import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  increment,
  getDoc,
} from "firebase/firestore";

export async function POST(request) {
  console.log("=== START SHIPMENT REQUEST ===");

  try {
    const { requestData, selectedTrip, senderId, senderName, senderEmail } =
      await request.json();

    // Basic validation
    if (
      !requestData ||
      !selectedTrip ||
      !senderId ||
      !senderName ||
      !senderEmail
    ) {
      return NextResponse.json(
        { error: "Missing required fields in the request body." },
        { status: 400 }
      );
    }

    // NEW: Check for existing unresolved request
    console.log("Checking for existing requests...");
    const existingRequestQuery = query(
      collection(db, "shipmentRequests"),
      where("senderId", "==", senderId),
      where("tripId", "==", selectedTrip.id),
      where("status", "in", ["pending", "accepted"])
    );

    const existingRequests = await getDocs(existingRequestQuery);

    if (!existingRequests.empty) {
      console.log("ERROR: Duplicate request detected");
      return NextResponse.json(
        {
          error:
            "You already have an active request for this trip. Please wait for the traveler's response.",
        },
        { status: 400 }
      );
    }

    // Check user tokens
    console.log("Checking user tokens...");
    const userRef = doc(db, "users", senderId);
    const userDocBefore = await getDoc(userRef);

    if (!userDocBefore.exists()) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const userDataBefore = userDocBefore.data();
    const tokensBefore = userDataBefore.tokens || 0;

    if (tokensBefore < 1) {
      return NextResponse.json(
        { error: `Insufficient tokens. Current: ${tokensBefore}` },
        { status: 400 }
      );
    }

    // Create shipment request
    const requestedWeight = parseFloat(requestData.weight);
    const shipmentRequest = {
      senderId,
      senderName,
      senderEmail,
      tripId: selectedTrip.id,
      travelerId: selectedTrip.travelerId,
      travelerName: selectedTrip.travelerName,
      travelerEmail: selectedTrip.travelerEmail,
      travelerPhone: selectedTrip.travelerPhone,
      itemDescription: requestData.itemDescription,
      weight: requestedWeight,
      quantity: parseInt(requestData.quantity),
      recipientName: requestData.recipientName,
      recipientPhone: requestData.recipientPhone,
      recipientAddress: requestData.recipientAddress,
      pickupCity: requestData.pickupCity,
      notes: requestData.notes || "",
      departureDate: selectedTrip.departureDate,
      arrivalDate: selectedTrip.arrivalDate,
      flightNumber: selectedTrip.flightNumber,
      totalCost: (
        requestedWeight * parseFloat(selectedTrip.pricePerKg)
      ).toFixed(2),
      availableWeight: selectedTrip.availableWeight,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    console.log("Creating shipment request...");
    const docRef = await addDoc(
      collection(db, "shipmentRequests"),
      shipmentRequest
    );

    // Deduct token
    console.log("Deducting token...");
    await updateDoc(userRef, {
      tokens: increment(-1),
      updatedAt: serverTimestamp(),
    });

    // Verify token deduction
    const userDocAfter = await getDoc(userRef);
    const tokensRemaining = userDocAfter.data().tokens || 0;

    console.log("=== END SHIPMENT REQUEST SUCCESS ===");

    return NextResponse.json(
      {
        success: true,
        message: "Shipment request successfully sent.",
        requestId: docRef.id,
        tokensRemaining,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("=== ERROR IN SHIPMENT REQUEST ===", error);
    return NextResponse.json(
      { error: "Failed to send request. Please try again." },
      { status: 500 }
    );
  }
}
