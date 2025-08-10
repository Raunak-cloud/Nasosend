"use client";
import React, { useState } from "react";
import {
  ArrowLeft,
  Scale,
  Users,
  Shield,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

const TermsOfServicePage = () => {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", title: "Overview", icon: Scale },
    { id: "platform", title: "Platform Services", icon: Users },
    { id: "responsibilities", title: "User Responsibilities", icon: Shield },
    {
      id: "limitations",
      title: "Limitations & Liability",
      icon: AlertTriangle,
    },
    { id: "compliance", title: "Legal Compliance", icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center">
            <button
              onClick={() => window.history.back()}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Terms of Service
              </h1>
              <p className="text-gray-600">Last updated: August 9, 2025</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 grid lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border p-4 sticky top-8">
            <h3 className="font-semibold text-gray-900 mb-4">
              Quick Navigation
            </h3>
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                      activeSection === section.id
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    <span className="text-sm">{section.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border p-8">
            {/* Overview Section */}
            {activeSection === "overview" && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Terms of Service Overview
                </h2>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">
                    Welcome to Nasosend
                  </h3>
                  <p className="text-blue-800">
                    Nasosend is a crowdshipping platform that connects people
                    wanting to send items between Australia and Nepal with
                    verified travelers who have available luggage space. We
                    facilitate introductions but do not handle logistics,
                    shipping, or payments between users.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Agreement to Terms
                    </h3>
                    <p className="text-gray-700">
                      By accessing or using Nasosend's services, you agree to be
                      bound by these Terms of Service and our Privacy Policy. If
                      you do not agree to these terms, please do not use our
                      platform.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Key Definitions
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          "Platform"
                        </h4>
                        <p className="text-sm text-gray-700">
                          Nasosend's website, mobile applications, and related
                          services that facilitate connections between senders
                          and travelers.
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          "Senders"
                        </h4>
                        <p className="text-sm text-gray-700">
                          Users who wish to send items from Australia to Nepal
                          or vice versa through our matching service.
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          "Travelers"
                        </h4>
                        <p className="text-sm text-gray-700">
                          Users with verified flight itineraries who offer to
                          carry items for senders in exchange for compensation.
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          "Matching Service"
                        </h4>
                        <p className="text-sm text-gray-700">
                          Our $10 AUD service that connects senders with up to 5
                          suitable travelers within the token validity period.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Service Model
                    </h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800">
                        <strong>Important:</strong> Nasosend is a marketplace
                        platform only. We do not:
                      </p>
                      <ul className="mt-2 space-y-1 text-yellow-800">
                        <li>• Handle physical transportation of items</li>
                        <li>
                          • Process payments between senders and travelers
                        </li>
                        <li>• Guarantee delivery or item condition</li>
                        <li>• Act as a courier or logistics company</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Platform Services Section */}
            {activeSection === "platform" && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Platform Services
                </h2>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      What We Provide
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-green-700 mb-2">
                          ✓ Matching Service
                        </h4>
                        <p className="text-sm text-gray-700">
                          Connect senders with up to 5 verified travelers within
                          30 days for $10 AUD.
                        </p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-green-700 mb-2">
                          ✓ Verification System
                        </h4>
                        <p className="text-sm text-gray-700">
                          Identity verification and flight itinerary validation
                          for travelers.
                        </p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-green-700 mb-2">
                          ✓ Rating System
                        </h4>
                        <p className="text-sm text-gray-700">
                          Community trust-building through user ratings and
                          reviews.
                        </p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-green-700 mb-2">
                          ✓ Communication Tools
                        </h4>
                        <p className="text-sm text-gray-700">
                          Secure messaging platform for initial negotiations.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Token System
                    </h3>
                    <div className="bg-blue-50 rounded-lg p-6">
                      <ul className="space-y-3 text-blue-800">
                        <li>
                          • <strong>Purchase:</strong> $10 AUD provides access
                          to match with up to 5 travelers
                        </li>
                        <li>
                          • <strong>Validity:</strong> Tokens expire 30 days
                          from purchase date
                        </li>
                        <li>
                          • <strong>Refund:</strong> Full refund if no matches
                          found within validity period
                        </li>
                        <li>
                          • <strong>Usage:</strong> One token consumed per
                          successful match attempt
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Account Registration
                    </h3>
                    <p className="text-gray-700 mb-4">
                      To use our services, you must create an account and
                      provide accurate information. You are responsible for
                      maintaining the security of your account credentials.
                    </p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800">
                        <strong>Age Requirement:</strong> You must be at least
                        18 years old to use Nasosend. Users under 18 may only
                        use the service with parental consent and supervision.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* User Responsibilities Section */}
            {activeSection === "responsibilities" && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  User Responsibilities
                </h2>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      For All Users
                    </h3>
                    <div className="space-y-4">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-gray-900">
                          Accurate Information
                        </h4>
                        <p className="text-gray-700">
                          Provide truthful and complete information in your
                          profile and listings.
                        </p>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-gray-900">
                          Legal Compliance
                        </h4>
                        <p className="text-gray-700">
                          Ensure all items and activities comply with Australian
                          and Nepali laws.
                        </p>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-gray-900">
                          Respectful Conduct
                        </h4>
                        <p className="text-gray-700">
                          Maintain professional and respectful communication
                          with other users.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Sender Responsibilities
                    </h3>
                    <div className="bg-green-50 rounded-lg p-6">
                      <ul className="space-y-2 text-green-800">
                        <li>• Accurately describe items to be transported</li>
                        <li>
                          • Ensure items are legal to transport and
                          import/export
                        </li>
                        <li>• Package items securely and appropriately</li>
                        <li>
                          • Provide complete and accurate recipient information
                        </li>
                        <li>
                          • Negotiate pricing and terms directly with travelers
                        </li>
                        <li>• Handle all payments directly with travelers</li>
                        <li>
                          • Respect travelers' restrictions and preferences
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Traveler Responsibilities
                    </h3>
                    <div className="bg-purple-50 rounded-lg p-6">
                      <ul className="space-y-2 text-purple-800">
                        <li>
                          • Provide valid and current flight itinerary
                          information
                        </li>
                        <li>
                          • Maintain accurate availability and capacity details
                        </li>
                        <li>
                          • Handle items with reasonable care during transport
                        </li>
                        <li>• Complete deliveries as agreed with senders</li>
                        <li>
                          • Communicate promptly about any changes or issues
                        </li>
                        <li>
                          • Verify item contents comply with airline regulations
                        </li>
                        <li>
                          • Ensure customs declarations are accurate and
                          complete
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Prohibited Activities
                    </h3>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-red-900 mb-2">
                            Prohibited Items
                          </h4>
                          <ul className="text-sm text-red-800 space-y-1">
                            <li>• Illegal substances or contraband</li>
                            <li>• Weapons or dangerous goods</li>
                            <li>• Perishable food items</li>
                            <li>• Fragile items without proper packaging</li>
                            <li>• Items exceeding airline restrictions</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-red-900 mb-2">
                            Prohibited Conduct
                          </h4>
                          <ul className="text-sm text-red-800 space-y-1">
                            <li>• Creating fake accounts or profiles</li>
                            <li>• Fraudulent payment or shipping claims</li>
                            <li>• Harassment or inappropriate behavior</li>
                            <li>• Circumventing platform fees or processes</li>
                            <li>• Violating customs or aviation laws</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Limitations & Liability Section */}
            {activeSection === "limitations" && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Limitations & Liability
                </h2>

                <div className="space-y-8">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-yellow-900 mb-3">
                      Platform Limitations
                    </h3>
                    <p className="text-yellow-800 mb-4">
                      Nasosend provides a matching service only. We explicitly
                      disclaim responsibility for:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <ul className="space-y-2 text-yellow-800">
                        <li>• Item loss, damage, or theft during transport</li>
                        <li>
                          • Flight delays, cancellations, or schedule changes
                        </li>
                        <li>• Customs issues or import/export violations</li>
                        <li>• Payment disputes between users</li>
                      </ul>
                      <ul className="space-y-2 text-yellow-800">
                        <li>• User conduct or communications</li>
                        <li>• Accuracy of user-provided information</li>
                        <li>• Delivery timeframes or methods</li>
                        <li>• Quality or condition of transported items</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Liability Disclaimer
                    </h3>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Service "As Is"
                        </h4>
                        <p className="text-gray-700">
                          Our platform is provided "as is" without warranties of
                          any kind. We do not guarantee uninterrupted service,
                          successful matches, or specific outcomes.
                        </p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Maximum Liability
                        </h4>
                        <p className="text-gray-700">
                          Our total liability to any user is limited to the
                          amount paid for our matching service ($10 AUD per
                          token purchase).
                        </p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Third-Party Actions
                        </h4>
                        <p className="text-gray-700">
                          We are not liable for actions, omissions, or conduct
                          of travelers, senders, or any third parties using our
                          platform.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      User Indemnification
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">
                        Users agree to indemnify and hold Nasosend harmless from
                        any claims, damages, or losses arising from their use of
                        the platform, violation of these terms, or activities
                        with other users.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Insurance & Protection
                    </h3>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-blue-800">
                        <strong>Recommendation:</strong> We strongly encourage
                        users to obtain appropriate insurance coverage for
                        valuable items. Nasosend does not provide insurance
                        coverage for transported items.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Legal Compliance Section */}
            {activeSection === "compliance" && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Legal Compliance
                </h2>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Governing Law
                    </h3>
                    <div className="bg-green-50 rounded-lg p-6">
                      <p className="text-green-800 mb-4">
                        These Terms of Service are governed by the laws of New
                        South Wales, Australia. Any disputes will be resolved in
                        the courts of New South Wales.
                      </p>
                      <p className="text-green-800">
                        <strong>International Users:</strong> Users from Nepal
                        or other countries acknowledge that Australian law
                        applies to their use of Nasosend.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Customs & Import Regulations
                    </h3>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          User Responsibility
                        </h4>
                        <p className="text-gray-700">
                          Users are solely responsible for ensuring compliance
                          with all applicable customs, import/export, and
                          aviation regulations in both Australia and Nepal.
                        </p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Documentation
                        </h4>
                        <p className="text-gray-700">
                          Proper customs declarations, invoices, and
                          documentation are the responsibility of senders and
                          travelers, not Nasosend.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Dispute Resolution
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <span className="text-blue-600 font-bold">1</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Direct Resolution
                        </h4>
                        <p className="text-sm text-gray-700">
                          Users should first attempt to resolve disputes
                          directly with each other.
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <span className="text-blue-600 font-bold">2</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Platform Mediation
                        </h4>
                        <p className="text-sm text-gray-700">
                          Nasosend offers voluntary mediation services for
                          platform-related disputes.
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <span className="text-blue-600 font-bold">3</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Legal Action
                        </h4>
                        <p className="text-sm text-gray-700">
                          Unresolved disputes may be taken to appropriate legal
                          authorities.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Terms Updates
                    </h3>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <p className="text-purple-800">
                        Nasosend reserves the right to update these Terms of
                        Service. Material changes will be communicated via email
                        with 30 days notice. Continued use after changes
                        constitutes acceptance of new terms.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Contact Information
                    </h3>
                    <div className="bg-white border rounded-lg p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Legal Inquiries
                          </h4>
                          <p className="text-gray-700">legal@nasosend.com</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            General Support
                          </h4>
                          <p className="text-gray-700">support@nasosend.com</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-600">
                          Nasosend Pty Ltd
                          <br />
                          ABN: 12 345 678 901
                          <br />
                          Sydney, NSW, Australia
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
