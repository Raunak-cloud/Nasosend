"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  User,
  Bot,
  Clock,
  CheckCheck,
  AlertCircle,
  Paperclip,
  Smile,
} from "lucide-react";

const LiveChat = ({ isOpen, onToggle, isAvailable }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected"); // disconnected, connecting, connected
  const [supportAgent, setSupportAgent] = useState(null);
  const [chatSession, setChatSession] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Mock support agents
  const supportAgents = [
    {
      id: 1,
      name: "Sarah Wilson",
      avatar:
        "https://ui-avatars.com/api/?name=Sarah+Wilson&background=3b82f6&color=fff",
      status: "online",
    },
    {
      id: 2,
      name: "David Chen",
      avatar:
        "https://ui-avatars.com/api/?name=David+Chen&background=10b981&color=fff",
      status: "online",
    },
    {
      id: 3,
      name: "Maya Patel",
      avatar:
        "https://ui-avatars.com/api/?name=Maya+Patel&background=8b5cf6&color=fff",
      status: "online",
    },
  ];

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Memoized initialize chat function
  const initializeChat = useCallback(() => {
    setConnectionStatus("connecting");

    // Simulate connection delay
    setTimeout(() => {
      const randomAgent =
        supportAgents[Math.floor(Math.random() * supportAgents.length)];
      setSupportAgent(randomAgent);
      setConnectionStatus("connected");
      setChatSession({
        id: `chat_${Date.now()}`,
        startTime: new Date(),
        agent: randomAgent,
      });

      // Add welcome message
      const welcomeMessage = {
        id: Date.now(),
        text: `Hi! I'm ${randomAgent.name} from Nasosend support. How can I help you today?`,
        sender: "agent",
        timestamp: new Date(),
        status: "delivered",
      };
      setMessages([welcomeMessage]);
    }, 2000);
  }, [supportAgents]); // Dependencies for useCallback

  // Initialize chat when opened
  useEffect(() => {
    if (isOpen && !chatSession && isAvailable) {
      initializeChat();
    }
  }, [isOpen, isAvailable, chatSession, initializeChat]);

  const sendMessage = () => {
    if (!currentMessage.trim() || connectionStatus !== "connected") return;

    const userMessage = {
      id: Date.now(),
      text: currentMessage.trim(),
      sender: "user",
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToRespond = currentMessage.trim();
    setCurrentMessage("");

    // Simulate message delivery
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: "delivered" } : msg
        )
      );
    }, 500);

    // Simulate agent typing and response
    setTimeout(() => {
      setIsTyping(true);
    }, 1000);

    setTimeout(() => {
      setIsTyping(false);
      const agentResponse = generateAgentResponse(messageToRespond);
      const responseMessage = {
        id: Date.now() + 1,
        text: agentResponse,
        sender: "agent",
        timestamp: new Date(),
        status: "delivered",
      };
      setMessages((prev) => [...prev, responseMessage]);
    }, 3000);
  };

  const generateAgentResponse = (userMessage) => {
    const message = userMessage.toLowerCase();

    if (message.includes("refund")) {
      return "I can help you with refund requests. Refunds are available if no matches are found within 30 days or if a traveler cancels their flight. Can you provide your booking reference number?";
    }

    if (message.includes("match") || message.includes("traveler")) {
      return "For matching issues, I'll need to check your account details. Are you having trouble finding travelers or is there an issue with a specific match?";
    }

    if (message.includes("payment") || message.includes("token")) {
      return "I can assist with payment and token-related questions. Are you trying to purchase tokens or having issues with a payment?";
    }

    if (message.includes("account") || message.includes("login")) {
      return "I can help with account issues. Are you having trouble logging in or need to update your account information?";
    }

    if (message.includes("verification")) {
      return "For verification issues, I can check the status of your documents. Verification typically takes 24-48 hours. What specific verification issue are you experiencing?";
    }

    if (message.includes("hello") || message.includes("hi")) {
      return "Hello! Thanks for reaching out. What can I help you with today?";
    }

    // Default response
    return "Thank you for your message. Let me look into this for you. Can you provide more details about the specific issue you're experiencing?";
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-AU", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const closeChat = () => {
    setMessages([]);
    setSupportAgent(null);
    setChatSession(null);
    setConnectionStatus("disconnected");
    setIsTyping(false);
    onToggle();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        isMinimized ? "w-80 h-14" : "w-80 h-96"
      }`}
    >
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col h-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {supportAgent ? (
                <Image
                  src={supportAgent.avatar}
                  alt={supportAgent.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
              )}
              {connectionStatus === "connected" && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold">
                {connectionStatus === "connected"
                  ? supportAgent?.name
                  : "Nasosend Support"}
              </h3>
              <p className="text-xs text-blue-100">
                {connectionStatus === "connecting"
                  ? "Connecting..."
                  : connectionStatus === "connected"
                  ? "Online"
                  : "Live Chat"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={closeChat}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Connection Status */}
            {!isAvailable && (
              <div className="bg-red-50 border-b border-red-200 p-3">
                <div className="flex items-center text-red-800">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">
                    Chat is currently offline. Available 9 AM - 10 PM AEDT
                  </span>
                </div>
              </div>
            )}

            {connectionStatus === "connecting" && (
              <div className="bg-yellow-50 border-b border-yellow-200 p-3">
                <div className="flex items-center text-yellow-800">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                  <span className="text-sm">
                    Connecting you with a support agent...
                  </span>
                </div>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {connectionStatus === "disconnected" && isAvailable && (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-sm">
                    Start a conversation with our support team
                  </p>
                  <button
                    onClick={initializeChat}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  >
                    Start Chat
                  </button>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex items-end space-x-2 max-w-xs ${
                      message.sender === "user"
                        ? "flex-row-reverse space-x-reverse"
                        : ""
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full flex-shrink-0">
                      {message.sender === "agent" ? (
                        supportAgent ? (
                          <Image
                            src={supportAgent.avatar}
                            alt={supportAgent.name}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <Bot className="w-3 h-3 text-white" />
                          </div>
                        )
                      ) : (
                        <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div
                      className={`px-3 py-2 rounded-lg ${
                        message.sender === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-900 border"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <div
                        className={`flex items-center justify-between mt-1 ${
                          message.sender === "user"
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        <span className="text-xs">
                          {formatTime(message.timestamp)}
                        </span>
                        {message.sender === "user" && (
                          <div className="ml-2">
                            {message.status === "sending" && (
                              <Clock className="w-3 h-3" />
                            )}
                            {message.status === "delivered" && (
                              <CheckCheck className="w-3 h-3" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-end space-x-2 max-w-xs">
                    <div className="w-6 h-6 rounded-full">
                      {supportAgent && (
                        <Image
                          src={supportAgent.avatar}
                          alt={supportAgent.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      )}
                    </div>
                    <div className="px-3 py-2 bg-white border rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {connectionStatus === "connected" && (
              <div className="border-t p-4">
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <textarea
                      ref={inputRef}
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={1}
                      style={{ minHeight: "38px", maxHeight: "100px" }}
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!currentMessage.trim()}
                    className={`p-2 rounded-lg transition-colors ${
                      currentMessage.trim()
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>Press Enter to send</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Offline Message */}
            {!isAvailable && (
              <div className="border-t p-4 bg-gray-50">
                <p className="text-sm text-gray-600 text-center">
                  Chat is currently offline. Please email us at{" "}
                  <a
                    href="mailto:support@nasosend.com"
                    className="text-blue-600 hover:underline"
                  >
                    support@nasosend.com
                  </a>
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Chat Toggle Button Component
export const ChatToggleButton = ({
  onClick,
  isAvailable,
  hasUnreadMessages,
}) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-4 right-4 w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-40 ${
        isAvailable
          ? "bg-gradient-to-r from-blue-600 to-green-600 text-white"
          : "bg-gray-600 text-gray-300"
      }`}
    >
      <div className="relative flex items-center justify-center w-full h-full">
        <MessageCircle className="w-6 h-6" />
        {isAvailable && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
        )}
        {hasUnreadMessages && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">1</span>
          </div>
        )}
      </div>
    </button>
  );
};

export default LiveChat;
