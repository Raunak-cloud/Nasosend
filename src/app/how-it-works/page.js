"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Plane,
  Users,
  Shield,
  CheckCircle,
  ArrowRight,
  MapPin,
  Clock,
  DollarSign,
  Star,
  CreditCard,
  Gift,
} from "lucide-react";

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState("sender");
  const router = useRouter();

  const senderSteps = [
    {
      icon: <Package className="w-8 h-8" />,
      title: "Post Your Item",
      description:
        "Create a listing with item details, pickup location in Australia, and delivery address in Nepal.",
      details: [
        "Add photos and description",
        "Set your budget",
        "Choose pickup timeframe",
      ],
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Connect with Travelers",
      description:
        "Browse verified travelers heading to Nepal or wait for them to contact you.",
      details: [
        "View traveler profiles",
        "Check ratings and reviews",
        "Compare offers",
      ],
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Buy Connection Tokens",
      description:
        "Purchase tokens to connect with multiple travelers. Starting from just $10 AUD for 5 connections.",
      details: [
        "Starter Pack: 5 tokens for $10",
        "Popular Pack: 15 tokens for $25",
        "Premium Pack: 30 tokens for $45",
        "100% refund if no matches found",
        "Tokens valid for 30 days to 1 year",
      ],
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Track & Receive",
      description:
        "Monitor your package journey and confirm delivery in Nepal.",
      details: [
        "Real-time tracking",
        "Photo confirmations",
        "Delivery notifications",
      ],
    },
  ];

  const travelerSteps = [
    {
      icon: <Plane className="w-8 h-8" />,
      title: "List Your Trip",
      description:
        "Add your travel details from Australia to Nepal with available space.",
      details: [
        "Flight dates and times",
        "Baggage allowance",
        "Pickup preferences",
      ],
    },
    {
      icon: <Package className="w-8 h-8" />,
      title: "Accept Requests",
      description:
        "Browse item requests or receive direct offers from senders.",
      details: [
        "Choose suitable items",
        "Negotiate pricing",
        "Confirm details",
      ],
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Pickup & Transport",
      description:
        "Collect the item in Australia and safely transport it to Nepal.",
      details: ["Verify item condition", "Secure packaging", "Safe transport"],
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Deliver & Earn 100%",
      description:
        "Complete delivery in Nepal and keep 100% of agreed payment.",
      details: [
        "Zero commission fees",
        "Direct payment from sender",
        "Get paid instantly",
      ],
    },
  ];

  const benefits = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Faster Delivery",
      description: "Get your items delivered in days, not weeks",
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Zero Commission",
      description:
        "Travelers keep 100% of earnings, affordable token system for senders",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Insured",
      description: "Every transaction is protected and insured",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Trusted Community",
      description: "Verified users with ratings and reviews",
    },
  ];

  const tokenPackages = [
    {
      name: "Starter Pack",
      tokens: 5,
      price: 10,
      description: "Perfect for occasional senders",
      color: "blue",
    },
    {
      name: "Popular Pack",
      tokens: 15,
      price: 25,
      originalPrice: 30,
      description: "Best value for regular users",
      color: "green",
      badge: "Most Popular",
    },
    {
      name: "Premium Pack",
      tokens: 30,
      price: 45,
      originalPrice: 60,
      description: "For frequent senders",
      color: "purple",
      badge: "Best Value",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">How Nasosend Works</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Connect with travelers to send items between Australia and Nepal
            quickly, safely, and affordably through our crowdshipping platform.
          </p>
          <div className="flex items-center justify-center space-x-4 text-lg">
            <div className="flex items-center gap-2">
              <span>🇦🇺</span>
              <span>Australia</span>
            </div>
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
                d="M7 16l-4-4m0 0l4-4m-4 4h18m0 0l-4-4m4 4l-4 4"
              />
            </svg>
            <div className="flex items-center gap-2">
              <span>🇳🇵</span>
              <span>Nepal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-lg p-2 shadow-lg border">
            <button
              onClick={() => setActiveTab("sender")}
              className={`px-8 py-3 rounded-md font-semibold transition-all ${
                activeTab === "sender"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              I Want to Send Items
            </button>
            <button
              onClick={() => setActiveTab("traveler")}
              className={`px-8 py-3 rounded-md font-semibold transition-all ${
                activeTab === "traveler"
                  ? "bg-green-600 text-white shadow-md"
                  : "text-gray-600 hover:text-green-600"
              }`}
            >
              I'm a Traveler
            </button>
          </div>
        </div>

        {/* Steps Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {(activeTab === "sender" ? senderSteps : travelerSteps).map(
            (step, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    activeTab === "sender"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {step.icon}
                </div>
                <div className="flex items-center mb-3">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3 ${
                      activeTab === "sender" ? "bg-blue-600" : "bg-green-600"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{step.description}</p>
                <ul className="space-y-1">
                  {step.details.map((detail, i) => (
                    <li
                      key={i}
                      className="text-sm text-gray-500 flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>

        {/* Token Packages Section - Only for Sender Tab */}
        {activeTab === "sender" && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Choose Your Connection Package
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Purchase tokens to connect with multiple travelers. Each token
                allows you to contact one verified traveler.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {tokenPackages.map((pkg, index) => (
                <div
                  key={index}
                  className={`relative bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border-2 ${
                    pkg.color === "green"
                      ? "border-green-200"
                      : pkg.color === "purple"
                      ? "border-purple-200"
                      : "border-blue-200"
                  }`}
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

                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {pkg.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {pkg.description}
                    </p>

                    <div className="mb-4">
                      <div className="text-3xl font-bold text-gray-900">
                        {pkg.tokens}
                        <span className="text-lg text-gray-600 font-normal">
                          {" "}
                          tokens
                        </span>
                      </div>
                    </div>

                    <div className="text-center mb-4">
                      <div className="flex items-center justify-center gap-2">
                        {pkg.originalPrice && (
                          <span className="text-lg text-gray-400 line-through">
                            ${pkg.originalPrice}
                          </span>
                        )}
                        <span className="text-2xl font-bold text-gray-900">
                          ${pkg.price}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        ${(pkg.price / pkg.tokens).toFixed(2)} per token
                      </p>
                      {pkg.originalPrice && (
                        <p className="text-sm text-green-600 font-medium">
                          Save ${pkg.originalPrice - pkg.price}!
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-center">
                        <Shield className="w-4 h-4 mr-2 text-green-500" />
                        100% refund if no matches
                      </div>
                      <div className="flex items-center justify-center">
                        <Clock className="w-4 h-4 mr-2 text-blue-500" />
                        {pkg.tokens <= 5
                          ? "30 days"
                          : pkg.tokens <= 15
                          ? "3 months"
                          : "1 year"}{" "}
                        validity
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-5 h-5 text-green-600" />
                  <span>Instant Activation</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Gift className="w-5 h-5 text-purple-600" />
                  <span>Extended Validity</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <span>Money Back Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Process Flow */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            The Complete Process
          </h2>
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-8 lg:space-y-0 lg:space-x-8">
            <div className="flex-1 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Item Posted</h3>
              <p className="text-gray-600">
                Sender creates listing with details and budget
              </p>
            </div>
            <ArrowRight className="w-8 h-8 text-gray-400 hidden lg:block" />
            <div className="flex-1 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Match Made</h3>
              <p className="text-gray-600">
                Traveler accepts request, direct payment arranged
              </p>
            </div>
            <ArrowRight className="w-8 h-8 text-gray-400 hidden lg:block" />
            <div className="flex-1 text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plane className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">In Transit</h3>
              <p className="text-gray-600">
                Item picked up and traveling to Nepal
              </p>
            </div>
            <ArrowRight className="w-8 h-8 text-gray-400 hidden lg:block" />
            <div className="flex-1 text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Delivered</h3>
              <p className="text-gray-600">
                Item delivered, traveler paid directly by sender
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Nasosend?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Safety & Security */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 text-white mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <Shield className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-6">
              Your Security is Our Priority
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-3">Verified Users</h3>
                <p>
                  All travelers and senders go through identity verification and
                  background checks.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Direct Payments</h3>
                <p>
                  Senders pay travelers directly after successful delivery
                  confirmation.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">
                  Money-Back Guarantee
                </h3>
                <p>
                  Full refund of token purchase if no travelers are found within
                  the validity period.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            What Our Users Say
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Priya S.",
                role: "Sender from Sydney",
                content:
                  "Sent gifts to my family in Kathmandu in just 5 days! The token system is so affordable compared to courier services.",
                rating: 5,
              },
              {
                name: "Raj K.",
                role: "Frequent Traveler",
                content:
                  "Love that there's no commission! I keep 100% of what senders pay me. Perfect way to earn while traveling.",
                rating: 5,
              },
              {
                name: "Anita M.",
                role: "Student in Melbourne",
                content:
                  "Just $10 for 5 connections! So much cheaper than courier services. Got my refund when no match was found first time.",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Be among the first to experience seamless crowdshipping
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg transition-colors"
            >
              Send an Item
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg transition-colors"
            >
              Become a Traveler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
