// app/api/stripe-webhook/route.js
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/firebase";
import {
  doc,
  updateDoc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function POST(request) {
  const body = await request.text();
  const signature = headers().get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSuccess(event.data.object);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailure(event.data.object);
        break;

      case "customer.created":
        await handleCustomerCreated(event.data.object);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSuccess(paymentIntent) {
  const { userId, tokens, packageId, userEmail } = paymentIntent.metadata;

  if (!userId || !tokens) {
    console.error("Missing metadata in payment intent");
    return;
  }

  try {
    // Update user's token balance
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const currentTokens = userDoc.data().tokens || 0;
      const tokenAmount = parseInt(tokens);

      await updateDoc(userRef, {
        tokens: currentTokens + tokenAmount,
        lastTokenPurchase: serverTimestamp(),
        totalTokensPurchased:
          (userDoc.data().totalTokensPurchased || 0) + tokenAmount,
        updatedAt: serverTimestamp(),
      });

      // Send notification to user
      await addNotification(userId, {
        type: "token_purchase",
        title: "Token Purchase Successful",
        message: `${tokenAmount} ${
          tokenAmount === 1 ? "token has" : "tokens have"
        } been added to your account.`,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
      });
    }

    // Update transaction record
    const transactionsRef = collection(db, "transactions");
    const q = query(
      transactionsRef,
      where("paymentIntentId", "==", paymentIntent.id)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const transactionDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, "transactions", transactionDoc.id), {
        status: "completed",
        completedAt: serverTimestamp(),
        receiptUrl: paymentIntent.charges?.data[0]?.receipt_url,
      });
    }

    // Create purchase history record
    const purchaseId = `purchase_${userId}_${Date.now()}`;
    await setDoc(doc(db, "tokenPurchases", purchaseId), {
      purchaseId,
      userId,
      userEmail,
      packageId,
      tokens: parseInt(tokens),
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      paymentIntentId: paymentIntent.id,
      paymentMethod: paymentIntent.payment_method,
      receiptUrl: paymentIntent.charges?.data[0]?.receipt_url,
      purchasedAt: serverTimestamp(),
    });

    console.log(`Successfully credited ${tokens} tokens to user ${userId}`);

    // Send confirmation email (optional)
    // await sendConfirmationEmail(userEmail, tokens, paymentIntent.amount / 100);
  } catch (error) {
    console.error("Error updating user tokens:", error);
    throw error;
  }
}

async function handlePaymentFailure(paymentIntent) {
  const { userId } = paymentIntent.metadata;

  try {
    // Update transaction status
    const transactionsRef = collection(db, "transactions");
    const q = query(
      transactionsRef,
      where("paymentIntentId", "==", paymentIntent.id)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const transactionDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, "transactions", transactionDoc.id), {
        status: "failed",
        failedAt: serverTimestamp(),
        error: paymentIntent.last_payment_error?.message || "Payment failed",
      });
    }

    // Send notification to user
    if (userId) {
      await addNotification(userId, {
        type: "payment_failed",
        title: "Payment Failed",
        message:
          "Your payment could not be processed. Please try again or use a different payment method.",
        error: paymentIntent.last_payment_error?.message,
      });
    }

    console.log("Payment failed for intent:", paymentIntent.id);
  } catch (error) {
    console.error("Error handling payment failure:", error);
  }
}

async function handleCustomerCreated(customer) {
  // Update user record with Stripe customer ID if needed
  if (customer.metadata?.firebaseUserId) {
    try {
      const userRef = doc(db, "users", customer.metadata.firebaseUserId);
      await updateDoc(userRef, {
        stripeCustomerId: customer.id,
        updatedAt: serverTimestamp(),
      });
      console.log(
        `Linked Stripe customer ${customer.id} to user ${customer.metadata.firebaseUserId}`
      );
    } catch (error) {
      console.error("Error linking Stripe customer:", error);
    }
  }
}

async function addNotification(userId, notification) {
  try {
    const notificationId = `notif_${Date.now()}`;
    await setDoc(doc(db, "notifications", notificationId), {
      notificationId,
      userId,
      ...notification,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding notification:", error);
  }
}

// Required config for Stripe webhooks (raw body)
export const config = {
  api: {
    bodyParser: false,
  },
};
