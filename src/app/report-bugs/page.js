//app/report-bugs/page.js
"use client";
import React, { useState } from "react";
import {
  Bug,
  AlertTriangle,
  CheckCircle,
  Upload,
  X,
  Camera,
  Monitor,
  Smartphone,
  Chrome,
  Globe,
  Info,
  Send,
  Clock,
  User,
  MessageSquare,
  Image,
  FileText,
  Zap,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";

const ReportBugs = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    stepsToReproduce: "",
    expectedBehavior: "",
    actualBehavior: "",
    bugType: "",
    severity: "",
    browser: "",
    device: "",
    operatingSystem: "",
    screenResolution: "",
    userEmail: "",
    page: "",
    attachments: [],
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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

  const bugTypes = [
    {
      value: "ui",
      label: "User Interface (UI)",
      icon: <Monitor className="w-4 h-4" />,
    },
    {
      value: "functionality",
      label: "Functionality Issue",
      icon: <Zap className="w-4 h-4" />,
    },
    {
      value: "performance",
      label: "Performance Problem",
      icon: <RefreshCw className="w-4 h-4" />,
    },
    {
      value: "security",
      label: "Security Concern",
      icon: <ShieldAlert className="w-4 h-4" />,
    },
    {
      value: "data",
      label: "Data Issue",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      value: "mobile",
      label: "Mobile Specific",
      icon: <Smartphone className="w-4 h-4" />,
    },
    { value: "other", label: "Other", icon: <Bug className="w-4 h-4" /> },
  ];

  const severityLevels = [
    {
      value: "critical",
      label: "Critical",
      description: "App crashes or major features unusable",
      color: "#EF4444",
      icon: <AlertTriangle className="w-4 h-4" />,
    },
    {
      value: "high",
      label: "High",
      description: "Important features affected",
      color: "#F59E0B",
      icon: <AlertTriangle className="w-4 h-4" />,
    },
    {
      value: "medium",
      label: "Medium",
      description: "Some features affected, workaround available",
      color: "#3B82F6",
      icon: <Info className="w-4 h-4" />,
    },
    {
      value: "low",
      label: "Low",
      description: "Minor issue or cosmetic problem",
      color: "#10B981",
      icon: <Info className="w-4 h-4" />,
    },
  ];

  const browsers = [
    {
      value: "chrome",
      label: "Google Chrome",
      icon: <Chrome className="w-4 h-4" />,
    },
    {
      value: "firefox",
      label: "Mozilla Firefox",
      icon: <Globe className="w-4 h-4" />,
    },
    { value: "safari", label: "Safari", icon: <Globe className="w-4 h-4" /> },
    {
      value: "edge",
      label: "Microsoft Edge",
      icon: <Globe className="w-4 h-4" />,
    },
    { value: "other", label: "Other", icon: <Globe className="w-4 h-4" /> },
  ];

  const devices = [
    "Desktop/Laptop",
    "Mobile Phone",
    "Tablet",
    "Smart TV",
    "Other",
  ];

  const operatingSystems = [
    "Windows 11",
    "Windows 10",
    "macOS",
    "Linux",
    "iOS",
    "Android",
    "Other",
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = (files) => {
    const validFiles = Array.from(files).filter((file) => {
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "video/mp4",
        "video/webm",
      ];
      const maxSize = 10 * 1024 * 1024; // 10MB
      return validTypes.includes(file.type) && file.size <= maxSize;
    });

    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles].slice(0, 5), // Max 5 files
    }));
  };

  const removeAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const detectSystemInfo = () => {
    const userAgent = navigator.userAgent;
    let browser = "Unknown";
    let os = "Unknown";

    // Detect browser
    if (userAgent.includes("Chrome")) browser = "chrome";
    else if (userAgent.includes("Firefox")) browser = "firefox";
    else if (userAgent.includes("Safari")) browser = "safari";
    else if (userAgent.includes("Edge")) browser = "edge";

    // Detect OS
    if (userAgent.includes("Windows")) os = "Windows";
    else if (userAgent.includes("Mac")) os = "macOS";
    else if (userAgent.includes("Linux")) os = "Linux";
    else if (userAgent.includes("iPhone") || userAgent.includes("iPad"))
      os = "iOS";
    else if (userAgent.includes("Android")) os = "Android";

    const screenRes = `${screen.width}x${screen.height}`;

    setFormData((prev) => ({
      ...prev,
      browser: browser,
      operatingSystem: os,
      screenResolution: screenRes,
      device: userAgent.includes("Mobile") ? "Mobile Phone" : "Desktop/Laptop",
    }));
  };

  const validateForm = () => {
    const required = ["title", "description", "bugType", "severity"];
    return required.every((field) => formData[field].trim() !== "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Bug report submitted:", formData);
      setShowSuccessModal(true);

      // Reset form
      setFormData({
        title: "",
        description: "",
        stepsToReproduce: "",
        expectedBehavior: "",
        actualBehavior: "",
        bugType: "",
        severity: "",
        browser: "",
        device: "",
        operatingSystem: "",
        screenResolution: "",
        userEmail: "",
        page: "",
        attachments: [],
      });
    } catch (error) {
      console.error("Error submitting bug report:", error);
      alert("Failed to submit bug report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    detectSystemInfo();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="text-white py-16"
        style={{
          background: `linear-gradient(to right, ${colors.primaryBlue}, ${colors.primaryRed})`,
        }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Bug className="w-12 h-12 mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold">Report a Bug</h1>
          </div>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Help us improve Nasosend by reporting any issues you encounter. Your
            feedback is valuable!
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div onSubmit={handleSubmit} className="space-y-8">
          {/* Bug Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <MessageSquare className="w-6 h-6 mr-2 text-blue-600" />
              Bug Information
            </h2>

            <div className="space-y-6">
              {/* Bug Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bug Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of the bug (e.g., 'Login button not working')"
                  required
                />
              </div>

              {/* Bug Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Bug Type *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {bugTypes.map((type) => (
                    <label
                      key={type.value}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.bugType === type.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="bugType"
                        value={type.value}
                        checked={formData.bugType === type.value}
                        onChange={(e) =>
                          handleInputChange("bugType", e.target.value)
                        }
                        className="sr-only"
                      />
                      {type.icon}
                      <span className="ml-2 text-sm font-medium">
                        {type.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Severity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Severity Level *
                </label>
                <div className="space-y-3">
                  {severityLevels.map((severity) => (
                    <label
                      key={severity.value}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.severity === severity.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="severity"
                        value={severity.value}
                        checked={formData.severity === severity.value}
                        onChange={(e) =>
                          handleInputChange("severity", e.target.value)
                        }
                        className="sr-only"
                      />
                      <div
                        className="w-4 h-4 rounded-full mr-3 flex items-center justify-center"
                        style={{ backgroundColor: severity.color }}
                      >
                        {React.cloneElement(severity.icon, {
                          className: "w-3 h-3 text-white",
                        })}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {severity.label}
                        </div>
                        <div className="text-sm text-gray-600">
                          {severity.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Page/Feature */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page/Feature Where Bug Occurred
                </label>
                <input
                  type="text"
                  value={formData.page}
                  onChange={(e) => handleInputChange("page", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Dashboard, Login page, Trip creation"
                />
              </div>
            </div>
          </div>

          {/* Detailed Description */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-green-600" />
              Detailed Description
            </h2>

            <div className="space-y-6">
              {/* Bug Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bug Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                  placeholder="Describe the bug in detail. What went wrong?"
                  required
                />
              </div>

              {/* Steps to Reproduce */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Steps to Reproduce
                </label>
                <textarea
                  value={formData.stepsToReproduce}
                  onChange={(e) =>
                    handleInputChange("stepsToReproduce", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                  placeholder="1. Go to...&#10;2. Click on...&#10;3. Enter...&#10;4. See error"
                />
              </div>

              {/* Expected vs Actual Behavior */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Behavior
                  </label>
                  <textarea
                    value={formData.expectedBehavior}
                    onChange={(e) =>
                      handleInputChange("expectedBehavior", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="What should have happened?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Actual Behavior
                  </label>
                  <textarea
                    value={formData.actualBehavior}
                    onChange={(e) =>
                      handleInputChange("actualBehavior", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="What actually happened?"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Monitor className="w-6 h-6 mr-2 text-purple-600" />
              System Information
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Browser */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Browser
                </label>
                <div className="space-y-2">
                  {browsers.map((browser) => (
                    <label
                      key={browser.value}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.browser === browser.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="browser"
                        value={browser.value}
                        checked={formData.browser === browser.value}
                        onChange={(e) =>
                          handleInputChange("browser", e.target.value)
                        }
                        className="sr-only"
                      />
                      {browser.icon}
                      <span className="ml-2 text-sm">{browser.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Device */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Device Type
                </label>
                <select
                  value={formData.device}
                  onChange={(e) => handleInputChange("device", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select device type</option>
                  {devices.map((device) => (
                    <option key={device} value={device}>
                      {device}
                    </option>
                  ))}
                </select>
              </div>

              {/* Operating System */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operating System
                </label>
                <select
                  value={formData.operatingSystem}
                  onChange={(e) =>
                    handleInputChange("operatingSystem", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select OS</option>
                  {operatingSystems.map((os) => (
                    <option key={os} value={os}>
                      {os}
                    </option>
                  ))}
                </select>
              </div>

              {/* Screen Resolution */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Screen Resolution
                </label>
                <input
                  type="text"
                  value={formData.screenResolution}
                  onChange={(e) =>
                    handleInputChange("screenResolution", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 1920x1080"
                />
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Image className="w-6 h-6 mr-2 text-orange-600" />
              Attachments (Optional)
            </h2>

            <div className="space-y-4">
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Screenshots, videos, or other files that help explain the bug
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Files
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Max 5 files, 10MB each. Supported: JPG, PNG, GIF, WebP, MP4,
                  WebM
                </p>
              </div>

              {/* Uploaded Files */}
              {formData.attachments.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">
                    Uploaded Files:
                  </h3>
                  {formData.attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-700">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <User className="w-6 h-6 mr-2 text-indigo-600" />
              Contact Information
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={formData.userEmail}
                onChange={(e) => handleInputChange("userEmail", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
              />
              <p className="text-sm text-gray-600 mt-2">
                Provide your email if you'd like us to follow up with you about
                this bug report.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting || !validateForm()}
              className={`flex items-center px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 ${
                isSubmitting || !validateForm()
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-red-600 text-white hover:from-blue-700 hover:to-red-700 shadow-lg"
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Bug Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Bug Report Submitted!
              </h3>
              <p className="text-gray-600 mb-6">
                Thank you for helping us improve Nasosend. We've received your
                bug report and will investigate it promptly.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center text-blue-800">
                  <Clock className="w-5 h-5 mr-2" />
                  <span className="font-medium">
                    Reference ID: BUG-{Date.now()}
                  </span>
                </div>
                <p className="text-blue-700 text-sm mt-2">
                  Save this reference ID for future correspondence.
                </p>
              </div>
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
    </div>
  );
};

export default ReportBugs;
