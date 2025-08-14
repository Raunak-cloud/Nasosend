//app/how-it-works/page.js
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

// A single, reusable component for rendering an icon with a background.
const IconContainer = ({ children, bgColor, iconColor }) => (
  <div
    className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4"
    style={{ backgroundColor: bgColor, color: iconColor }}
  >
    {children}
  </div>
);

// A reusable component for rendering a single step.
const StepCard = ({
  title,
  description,
  details,
  stepNumber,
  stepIndicatorColor,
}) => (
  <div
    className="rounded-2xl p-6 shadow-lg transition-shadow duration-300 ease-in-out hover:shadow-xl"
    style={{ backgroundColor: "#FFFFFF" }}
  >
    <div className="flex items-center gap-4 mb-4">
      <span
        className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
        style={{ backgroundColor: stepIndicatorColor }}
      >
        {stepNumber}
      </span>
      <h3
        className="text-xl md:text-2xl font-bold"
        style={{ color: "#2E2E2E" }}
      >
        {title}
      </h3>
    </div>
    <p className="text-gray-600 mb-4">{description}</p>
    {details && (
      <ul className="space-y-2">
        {details.map((detail, i) => (
          <li key={i} className="text-sm text-gray-500 flex items-center">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
            {detail}
          </li>
        ))}
      </ul>
    )}
  </div>
);

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState("sender");
  const router = useRouter();

  // The professional, globally defined color palette
  const colors = {
    primaryRed: "#DC143C",
    primaryRedHover: "#C00A2C",
    primaryBlue: "#003366",
    primaryBlueHover: "#002A52",
    gold: "#FFD700",
    goldLight: "#FDE68A",
    white: "#FFFFFF",
    darkGray: "#2E2E2E",
    lightGray: "#F5F5F5",
    borderGray: "#D9D9D9",
    lighterRed: "#FEEBEB",
    lighterBlue: "#E5E9EC",
  };

  const senderSteps = [
    {
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
      title: "Browse available Travelers",
      description:
        "Browse verified travelers heading to Nepal or wait for them to contact you.",
      details: [
        "View available travlers",
        "Check if they match your preferences",
        "Compare offers",
      ],
    },
    {
      title: "Buy Connection Tokens",
      description:
        "Purchase tokens to connect with multiple travelers, starting from just $2 AUD for 1 connection.",
      details: [
        "Starter Pack: 1 token for $2",
        "Regular Senders: 5 tokens for $5 (Save $5!)",
        "100% refund if no matches made",
      ],
    },
    {
      title: "Connect with Travelers",
      description: "Request for a connection.",
      details: [
        "Real-time notifications",
        "Updates via email",
        "You are ready to send your items",
      ],
    },
  ];

  const travelerSteps = [
    {
      title: "List Your Trip",
      description:
        "Add your travel details from Australia to Nepal with available baggage space.",
      details: [
        "Flight dates and times",
        "Baggage allowance",
        "Pickup preferences",
      ],
    },
    {
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
      title: "Pickup & Transport",
      description:
        "Collect the item in Australia and safely transport it to Nepal.",
      details: ["Verify item condition", "Secure packaging", "Safe transport"],
    },
    {
      title: "Deliver & Earn 100%",
      description:
        "Complete delivery in Nepal and keep 100% of the agreed payment.",
      details: [
        "Zero commission fees",
        "Direct payment from sender",
        "Get paid instantly",
      ],
    },
  ];

  const tokenPackages = [
    {
      name: "Starter Pack",
      tokens: 1,
      price: 2,
      description: "Perfect for first-time users",
      color: colors.primaryBlue,
    },
    {
      name: "Regular Senders",
      tokens: 5,
      price: 5,
      originalPrice: 10,
      description: "Best value for regular users",
      color: colors.primaryRed,
      badge: "Most Popular",
    },
  ];

  const benefits = [
    {
      icon: <Clock />,
      title: "Faster Delivery",
      description: "Get your items delivered in days, not weeks",
    },
    {
      icon: <DollarSign />,
      title: "Zero Commission",
      description: "Travelers keep 100% of earnings",
    },
    {
      icon: <Shield />,
      title: "Flexibility",
      description: "Senders and travelers comminicate directly",
    },
    {
      icon: <Users />,
      title: "Trusted Community",
      description: "Verified users",
    },
  ];

  // CTA button styles for reusability and hover effects
  const ctaButtonClasses = (bgColor, hoverColor) =>
    `text-white font-bold py-3 px-6 md:py-4 md:px-8 rounded-full transition-colors duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg ${
      bgColor === colors.primaryRed
        ? `bg-red-600 hover:bg-red-700`
        : `bg-blue-800 hover:bg-blue-900`
    }`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.lightGray }}>
      {/* Hero Section */}
      <div
        className="text-white py-12 md:py-24"
        style={{
          background: `linear-gradient(to right, ${colors.primaryBlue}, ${colors.primaryRed})`,
        }}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-6 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-2 md:mb-4">
            How Nasosend Works
          </h1>
          <p className="text-base md:text-xl mb-4 md:mb-8 max-w-3xl mx-auto opacity-90">
            Connect with travelers to send items between Australia 🇦🇺 and Nepal
            🇳🇵 quickly, safely, and affordably.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-10 md:mb-16">
          <div
            className="rounded-full p-1 shadow-inner border inline-flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2"
            style={{
              backgroundColor: colors.white,
              borderColor: colors.borderGray,
            }}
          >
            <button
              onClick={() => setActiveTab("sender")}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === "sender"
                  ? "text-white shadow-md"
                  : "text-gray-600 hover:text-red-500"
              }`}
              style={{
                backgroundColor:
                  activeTab === "sender" ? colors.primaryRed : "transparent",
              }}
            >
              <Package className="w-5 h-5" />
              <span>I Want to Send Items</span>
            </button>
            <button
              onClick={() => setActiveTab("traveler")}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === "traveler"
                  ? "text-white shadow-md"
                  : "text-gray-600 hover:text-blue-700"
              }`}
              style={{
                backgroundColor:
                  activeTab === "traveler" ? colors.primaryBlue : "transparent",
              }}
            >
              <Plane className="w-5 h-5" />
              <span>I'm a Traveler</span>
            </button>
          </div>
        </div>

        {/* Steps Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-16">
          {(activeTab === "sender" ? senderSteps : travelerSteps).map(
            (step, index) => (
              <StepCard
                key={index}
                title={step.title}
                description={step.description}
                details={step.details}
                stepNumber={index + 1}
                stepIndicatorColor={
                  activeTab === "sender"
                    ? colors.primaryRed
                    : colors.primaryBlue
                }
              />
            )
          )}
        </div>

        {/* Token Packages Section - Only for Sender Tab */}
        {activeTab === "sender" && (
          <div
            className="rounded-2xl p-6 md:p-8 mb-16 shadow-lg"
            style={{
              background: `linear-gradient(to bottom right, ${colors.lighterRed}, ${colors.lighterBlue})`,
            }}
          >
            <div className="text-center mb-8">
              <h2
                className="text-3xl font-bold text-gray-900 mb-3"
                style={{ color: colors.darkGray }}
              >
                Choose Your Connection Package
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Purchase tokens to connect with multiple travelers. Each token
                allows you to contact one verified traveler.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {tokenPackages.map((pkg, index) => (
                <div
                  key={index}
                  className={`relative rounded-2xl p-6 shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl border-2 ${
                    pkg.badge ? "transform scale-105" : ""
                  }`}
                  style={{
                    backgroundColor: colors.white,
                    borderColor: pkg.badge ? pkg.color : colors.borderGray,
                  }}
                >
                  {pkg.badge && (
                    <div
                      className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 text-xs font-bold rounded-full text-white`}
                      style={{ backgroundColor: pkg.color }}
                    >
                      {pkg.badge}
                    </div>
                  )}
                  <div className="text-center">
                    <h3
                      className="text-xl font-bold text-gray-900 mb-2"
                      style={{ color: colors.darkGray }}
                    >
                      {pkg.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {pkg.description}
                    </p>
                    <div className="mb-4">
                      <div
                        className="text-3xl font-bold text-gray-900"
                        style={{ color: colors.darkGray }}
                      >
                        {pkg.tokens}
                        <span className="text-lg text-gray-600 font-normal">
                          {" "}
                          {pkg.tokens === 1 ? "token" : "tokens"}
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
                        <span
                          className="text-2xl font-bold text-gray-900"
                          style={{ color: colors.darkGray }}
                        >
                          ${pkg.price}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        ${(pkg.price / pkg.tokens).toFixed(2)} per token
                      </p>
                      {pkg.originalPrice && (
                        <p
                          className="text-sm font-medium"
                          style={{ color: pkg.color }}
                        >
                          Save ${pkg.originalPrice - pkg.price} (50% off)!
                        </p>
                      )}
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-center">
                        <Shield
                          className="w-4 h-4 mr-2"
                          style={{ color: colors.primaryBlue }}
                        />
                        100% refund if no matches made
                      </div>
                      <div className="flex items-center justify-center">
                        <Clock
                          className="w-4 h-4 mr-2"
                          style={{ color: colors.primaryRed }}
                        />
                        Instant activation
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Benefits Grid */}
        <div className="mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            style={{ color: colors.darkGray }}
          >
            Why Choose Nasosend?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out"
                style={{ backgroundColor: colors.white }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white mx-auto mb-4"
                  style={{
                    background: `linear-gradient(to bottom right, ${colors.primaryBlue}, ${colors.primaryRed})`,
                  }}
                >
                  {React.cloneElement(benefit.icon, { className: "w-6 h-6" })}
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: colors.darkGray }}
                >
                  {benefit.title}
                </h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2
            className="text-3xl md:text-4xl font-bold mb-6"
            style={{ color: colors.darkGray }}
          >
            Ready to Get Started?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Be among the first to experience seamless crowdshipping.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/dashboard")}
              className={ctaButtonClasses(
                colors.primaryRed,
                colors.primaryRedHover
              )}
            >
              Send an Item
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className={ctaButtonClasses(
                colors.primaryBlue,
                colors.primaryBlueHover
              )}
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
