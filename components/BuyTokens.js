"use client";
import React, { useState, useEffect } from "react";
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

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

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
  hidePostalCode: false,
};

// Payment Form Component
const PaymentForm = ({
  selectedPackage,
  onSuccess,
  onBack,
  userEmail,
  userId,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardholderName, setCardholderName] = useState("");
  const [email, setEmail] = useState(userEmail || "");
  const [saveCard, setSaveCard] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create payment intent on your server
      const response = await fetch("/api/create-token-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          tokens: selectedPackage.tokens,
          amount: selectedPackage.price * 100, // Convert to cents
          currency: "aud",
          userId: userId,
          userEmail: email,
          saveCard: saveCard,
        }),
      });

      const { clientSecret, error: apiError } = await response.json();

      if (apiError) {
        throw new Error(apiError);
      }

      // Confirm the payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: cardholderName,
            email: email,
          },
        },
        setup_future_usage: saveCard ? "off_session" : null,
      });

      if (result.error) {
        setError(result.error.message);
        setProcessing(false);
      } else {
        if (result.paymentIntent.status === "succeeded") {
          setPaymentSuccess(true);
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
    return cardholderName.length > 0 && email.length > 0 && !error;
  };

  if (paymentSuccess) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
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

          {/* Trust Badges */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <Check className="w-4 h-4 mr-2 text-green-500" />
              SSL encrypted payment
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Check className="w-4 h-4 mr-2 text-green-500" />
              PCI DSS compliant
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Check className="w-4 h-4 mr-2 text-green-500" />
              Money-back guarantee
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
              required
            />
          </div>

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
              <CardElement options={cardElementOptions} />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Test card: 4242 4242 4242 4242, any future date, any 3 digits
            </p>
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
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
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
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/stripe/stripe-original.svg"
                alt="Stripe"
                className="h-6"
              />
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
  currentTokens,
  onTokensPurchased,
  userEmail,
  userId,
}) => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

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
            <Elements stripe={stripePromise}>
              <PaymentForm
                selectedPackage={selectedPackage}
                onSuccess={handlePaymentSuccess}
                onBack={handleBack}
                userEmail={userEmail}
                userId={userId}
              />
            </Elements>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BuyTokens;
