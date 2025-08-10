"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Mail,
  MessageCircle,
  Clock,
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Info,
  Copy,
} from "lucide-react";
import LiveChat, { ChatToggleButton } from "@/components/LiveChat";

const SupportPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [isChatAvailable, setIsChatAvailable] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [emailCopied, setEmailCopied] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);

  // Check if chat is available (9 AM to 10 PM AEDT)
  useEffect(() => {
    const checkChatAvailability = () => {
      const now = new Date();
      const aedtTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Australia/Sydney" })
      );
      const hours = aedtTime.getHours();
      setIsChatAvailable(hours >= 9 && hours < 22);
      setCurrentTime(aedtTime);
    };

    checkChatAvailability();
    const interval = setInterval(checkChatAvailability, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const faqItems = [
    {
      id: 1,
      category: "Getting Started",
      question: "How does Nasosend work?",
      answer:
        "Nasosend is a matching platform that connects senders with verified travelers. You pay $10 AUD to access up to 5 traveler matches within 30 days. Once matched, you negotiate directly with travelers for pricing and delivery terms.",
    },
    {
      id: 2,
      category: "Pricing",
      question: "What does the $10 AUD fee cover?",
      answer:
        "The $10 AUD matchmaking fee gives you access to connect with up to 5 verified travelers within 30 days. This is a one-time fee per matching session. Travelers keep 100% of any shipping fees you agree upon.",
    },
    {
      id: 3,
      category: "Refunds",
      question: "When can I get a refund?",
      answer:
        "You receive a full refund if: (1) No travelers match your request within 30 days, or (2) A matched traveler cancels their flight due to unforeseen circumstances. Refunds are not available once you're successfully matched with a traveler.",
    },
    {
      id: 4,
      category: "Safety",
      question: "How are travelers verified?",
      answer:
        "All travelers undergo identity verification, background checks, and flight itinerary validation. We verify government-issued ID, passport details, and current flight bookings before approving accounts.",
    },
    {
      id: 5,
      category: "Shipping",
      question: "What items can I send?",
      answer:
        "You can send most legal items that comply with airline and customs regulations. Prohibited items include illegal substances, weapons, perishable foods, and items exceeding airline weight limits. Always check with your matched traveler about their restrictions.",
    },
    {
      id: 6,
      category: "Account",
      question: "How do I become a verified traveler?",
      answer:
        "Submit your government-issued ID, flight itinerary, and complete our verification process. Verification typically takes 24-48 hours. You must have a valid flight booking between Australia and Nepal to qualify.",
    },
    {
      id: 7,
      category: "Payment",
      question: "How do I pay travelers?",
      answer:
        "Nasosend does not process payments between users. You arrange payment directly with your matched traveler - cash, bank transfer, or any mutually agreed method. We only process the $10 AUD matching fee.",
    },
    {
      id: 8,
      category: "Technical",
      question: "I can't access my account. What should I do?",
      answer:
        "Try resetting your password first. If that doesn't work, contact our support team with your registered email address. We can help restore access or identify any account issues.",
    },
  ];

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("support@nasosend.com");
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = "support@nasosend.com";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    }
  };

  const filteredFAQs = faqItems.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startChat = () => {
    if (isChatAvailable) {
      setShowLiveChat(true);
    }
  };

  const formatAEDTTime = () => {
    return currentTime.toLocaleTimeString("en-AU", {
      timeZone: "Australia/Sydney",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
          <div className="flex items-center mb-3">
            <button
              onClick={() => window.history.back()}
              className="mr-3 p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
              Support Center
            </h1>
          </div>
          <p className="text-sm sm:text-base lg:text-lg text-blue-100 max-w-3xl">
            Get help with your Nasosend experience. Our team is here to assist
            with matching, payments, verification, and any other questions you
            might have.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        {/* Compact Quick Actions */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12 -mt-12 sm:-mt-16 relative z-10">
          {/* Email Support */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Email Support
              </h3>
              <p className="text-sm text-gray-600 mb-3 sm:mb-4">
                Send us an email and we'll respond within 24 hours
              </p>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2">
                  <a
                    href="mailto:support@nasosend.com"
                    className="flex-1 bg-blue-600 text-white py-2 px-3 sm:px-4 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm sm:text-base"
                  >
                    support@nasosend.com
                  </a>
                  <button
                    onClick={copyEmail}
                    className={`px-2.5 py-2 border rounded-lg transition-colors flex items-center ${
                      emailCopied
                        ? "border-green-600 text-green-600 bg-green-50"
                        : "border-blue-600 text-blue-600 hover:bg-blue-50"
                    }`}
                    title={emailCopied ? "Copied!" : "Copy email address"}
                  >
                    {emailCopied ? (
                      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  {emailCopied
                    ? "Email address copied to clipboard!"
                    : "Click copy button to copy email address"}
                </p>
              </div>
            </div>
          </div>

          {/* Live Chat */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border">
            <div className="text-center">
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 ${
                  isChatAvailable ? "bg-green-100" : "bg-gray-100"
                }`}
              >
                <MessageCircle
                  className={`w-6 h-6 sm:w-7 sm:h-7 ${
                    isChatAvailable ? "text-green-600" : "text-gray-400"
                  }`}
                />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Live Chat
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Chat with our support team in real-time
              </p>
              <div className="flex items-center justify-center text-xs sm:text-sm text-gray-500 mb-3">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span>9 AM - 10 PM AEDT</span>
              </div>
              <div className="mb-3 sm:mb-4">
                <div
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs sm:text-sm ${
                    isChatAvailable
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1.5 sm:mr-2 ${
                      isChatAvailable ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  {isChatAvailable ? "Online" : "Offline"}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Current time: {formatAEDTTime()} AEDT
                </p>
              </div>
              <button
                onClick={startChat}
                disabled={!isChatAvailable}
                className={`w-full py-2 px-4 rounded-lg transition-colors text-sm sm:text-base ${
                  isChatAvailable
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isChatAvailable ? "Start Chat" : "Chat Offline"}
              </button>
            </div>
          </div>
        </div>

        {/* Compact FAQ Search */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            Frequently Asked Questions
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Compact FAQ List */}
        <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-12">
          {filteredFAQs.map((faq) => (
            <div key={faq.id} className="bg-white rounded-lg border shadow-sm">
              <button
                onClick={() =>
                  setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)
                }
                className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full mr-2 sm:mr-3">
                    {faq.category}
                  </span>
                  <span className="text-sm sm:text-base lg:text-lg font-medium text-gray-900">
                    {faq.question}
                  </span>
                </div>
                {expandedFAQ === faq.id ? (
                  <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {expandedFAQ === faq.id && (
                <div className="px-4 sm:px-6 pb-3 sm:pb-4">
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Live Chat Component */}
      <LiveChat
        isOpen={showLiveChat}
        onToggle={() => setShowLiveChat(!showLiveChat)}
        isAvailable={isChatAvailable}
      />

      {/* Chat Toggle Button */}
      {!showLiveChat && (
        <ChatToggleButton
          onClick={() => setShowLiveChat(true)}
          isAvailable={isChatAvailable}
          hasUnreadMessages={false}
        />
      )}
    </div>
  );
};

export default SupportPage;
