"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  X,
  Check,
  CreditCard,
  Shield,
  Clock,
  Gift,
  Star,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

// Initialize Stripe - Add null check
let stripePromise = null;
if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
} else {
  console.error("Stripe publishable key is not set!");
}

// Card Element Options
const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      "::placeholder": {
        color: "#aab7c4",
      },
      fontFamily: "Inter, system-ui, sans-serif",
    },
    invalid: {
      color: "#9e2146",
      iconColor: "#9e2146",
    },
  },
  hidePostalCode: true, // Hide postal code field
};

// Payment Form Component
const PaymentForm = ({ selectedPackage, onSuccess, onBack }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user, userProfile } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardholderName, setCardholderName] = useState("");
  const [saveCard, setSaveCard] = useState(false);

  // Get email from user object
  const userEmail = user?.email || "";

  // Check Stripe initialization
  useEffect(() => {
    if (!stripe) {
      console.log("Stripe is still loading...");
    } else {
      console.log("Stripe loaded successfully");
    }
  }, [stripe]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError("Stripe is still loading. Please wait...");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Log the request data for debugging
      const requestData = {
        packageId: selectedPackage.id,
        tokens: selectedPackage.tokens,
        amount: selectedPackage.price * 100, // Convert to cents
        currency: "aud",
        userId: user?.uid || "test-user", // Get userId from auth
        userEmail: userEmail || "test@example.com", // Fallback email
        saveCard: saveCard,
      };

      console.log("Creating payment intent with:", requestData);

      // Create payment intent on your server
      const response = await fetch("/api/create-token-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      // Check if response is ok
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server response error:", errorData);
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Server response:", responseData);

      if (responseData.error) {
        throw new Error(responseData.error);
      }

      if (!responseData.clientSecret) {
        throw new Error("No client secret received from server");
      }

      // Get card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      // Confirm the payment
      console.log("Confirming payment...");
      const result = await stripe.confirmCardPayment(
        responseData.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: cardholderName,
              email: userEmail,
            },
          },
          setup_future_usage: saveCard ? "off_session" : null,
        }
      );

      console.log("Payment result:", result);

      if (result.error) {
        // Handle specific Stripe errors
        let errorMessage = result.error.message;

        // Provide more user-friendly error messages
        switch (result.error.code) {
          case "card_declined":
            errorMessage =
              "Your card was declined. Please try a different card or contact your bank.";
            if (result.error.decline_code) {
              switch (result.error.decline_code) {
                case "insufficient_funds":
                  errorMessage =
                    "Your card has insufficient funds. Please try a different payment method.";
                  break;
                case "lost_card":
                  errorMessage =
                    "This card has been reported lost. Please use a different card.";
                  break;
                case "stolen_card":
                  errorMessage =
                    "This card has been reported stolen. Please use a different card.";
                  break;
                case "expired_card":
                  errorMessage =
                    "Your card has expired. Please use a different card.";
                  break;
                case "incorrect_cvc":
                  errorMessage =
                    "The CVV/CVC number is incorrect. Please check and try again.";
                  break;
                case "processing_error":
                  errorMessage =
                    "An error occurred while processing your card. Please try again.";
                  break;
                case "incorrect_number":
                  errorMessage =
                    "The card number is incorrect. Please check and try again.";
                  break;
                default:
                  errorMessage = `Card declined: ${result.error.decline_code}. Please try a different card.`;
              }
            }
            break;
          case "incorrect_number":
            errorMessage =
              "The card number is incorrect. Please check and try again.";
            break;
          case "invalid_number":
            errorMessage = "The card number is not a valid credit card number.";
            break;
          case "invalid_expiry_month":
            errorMessage = "The card's expiration month is invalid.";
            break;
          case "invalid_expiry_year":
            errorMessage = "The card's expiration year is invalid.";
            break;
          case "invalid_cvc":
            errorMessage = "The card's security code (CVV/CVC) is invalid.";
            break;
          case "incorrect_cvc":
            errorMessage = "The card's security code (CVV/CVC) is incorrect.";
            break;
          case "expired_card":
            errorMessage =
              "Your card has expired. Please use a different card.";
            break;
          case "incorrect_zip":
            errorMessage = "The ZIP/postal code you entered is incorrect.";
            break;
          case "incomplete_number":
            errorMessage = "Your card number is incomplete.";
            break;
          case "incomplete_cvc":
            errorMessage = "Your card's security code is incomplete.";
            break;
          case "incomplete_expiry":
            errorMessage = "Your card's expiration date is incomplete.";
            break;
          case "processing_error":
            errorMessage =
              "An error occurred while processing your card. Please try again.";
            break;
          case "rate_limit":
            errorMessage =
              "Too many requests. Please wait a moment and try again.";
            break;
          default:
            // Use the original message if we don't have a specific one
            errorMessage =
              result.error.message || "Payment failed. Please try again.";
        }

        setError(errorMessage);
        setProcessing(false);
      } else {
        if (result.paymentIntent.status === "succeeded") {
          setPaymentSuccess(true);

          // Update user's tokens in Firebase
          try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
              tokens: increment(selectedPackage.tokens),
              lastTokenPurchase: new Date(),
            });
            console.log(
              `Successfully added ${selectedPackage.tokens} tokens to user profile`
            );
          } catch (updateError) {
            console.error("Error updating user tokens:", updateError);
            // Payment succeeded but token update failed - handle this case
            // The webhook will also update tokens as a backup
          }

          // Call the success callback after showing success message
          setTimeout(() => {
            onSuccess(selectedPackage.tokens, selectedPackage.price);
          }, 2000);
        }
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Payment failed. Please try again.");
      setProcessing(false);
    }
  };

  const isFormValid = () => {
    return cardholderName.length > 0 && !error;
  };

  if (paymentSuccess) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          {selectedPackage.tokens}{" "}
          {selectedPackage.tokens === 1 ? "token has" : "tokens have"} been
          credited to your account
        </p>
        <div className="bg-green-50 rounded-lg p-6 max-w-md mx-auto">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Tokens Purchased:</span>
            <span className="font-bold text-green-600">
              {selectedPackage.tokens}{" "}
              {selectedPackage.tokens === 1 ? "token" : "tokens"}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-700">Amount Paid:</span>
            <span className="font-bold text-gray-900">
              ${selectedPackage.price} AUD
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Complete Payment</h2>
          <p className="text-gray-600 mt-2">
            Secure checkout for {selectedPackage?.name}
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowRight className="w-6 h-6 transform rotate-180" />
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Order Summary
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-700">{selectedPackage?.name}</span>
              <span className="font-semibold">${selectedPackage?.price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Tokens</span>
              <span className="font-semibold">
                {selectedPackage?.tokens}{" "}
                {selectedPackage?.tokens === 1 ? "token" : "tokens"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Processing Fee</span>
              <span className="font-semibold">Free</span>
            </div>
            <hr />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${selectedPackage?.price} AUD</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white rounded-lg">
            <div className="flex items-center text-sm text-gray-600">
              <Shield className="w-4 h-4 mr-2" />
              Your payment is secured by Stripe
            </div>
          </div>

          {/* User Info Display */}
          {userEmail && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-700 mb-1">Purchasing as:</p>
              <p className="text-sm font-medium text-gray-900">{userEmail}</p>
            </div>
          )}

          {/* Test Mode Notice */}
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-800 font-medium mb-2">
              TEST MODE - Use test card numbers:
            </p>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• Success: 4242 4242 4242 4242</li>
              <li>• Decline: 4000 0000 0000 0002</li>
              <li>• Any future expiry & any 3-digit CVV</li>
            </ul>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {!stripe && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
              <p className="text-sm">Loading payment system...</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cardholder Name
            </label>
            <input
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Information
            </label>
            <div className="border border-gray-300 rounded-lg p-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500">
              <CardElement
                options={cardElementOptions}
                onReady={(element) =>
                  console.log("CardElement ready:", element)
                }
                onChange={(event) => {
                  if (event.error) {
                    setError(event.error.message);
                  } else {
                    setError(null);
                  }
                }}
              />
            </div>
          </div>

          {/* Save Card Option */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="saveCard"
              checked={saveCard}
              onChange={(e) => setSaveCard(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="saveCard" className="ml-2 text-sm text-gray-700">
              Save card for future purchases
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Payment Error</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!stripe || processing || !isFormValid()}
            className={`w-full py-4 rounded-lg font-semibold transition-colors flex items-center justify-center ${
              !processing && stripe && isFormValid()
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Pay ${selectedPackage?.price} AUD
              </>
            )}
          </button>

          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500">
              By completing this purchase, you agree to our Terms of Service and
              Privacy Policy.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <span className="text-xs text-gray-400">Powered by Stripe</span>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

// Main BuyTokens Component
const BuyTokens = ({
  isOpen,
  onClose,
  currentTokens = 0,
  onTokensPurchased,
}) => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const { user } = useAuth();

  // Get user data from auth
  const userEmail = user?.email || "";
  const userId = user?.uid || null;

  const tokenPackages = [
    {
      id: "starter",
      name: "Starter Pack",
      tokens: 1,
      price: 2,
      originalPrice: null,
      description: "Perfect for first-time users",
      features: ["Connect with 1 traveler", "Simple and affordable"],
      badge: null,
      color: "blue",
    },
    {
      id: "regular",
      name: "Regular Senders",
      tokens: 5,
      price: 5,
      originalPrice: 10,
      description: "Best value for regular users",
      features: ["Connect with up to 5 travelers", "Great value package"],
      badge: "Most Popular",
      color: "green",
    },
  ];

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = (tokens, price) => {
    onTokensPurchased(tokens, price);
    setShowPaymentForm(false);
    setSelectedPackage(null);
    onClose();
  };

  const handleBack = () => {
    setShowPaymentForm(false);
    setSelectedPackage(null);
  };

  if (!isOpen) return null;

  // Check if Stripe is configured
  if (!stripePromise) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Payment System Not Configured
            </h2>
            <p className="text-gray-600 mb-4">
              The payment system is not properly configured. Please contact
              support.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {!showPaymentForm ? (
          // Package Selection
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Buy Tokens</h2>
                <p className="text-gray-600 mt-2">
                  Choose a token package to start connecting with travelers
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Current Tokens Display */}
            <div className="bg-gray-50 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Current Balance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {currentTokens} Tokens
                  </p>
                </div>
              </div>
            </div>

            {/* Token Packages */}
            <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
              {tokenPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg ${
                    pkg.color === "green"
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 bg-white"
                  }`}
                  onClick={() => handlePackageSelect(pkg)}
                >
                  {pkg.badge && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 text-xs font-bold rounded-full text-white bg-green-600">
                      {pkg.badge}
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {pkg.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {pkg.description}
                    </p>

                    <div className="mb-4">
                      <div className="text-4xl font-bold text-gray-900">
                        {pkg.tokens}
                        <span className="text-lg text-gray-600 font-normal">
                          {" "}
                          {pkg.tokens === 1 ? "token" : "tokens"}
                        </span>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {pkg.originalPrice && (
                          <span className="text-lg text-gray-400 line-through">
                            ${pkg.originalPrice}
                          </span>
                        )}
                        <span className="text-3xl font-bold text-gray-900">
                          ${pkg.price}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        ${(pkg.price / pkg.tokens).toFixed(2)} per token
                      </p>
                      {pkg.originalPrice && (
                        <p className="text-sm text-green-600 font-medium mt-1">
                          Save ${pkg.originalPrice - pkg.price} (50% off)!
                        </p>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      pkg.color === "green"
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    Select Package
                  </button>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-4 gap-6 pt-8 border-t">
              <div className="text-center">
                <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">
                  Secure Payment
                </h4>
                <p className="text-sm text-gray-600">Powered by Stripe</p>
              </div>
              <div className="text-center">
                <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">
                  Instant Activation
                </h4>
                <p className="text-sm text-gray-600">
                  Tokens credited immediately
                </p>
              </div>
              <div className="text-center">
                <Gift className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">
                  No Hidden Fees
                </h4>
                <p className="text-sm text-gray-600">
                  What you see is what you pay
                </p>
              </div>
              <div className="text-center">
                <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Money Back</h4>
                <p className="text-sm text-gray-600">
                  100% refund if no matches made
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Payment Form wrapped in Stripe Elements
          <div className="p-8">
            {stripePromise ? (
              <Elements stripe={stripePromise}>
                <PaymentForm
                  selectedPackage={selectedPackage}
                  onSuccess={handlePaymentSuccess}
                  onBack={handleBack}
                  userEmail={userEmail}
                  userId={userId}
                />
              </Elements>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading payment system...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyTokens;
