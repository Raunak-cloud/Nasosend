// app/help-center/page.js
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LiveChat from "@/components/LiveChat";
import {
  ArrowLeft,
  Mail,
  MessageCircle,
  Clock,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Copy,
  Send,
  Shield,
  CreditCard,
  Package,
  Plane,
  Users,
  Settings,
  BookOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";

const HelpCenterPage = () => {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isChatAvailable, setIsChatAvailable] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [emailCopied, setEmailCopied] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);

  const colors = {
    primaryRed: "#DC143C",
    primaryRedHover: "#B01030",
    primaryBlue: "#003366",
    primaryBlueHover: "#002A52",
    gold: "#FFD700",
    goldLight: "#FFFBEB",
    goldDark: "#A17300",
    white: "#FFFFFF",
    darkGray: "#2E2E2E",
    lightGray: "#F5F5F5",
    borderGray: "#D9D9D9",
    lighterRed: "#FFF5F5",
    lighterBlue: "#F0F4F8",
  };

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

  // FAQ Categories
  const faqCategories = [
    { id: "all", name: "All Topics", icon: HelpCircle },
    { id: "getting-started", name: "Getting Started", icon: BookOpen },
    { id: "pricing", name: "Pricing & Payments", icon: CreditCard },
    { id: "shipping", name: "Shipping & Delivery", icon: Package },
    { id: "safety", name: "Safety & Security", icon: Shield },
    { id: "travelers", name: "For Travelers", icon: Plane },
    { id: "senders", name: "For Senders", icon: Send },
    { id: "account", name: "Account & Verification", icon: Users },
    { id: "technical", name: "Technical Issues", icon: Settings },
  ];

  // FAQ Items
  const faqItems = [
    {
      id: 1,
      category: "getting-started",
      question: "How does Nasosend work?",
      answer:
        "Nasosend is a peer-to-peer shipping platform that connects senders with verified travelers. Here's how it works:\n\n1. Senders post their shipping needs\n2. Travelers post their upcoming trips\n3. Our system matches senders with suitable travelers\n4. You pay $10 AUD to access up to 5 traveler matches within 30 days\n5. Once matched, you negotiate directly with travelers for pricing and delivery terms\n6. The traveler delivers your package and you confirm receipt\n\nIt's that simple! You save money on international shipping while travelers earn extra income.",
    },
    {
      id: 2,
      category: "pricing",
      question: "What does the $10 AUD fee cover?",
      answer:
        "The $10 AUD matchmaking fee gives you:\n• Access to connect with up to 5 verified travelers\n• 30-day validity period\n• Our secure matching algorithm\n• Platform support and dispute assistance\n• Access to traveler verification and ratings\n\nThis is a one-time fee per matching session. Travelers keep 100% of any shipping fees you agree upon. There are no hidden charges or commission on the shipping fee.",
    },
    {
      id: 3,
      category: "pricing",
      question: "When can I get a refund?",
      answer:
        "You're eligible for a full refund in these situations:\n\n• No travelers match your request within 30 days\n• A matched traveler cancels their flight due to unforeseen circumstances\n• Technical issues prevent you from accessing matches\n\nRefunds are NOT available once:\n• You've successfully connected with a traveler\n• You've exchanged contact information\n• The 30-day period has expired with successful matches\n\nRefunds are processed within 5-7 business days.",
    },
    {
      id: 4,
      category: "safety",
      question: "How are travelers verified?",
      answer:
        "We take safety seriously with our comprehensive verification process:\n\n• Government-issued ID verification\n• Passport validation\n• Flight booking confirmation\n• Background checks (where available)\n• Phone number verification\n• Email verification\n• Social media profile review (optional)\n\nOnly travelers who pass all mandatory checks can accept shipping requests. You can also see traveler ratings and reviews from previous transactions.",
    },
    {
      id: 5,
      category: "shipping",
      question: "What items can I send?",
      answer:
        "You can send most legal items that comply with airline and customs regulations:\n\n✅ ALLOWED:\n• Documents and papers\n• Clothing and accessories\n• Electronics (declared)\n• Non-perishable foods (packaged)\n• Gifts and souvenirs\n• Books and media\n• Small household items\n\n❌ PROHIBITED:\n• Illegal substances\n• Weapons or explosives\n• Perishable foods\n• Liquids over 100ml\n• Items exceeding airline weight limits\n• Hazardous materials\n• Items banned by customs\n\nAlways check with your matched traveler about their specific restrictions.",
    },
    {
      id: 6,
      category: "travelers",
      question: "How do I become a verified traveler?",
      answer:
        "Becoming a verified traveler is easy:\n\n1. Create an account on Nasosend\n2. Complete your profile with accurate information\n3. Submit required documents:\n   • Government-issued ID\n   • Passport (for international trips)\n   • Flight itinerary or booking confirmation\n4. Complete our verification process (24-48 hours)\n5. Once approved, post your trips and start earning!\n\nYou must have a confirmed flight booking between supported countries to qualify. Verification is free for travelers.",
    },
    {
      id: 7,
      category: "pricing",
      question: "How do I pay travelers?",
      answer:
        "Payment to travelers is handled directly between you and the traveler:\n\n• Nasosend does NOT process traveler payments\n• You arrange payment method with your traveler:\n  - Cash on delivery\n  - Bank transfer\n  - PayPal or other payment apps\n  - Any mutually agreed method\n\n• We recommend:\n  - Agreeing on payment terms in writing\n  - Using secure payment methods\n  - Getting a receipt from the traveler\n  - Only paying after package pickup/delivery\n\nThe $10 AUD platform fee is separate and paid to Nasosend.",
    },
    {
      id: 8,
      category: "account",
      question: "I can't access my account. What should I do?",
      answer:
        "If you're having trouble accessing your account:\n\n1. Try resetting your password:\n   • Click 'Forgot Password' on the login page\n   • Enter your registered email\n   • Check your email for reset instructions\n\n2. Check if your account is verified:\n   • Unverified accounts have limited access\n   • Complete verification in your profile settings\n\n3. Clear your browser cache and cookies\n\n4. Try a different browser or device\n\n5. If issues persist, contact support:\n   • Email: support@nasosend.com\n   • Live chat (9 AM - 10 PM AEDT)\n   • Include your registered email address",
    },
    {
      id: 9,
      category: "senders",
      question: "How do I create a shipping request?",
      answer:
        "Creating a shipping request is simple:\n\n1. Log in to your Nasosend account\n2. Click 'Send a Package'\n3. Fill in the details:\n   • Package description and photos\n   • Pickup location\n   • Delivery location\n   • Preferred dates\n   • Package weight and dimensions\n   • Your budget range\n4. Review and submit your request\n5. Pay the $10 AUD matching fee\n6. Wait for traveler matches (usually within 24 hours)\n7. Review matched travelers and choose the best option\n8. Contact your chosen traveler to arrange details",
    },
    {
      id: 10,
      category: "safety",
      question: "What if something goes wrong with my shipment?",
      answer:
        "While rare, we're here to help if issues arise:\n\n• Document everything:\n  - Take photos before handover\n  - Get receipts and confirmation\n  - Save all communication\n\n• For package issues:\n  - Contact the traveler immediately\n  - Report to Nasosend support within 48 hours\n  - We'll mediate and help resolve the issue\n\n• For serious problems:\n  - File a formal complaint through our platform\n  - We'll investigate and take action\n  - Travelers can be suspended or banned\n\n• Prevention tips:\n  - Choose highly-rated travelers\n  - Use secure packaging\n  - Declare valuable items\n  - Consider shipping insurance for high-value items",
    },
    {
      id: 11,
      category: "travelers",
      question: "How much can I earn as a traveler?",
      answer:
        "Your earnings depend on several factors:\n\n• Route popularity (international routes pay more)\n• Package size and weight\n• Delivery urgency\n• Your rating and experience\n\nTypical earnings:\n• Domestic trips: $20-50 AUD per package\n• International trips: $50-200 AUD per package\n• Documents/small items: $20-50 AUD\n• Larger packages: $100-300 AUD\n\nYou keep 100% of the shipping fee - Nasosend doesn't take any commission. Many travelers earn $500-2000+ per month with regular trips.",
    },
    {
      id: 12,
      category: "technical",
      question: "What browsers and devices are supported?",
      answer:
        "Nasosend works on most modern devices:\n\n✅ Supported Browsers:\n• Chrome (version 90+)\n• Firefox (version 88+)\n• Safari (version 14+)\n• Edge (version 90+)\n\n✅ Devices:\n• Desktop computers (Windows, Mac, Linux)\n• Tablets (iOS, Android)\n• Smartphones (iOS 12+, Android 8+)\n\n⚠️ For best experience:\n• Enable JavaScript\n• Allow cookies\n• Use latest browser version\n• Stable internet connection\n\nMobile apps coming soon for iOS and Android!",
    },
  ];

  // Filter FAQs based on category
  const filteredFAQs = faqItems.filter((faq) => {
    return selectedCategory === "all" || faq.category === selectedCategory;
  });

  // Copy email to clipboard
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("support@nasosend.com");
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
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

  // Format AEDT time
  const formatAEDTTime = () => {
    return currentTime.toLocaleTimeString("en-AU", {
      timeZone: "Australia/Sydney",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.lightGray }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions - Only Email and Live Chat */}
        <div className="grid sm:grid-cols-2 gap-4 mb-12 max-w-2xl mx-auto">
          {/* Email Support */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start space-x-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: colors.lighterBlue }}
              >
                <Mail
                  className="w-6 h-6"
                  style={{ color: colors.primaryBlue }}
                />
              </div>
              <div className="flex-1">
                <h3
                  className="text-lg font-semibold mb-1"
                  style={{ color: colors.darkGray }}
                >
                  Email Support
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Get help via email - we respond within 24 hours
                </p>
                <div className="flex items-center space-x-2">
                  <a
                    href="mailto:support@nasosend.com"
                    className="text-sm font-medium hover:underline"
                    style={{ color: colors.primaryBlue }}
                  >
                    support@nasosend.com
                  </a>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyEmail();
                    }}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title={emailCopied ? "Copied!" : "Copy email"}
                  >
                    {emailCopied ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Live Chat */}
          <div
            className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${
              isChatAvailable && user ? "cursor-pointer" : ""
            }`}
            onClick={() => isChatAvailable && user && setShowLiveChat(true)}
          >
            <div className="flex items-start space-x-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isChatAvailable ? "bg-green-100" : "bg-gray-100"
                }`}
              >
                <MessageCircle
                  className={`w-6 h-6 ${
                    isChatAvailable ? "text-green-600" : "text-gray-400"
                  }`}
                />
              </div>
              <div className="flex-1">
                <h3
                  className="text-lg font-semibold mb-1"
                  style={{ color: colors.darkGray }}
                >
                  Live Chat
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Chat with our support team in real-time
                </p>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>9 AM - 10 PM AEDT</span>
                  </div>
                  <div
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      isChatAvailable
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mr-1 ${
                        isChatAvailable ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    {isChatAvailable ? "Online" : "Offline"}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatAEDTTime()} AEDT
                </p>
                {!user && (
                  <p className="text-xs text-amber-600 mt-2">
                    Please login to use live chat
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="mb-8">
          <h2
            className="text-2xl font-bold mb-6 text-center"
            style={{ color: colors.darkGray }}
          >
            Browse Help Topics
          </h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {faqCategories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center px-4 py-2 rounded-full transition-colors ${
                    selectedCategory === category.id
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ List */}
        <div className="mb-12">
          <h2
            className="text-2xl font-bold mb-6"
            style={{ color: colors.darkGray }}
          >
            Frequently Asked Questions
            {selectedCategory !== "all" && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                - {faqCategories.find((c) => c.id === selectedCategory)?.name}
              </span>
            )}
          </h2>

          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)
                  }
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 pr-4">
                    <span
                      className="inline-block px-2 py-1 rounded-full text-xs mr-3 mb-2"
                      style={{
                        backgroundColor: colors.lighterBlue,
                        color: colors.primaryBlue,
                      }}
                    >
                      {faqCategories.find((c) => c.id === faq.category)?.name}
                    </span>
                    <h3
                      className="text-base font-medium"
                      style={{ color: colors.darkGray }}
                    >
                      {faq.question}
                    </h3>
                  </div>
                  {expandedFAQ === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {expandedFAQ === faq.id && (
                  <div className="px-6 pb-4 border-t border-gray-100">
                    <div className="pt-4 text-sm text-gray-600 whitespace-pre-line">
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Chat Component */}
      {user && showLiveChat && (
        <LiveChat
          userId={user.uid}
          userName={
            userProfile?.displayName || user.email?.split("@")[0] || "User"
          }
          userEmail={user.email || ""}
        />
      )}
    </div>
  );
};

export default HelpCenterPage;
