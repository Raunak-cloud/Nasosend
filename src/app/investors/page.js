"use client";
import React, { useState } from "react";
import {
  TrendingUp,
  Users,
  Globe,
  DollarSign,
  Calendar,
  Mail,
  X,
  CheckCircle,
  Building,
  Rocket,
  Send,
} from "lucide-react";

const Investors = () => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    company: "",
    investmentSize: "",
    message: "",
  });
  const [meetingForm, setMeetingForm] = useState({
    name: "",
    email: "",
    company: "",
    preferredDate: "",
    preferredTime: "",
    message: "",
  });

  const colors = {
    primaryRed: "#DC143C",
    primaryBlue: "#003366",
    successGreen: "#10B981",
    white: "#FFFFFF",
    lightGray: "#F9FAFB",
  };

  const highlights = [
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Growing Market",
      description:
        "Expanding cross-border shipping platform connecting Australia & Nepal",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Strong User Interest",
      description:
        "Growing community of travelers and senders joining the platform",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Proven Concept",
      description:
        "Validated business model ready for market launch and scaling",
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Expansion Ready",
      description:
        "Prepared to scale to additional country corridors with funding",
    },
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    console.log("Contact form submitted:", contactForm);
    setShowContactModal(false);
    setContactForm({
      name: "",
      email: "",
      company: "",
      investmentSize: "",
      message: "",
    });
    setShowSuccessModal(true);
  };

  const handleMeetingSubmit = (e) => {
    e.preventDefault();
    console.log("Meeting scheduled:", meetingForm);
    setShowScheduleModal(false);
    setMeetingForm({
      name: "",
      email: "",
      company: "",
      preferredDate: "",
      preferredTime: "",
      message: "",
    });
    setShowSuccessModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="text-white py-20"
        style={{
          background: `linear-gradient(135deg, ${colors.primaryBlue} 0%, ${colors.primaryRed} 100%)`,
        }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Investment Opportunity
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto mb-8">
            Join us in building the future of cross-border peer-to-peer
            shipping. We're seeking strategic investors to help us launch and
            scale our innovative platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-900 transition-colors"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Schedule Meeting
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Why Nasosend */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Why Nasosend?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're building an innovative peer-to-peer platform that connects
            travelers with people who need items delivered internationally,
            starting with the Australia-Nepal corridor.
          </p>
        </div>

        {/* Highlights Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {highlights.map((highlight, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white"
                style={{ backgroundColor: colors.primaryBlue }}
              >
                {highlight.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {highlight.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {highlight.description}
              </p>
            </div>
          ))}
        </div>

        {/* Investment Opportunity */}
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <Building className="w-16 h-16 text-blue-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Invest in Innovation?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            We're looking for strategic investors who share our vision of making
            cross-border shipping more accessible and efficient. Help us bring
            this innovative solution to market.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={() => setShowContactModal(true)}
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-red-600 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg"
            >
              <Mail className="w-5 h-5 inline mr-2" />
              Contact Investment Team
            </button>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-10 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold text-lg hover:border-blue-600 hover:text-blue-600 transition-colors"
            >
              <Calendar className="w-5 h-5 inline mr-2" />
              Schedule a Meeting
            </button>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Investment Inquiry
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company/Fund
                </label>
                <input
                  type="text"
                  value={contactForm.company}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, company: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your company or investment fund"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Investment Interest
                </label>
                <select
                  value={contactForm.investmentSize}
                  onChange={(e) =>
                    setContactForm({
                      ...contactForm,
                      investmentSize: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select investment range</option>
                  <option value="<100K">Less than $100K</option>
                  <option value="100K-500K">$100K - $500K</option>
                  <option value="500K-1M">$500K - $1M</option>
                  <option value="1M+">$1M+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, message: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Tell us about your investment interest and any questions you have..."
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowContactModal(false)}
                className="flex-1 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleContactSubmit}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Schedule Meeting
              </h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={meetingForm.name}
                  onChange={(e) =>
                    setMeetingForm({ ...meetingForm, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={meetingForm.email}
                  onChange={(e) =>
                    setMeetingForm({ ...meetingForm, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company/Fund
                </label>
                <input
                  type="text"
                  value={meetingForm.company}
                  onChange={(e) =>
                    setMeetingForm({ ...meetingForm, company: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your company or investment fund"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={meetingForm.preferredDate}
                    onChange={(e) =>
                      setMeetingForm({
                        ...meetingForm,
                        preferredDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Time
                  </label>
                  <select
                    value={meetingForm.preferredTime}
                    onChange={(e) =>
                      setMeetingForm({
                        ...meetingForm,
                        preferredTime: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select time</option>
                    <option value="9:00 AM">9:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="1:00 PM">1:00 PM</option>
                    <option value="2:00 PM">2:00 PM</option>
                    <option value="3:00 PM">3:00 PM</option>
                    <option value="4:00 PM">4:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={meetingForm.message}
                  onChange={(e) =>
                    setMeetingForm({ ...meetingForm, message: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Briefly describe what you'd like to discuss in the meeting..."
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMeetingSubmit}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Meeting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Thank You!
            </h3>
            <p className="text-gray-600 mb-6">
              We've received your request and will get back to you within 24
              hours.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Investors;
