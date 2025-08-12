// app/api/send-email/route.js

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request) {
  const { to, subject, text, html } = await request.json();

  if (!to || !subject || !text) {
    return NextResponse.json(
      { error: "Missing required fields: to, subject, text" },
      { status: 400 }
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.sendgrid.net", // SendGrid's SMTP host
      port: 587,
      secure: false,
      auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM_ADDRESS,
      to,
      subject,
      text,
      html,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Email sent successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to send email:", error);
    return NextResponse.json(
      { error: "Failed to send email. Please try again later." },
      { status: 500 }
    );
  }
}
