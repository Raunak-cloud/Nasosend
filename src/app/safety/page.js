//app/safety-guidelines/page.js
"use client";
import React, { useState } from "react";
import {
  Shield,
  X,
  AlertTriangle,
  CheckCircle,
  Users,
  Package,
  Plane,
  Camera,
  Phone,
  FileText,
  Eye,
  MapPin,
  CreditCard,
  Clock,
  Ban,
  Info,
  UserCheck,
  Lock,
  MessageCircle,
} from "lucide-react";

const SafetyGuidelines = () => {
  const [activeTab, setActiveTab] = useState("senders");

  const colors = {
    primaryRed: "#DC143C",
    primaryBlue: "#003366",
    successGreen: "#10B981",
    warningYellow: "#F59E0B",
    dangerRed: "#EF4444",
    white: "#FFFFFF",
    lightGray: "#F9FAFB",
    darkGray: "#374151",
    borderGray: "#E5E7EB",
  };

  const senderGuidelines = [
    {
      category: "Before Handover",
      icon: <Package className="w-6 h-6" />,
      color: colors.primaryBlue,
      items: [
        {
          title: "Verify Item Contents",
          description: "Double-check all items match your listing description",
          details: [
            "Count all items and verify quantities",
            "Ensure items are in described condition",
            "Remove any prohibited items (liquids, batteries, etc.)",
            "Check weight doesn't exceed agreed limits",
          ],
        },
        {
          title: "Secure Packaging",
          description:
            "Package items properly to prevent damage during transport",
          details: [
            "Use bubble wrap or protective padding",
            "Seal packages with strong tape",
            "Label fragile items clearly",
            "Consider waterproof packaging for electronics",
          ],
        },
        {
          title: "Documentation Preparation",
          description: "Prepare all necessary documents and receipts",
          details: [
            "Keep purchase receipts for valuable items",
            "Create detailed inventory list with photos",
            "Prepare customs declaration if required",
            "Have backup copies of important documents",
          ],
        },
      ],
    },
    {
      category: "Traveler Verification",
      icon: <UserCheck className="w-6 h-6" />,
      color: colors.successGreen,
      items: [
        {
          title: "Identity Verification",
          description: "Confirm the traveler's identity and credentials",
          details: [
            "Verify government-issued photo ID",
            "Check passport and visa validity",
            "Confirm flight booking details",
            "Verify profile matches the person meeting you",
          ],
        },
        {
          title: "Contact Information Exchange",
          description: "Obtain complete contact details for both countries",
          details: [
            "Get local phone number in Australia",
            "Obtain contact number for Nepal",
            "Exchange WhatsApp or messaging apps",
            "Get emergency contact information",
            "Confirm social media profiles if available",
          ],
        },
        {
          title: "Travel Details Confirmation",
          description: "Verify all travel arrangements and timeline",
          details: [
            "Confirm exact travel dates",
            "Verify airline and flight numbers",
            "Check baggage allowance limits",
            "Understand any potential delays or connections",
          ],
        },
      ],
    },
    {
      category: "Handover Process",
      icon: <Camera className="w-6 h-6" />,
      color: colors.warningYellow,
      items: [
        {
          title: "Meeting Safety",
          description: "Ensure safe handover in public locations",
          details: [
            "Meet in well-lit, public places",
            "Consider bringing a friend for safety",
            "Use shopping centers or coffee shops",
            "Avoid residential areas or isolated locations",
          ],
        },
        {
          title: "Photo Documentation",
          description: "Document the handover process thoroughly",
          details: [
            "Take photos of all items being handed over",
            "Photograph package condition and sealing",
            "Capture traveler's ID with their permission",
            "Record handover location and time",
          ],
        },
        {
          title: "Receipt and Acknowledgment",
          description: "Create written record of the transaction",
          details: [
            "Write detailed receipt of items transferred",
            "Include item descriptions and quantities",
            "Both parties sign and date the receipt",
            "Exchange copies of the receipt",
          ],
        },
      ],
    },
    {
      category: "Payment",
      icon: <CreditCard className="w-6 h-6" />,
      color: colors.primaryRed,
      items: [
        {
          title: "Payment Terms",
          description: "Clarify payment structure and timeline",
          details: [
            "Agree on partial payment upfront if needed",
            "Confirm final payment upon delivery confirmation",
            "Use secure payment methods (bank transfer, PayPal)",
            "Avoid cash payments for large amounts",
          ],
        },
      ],
    },
  ];

  const travelerGuidelines = [
    {
      category: "Pre-Travel Preparation",
      icon: <Plane className="w-6 h-6" />,
      color: colors.primaryBlue,
      items: [
        {
          title: "Legal Compliance Check",
          description: "Ensure all items are legal to transport",
          details: [
            "Check customs regulations for both countries",
            "Verify no prohibited items (drugs, weapons, etc.)",
            "Understand duty and tax implications",
            "Research import restrictions in destination country",
          ],
        },
        {
          title: "Baggage Planning",
          description: "Plan your baggage space and weight limits",
          details: [
            "Check airline baggage allowances",
            "Reserve space for sender items",
            "Consider weight distribution",
            "Plan for potential overweight fees",
          ],
        },
        {
          title: "Documentation Preparation",
          description: "Prepare necessary travel and customs documents",
          details: [
            "Ensure passport validity (6+ months)",
            "Check visa requirements",
            "Prepare customs declaration forms",
            "Have sender's contact details ready",
          ],
        },
      ],
    },
    {
      category: "Item Inspection & Acceptance",
      icon: <Eye className="w-6 h-6" />,
      color: colors.successGreen,
      items: [
        {
          title: "Thorough Item Inspection",
          description: "Carefully examine all items before accepting",
          details: [
            "Open and inspect package contents",
            "Verify items match the description",
            "Check for any damage or tampering",
            "Refuse suspicious or unlabeled items",
            "Ask questions about unfamiliar items",
          ],
        },
        {
          title: "Weight and Size Verification",
          description: "Confirm items fit within agreed parameters",
          details: [
            "Weigh items to confirm limits",
            "Measure dimensions if necessary",
            "Ensure items fit in your luggage",
            "Account for packaging materials",
          ],
        },
        {
          title: "Legal Item Verification",
          description: "Ensure items are legal and properly documented",
          details: [
            "Ask for purchase receipts",
            "Verify no counterfeit goods",
            "Check for proper labeling",
            "Refuse items without clear origin",
          ],
        },
      ],
    },
    {
      category: "During Transit",
      icon: <Lock className="w-6 h-6" />,
      color: colors.warningYellow,
      items: [
        {
          title: "Secure Storage",
          description: "Keep items safe throughout your journey",
          details: [
            "Keep valuable items in carry-on when possible",
            "Use TSA-approved locks",
            "Don't leave items unattended",
            "Consider travel insurance for valuable items",
          ],
        },
        {
          title: "Communication",
          description: "Maintain contact with sender and recipient",
          details: [
            "Update sender on travel progress",
            "Notify of any delays or issues",
            "Confirm arrival and next steps",
            "Share tracking information if available",
          ],
        },
        {
          title: "Customs Declaration",
          description: "Properly declare items at customs",
          details: [
            "Be honest about item contents and value",
            "Have documentation ready",
            "Understand duty obligations",
            "Cooperate fully with customs officials",
          ],
        },
      ],
    },
    {
      category: "Delivery Process",
      icon: <MapPin className="w-6 h-6" />,
      color: colors.primaryRed,
      items: [
        {
          title: "Recipient Verification",
          description: "Confirm recipient identity before handover",
          details: [
            "Verify recipient's government-issued ID",
            "Confirm delivery address matches",
            "Check recipient details with sender if unsure",
            "Get photo confirmation of delivery",
          ],
        },
        {
          title: "Delivery Documentation",
          description: "Document the successful delivery",
          details: [
            "Take photos of items being delivered",
            "Get recipient's signature on delivery receipt",
            "Note delivery time and location",
            "Send confirmation to sender immediately",
          ],
        },
        {
          title: "Payment Completion",
          description: "Ensure proper payment processing",
          details: [
            "Confirm delivery before requesting payment",
            "Use agreed payment methods",
            "Provide delivery confirmation to sender",
            "Update Nasosend platform with completion status",
          ],
        },
      ],
    },
  ];

  const prohibitedItems = [
    {
      category: "Strictly Prohibited",
      icon: <Ban className="w-6 h-6" />,
      color: colors.dangerRed,
      items: [
        "Illegal drugs or substances",
        "Weapons and ammunition",
        "Explosive materials",
        "Hazardous chemicals",
        "Live animals or plants",
        "Human remains or organs",
        "Counterfeit goods",
        "Stolen property",
      ],
    },
    {
      category: "Restricted Items",
      icon: <AlertTriangle className="w-6 h-6" />,
      color: colors.warningYellow,
      items: [
        "Liquids over 100ml (carry-on)",
        "Lithium batteries (check airline rules)",
        "Cash over declared limits",
        "Prescription medications (need documentation)",
        "Food items (check quarantine rules)",
        "Religious or cultural artifacts",
        "Items requiring special permits",
        "High-value electronics without receipts",
      ],
    },
  ];

  const emergencyContacts = [
    {
      country: "Australia",
      emergency: "000",
      police: "000",
      customs: "1800 803 772",
    },
    {
      country: "Nepal",
      emergency: "100/112",
      police: "100",
      customs: "+977-1-4211966",
    },
  ];

  const TabButton = ({ isActive, onClick, children, icon }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
        isActive
          ? "bg-white text-blue-900 shadow-md"
          : "text-white hover:bg-white hover:bg-opacity-20"
      }`}
    >
      {icon}
      {children}
    </button>
  );

  const GuidelineCard = ({ category, icon, color, items }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
      <div
        className="px-6 py-4 text-white flex items-center gap-3"
        style={{ backgroundColor: color }}
      >
        {icon}
        <h3 className="text-xl font-bold">{category}</h3>
      </div>
      <div className="p-6">
        {items.map((item, index) => (
          <div key={index} className="mb-6 last:mb-0">
            <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              {item.title}
            </h4>
            <p className="text-gray-600 mb-3">{item.description}</p>
            <ul className="space-y-2">
              {item.details.map((detail, detailIndex) => (
                <li
                  key={detailIndex}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="text-white py-16"
        style={{
          background: `linear-gradient(to right, ${colors.primaryBlue}, ${colors.primaryRed})`,
        }}
      >
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Safety Guidelines
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Essential safety protocols for secure item transport between
            Australia and Nepal
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div
            className="rounded-lg p-1 inline-flex gap-1"
            style={{ backgroundColor: colors.primaryBlue }}
          >
            <TabButton
              isActive={activeTab === "senders"}
              onClick={() => setActiveTab("senders")}
              icon={<Package className="w-5 h-5" />}
            >
              For Senders
            </TabButton>
            <TabButton
              isActive={activeTab === "travelers"}
              onClick={() => setActiveTab("travelers")}
              icon={<Plane className="w-5 h-5" />}
            >
              For Travelers
            </TabButton>
          </div>
        </div>

        {/* Guidelines Content */}
        <div className="mb-16">
          {activeTab === "senders" && (
            <div>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Sender Safety Guidelines
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Follow these essential steps to ensure safe and successful
                  item delivery
                </p>
              </div>
              {senderGuidelines.map((section, index) => (
                <GuidelineCard key={index} {...section} />
              ))}
            </div>
          )}

          {activeTab === "travelers" && (
            <div>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Traveler Safety Guidelines
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Essential protocols for safe and legal item transport
                </p>
              </div>
              {travelerGuidelines.map((section, index) => (
                <GuidelineCard key={index} {...section} />
              ))}
            </div>
          )}
        </div>

        {/* Prohibited Items Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Prohibited & Restricted Items
            </h2>
            <p className="text-lg text-gray-600">
              Items that cannot be transported through our platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {prohibitedItems.map((section, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div
                  className="px-6 py-4 text-white flex items-center gap-3"
                  style={{ backgroundColor: section.color }}
                >
                  {section.icon}
                  <h3 className="text-xl font-bold">{section.category}</h3>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {section.items.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="flex items-center gap-3 text-gray-700"
                      >
                        <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Phone className="w-8 h-8 text-red-600" />
            <h2 className="text-2xl font-bold text-red-900">
              Emergency Contacts
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {emergencyContacts.map((contact, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 border border-red-200"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  {contact.country}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Emergency:</span>
                    <span className="font-semibold text-red-600">
                      {contact.emergency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Police:</span>
                    <span className="font-semibold">{contact.police}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customs:</span>
                    <span className="font-semibold">{contact.customs}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
          <div className="flex items-start gap-4">
            <Info className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-blue-900 mb-4">
                Important Legal Notice
              </h3>
              <div className="text-blue-800 space-y-3">
                <p>
                  <strong>Disclaimer:</strong> Nasosend is a platform that
                  connects senders and travelers. We are not responsible for the
                  contents of packages or the actions of users.
                </p>
                <p>
                  <strong>Legal Compliance:</strong> All users must comply with
                  local laws, customs regulations, and airline policies.
                  Violation of these guidelines may result in legal
                  consequences.
                </p>
                <p>
                  <strong>Insurance:</strong> While we provide basic coverage,
                  users are encouraged to obtain additional insurance for
                  high-value items.
                </p>
                <p>
                  <strong>Reporting:</strong> Report any suspicious activity or
                  safety concerns immediately to our support team and local
                  authorities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyGuidelines;
