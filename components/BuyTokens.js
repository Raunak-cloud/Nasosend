"use client";
import React, { useState } from "react";
import {
  X,
  Check,
  CreditCard,
  Shield,
  Clock,
  Gift,
  Star,
  ArrowRight,
} from "lucide-react";

const BuyTokens = ({ isOpen, onClose, currentTokens, onTokensPurchased }) => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    email: "",
  });

  const tokenPackages = [
    {
      id: "starter",
      name: "Starter Pack",
      tokens: 5,
      price: 10,
      originalPrice: null,
      description: "Perfect for occasional senders",
      features: [
        "Connect with up to 5 travelers",
        "30-day token validity",
        "Email support",
        "Basic tracking",
      ],
      badge: null,
      color: "blue",
    },
    {
      id: "popular",
      name: "Popular Pack",
      tokens: 15,
      price: 25,
      originalPrice: 30,
      description: "Best value for regular users",
      features: [
        "Connect with up to 25 travelers",
        "3 months token validity",
        "Priority support",
      ],
      badge: "Most Popular",
      color: "green",
    },
    {
      id: "premium",
      name: "Premium Pack",
      tokens: 30,
      price: 45,
      originalPrice: 60,
      description: "For frequent senders and businesses",
      features: [
        "Connect with up to 45 travelers",
        "1 year token validity",
        "24/7 priority support",
      ],
      badge: "Best Value",
      color: "purple",
    },
  ];

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setShowPaymentForm(true);
  };

  const handleInputChange = (field, value) => {
    setPaymentData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\D/g, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const handlePayment = async () => {
    if (!selectedPackage) return;

    setProcessing(true);

    // Mock payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate successful payment
    setProcessing(false);
    setPaymentSuccess(true);

    // Credit tokens to account after 1 second
    setTimeout(() => {
      onTokensPurchased(selectedPackage.tokens, selectedPackage.price);
      setPaymentSuccess(false);
      setShowPaymentForm(false);
      setSelectedPackage(null);
      setPaymentData({
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardholderName: "",
        email: "",
      });
      onClose();
    }, 1500);
  };

  const isFormValid = () => {
    return (
      paymentData.cardNumber.length >= 19 &&
      paymentData.expiryDate.length === 5 &&
      paymentData.cvv.length >= 3 &&
      paymentData.cardholderName.length > 0 &&
      paymentData.email.length > 0
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Balance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {currentTokens} Tokens
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Expires</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(
                      Date.now() + 30 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString("en-AU")}
                  </p>
                </div>
              </div>
            </div>

            {/* Token Packages */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {tokenPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg ${
                    pkg.color === "green"
                      ? "border-green-200 bg-green-50"
                      : pkg.color === "purple"
                      ? "border-purple-200 bg-purple-50"
                      : "border-gray-200 bg-white"
                  }`}
                  onClick={() => handlePackageSelect(pkg)}
                >
                  {pkg.badge && (
                    <div
                      className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 text-xs font-bold rounded-full text-white ${
                        pkg.color === "green" ? "bg-green-600" : "bg-purple-600"
                      }`}
                    >
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
                          tokens
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
                          Save ${pkg.originalPrice - pkg.price}!
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
                        : pkg.color === "purple"
                        ? "bg-purple-600 text-white hover:bg-purple-700"
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
                <p className="text-sm text-gray-600">256-bit SSL encryption</p>
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
                  No Expiry Stress
                </h4>
                <p className="text-sm text-gray-600">
                  Extended validity periods
                </p>
              </div>
              <div className="text-center">
                <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Money Back</h4>
                <p className="text-sm text-gray-600">100% refund guarantee</p>
              </div>
            </div>
          </div>
        ) : (
          // Payment Form
          <div className="p-8">
            {paymentSuccess ? (
              // Success Screen
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Payment Successful!
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  {selectedPackage.tokens} tokens have been credited to your
                  account
                </p>
                <div className="bg-green-50 rounded-lg p-6 max-w-md mx-auto">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Tokens Purchased:</span>
                    <span className="font-bold text-green-600">
                      {selectedPackage.tokens} tokens
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
            ) : (
              // Payment Form
              <>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Complete Payment
                    </h2>
                    <p className="text-gray-600 mt-2">
                      Secure checkout for {selectedPackage?.name}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowPaymentForm(false);
                      setSelectedPackage(null);
                    }}
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
                        <span className="text-gray-700">
                          {selectedPackage?.name}
                        </span>
                        <span className="font-semibold">
                          ${selectedPackage?.price}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Tokens</span>
                        <span className="font-semibold">
                          {selectedPackage?.tokens} tokens
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
                        Your payment is secured with 256-bit SSL encryption
                      </div>
                    </div>
                  </div>

                  {/* Payment Form */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={paymentData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={paymentData.cardholderName}
                        onChange={(e) =>
                          handleInputChange("cardholderName", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={paymentData.cardNumber}
                        onChange={(e) =>
                          handleInputChange(
                            "cardNumber",
                            formatCardNumber(e.target.value)
                          )
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={paymentData.expiryDate}
                          onChange={(e) =>
                            handleInputChange(
                              "expiryDate",
                              formatExpiryDate(e.target.value)
                            )
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={paymentData.cvv}
                          onChange={(e) =>
                            handleInputChange(
                              "cvv",
                              e.target.value.replace(/\D/g, "")
                            )
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                    </div>

                    <button
                      onClick={handlePayment}
                      disabled={!isFormValid() || processing}
                      className={`w-full py-4 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                        isFormValid() && !processing
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

                    <p className="text-xs text-gray-500 text-center">
                      By completing this purchase, you agree to our Terms of
                      Service and Privacy Policy. This is a mock payment system
                      for demonstration purposes.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyTokens;
