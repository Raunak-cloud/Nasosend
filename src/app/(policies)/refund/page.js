"use client";
import React from "react";
import {
  Shield,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

const RefundPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center">
            <button
              onClick={() => window.history.back()}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Refund Policy
              </h1>
              <p className="text-gray-600">Last updated: August 9, 2025</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Overview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <Shield className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                Our Refund Commitment
              </h2>
              <p className="text-blue-800">
                Nasosend is committed to fair and transparent refund practices.
                As a matching platform connecting senders with verified
                travelers, our refund policy is designed to protect your
                investment while recognizing the collaborative nature of
                crowdshipping.
              </p>
            </div>
          </div>
        </div>

        {/* Eligible Refund Scenarios */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Eligible Refund Scenarios
          </h2>

          <div className="space-y-6">
            <div className="bg-white border border-green-200 rounded-lg p-6">
              <div className="flex items-start">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Matches Found
                  </h3>
                  <p className="text-gray-700 mb-3">
                    <strong>100% Refund Guaranteed:</strong> If no verified
                    travelers match your request before your token expiry date,
                    you will receive a full refund of your $10 AUD matchmaking
                    fee.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>
                      • Automatic refund processing within 3-5 business days
                    </li>
                    <li>• No additional documentation required</li>
                    <li>• Refund to original payment method</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white border border-green-200 rounded-lg p-6">
              <div className="flex items-start">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Flight Cancellation by Traveler
                  </h3>
                  <p className="text-gray-700 mb-3">
                    <strong>100% Refund Available:</strong> If a matched
                    traveler cancels their flight due to unforeseen
                    circumstances and no alternative arrangements can be made.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Valid flight cancellation documentation required</li>
                    <li>• Must be reported within 24 hours of cancellation</li>
                    <li>
                      • Nasosend will attempt to find alternative travelers
                      first
                    </li>
                    <li>
                      • Refund processed within 5-7 business days upon
                      verification
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Non-Refundable Scenarios */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Non-Refundable Scenarios
          </h2>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-3">
                  When Refunds Are Not Available
                </h3>
                <ul className="space-y-3 text-red-800">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      <strong>Successful Match Made:</strong> Once you are
                      successfully matched with a verified traveler, the
                      matchmaking service is considered delivered. Any
                      subsequent negotiations, pricing agreements, or delivery
                      arrangements are between you and the traveler.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      <strong>Pricing Disagreements:</strong> Disputes over
                      pricing, item restrictions, or delivery terms between
                      sender and traveler are not grounds for platform refunds.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      <strong>Change of Mind:</strong> Refunds are not available
                      if you change your mind about sending an item after being
                      matched with a traveler.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      <strong>Traveler Availability:</strong> If a matched
                      traveler becomes unavailable for personal reasons (not
                      flight cancellation), refunds are at Nasosend's
                      discretion.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Refund Process */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Refund Process
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 border">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Submit Request
              </h3>
              <p className="text-sm text-gray-600">
                Contact our support team with your booking reference and reason
                for refund request.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Review & Verification
              </h3>
              <p className="text-sm text-gray-600">
                We review your case and verify eligibility within 24-48 hours.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Refund Processing
              </h3>
              <p className="text-sm text-gray-600">
                Approved refunds are processed to your original payment method
                within 5-7 business days.
              </p>
            </div>
          </div>
        </section>

        {/* Important Notes */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Important Notes
          </h2>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start">
              <Clock className="w-6 h-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
              <div className="space-y-3 text-yellow-800">
                <p>
                  <strong>Platform Role:</strong> Nasosend operates as a
                  matching platform only. We do not handle the physical
                  transportation of items or guarantee delivery. Our
                  responsibility is limited to connecting you with verified
                  travelers.
                </p>
                <p>
                  <strong>Traveler Payments:</strong> All payments for shipping
                  services are made directly between senders and travelers.
                  Nasosend does not process or hold these payments.
                </p>
                <p>
                  <strong>Dispute Resolution:</strong> For disputes related to
                  item handling, delivery, or pricing with travelers, we offer
                  mediation services but cannot guarantee resolution.
                </p>
                <p>
                  <strong>Refund Timeline:</strong> Token expiry dates are
                  clearly displayed at purchase. Refund eligibility expires with
                  your tokens unless a valid flight cancellation occurs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Refund Support
          </h2>

          <div className="bg-white rounded-lg p-6 border">
            <p className="text-gray-700 mb-4">
              For refund requests or questions about our refund policy, please
              contact our support team:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Email Support
                </h4>
                <p className="text-gray-600">refunds@nasosend.com</p>
                <p className="text-sm text-gray-500">
                  Response within 24 hours
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Phone Support
                </h4>
                <p className="text-gray-600">+61 (0) 2 1234 5678</p>
                <p className="text-sm text-gray-500">
                  Mon-Fri, 9 AM - 6 PM AEDT
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Legal Footer */}
        <div className="bg-gray-100 rounded-lg p-6 text-sm text-gray-600">
          <p className="mb-2">
            <strong>Legal Notice:</strong> This refund policy is part of our
            Terms of Service. By using Nasosend, you agree to these refund terms
            and conditions.
          </p>
          <p>
            Nasosend reserves the right to update this refund policy with
            reasonable notice. Material changes will be communicated via email
            to registered users.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyPage;
