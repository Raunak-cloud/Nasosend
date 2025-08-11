"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import PhoneInput from "@/components/PhoneInput";
import OTPInput from "@/components/OTPInput";
import AuthWrapper from "@/components/AuthWrapper";
import Link from "next/link";

export default function LoginPage() {
  return (
    <AuthWrapper requireAuth={false}>
      <LoginContent />
    </AuthWrapper>
  );
}

function LoginContent() {
  const router = useRouter();
  const [step, setStep] = useState("phone"); // 'phone' or 'otp'
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // A more professional, globally defined color palette
  const colors = {
    primaryRed: "#DC143C",
    primaryRedHover: "#B01030",
    primaryBlue: "#003366",
    primaryBlueHover: "#002A52",
    gold: "#FFD700",
    goldLight: "#FFFBEB",
    goldDark: "#A17300",
    white: "#FFFFFF",
    darkGray: "#2E2E2E",
    lightGray: "#F5F5F5",
    borderGray: "#D9D9D9",
    lighterRed: "#FFF5F5",
    lighterBlue: "#F0F4F8",
  };

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {
            console.log("Recaptcha verified");
          },
          "expired-callback": () => {
            console.log("Recaptcha expired");
            setError("Verification expired. Please try again.");
          },
        }
      );
    }
  };

  const sendOTP = async (e) => {
    e.preventDefault();
    setError("");

    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);

    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        appVerifier
      );
      setVerificationId(confirmationResult.verificationId);
      window.confirmationResult = confirmationResult;

      setStep("otp");
      setResendTimer(60);
      setIsLoading(false);
    } catch (error) {
      console.error("Error sending OTP:", error);
      setError(error.message || "Failed to send OTP. Please try again.");
      setIsLoading(false);

      // Reset recaptcha on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);

    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const result = await signInWithCredential(auth, credential);

      // Save user to Firestore
      const userRef = doc(db, "users", result.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: result.user.uid,
          phoneNumber: result.user.phoneNumber,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        });
      } else {
        await setDoc(
          userRef,
          {
            lastLogin: serverTimestamp(),
          },
          { merge: true }
        );
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setError("Invalid verification code. Please try again.");
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    setOtp("");
    setStep("phone");
    setError("");
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: colors.lightGray }}
    >
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
            style={{
              background: `linear-gradient(to bottom right, ${colors.primaryBlue}, ${colors.primaryRed})`,
            }}
          >
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: colors.darkGray }}>
            Nasosend
          </h1>
          <p className="text-gray-600 mt-2">
            Send items from Australia to Nepal
          </p>
        </div>

        {/* Auth Card */}
        <div
          className="rounded-2xl shadow-xl p-8"
          style={{ backgroundColor: colors.white }}
        >
          <h2
            className="text-2xl font-semibold text-center mb-6"
            style={{ color: colors.darkGray }}
          >
            {step === "phone"
              ? "Sign in with Phone"
              : "Enter Verification Code"}
          </h2>

          {step === "phone" ? (
            <form onSubmit={sendOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <PhoneInput
                  value={phoneNumber}
                  onChange={setPhoneNumber}
                  error={error}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 text-white font-medium rounded-lg transition duration-200 ease-in-out transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                style={{
                  background: `linear-gradient(to right, ${colors.primaryBlue}, ${colors.primaryRed})`,
                }}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  "Send Verification Code"
                )}
              </button>

              <div className="text-center text-sm text-gray-600">
                By continuing, you agree to our{" "}
                <Link
                  href="/terms"
                  className="hover:underline"
                  style={{ color: colors.primaryBlue }}
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="hover:underline"
                  style={{ color: colors.primaryBlue }}
                >
                  Privacy Policy
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={verifyOTP} className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 text-center mb-4">
                  We've sent a verification code to
                  <br />
                  <span
                    className="font-semibold"
                    style={{ color: colors.darkGray }}
                  >
                    {phoneNumber}
                  </span>
                </p>
                <OTPInput value={otp} onChange={setOtp} error={error} />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 text-white font-medium rounded-lg transition duration-200 ease-in-out transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                style={{
                  background: `linear-gradient(to right, ${colors.primaryBlue}, ${colors.primaryRed})`,
                }}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </button>

              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-sm text-gray-600">
                    Resend code in{" "}
                    <span className="font-semibold">{resendTimer}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={resendOTP}
                    className="text-sm hover:underline"
                    style={{ color: colors.primaryBlue }}
                  >
                    Didn't receive the code? Resend
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setError("");
                }}
                className="w-full text-sm hover:text-gray-800"
                style={{ color: colors.darkGray }}
              >
                ← Change phone number
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container"></div>
    </div>
  );
}
