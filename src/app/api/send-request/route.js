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

    console.log("1. Received data:", { senderId });

    // Basic validation
    if (
      !requestData ||
      !selectedTrip ||
      !senderId ||
      !senderName ||
      !senderEmail
    ) {
      console.log("2. Validation failed: Missing fields");
      return NextResponse.json(
        { error: "Missing required fields in the request body." },
        { status: 400 }
      );
    }

    // Check user tokens BEFORE
    console.log("3. Checking user tokens BEFORE...");
    const userRef = doc(db, "users", senderId);
    const userDocBefore = await getDoc(userRef);

    if (!userDocBefore.exists()) {
      console.log("4. ERROR: User not found");
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const userDataBefore = userDocBefore.data();
    const tokensBefore = userDataBefore.tokens || 0;
    console.log("5. Tokens BEFORE:", tokensBefore);

    if (tokensBefore < 1) {
      console.log("6. ERROR: Insufficient tokens");
      return NextResponse.json(
        { error: `Insufficient tokens. Current: ${tokensBefore}` },
        { status: 400 }
      );
    }

    // Create shipment request (simplified for testing)
    const requestedWeight = parseFloat(requestData.weight);
    const shipmentRequest = {
      ...requestData,
      senderId,
      senderName,
      senderEmail,
      tripId: selectedTrip.id,
      weight: requestedWeight,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    console.log("7. Creating shipment request...");
    const docRef = await addDoc(
      collection(db, "shipmentRequests"),
      shipmentRequest
    );
    console.log("8. Shipment request created with ID:", docRef.id);

    // DEDUCT TOKEN
    console.log("9. ATTEMPTING TO DEDUCT TOKEN...");
    console.log("10. User ref path:", userRef.path);
    console.log("11. Calling updateDoc with increment(-1)...");

    try {
      await updateDoc(userRef, {
        tokens: increment(-1),
        updatedAt: serverTimestamp(),
      });
      console.log("12. ✅ updateDoc completed successfully");
    } catch (updateError) {
      console.error("13. ❌ ERROR in updateDoc:", updateError);
      console.error("14. Error code:", updateError.code);
      console.error("15. Error message:", updateError.message);
      throw updateError;
    }

    // Check tokens AFTER
    console.log("16. Checking tokens AFTER...");
    const userDocAfter = await getDoc(userRef);
    const userDataAfter = userDocAfter.data();
    const tokensAfter = userDataAfter.tokens || 0;
    console.log("17. Tokens AFTER:", tokensAfter);
    console.log("18. Token change:", tokensBefore - tokensAfter);

    console.log("=== END SHIPMENT REQUEST SUCCESS ===");

    return NextResponse.json(
      {
        success: true,
        message: "Shipment request successfully sent.",
        requestId: docRef.id,
        tokensBefore,
        tokensAfter,
        tokenChange: tokensBefore - tokensAfter,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("=== ERROR IN SHIPMENT REQUEST ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    return NextResponse.json(
      { error: "Failed to send request. Please try again." },
      { status: 500 }
    );
  }
}
