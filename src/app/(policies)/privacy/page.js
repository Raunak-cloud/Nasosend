"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Shield,
  Eye,
  Lock,
  Database,
  Globe,
  Settings,
} from "lucide-react";

const PrivacyPolicyPage = () => {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", title: "Privacy Overview", icon: Shield },
    { id: "collection", title: "Data Collection", icon: Database },
    { id: "usage", title: "How We Use Data", icon: Settings },
    { id: "sharing", title: "Data Sharing", icon: Globe },
    { id: "security", title: "Data Security", icon: Lock },
    { id: "rights", title: "Your Rights", icon: Eye },
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
                Privacy Policy
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
            {/* Privacy Overview Section */}
            {activeSection === "overview" && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Privacy Policy Overview
                </h2>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">
                    Our Privacy Commitment
                  </h3>
                  <p className="text-blue-800">
                    At Nasosend, we respect your privacy and are committed to
                    protecting your personal information. This policy explains
                    how we collect, use, and safeguard your data when you use
                    our crowdshipping platform to connect with travelers between
                    Australia and Nepal.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Key Privacy Principles
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">
                          Transparency
                        </h4>
                        <p className="text-sm text-green-800">
                          We clearly explain what data we collect and how we use
                          it for our matching service.
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">
                          Minimal Collection
                        </h4>
                        <p className="text-sm text-green-800">
                          We only collect data necessary for our platform
                          operations and user safety.
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">
                          User Control
                        </h4>
                        <p className="text-sm text-green-800">
                          You maintain control over your personal information
                          and can modify or delete it.
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">
                          Security First
                        </h4>
                        <p className="text-sm text-green-800">
                          We implement robust security measures to protect your
                          data from unauthorized access.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Scope of This Policy
                    </h3>
                    <p className="text-gray-700 mb-4">
                      This privacy policy applies to all information collected
                      through:
                    </p>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Nasosend website (nasosend.com)</li>
                      <li>• Mobile applications</li>
                      <li>• Email communications</li>
                      <li>• Customer support interactions</li>
                      <li>• Payment processing for our matching service</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Australian Privacy Act Compliance
                    </h3>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <p className="text-purple-800">
                        Nasosend is committed to compliance with the Australian
                        Privacy Act 1988 and the Australian Privacy Principles
                        (APPs). We are registered in Australia and follow
                        Australian privacy laws for all users, regardless of
                        location.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Collection Section */}
            {activeSection === "collection" && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Information We Collect
                </h2>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Personal Information
                    </h3>
                    <p className="text-gray-700 mb-4">
                      We collect personal information necessary to provide our
                      matching service and ensure user safety:
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-blue-700 mb-3">
                          Account Information
                        </h4>
                        <ul className="space-y-1 text-sm text-gray-700">
                          <li>• Full name</li>
                          <li>• Email address</li>
                          <li>• Phone number</li>
                          <li>• Profile picture (optional)</li>
                          <li>• Account preferences</li>
                        </ul>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-blue-700 mb-3">
                          Verification Information
                        </h4>
                        <ul className="space-y-1 text-sm text-gray-700">
                          <li>• Government-issued ID</li>
                          <li>• Passport details</li>
                          <li>• Flight itineraries (travelers)</li>
                          <li>• Address verification</li>
                          <li>• Background check results</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Platform Usage Data
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Activity Data
                          </h4>
                          <ul className="text-sm text-gray-700 space-y-1">
                            <li>• Matching requests</li>
                            <li>• Messages sent/received</li>
                            <li>• Search queries</li>
                            <li>• Platform interactions</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Technical Data
                          </h4>
                          <ul className="text-sm text-gray-700 space-y-1">
                            <li>• IP address</li>
                            <li>• Browser type</li>
                            <li>• Device information</li>
                            <li>• Session duration</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Location Data
                          </h4>
                          <ul className="text-sm text-gray-700 space-y-1">
                            <li>• General location (city)</li>
                            <li>• Pickup/delivery areas</li>
                            <li>• Travel routes</li>
                            <li>• Time zone settings</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Payment Information
                    </h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800 mb-3">
                        <strong>Important:</strong> Nasosend only processes
                        payments for our $10 AUD matching service. We do not
                        handle payments between senders and travelers.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-yellow-900 mb-2">
                            What We Collect
                          </h4>
                          <ul className="text-sm text-yellow-800 space-y-1">
                            <li>• Billing name and address</li>
                            <li>• Email for receipts</li>
                            <li>• Transaction history</li>
                            <li>• Refund processing information</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-yellow-900 mb-2">
                            What We Don't Store
                          </h4>
                          <ul className="text-sm text-yellow-800 space-y-1">
                            <li>• Full credit card numbers</li>
                            <li>• CVV codes</li>
                            <li>• Banking passwords</li>
                            <li>• Payment details (handled by Stripe)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Communications
                    </h3>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Platform Messages
                        </h4>
                        <p className="text-gray-700">
                          We store messages sent through our platform to
                          facilitate matches and provide support. Messages are
                          encrypted and only accessible to relevant parties.
                        </p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Support Communications
                        </h4>
                        <p className="text-gray-700">
                          Customer support interactions via email, chat, or
                          phone are recorded for quality assurance and training
                          purposes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Usage Section */}
            {activeSection === "usage" && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  How We Use Your Information
                </h2>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Primary Platform Functions
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-3">
                          Matching Service
                        </h4>
                        <ul className="space-y-2 text-blue-800">
                          <li>• Connect senders with suitable travelers</li>
                          <li>• Filter matches based on preferences</li>
                          <li>• Display relevant travel itineraries</li>
                          <li>• Calculate match compatibility scores</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-3">
                          User Verification
                        </h4>
                        <ul className="space-y-2 text-green-800">
                          <li>• Verify identity documents</li>
                          <li>• Validate flight itineraries</li>
                          <li>• Conduct background checks</li>
                          <li>• Maintain verification status</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Safety & Trust
                    </h3>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h4 className="font-semibold text-red-900 mb-3">
                        Community Protection
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <ul className="space-y-2 text-red-800">
                          <li>• Fraud prevention and detection</li>
                          <li>• Monitoring for suspicious activity</li>
                          <li>• Rating and review system maintenance</li>
                          <li>• Investigation of reported issues</li>
                        </ul>
                        <ul className="space-y-2 text-red-800">
                          <li>• Account security monitoring</li>
                          <li>• Compliance with legal requirements</li>
                          <li>• Risk assessment and mitigation</li>
                          <li>• Platform abuse prevention</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Communication & Support
                    </h3>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Platform Communications
                        </h4>
                        <ul className="text-gray-700 space-y-1">
                          <li>• Match notifications and updates</li>
                          <li>• Transaction confirmations and receipts</li>
                          <li>• Important platform announcements</li>
                          <li>• Security alerts and warnings</li>
                        </ul>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Customer Support
                        </h4>
                        <ul className="text-gray-700 space-y-1">
                          <li>• Responding to inquiries and requests</li>
                          <li>• Resolving technical issues</li>
                          <li>• Processing refunds and cancellations</li>
                          <li>• Providing platform guidance</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Platform Improvement
                    </h3>
                    <div className="bg-purple-50 rounded-lg p-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-purple-900 mb-2">
                            Analytics & Insights
                          </h4>
                          <ul className="text-sm text-purple-800 space-y-1">
                            <li>• Usage pattern analysis</li>
                            <li>• Feature performance measurement</li>
                            <li>• User experience optimization</li>
                            <li>• Platform reliability monitoring</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-purple-900 mb-2">
                            Product Development
                          </h4>
                          <ul className="text-sm text-purple-800 space-y-1">
                            <li>• New feature development</li>
                            <li>• Bug identification and fixing</li>
                            <li>• Performance optimization</li>
                            <li>• User interface improvements</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Legal Compliance
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 mb-3">
                        We may use your information to comply with legal
                        obligations, including:
                      </p>
                      <ul className="text-gray-700 space-y-1">
                        <li>• Responding to legal requests and court orders</li>
                        <li>
                          • Reporting suspicious activities to authorities
                        </li>
                        <li>• Maintaining required business records</li>
                        <li>
                          • Ensuring compliance with customs and aviation
                          regulations
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Sharing Section */}
            {activeSection === "sharing" && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  How We Share Your Information
                </h2>

                <div className="space-y-8">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-900 mb-3">
                      We DO NOT Sell Your Data
                    </h3>
                    <p className="text-red-800">
                      Nasosend does not sell, rent, or trade your personal
                      information to third parties for marketing purposes. Your
                      data is used solely for platform operations and user
                      safety.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Information Shared with Other Users
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-blue-700 mb-3">
                          Senders See (About Travelers)
                        </h4>
                        <ul className="space-y-1 text-sm text-gray-700">
                          <li>• Name and profile picture</li>
                          <li>• Travel route and dates</li>
                          <li>• Available luggage space</li>
                          <li>• Verification status</li>
                          <li>• Ratings and reviews</li>
                          <li>• General preferences and restrictions</li>
                        </ul>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-green-700 mb-3">
                          Travelers See (About Senders)
                        </h4>
                        <ul className="space-y-1 text-sm text-gray-700">
                          <li>• Name and profile picture</li>
                          <li>• Item descriptions and weight</li>
                          <li>• Pickup and delivery locations</li>
                          <li>• Verification status</li>
                          <li>• Ratings and reviews</li>
                          <li>• Contact information (when matched)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Third-Party Service Providers
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">
                          Payment Processing
                        </h4>
                        <p className="text-blue-800 mb-2">
                          We use Stripe for secure payment processing of our $10
                          AUD matching fee.
                        </p>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Credit card processing</li>
                          <li>• Fraud detection</li>
                          <li>• Refund processing</li>
                          <li>• PCI DSS compliance</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">
                          Identity Verification
                        </h4>
                        <p className="text-green-800 mb-2">
                          We partner with certified verification services for
                          user safety.
                        </p>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• Document verification</li>
                          <li>• Background checks</li>
                          <li>• Identity confirmation</li>
                          <li>• Risk assessment</li>
                        </ul>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">
                          Communication Services
                        </h4>
                        <p className="text-purple-800 mb-2">
                          Email and SMS services for platform notifications.
                        </p>
                        <ul className="text-sm text-purple-800 space-y-1">
                          <li>• Email delivery services</li>
                          <li>• SMS notifications</li>
                          <li>• Push notifications</li>
                          <li>• Communication analytics</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Legal and Compliance Sharing
                    </h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <p className="text-yellow-800 mb-4">
                        We may share information when required by law or to
                        protect our users:
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <ul className="space-y-2 text-yellow-800">
                          <li>• Law enforcement requests</li>
                          <li>• Court orders and subpoenas</li>
                          <li>• Government investigations</li>
                          <li>• Customs and border protection</li>
                        </ul>
                        <ul className="space-y-2 text-yellow-800">
                          <li>• Safety threat investigations</li>
                          <li>• Fraud prevention</li>
                          <li>• Legal proceedings</li>
                          <li>• Regulatory compliance</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Business Transfers
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">
                        In the event of a merger, acquisition, or sale of
                        Nasosend, user information may be transferred to the new
                        entity. We will notify users of any such transfer and
                        provide options regarding their data.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Security Section */}
            {activeSection === "security" && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Data Security & Protection
                </h2>

                <div className="space-y-8">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-3">
                      Our Security Commitment
                    </h3>
                    <p className="text-green-800">
                      We implement industry-standard security measures to
                      protect your personal information from unauthorized
                      access, disclosure, alteration, and destruction.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Technical Security Measures
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-blue-700 mb-3">
                          Data Encryption
                        </h4>
                        <ul className="space-y-2 text-gray-700">
                          <li>
                            • 256-bit SSL encryption for data transmission
                          </li>
                          <li>• AES-256 encryption for stored data</li>
                          <li>• Encrypted database storage</li>
                          <li>• Secure API communications</li>
                        </ul>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-blue-700 mb-3">
                          Access Controls
                        </h4>
                        <ul className="space-y-2 text-gray-700">
                          <li>• Multi-factor authentication</li>
                          <li>• Role-based access permissions</li>
                          <li>• Regular access reviews</li>
                          <li>• Secure password requirements</li>
                        </ul>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-blue-700 mb-3">
                          Infrastructure Security
                        </h4>
                        <ul className="space-y-2 text-gray-700">
                          <li>• Secure cloud hosting (AWS/Azure)</li>
                          <li>• Regular security updates</li>
                          <li>• Firewall protection</li>
                          <li>• Intrusion detection systems</li>
                        </ul>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-blue-700 mb-3">
                          Monitoring & Auditing
                        </h4>
                        <ul className="space-y-2 text-gray-700">
                          <li>• 24/7 security monitoring</li>
                          <li>• Regular security audits</li>
                          <li>• Vulnerability assessments</li>
                          <li>• Incident response procedures</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Data Retention
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">
                          Active Accounts
                        </h4>
                        <p className="text-blue-800">
                          We retain your personal information while your account
                          is active and for as long as needed to provide our
                          services, comply with legal obligations, and resolve
                          disputes.
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">
                          Account Deletion
                        </h4>
                        <p className="text-purple-800">
                          When you delete your account, we remove your personal
                          information within 30 days, except for data required
                          for legal compliance or legitimate business purposes.
                        </p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <h4 className="font-semibold text-yellow-900 mb-2">
                          Legal Requirements
                        </h4>
                        <p className="text-yellow-800">
                          Some information may be retained longer to comply with
                          legal obligations, such as financial records (7 years)
                          and verification documents (5 years).
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Security Incident Response
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <span className="text-red-600 font-bold">1</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Detection
                        </h4>
                        <p className="text-sm text-gray-700">
                          Immediate identification and assessment of security
                          incidents.
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <span className="text-red-600 font-bold">2</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Response
                        </h4>
                        <p className="text-sm text-gray-700">
                          Swift action to contain and mitigate any security
                          breaches.
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <span className="text-red-600 font-bold">3</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Notification
                        </h4>
                        <p className="text-sm text-gray-700">
                          Prompt notification to affected users and relevant
                          authorities.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* User Rights Section */}
            {activeSection === "rights" && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Your Privacy Rights
                </h2>

                <div className="space-y-8">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">
                      Your Data, Your Control
                    </h3>
                    <p className="text-blue-800">
                      Under Australian privacy law and our commitment to
                      transparency, you have significant rights regarding your
                      personal information. We make it easy to exercise these
                      rights.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Access & Portability Rights
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-green-700 mb-3">
                          Access Your Data
                        </h4>
                        <p className="text-gray-700 mb-3">
                          Request a copy of all personal information we hold
                          about you.
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Account information</li>
                          <li>• Transaction history</li>
                          <li>• Communication records</li>
                          <li>• Platform usage data</li>
                        </ul>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-green-700 mb-3">
                          Data Portability
                        </h4>
                        <p className="text-gray-700 mb-3">
                          Export your data in a machine-readable format.
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• JSON or CSV format</li>
                          <li>• Complete profile data</li>
                          <li>• Communication history</li>
                          <li>• Platform preferences</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Correction & Deletion Rights
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <h4 className="font-semibold text-yellow-900 mb-2">
                          Correct Inaccurate Information
                        </h4>
                        <p className="text-yellow-800">
                          Update or correct any inaccurate or outdated personal
                          information in your account settings or by contacting
                          our support team.
                        </p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4">
                        <h4 className="font-semibold text-red-900 mb-2">
                          Delete Your Data
                        </h4>
                        <p className="text-red-800 mb-2">
                          Request deletion of your personal information, subject
                          to legal retention requirements.
                        </p>
                        <ul className="text-sm text-red-800 space-y-1">
                          <li>• Complete account deletion</li>
                          <li>• Selective data removal</li>
                          <li>• Communication history deletion</li>
                          <li>• Profile information removal</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Communication Preferences
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Marketing Emails
                        </h4>
                        <p className="text-sm text-gray-700 mb-2">
                          Opt out of promotional emails while keeping essential
                          notifications.
                        </p>
                        <button className="text-blue-600 text-sm hover:underline">
                          Manage Preferences
                        </button>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          SMS Notifications
                        </h4>
                        <p className="text-sm text-gray-700 mb-2">
                          Control which SMS notifications you receive.
                        </p>
                        <button className="text-blue-600 text-sm hover:underline">
                          Update Settings
                        </button>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Push Notifications
                        </h4>
                        <p className="text-sm text-gray-700 mb-2">
                          Customize mobile app notification preferences.
                        </p>
                        <button className="text-blue-600 text-sm hover:underline">
                          Configure Alerts
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      How to Exercise Your Rights
                    </h3>
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white border rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3">
                            Self-Service Options
                          </h4>
                          <ul className="space-y-2 text-gray-700">
                            <li>• Account settings dashboard</li>
                            <li>• Privacy preferences center</li>
                            <li>• Data download tool</li>
                            <li>• Communication preferences</li>
                          </ul>
                        </div>
                        <div className="bg-white border rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3">
                            Contact Support
                          </h4>
                          <ul className="space-y-2 text-gray-700">
                            <li>• Email: privacy@nasosend.com</li>
                            <li>• Phone: +61 (0) 2 1234 5678</li>
                            <li>• In-app support chat</li>
                            <li>• Written request (see address below)</li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Response Timeline
                        </h4>
                        <p className="text-gray-700">
                          We will respond to your privacy requests within 30
                          days. For complex requests, we may extend this period
                          by an additional 30 days with notification.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Privacy Complaints
                    </h3>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                      <p className="text-purple-800 mb-4">
                        If you have concerns about how we handle your personal
                        information:
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-purple-900 mb-2">
                            Contact Us First
                          </h4>
                          <p className="text-sm text-purple-800">
                            Email: privacy@nasosend.com
                            <br />
                            We aim to resolve complaints within 30 days.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-purple-900 mb-2">
                            External Complaint
                          </h4>
                          <p className="text-sm text-purple-800">
                            Office of the Australian Information Commissioner
                            (OAIC)
                            <br />
                            Website: www.oaic.gov.au
                          </p>
                        </div>
                      </div>
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
                            Privacy Officer
                          </h4>
                          <p className="text-gray-700">
                            Email: privacy@nasosend.com
                            <br />
                            Phone: +61 (0) 2 1234 5678
                            <br />
                            Response time: Within 48 hours
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Postal Address
                          </h4>
                          <p className="text-gray-700">
                            Nasosend Pty Ltd
                            <br />
                            Privacy Officer
                            <br />
                            Level 10, 123 Collins Street
                            <br />
                            Melbourne, VIC 3000
                            <br />
                            Australia
                          </p>
                        </div>
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

export default PrivacyPolicyPage;
