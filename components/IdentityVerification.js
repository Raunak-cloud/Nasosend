"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc, getFirestore } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAuth,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  updateEmail,
  EmailAuthProvider,
  linkWithCredential,
} from "firebase/auth";
import {
  Mail,
  CheckCircle,
  AlertCircle,
  X,
  Send,
  Loader2,
  Lock,
} from "lucide-react";

// Initialize Firebase
const db = getFirestore();
const storage = getStorage();
const auth = getAuth();

export default function IdentityVerification() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    streetAddress: "",
    city: "",
    postcode: "",
    country: "Australia",
    gender: "",
    email: "",
  });

  const [stateId, setStateId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Email verification state
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [pendingEmailUpdate, setPendingEmailUpdate] = useState(null);

  // Check if the user is coming back from an email verification link
  useEffect(() => {
    const verifyEmailLink = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem("emailForSignIn");
        if (!email) {
          email = window.prompt("Please provide your email for confirmation");
        }

        if (email) {
          setIsVerifyingEmail(true);
          try {
            // Create email credential for linking
            const credential = EmailAuthProvider.credentialWithLink(
              email,
              window.location.href
            );

            if (user) {
              // Link the email credential to the existing user account
              await linkWithCredential(user, credential);

              // Update the user's email if it's different
              if (user.email !== email) {
                await updateEmail(user, email);
              }

              console.log("Email successfully linked to account!");
            } else {
              // Sign in with email link if no user is logged in
              await signInWithEmailLink(auth, email, window.location.href);
            }

            // Clean up and update state
            window.localStorage.removeItem("emailForSignIn");
            setIsEmailVerified(true);
            setVerificationSent(false);
            setSubmitError("");
            setPendingEmailUpdate(email);

            // Clean up URL
            if (window.history.replaceState) {
              window.history.replaceState(
                {},
                document.title,
                window.location.pathname
              );
            }
          } catch (error) {
            console.error("Error linking email:", error);
            // Handle specific error cases
            if (error.code === "auth/credential-already-in-use") {
              setSubmitError(
                "This email is already associated with another account."
              );
            } else if (error.code === "auth/email-already-in-use") {
              setSubmitError(
                "This email is already in use by another account."
              );
            } else {
              setSubmitError(
                "Failed to verify email. The link may be invalid or expired."
              );
            }
          } finally {
            setIsVerifyingEmail(false);
          }
        }
      }
    };

    // Load persisted form data
    const persistedData = localStorage.getItem("formData");
    if (persistedData) {
      setFormData(JSON.parse(persistedData));
    }

    // Update email verification status based on user state
    if (user) {
      // Check if user has verified email
      const hasVerifiedEmail =
        user.emailVerified ||
        user.providerData.some(
          (provider) => provider.providerId === "password"
        );

      setIsEmailVerified(hasVerifiedEmail);

      // Update form data with user's email if verified
      if (hasVerifiedEmail && user.email && user.email !== formData.email) {
        setFormData((prev) => ({ ...prev, email: user.email }));
      }

      // Handle pending email update
      if (pendingEmailUpdate && pendingEmailUpdate !== formData.email) {
        setFormData((prev) => ({ ...prev, email: pendingEmailUpdate }));
        setPendingEmailUpdate(null);
      }
    }

    // Only run email link verification if user exists
    if (user) {
      verifyEmailLink();
    }
  }, [user, pendingEmailUpdate]);

  // Redirect if not authenticated
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-700 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    localStorage.setItem("formData", JSON.stringify(newFormData));

    // Reset email verification if email changes
    if (name === "email" && value !== user?.email) {
      setIsEmailVerified(false);
      setVerificationSent(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitError("Please enter a valid email address.");
      return;
    }

    setIsVerifyingEmail(true);
    setSubmitError("");

    const actionCodeSettings = {
      url: window.location.href,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, formData.email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", formData.email);
      setVerificationSent(true);
      setSubmitError("");
      console.log("Verification email sent successfully.");
    } catch (error) {
      console.error("Error sending verification email:", error);
      if (error.code === "auth/invalid-email") {
        setSubmitError("Please enter a valid email address.");
      } else if (error.code === "auth/too-many-requests") {
        setSubmitError(
          "Too many verification attempts. Please try again later."
        );
      } else {
        setSubmitError("Failed to send verification email. Please try again.");
      }
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        setSubmitError(
          "Please upload a valid image (JPEG, JPG, PNG) or PDF file."
        );
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setSubmitError("File size must be less than 5MB.");
        return;
      }

      setStateId(file);
      setSubmitError("");
    }
  };

  const validateForm = () => {
    if (!isEmailVerified) {
      setSubmitError("Please verify your email address first.");
      return false;
    }
    if (!formData.fullName.trim()) {
      setSubmitError("Full name is required.");
      return false;
    }
    if (!formData.streetAddress.trim()) {
      setSubmitError("Street address is required.");
      return false;
    }
    if (!formData.city.trim()) {
      setSubmitError("City is required.");
      return false;
    }
    if (!formData.postcode.trim()) {
      setSubmitError("Postcode is required.");
      return false;
    }
    if (!formData.gender) {
      setSubmitError("Gender is required.");
      return false;
    }
    if (!stateId) {
      setSubmitError("State ID document is required.");
      return false;
    }

    const postcodeRegex = /^\d{4}$/;
    if (!postcodeRegex.test(formData.postcode)) {
      setSubmitError("Please enter a valid Australian postcode (4 digits).");
      return false;
    }

    return true;
  };

  const uploadStateId = async (file, userId) => {
    try {
      const fileExtension = file.name.split(".").pop();
      const fileName = `state-ids/${userId}/state-id-${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, fileName);

      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return downloadURL;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error("Failed to upload state ID document.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError("");
    setUploadProgress(0);

    try {
      setUploadProgress(25);

      const stateIdUrl = await uploadStateId(stateId, user.uid);
      setUploadProgress(75);

      const verificationData = {
        fullName: formData.fullName.trim(),
        streetAddress: formData.streetAddress.trim(),
        city: formData.city.trim(),
        country: formData.country,
        postcode: formData.postcode.trim(),
        gender: formData.gender,
        email: formData.email,
        emailVerified: isEmailVerified,
        stateIdUrl: stateIdUrl,
        submittedAt: new Date().toISOString(),
        status: "pending",
      };

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        {
          verification: verificationData,
          verified: false,
          verificationPending: true,
        },
        { merge: true }
      );

      setUploadProgress(100);
      setSubmitSuccess(true);

      // Clear localStorage data on successful submission
      localStorage.removeItem("formData");

      setTimeout(() => {
        router.push("/traveler/dashboard");
      }, 3000);
    } catch (error) {
      console.error("Error submitting verification:", error);
      setSubmitError(
        error.message ||
          "An error occurred while submitting your verification. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-green-200">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Verification Submitted!
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Your identity verification has been submitted successfully. Our team
            will review your documents within 24-48 hours.
          </p>
          <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
            <p className="text-sm text-green-800 font-medium">
              You'll receive an email confirmation shortly. Redirecting to
              dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Identity Verification
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Secure your account by verifying your identity. This helps us ensure
            the safety of all travelers and senders.
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-200">
          <div className="flex items-start">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">
                Why do we need this?
              </p>
              <p className="text-sm text-blue-800">
                Identity verification helps us maintain a trusted community and
                comply with safety regulations. Your information is encrypted
                and stored securely.
              </p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-8 sm:p-12 space-y-8">
              {/* Personal Information Section */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Full Legal Name *
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your full legal name as it appears on your ID"
                    />
                  </div>

                  {/* Email Verification Field */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Email Address *
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border ${
                            isEmailVerified
                              ? "border-green-500 bg-green-50"
                              : "border-gray-300"
                          } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12`}
                          placeholder="Enter your email address"
                          disabled={isEmailVerified || verificationSent}
                        />
                        {isEmailVerified && (
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                        )}
                      </div>
                      {!isEmailVerified && (
                        <button
                          type="button"
                          onClick={handleSendVerificationEmail}
                          disabled={isVerifyingEmail || formData.email === ""}
                          className={`px-4 py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center whitespace-nowrap
                            ${
                              isVerifyingEmail || formData.email === ""
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                        >
                          {isVerifyingEmail && (
                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                          )}
                          {!isVerifyingEmail && !verificationSent && "Verify"}
                          {verificationSent && "Resend"}
                        </button>
                      )}
                    </div>
                    {verificationSent && !isEmailVerified && (
                      <p className="mt-2 text-sm text-yellow-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />A verification
                        link has been sent to your email. Please check your
                        inbox and click the link to continue.
                      </p>
                    )}
                    {isEmailVerified && (
                      <p className="mt-2 text-sm text-green-600 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Email successfully verified and linked to your account!
                      </p>
                    )}
                  </div>

                  {/* Street Address */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="streetAddress"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Street Address *
                    </label>
                    <input
                      id="streetAddress"
                      name="streetAddress"
                      type="text"
                      required
                      value={formData.streetAddress}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="123 Main Street"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      City *
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Sydney"
                    />
                  </div>

                  {/* Postcode */}
                  <div>
                    <label
                      htmlFor="postcode"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Postcode *
                    </label>
                    <input
                      id="postcode"
                      name="postcode"
                      type="text"
                      required
                      maxLength="4"
                      value={formData.postcode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="2000"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label
                      htmlFor="gender"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Gender *
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      required
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>

                  {/* Country */}
                  <div>
                    <label
                      htmlFor="country"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Country
                    </label>
                    <input
                      id="country"
                      name="country"
                      type="text"
                      value={formData.country}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 bg-gray-50 text-gray-700 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Document Upload Section */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  Identity Document
                </h3>

                <div>
                  <label
                    htmlFor="stateId"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    State ID Document *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-all">
                    <input
                      id="stateId"
                      name="stateId"
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      required
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="stateId" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                          <svg
                            className="w-8 h-8 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                        </div>
                        <p className="text-lg font-semibold text-gray-700 mb-2">
                          {stateId ? stateId.name : "Upload Your ID Document"}
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          Driver's License, State ID, or Passport
                        </p>
                        <div className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors">
                          Choose File
                        </div>
                      </div>
                    </label>
                  </div>
                  <p className="mt-3 text-sm text-gray-500">
                    Accepted formats: JPEG, PNG, PDF • Maximum size: 5MB
                  </p>
                </div>

                {/* Document Requirements */}
                <div className="mt-6 bg-gray-50 rounded-2xl p-6">
                  <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
                    <div className="w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center mr-2">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    Document Requirements:
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      Document must be valid and not expired
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      All text must be clearly readable
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      No glare, shadows, or obstructions
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      Photo must show your full face clearly
                    </li>
                  </ul>
                </div>
              </div>

              {/* Error Message */}
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                    <p className="text-red-800 font-medium">{submitError}</p>
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {isSubmitting && uploadProgress > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <div className="flex justify-between text-sm text-blue-800 mb-2">
                    <span>Processing verification...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 sm:px-12 py-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting || !isEmailVerified}
                className={`w-full text-white py-4 px-8 rounded-2xl font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg
                ${
                  isSubmitting || !isEmailVerified
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
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
                    Submitting Verification...
                  </div>
                ) : (
                  "Submit Identity Verification"
                )}
              </button>
              {!isEmailVerified && (
                <div className="mt-4 p-3 bg-red-50 rounded-xl text-sm text-red-700 text-center flex items-center justify-center">
                  <Lock className="w-4 h-4 mr-2" />
                  Please verify your email to enable submission.
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Security Notice */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-full">
            <svg
              className="w-4 h-4 text-green-600 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span className="text-sm font-medium text-green-800">
              Your data is encrypted and securely stored
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
