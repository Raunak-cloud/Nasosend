// app/api/send-email/route.js

import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

export async function POST(request) {
  // Log to verify the route is being hit
  console.log("=== EMAIL API ROUTE CALLED ===");
  console.log("Time:", new Date().toISOString());

  try {
    const body = await request.json();
    console.log("Request body received:", JSON.stringify(body, null, 2));

    const { to, subject, text, html } = body;

    // Log environment variables (without exposing the full key)
    console.log("Environment check:");
    console.log("- Has SENDGRID_API_KEY:", !!process.env.SENDGRID_API_KEY);
    console.log(
      "- API Key starts with:",
      process.env.SENDGRID_API_KEY?.substring(0, 7)
    );
    console.log("- EMAIL_FROM_ADDRESS:", process.env.EMAIL_FROM_ADDRESS);
    console.log(to, subject, text, html);
    // Validate required fields
    if (!to || !subject || (!text && !html)) {
      console.error("Missing required fields");
      return NextResponse.json(
        {
          error:
            "Missing required fields: to, subject, and either text or html",
        },
        { status: 400 }
      );
    }

    // Check environment variables
    if (!process.env.SENDGRID_API_KEY) {
      console.error("❌ SENDGRID_API_KEY is missing!");
      return NextResponse.json(
        { error: "Email service is not configured properly - Missing API Key" },
        { status: 500 }
      );
    }

    if (!process.env.EMAIL_FROM_ADDRESS) {
      console.error("❌ EMAIL_FROM_ADDRESS is missing!");
      return NextResponse.json(
        { error: "Email sender address is not configured" },
        { status: 500 }
      );
    }

    console.log("📧 Attempting to send email:");
    console.log("- To:", to);
    console.log("- From:", process.env.EMAIL_FROM_ADDRESS);
    console.log("- Subject:", subject);

    const msg = {
      to: to,
      from: process.env.EMAIL_FROM_ADDRESS,
      subject: subject,
      text: text || "No text content provided",
      html: html || `<p>${text || "No content provided"}</p>`,
    };

    console.log("Sending with SendGrid...");

    try {
      const result = await sgMail.send(msg);
      console.log("✅ Email sent successfully!");
      console.log("Response status:", result[0].statusCode);
      console.log("Response headers:", result[0].headers);

      return NextResponse.json(
        {
          message: "Email sent successfully!",
          statusCode: result[0].statusCode,
          to: to,
          subject: subject,
        },
        { status: 200 }
      );
    } catch (sendError) {
      console.error("❌ SendGrid send failed:", sendError);
      if (sendError.response) {
        console.error(
          "SendGrid Error Response:",
          JSON.stringify(sendError.response.body, null, 2)
        );
      }
      throw sendError;
    }
  } catch (error) {
    console.error("❌ Failed to send email - Full error:", error);

    if (error.response) {
      console.error(
        "Error response body:",
        JSON.stringify(error.response.body, null, 2)
      );

      return NextResponse.json(
        {
          error: "Failed to send email",
          details: error.response.body?.errors || error.message,
          code: error.code,
        },
        { status: error.code || 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to send email",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Test endpoint to check configuration
export async function GET() {
  console.log("=== EMAIL API GET TEST ===");
  console.log("Environment variables check:");
  console.log("- SENDGRID_API_KEY exists:", !!process.env.SENDGRID_API_KEY);
  console.log(
    "- SENDGRID_API_KEY length:",
    process.env.SENDGRID_API_KEY?.length || 0
  );
  console.log(
    "- EMAIL_FROM_ADDRESS:",
    process.env.EMAIL_FROM_ADDRESS || "NOT SET"
  );

  // Test SendGrid connection
  let sendGridStatus = "Not tested";
  if (process.env.SENDGRID_API_KEY) {
    try {
      // Try to set the API key
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      sendGridStatus = "API key set successfully";
    } catch (error) {
      sendGridStatus = `Failed to set API key: ${error.message}`;
    }
  }

  return NextResponse.json({
    status: "Email service endpoint",
    configuration: {
      hasApiKey: !!process.env.SENDGRID_API_KEY,
      apiKeyLength: process.env.SENDGRID_API_KEY?.length || 0,
      apiKeyPrefix: process.env.SENDGRID_API_KEY?.substring(0, 7) || "NOT SET",
      hasFromAddress: !!process.env.EMAIL_FROM_ADDRESS,
      fromAddress: process.env.EMAIL_FROM_ADDRESS || "NOT SET",
      sendGridStatus: sendGridStatus,
    },
    timestamp: new Date().toISOString(),
  });
}
