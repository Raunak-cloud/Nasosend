// app/api/create-token-payment/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function POST(request) {
  try {
    const {
      packageId,
      tokens,
      amount,
      currency = "aud",
      userId,
      userEmail,
      saveCard,
    } = await request.json();

    // Validate the request
    if (!packageId || !tokens || !amount || !userId || !userEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate amount (minimum 50 cents for Stripe)
    if (amount < 50) {
      return NextResponse.json(
        { error: "Amount must be at least $0.50 AUD" },
        { status: 400 }
      );
    }

    // Create or retrieve Stripe customer
    let customerId;

    // Check if user already has a Stripe customer ID in Firebase
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists() && userDoc.data().stripeCustomerId) {
      customerId = userDoc.data().stripeCustomerId;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          firebaseUserId: userId,
        },
      });
      customerId = customer.id;

      // Save Stripe customer ID to Firebase
      await updateDoc(userRef, {
        stripeCustomerId: customerId,
        updatedAt: serverTimestamp(),
      });
    }

    // Create metadata for the payment
    const metadata = {
      userId,
      packageId,
      tokens: tokens.toString(),
      userEmail,
    };

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in cents
      currency,
      customer: customerId,
      setup_future_usage: saveCard ? "off_session" : null,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata,
      description: `Token package: ${packageId} - ${tokens} tokens`,
      statement_descriptor: "NASOSEND TOKENS",
    });

    // Create a transaction record in Firebase
    const transactionId = `txn_${Date.now()}_${userId}`;
    await setDoc(doc(db, "transactions", transactionId), {
      transactionId,
      userId,
      userEmail,
      packageId,
      tokens,
      amount: amount / 100, // Store in dollars
      currency,
      status: "pending",
      paymentIntentId: paymentIntent.id,
      stripeCustomerId: customerId,
      createdAt: serverTimestamp(),
      metadata,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      transactionId,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent: " + error.message },
      { status: 500 }
    );
  }
}

// Webhook handler to confirm payment and credit tokens
export async function webhookHandler(request) {
  const sig = request.headers.get("stripe-signature");
  const body = await request.text();

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;

      // Extract metadata
      const { userId, tokens, packageId } = paymentIntent.metadata;

      if (userId && tokens) {
        try {
          // Update user's token balance in Firebase
          const userRef = doc(db, "users", userId);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const currentTokens = userDoc.data().tokens || 0;
            await updateDoc(userRef, {
              tokens: currentTokens + parseInt(tokens),
              lastTokenPurchase: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }

          // Update transaction status
          const transactionQuery = await getDocs(
            query(
              collection(db, "transactions"),
              where("paymentIntentId", "==", paymentIntent.id)
            )
          );

          if (!transactionQuery.empty) {
            const transactionDoc = transactionQuery.docs[0];
            await updateDoc(doc(db, "transactions", transactionDoc.id), {
              status: "completed",
              completedAt: serverTimestamp(),
              stripePaymentIntentId: paymentIntent.id,
            });
          }

          // Add to purchase history
          await setDoc(doc(db, "tokenPurchases", `${userId}_${Date.now()}`), {
            userId,
            packageId,
            tokens: parseInt(tokens),
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            paymentIntentId: paymentIntent.id,
            purchasedAt: serverTimestamp(),
          });

          console.log(
            `Successfully credited ${tokens} tokens to user ${userId}`
          );
        } catch (error) {
          console.error("Error updating user tokens:", error);
        }
      }
      break;

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object;
      console.log("Payment failed:", failedPayment.id);

      // Update transaction status to failed
      try {
        const transactionQuery = await getDocs(
          query(
            collection(db, "transactions"),
            where("paymentIntentId", "==", failedPayment.id)
          )
        );

        if (!transactionQuery.empty) {
          const transactionDoc = transactionQuery.docs[0];
          await updateDoc(doc(db, "transactions", transactionDoc.id), {
            status: "failed",
            failedAt: serverTimestamp(),
            error: failedPayment.last_payment_error?.message,
          });
        }
      } catch (error) {
        console.error("Error updating failed transaction:", error);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
