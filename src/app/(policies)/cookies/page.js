"use client";
import React, { useState } from "react";
import {
  ArrowLeft,
  Cookie,
  Settings,
  BarChart3,
  Shield,
  Globe,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

const CookiePolicyPage = () => {
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // Always true, cannot be disabled
    analytics: true,
    functional: true,
    marketing: false,
  });

  const togglePreference = (type) => {
    if (type === "essential") return; // Essential cookies cannot be disabled
    setCookiePreferences((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const savePreferences = () => {
    // In a real app, this would save to backend and update cookies
    alert("Cookie preferences saved successfully!");
  };

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
                Cookie Policy
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
            <Cookie className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                About Cookies
              </h2>
              <p className="text-blue-800">
                Nasosend uses cookies and similar technologies to enhance your
                experience, analyze platform usage, and provide personalized
                content. This policy explains what cookies we use and how you
                can control them.
              </p>
            </div>
          </div>
        </div>

        {/* What are Cookies */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            What Are Cookies?
          </h2>

          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Cookie Definition
              </h3>
              <p className="text-gray-700 mb-4">
                Cookies are small text files stored on your device when you
                visit websites. They help websites remember information about
                your visit, such as your preferred language and other settings,
                to make your next visit easier and the site more useful to you.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    First-Party Cookies
                  </h4>
                  <p className="text-sm text-gray-700">
                    Set directly by Nasosend to provide core functionality and
                    improve your user experience.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Third-Party Cookies
                  </h4>
                  <p className="text-sm text-gray-700">
                    Set by external services we use, such as analytics providers
                    and payment processors.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cookie Preferences */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Manage Your Cookie Preferences
          </h2>

          <div className="bg-white rounded-lg border p-6">
            <p className="text-gray-700 mb-6">
              You can control which cookies we use on your device. Essential
              cookies are required for the platform to function and cannot be
              disabled.
            </p>

            <div className="space-y-6">
              {/* Essential Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Shield className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Essential Cookies
                    </h3>
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Required
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">
                    These cookies are necessary for the website to function and
                    cannot be disabled.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• User authentication and session management</li>
                    <li>• Security features and fraud prevention</li>
                    <li>• Basic website functionality</li>
                    <li>• Load balancing and performance</li>
                  </ul>
                </div>
                <div className="ml-4">
                  <ToggleRight className="w-8 h-8 text-green-600" />
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Settings className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Functional Cookies
                    </h3>
                  </div>
                  <p className="text-gray-700 mb-2">
                    These cookies enable enhanced functionality and
                    personalization.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Language and region preferences</li>
                    <li>• User interface customizations</li>
                    <li>• Form data and search preferences</li>
                    <li>• Accessibility settings</li>
                  </ul>
                </div>
                <div className="ml-4">
                  <button onClick={() => togglePreference("functional")}>
                    {cookiePreferences.functional ? (
                      <ToggleRight className="w-8 h-8 text-blue-600" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <BarChart3 className="w-5 h-5 text-purple-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Analytics Cookies
                    </h3>
                  </div>
                  <p className="text-gray-700 mb-2">
                    These cookies help us understand how visitors use our
                    website.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Website usage statistics</li>
                    <li>• Page performance monitoring</li>
                    <li>• User journey analysis</li>
                    <li>• Error tracking and debugging</li>
                  </ul>
                </div>
                <div className="ml-4">
                  <button onClick={() => togglePreference("analytics")}>
                    {cookiePreferences.analytics ? (
                      <ToggleRight className="w-8 h-8 text-purple-600" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Globe className="w-5 h-5 text-orange-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Marketing Cookies
                    </h3>
                  </div>
                  <p className="text-gray-700 mb-2">
                    These cookies track your activity to provide relevant
                    advertisements.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Personalized advertisements</li>
                    <li>• Social media integration</li>
                    <li>• Conversion tracking</li>
                    <li>• Retargeting campaigns</li>
                  </ul>
                </div>
                <div className="ml-4">
                  <button onClick={() => togglePreference("marketing")}>
                    {cookiePreferences.marketing ? (
                      <ToggleRight className="w-8 h-8 text-orange-600" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={savePreferences}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </section>

        {/* Detailed Cookie Information */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Detailed Cookie Information
          </h2>

          <div className="space-y-6">
            {/* Essential Cookies Table */}
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="bg-green-50 px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-green-900">
                  Essential Cookies
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Cookie Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Purpose
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        nasosend_session
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        User authentication and session management
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        Session
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        csrf_token
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        Cross-site request forgery protection
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        Session
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        load_balancer
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        Server load balancing and performance
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        1 hour
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Functional Cookies Table */}
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="bg-blue-50 px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-blue-900">
                  Functional Cookies
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Cookie Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Purpose
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        user_preferences
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        Language, currency, and interface preferences
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        1 year
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        search_filters
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        Saved search preferences and filters
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        30 days
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        accessibility
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        Accessibility settings and preferences
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        1 year
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Analytics Cookies Table */}
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="bg-purple-50 px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-purple-900">
                  Analytics Cookies
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Cookie Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Purpose
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        _ga
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        Google Analytics - distinguish users
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        2 years
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        _ga_*
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        Google Analytics - session state
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        2 years
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        nasosend_analytics
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        Internal analytics and user behavior tracking
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        1 year
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Third-Party Services */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Third-Party Services
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Google Analytics
              </h3>
              <p className="text-gray-700 mb-3">
                We use Google Analytics to understand how users interact with
                our platform.
              </p>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>• Page views and user sessions</li>
                <li>• Traffic sources and user demographics</li>
                <li>• Feature usage and conversion tracking</li>
              </ul>
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                Google Privacy Policy →
              </a>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Stripe Payments
              </h3>
              <p className="text-gray-700 mb-3">
                Stripe processes our $10 AUD matching fee payments securely.
              </p>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>• Payment processing and fraud detection</li>
                <li>• Transaction security and PCI compliance</li>
                <li>• Billing information management</li>
              </ul>
              <a
                href="https://stripe.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                Stripe Privacy Policy →
              </a>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Customer Support
              </h3>
              <p className="text-gray-700 mb-3">
                We use customer support tools to provide better service.
              </p>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>• Live chat functionality</li>
                <li>• Support ticket management</li>
                <li>• User feedback collection</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Email Services
              </h3>
              <p className="text-gray-700 mb-3">
                Email delivery services for platform notifications and
                communications.
              </p>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>• Transactional emails</li>
                <li>• Account notifications</li>
                <li>• Marketing communications (if opted in)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Managing Cookies */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            How to Manage Cookies
          </h2>

          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-3">
                Browser Settings
              </h3>
              <p className="text-yellow-800 mb-4">
                You can control cookies through your browser settings. However,
                disabling cookies may affect your ability to use certain
                features of our platform.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-2">
                    Popular Browsers
                  </h4>
                  <ul className="space-y-1 text-sm text-yellow-800">
                    <li>
                      •{" "}
                      <a href="#" className="hover:underline">
                        Chrome Cookie Settings
                      </a>
                    </li>
                    <li>
                      •{" "}
                      <a href="#" className="hover:underline">
                        Firefox Cookie Settings
                      </a>
                    </li>
                    <li>
                      •{" "}
                      <a href="#" className="hover:underline">
                        Safari Cookie Settings
                      </a>
                    </li>
                    <li>
                      •{" "}
                      <a href="#" className="hover:underline">
                        Edge Cookie Settings
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-2">
                    Mobile Browsers
                  </h4>
                  <ul className="space-y-1 text-sm text-yellow-800">
                    <li>
                      •{" "}
                      <a href="#" className="hover:underline">
                        iOS Safari Settings
                      </a>
                    </li>
                    <li>
                      •{" "}
                      <a href="#" className="hover:underline">
                        Android Chrome Settings
                      </a>
                    </li>
                    <li>
                      •{" "}
                      <a href="#" className="hover:underline">
                        Samsung Internet Settings
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Do Not Track
              </h3>
              <p className="text-gray-700">
                We respect browser "Do Not Track" signals. When you enable Do
                Not Track in your browser, we will not use tracking cookies for
                analytics or marketing purposes, though essential cookies will
                still be used for platform functionality.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Cookie Policy Updates & Contact
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Policy Updates
              </h3>
              <p className="text-gray-700 mb-4">
                We may update this Cookie Policy periodically to reflect changes
                in our practices or applicable laws. We will notify you of
                significant changes via email or platform notification.
              </p>
              <p className="text-sm text-gray-600">
                Last updated: August 9, 2025
              </p>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Questions About Cookies
              </h3>
              <p className="text-gray-700 mb-4">
                If you have questions about our use of cookies or this policy,
                please contact us:
              </p>
              <div className="space-y-2 text-sm text-gray-700">
                <p>Email: privacy@nasosend.com</p>
                <p>Phone: +61 (0) 2 1234 5678</p>
                <p>Subject line: "Cookie Policy Inquiry"</p>
              </div>
            </div>
          </div>
        </section>

        {/* Legal Footer */}
        <div className="bg-gray-100 rounded-lg p-6 text-sm text-gray-600">
          <p className="mb-2">
            <strong>Legal Notice:</strong> This Cookie Policy is part of our
            Privacy Policy and Terms of Service. By using Nasosend, you agree to
            our use of cookies as described in this policy.
          </p>
          <p>
            For more information about how we protect your privacy, please
            review our full
            <a href="/privacy" className="text-blue-600 hover:underline ml-1">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicyPage;
