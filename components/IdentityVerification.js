"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc, getFirestore } from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getStorage,
} from "firebase/storage";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAuth,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  updateEmail,
  EmailAuthProvider,
  linkWithCredential,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import {
  Mail,
  CheckCircle,
  AlertCircle,
  X,
  Send,
  Loader2,
  Lock,
  Upload,
} from "lucide-react";

// Initialize Firebase
const db = getFirestore();
const storage = getStorage();
const auth = getAuth();

const getAuthErrorText = (errorCode) => {
  switch (errorCode) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many verification attempts. Please try again later.";
    case "auth/credential-already-in-use":
      return "This email is already associated with another account.";
    case "auth/email-already-in-use":
      return "This email is already in use by another account.";
    case "auth/email-already-exists":
      return "This email is already registered with another account.";
    default:
      return "An unknown error occurred. Please try again.";
  }
};

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
  const [stateIdUrl, setStateIdUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Email verification state
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [pendingEmailUpdate, setPendingEmailUpdate] = useState(null);
  const [emailError, setEmailError] = useState("");

  // Field validation errors
  const [validationErrors, setValidationErrors] = useState({});

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
            const credential = EmailAuthProvider.credentialWithLink(
              email,
              window.location.href
            );

            if (user) {
              await linkWithCredential(user, credential);
              if (user.email !== email) {
                await updateEmail(user, email);
              }
            } else {
              await signInWithEmailLink(auth, email, window.location.href);
            }

            window.localStorage.removeItem("emailForSignIn");
            setIsEmailVerified(true);
            setVerificationSent(false);
            setSubmitError("");
            setEmailError("");
            setPendingEmailUpdate(email);

            if (window.history.replaceState) {
              window.history.replaceState(
                {},
                document.title,
                window.location.pathname
              );
            }
          } catch (error) {
            console.error("Error linking email:", error);
            setEmailError(getAuthErrorText(error.code));
          } finally {
            setIsVerifyingEmail(false);
          }
        }
      }
    };

    const persistedData = localStorage.getItem("formData");
    if (persistedData) {
      setFormData(JSON.parse(persistedData));
    }

    const persistedFile = localStorage.getItem("stateId");
    const persistedFileUrl = localStorage.getItem("stateIdUrl");
    if (persistedFile && persistedFileUrl) {
      setStateId(JSON.parse(persistedFile));
      setStateIdUrl(persistedFileUrl);
    }

    if (user) {
      const hasVerifiedEmail =
        user.emailVerified ||
        user.providerData.some(
          (provider) => provider.providerId === "password"
        );

      setIsEmailVerified(hasVerifiedEmail);

      if (hasVerifiedEmail && user.email && user.email !== formData.email) {
        setFormData((prev) => ({ ...prev, email: user.email }));
      }

      if (pendingEmailUpdate && pendingEmailUpdate !== formData.email) {
        setFormData((prev) => ({ ...prev, email: pendingEmailUpdate }));
        setPendingEmailUpdate(null);
      }
    }

    if (user) {
      verifyEmailLink();
    }
  }, [user, pendingEmailUpdate]);

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
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "email" && value !== user?.email) {
      setIsEmailVerified(false);
      setVerificationSent(false);
      setEmailError("");
    }
  };

  const checkEmailExists = async (email) => {
    try {
      // Check if email exists in Firebase Auth
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);

      if (signInMethods.length > 0) {
        // Email exists in authentication
        // Check if it's the current user's email
        if (user.email === email) {
          return { exists: false }; // It's the same user, allow verification
        }

        // Email is registered to another account in the authentication system
        return {
          exists: true,
          message: "This email is already registered to another account.",
        };
      }

      // Email doesn't exist in authentication system, safe to use
      return { exists: false };
    } catch (error) {
      console.error("Error checking email:", error);
      // If there's an error, we'll let the user proceed and handle it during actual verification
      return { exists: false, error: true };
    }
  };

  const handleSendVerificationEmail = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setIsVerifyingEmail(true);
    setEmailError("");

    // Check if email already exists
    const emailCheck = await checkEmailExists(formData.email);

    if (emailCheck.exists) {
      setEmailError(emailCheck.message);
      setIsVerifyingEmail(false);
      return;
    }

    const actionCodeSettings = {
      url: window.location.href,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, formData.email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", formData.email);
      setVerificationSent(true);
      setEmailError("");
    } catch (error) {
      console.error("Error sending verification email:", error);
      setEmailError(getAuthErrorText(error.code));
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setStateId(null);
      setStateIdUrl(null);
      localStorage.removeItem("stateId");
      localStorage.removeItem("stateIdUrl");
      setUploadProgress(0);
      setSubmitError("");
      return;
    }

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
      setStateId(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError("File size must be less than 5MB.");
      setStateId(null);
      return;
    }

    setSubmitError("");
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileExtension = file.name.split(".").pop();
      const fileName = `state-ids/${
        user.uid
      }/state-id-${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, fileName);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
          setSubmitError("Failed to upload file. Please try again.");
          setIsUploading(false);
          setUploadProgress(0);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setStateId({ name: file.name, type: file.type });
          setStateIdUrl(downloadURL);
          localStorage.setItem(
            "stateId",
            JSON.stringify({ name: file.name, type: file.type })
          );
          localStorage.setItem("stateIdUrl", downloadURL);
          setSubmitError("");
          setIsUploading(false);
          setUploadProgress(0);
        }
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      setSubmitError("An error occurred during file upload.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const validateForm = () => {
    let errors = {};
    let formIsValid = true;

    if (!isEmailVerified) {
      setSubmitError("Please verify your email address first.");
      formIsValid = false;
    }

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required.";
      formIsValid = false;
    }
    if (!formData.streetAddress.trim()) {
      errors.streetAddress = "Street address is required.";
      formIsValid = false;
    }
    if (!formData.city.trim()) {
      errors.city = "City is required.";
      formIsValid = false;
    }
    if (!formData.postcode.trim()) {
      errors.postcode = "Postcode is required.";
      formIsValid = false;
    }
    if (!formData.gender) {
      errors.gender = "Gender is required.";
      formIsValid = false;
    }
    if (!stateIdUrl) {
      errors.stateId = "State ID document is required.";
      formIsValid = false;
    }

    const postcodeRegex = /^\d{4}$/;
    if (formData.postcode.trim() && !postcodeRegex.test(formData.postcode)) {
      errors.postcode = "Please enter a valid Australian postcode (4 digits).";
      formIsValid = false;
    }

    setValidationErrors(errors);
    return formIsValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
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
          tokens: 2,
        },
        { merge: true }
      );

      setSubmitSuccess(true);
      localStorage.removeItem("formData");
      localStorage.removeItem("stateId");
      localStorage.removeItem("stateIdUrl");

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

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-8 sm:p-12 space-y-8">
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
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        validationErrors.fullName
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter your full legal name as it appears on your ID"
                    />
                    {validationErrors.fullName && (
                      <p className="mt-1 text-sm text-red-500">
                        {validationErrors.fullName}
                      </p>
                    )}
                  </div>

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
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border ${
                            isEmailVerified
                              ? "border-green-500 bg-green-50"
                              : emailError
                              ? "border-red-500"
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
                    {emailError && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {emailError}
                      </p>
                    )}
                    {verificationSent && !isEmailVerified && !emailError && (
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
                      value={formData.streetAddress}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        validationErrors.streetAddress
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="123 Main Street"
                    />
                    {validationErrors.streetAddress && (
                      <p className="mt-1 text-sm text-red-500">
                        {validationErrors.streetAddress}
                      </p>
                    )}
                  </div>

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
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        validationErrors.city
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Sydney"
                    />
                    {validationErrors.city && (
                      <p className="mt-1 text-sm text-red-500">
                        {validationErrors.city}
                      </p>
                    )}
                  </div>

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
                      maxLength="4"
                      value={formData.postcode}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        validationErrors.postcode
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="2000"
                    />
                    {validationErrors.postcode && (
                      <p className="mt-1 text-sm text-red-500">
                        {validationErrors.postcode}
                      </p>
                    )}
                  </div>

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
                      value={formData.gender}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        validationErrors.gender
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    {validationErrors.gender && (
                      <p className="mt-1 text-sm text-red-500">
                        {validationErrors.gender}
                      </p>
                    )}
                  </div>

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
                  <div
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all relative overflow-hidden ${
                      validationErrors.stateId
                        ? "border-red-500"
                        : "border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    {/* Upload Progress Overlay */}
                    {isUploading && uploadProgress > 0 && (
                      <div className="absolute inset-0 bg-blue-50 bg-opacity-90 flex flex-col items-center justify-center z-10">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
                          <Loader2 className="animate-spin h-8 w-8 text-white" />
                        </div>
                        <p className="text-lg font-semibold text-blue-900 mb-2">
                          Uploading...
                        </p>
                        <div className="w-64 bg-blue-200 rounded-full h-3 mb-2">
                          <div
                            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-blue-700">
                          {Math.round(uploadProgress)}%
                        </p>
                      </div>
                    )}

                    <input
                      id="stateId"
                      name="stateId"
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <label htmlFor="stateId" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                            stateIdUrl
                              ? "bg-green-100 text-green-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {stateIdUrl ? (
                            <CheckCircle className="w-8 h-8" />
                          ) : (
                            <Upload className="w-8 h-8" />
                          )}
                        </div>
                        <p className="text-lg font-semibold text-gray-700 mb-2">
                          {stateId
                            ? `File uploaded: ${stateId.name}`
                            : "Upload Your ID Document"}
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          Driver's License, State ID, or Passport
                        </p>
                        <div
                          className={`px-6 py-2 rounded-xl font-medium transition-colors ${
                            isUploading
                              ? "bg-gray-400 text-white cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {isUploading ? "Uploading..." : "Choose File"}
                        </div>
                      </div>
                    </label>
                  </div>
                  {validationErrors.stateId && (
                    <p className="mt-1 text-sm text-red-500">
                      {validationErrors.stateId}
                    </p>
                  )}
                  <p className="mt-3 text-sm text-gray-500">
                    Accepted formats: JPEG, PNG, PDF • Maximum size: 5MB
                  </p>
                </div>

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
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 sm:px-12 py-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={
                  isSubmitting || !isEmailVerified || !stateIdUrl || isUploading
                }
                className={`w-full text-white py-4 px-8 rounded-2xl font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg
                  ${
                    isSubmitting ||
                    !isEmailVerified ||
                    !stateIdUrl ||
                    isUploading
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
              {(!isEmailVerified || !stateIdUrl) && (
                <div className="mt-4 p-3 bg-red-50 rounded-xl text-sm text-red-700 text-center flex items-center justify-center">
                  <Lock className="w-4 h-4 mr-2" />
                  Please verify your email and upload a document to enable
                  submission.
                </div>
              )}
            </div>
          </form>
        </div>

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
