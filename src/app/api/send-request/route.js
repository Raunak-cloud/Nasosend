import { NextResponse } from "next/server";
import { db } from "@/lib/firebase"; // Assuming you have a server-side Firebase config file
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
} from "firebase/firestore";

/**
 * Handles POST requests to create a new shipment request.
 *
 * This API endpoint receives shipment data from the client, validates it,
 * and securely saves it to the 'shipmentRequests' collection in Firestore.
 * It also checks for the traveler's available weight before creating the request.
 *
 * @param {Request} request The incoming HTTP request.
 * @returns {NextResponse} A JSON response indicating success or failure.
 */
export async function POST(request) {
  try {
    // Parse the incoming JSON request body
    const { requestData, selectedTrip, senderId, senderName, senderEmail } =
      await request.json();

    console.log("📤 API received a new shipment request:", {
      selectedTrip,
      requestData,
    });

    // --- Validation and Pre-checks ---

    // Basic data validation
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

    // Check for required request data fields
    if (
      !requestData.itemDescription ||
      !requestData.weight ||
      !requestData.recipientName ||
      !requestData.recipientAddress
    ) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    const requestedWeight = parseFloat(requestData.weight);
    if (isNaN(requestedWeight) || requestedWeight <= 0) {
      return NextResponse.json(
        { error: "Invalid weight provided." },
        { status: 400 }
      );
    }

    // Fetch the trip again from Firestore to get the most up-to-date 'availableWeight'
    // This prevents race conditions where multiple users could request the same weight simultaneously.
    const tripQuery = query(
      collection(db, "trips"),
      where("__name__", "==", selectedTrip.id)
    );
    const tripSnapshot = await getDocs(tripQuery);

    if (tripSnapshot.empty) {
      return NextResponse.json({ error: "Trip not found." }, { status: 404 });
    }

    const tripDoc = tripSnapshot.docs[0];
    const tripData = tripDoc.data();
    const currentAvailableWeight = tripData.availableWeight;

    if (requestedWeight > currentAvailableWeight) {
      return NextResponse.json(
        {
          error: `Requested weight (${requestedWeight}kg) exceeds the available weight (${currentAvailableWeight}kg).`,
        },
        { status: 400 }
      );
    }

    // --- Prepare and Save the Request ---

    const shipmentRequest = {
      // Data from the client request
      ...requestData,
      senderId,
      senderName,
      senderEmail,

      // Data from the selected trip, now validated and fetched from Firestore
      tripId: selectedTrip.id,
      travelerId: selectedTrip.travelerId,
      travelerName: selectedTrip.travelerName,
      travelerPhone: selectedTrip.travelerPhone,
      departureDate: selectedTrip.departureDate,
      arrivalDate: selectedTrip.arrivalDate,
      departureCity: selectedTrip.departureCity,
      arrivalCity: selectedTrip.arrivalCity,
      airline: selectedTrip.airline || "",
      flightNumber: selectedTrip.flightNumber || "",

      // Request-specific details
      weight: requestedWeight,
      quantity: parseInt(requestData.quantity),
      status: "pending", // Initial status is pending
      totalCost: requestedWeight * parseFloat(selectedTrip.pricePerKg),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    console.log(
      "💾 Saving new shipment request to Firestore:",
      shipmentRequest
    );

    // Add the document to the 'shipmentRequests' collection
    const docRef = await addDoc(
      collection(db, "shipmentRequests"),
      shipmentRequest
    );

    console.log("✅ Shipment request saved with ID:", docRef.id);

    // Return a success response with the ID of the newly created document
    return NextResponse.json(
      {
        success: true,
        message: "Shipment request successfully sent.",
        requestId: docRef.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error processing shipment request:", error);
    // Return a generic server error response
    return NextResponse.json(
      { error: "Failed to send request. Please try again." },
      { status: 500 }
    );
  }
}
