// components/SupportChatDashboard.js
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { db, storage } from "@/lib/firebase";
import {
  collection,
  doc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  writeBatch,
  getDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import Image from "next/image";
import {
  MessageSquare,
  Send,
  Phone,
  Video,
  MoreVertical,
  Search,
  Filter,
  X,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Paperclip,
  Download,
  Mic,
  FileText,
  Image as ImageIcon,
  Volume2,
  VolumeX,
  Star,
  TrendingUp,
  Users,
  BarChart,
  CheckCheck,
  Check,
  RefreshCw,
} from "lucide-react";

const SupportChatDashboard = ({ agentId, agentProfile }) => {
  // State for chat management
  const [activeSessions, setActiveSessions] = useState([]);
  const [queuedSessions, setQueuedSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [customerTyping, setCustomerTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [agentStatus, setAgentStatus] = useState("online");

  // Statistics
  const [stats, setStats] = useState({
    totalChats: 0,
    avgResponseTime: 0,
    avgRating: 0,
    resolvedToday: 0,
  });

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const audioRef = useRef(null);
  const unsubscribeSessionsRef = useRef(null);
  const unsubscribeMessagesRef = useRef(null);
  const unsubscribeQueueRef = useRef(null);

  // Constants
  const MAX_CONCURRENT_CHATS = 5;
  const TYPING_TIMEOUT = 3000;

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/sounds/notification.mp3");
    audioRef.current.volume = 0.5;
  }, []);

  // Initialize agent status
  useEffect(() => {
    if (!agentId) return;

    const updateAgentStatus = async () => {
      try {
        await updateDoc(doc(db, "supportAgents", agentId), {
          status: agentStatus,
          lastSeen: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error updating agent status:", error);
      }
    };

    updateAgentStatus();
    const interval = setInterval(updateAgentStatus, 60000);

    return () => clearInterval(interval);
  }, [agentId, agentStatus]);

  // Subscribe to active sessions
  useEffect(() => {
    if (!agentId) return;

    const sessionsQuery = query(
      collection(db, "chatSessions"),
      where("agentId", "==", agentId),
      where("status", "==", "active")
    );

    unsubscribeSessionsRef.current = onSnapshot(sessionsQuery, (snapshot) => {
      const sessions = [];
      snapshot.forEach((doc) => {
        sessions.push({ id: doc.id, ...doc.data() });
      });
      setActiveSessions(sessions);

      // Update agent's active chat count
      updateDoc(doc(db, "supportAgents", agentId), {
        activeChats: sessions.length,
      }).catch(console.error);
    });

    return () => {
      if (unsubscribeSessionsRef.current) {
        unsubscribeSessionsRef.current();
      }
    };
  }, [agentId]);

  // Subscribe to queued sessions
  useEffect(() => {
    const queueQuery = query(
      collection(db, "chatQueue"),
      orderBy("priority", "desc"),
      orderBy("createdAt", "asc")
    );

    unsubscribeQueueRef.current = onSnapshot(queueQuery, async (snapshot) => {
      const queue = [];

      for (const queueDoc of snapshot.docs) {
        const queueData = queueDoc.data();

        // Fetch session details
        try {
          const sessionDoc = await getDoc(
            doc(db, "chatSessions", queueData.sessionId)
          );
          if (sessionDoc.exists()) {
            queue.push({
              queueId: queueDoc.id,
              ...queueData,
              session: { id: sessionDoc.id, ...sessionDoc.data() },
            });
          }
        } catch (error) {
          console.error("Error fetching session:", error);
        }
      }

      setQueuedSessions(queue);

      // Play sound for new queue items
      if (queue.length > 0 && soundEnabled) {
        playNotificationSound();
      }
    });

    return () => {
      if (unsubscribeQueueRef.current) {
        unsubscribeQueueRef.current();
      }
    };
  }, [soundEnabled]);

  // Subscribe to messages for selected session
  useEffect(() => {
    if (!selectedSession) {
      setMessages([]);
      return;
    }

    const messagesRef = collection(
      db,
      "chatSessions",
      selectedSession.id,
      "messages"
    );
    const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));

    unsubscribeMessagesRef.current = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = [];
      snapshot.forEach((doc) => {
        newMessages.push({ id: doc.id, ...doc.data() });
      });
      setMessages(newMessages);
      scrollToBottom();

      // Mark agent messages as read
      markMessagesAsRead();
    });

    // Subscribe to customer typing indicator
    const sessionRef = doc(db, "chatSessions", selectedSession.id);
    const unsubscribeSession = onSnapshot(sessionRef, (snapshot) => {
      if (snapshot.exists()) {
        setCustomerTyping(snapshot.data().customerTyping || false);
      }
    });

    return () => {
      if (unsubscribeMessagesRef.current) {
        unsubscribeMessagesRef.current();
      }
      unsubscribeSession();
    };
  }, [selectedSession]);

  // Accept chat from queue
  const acceptChat = useCallback(
    async (queueItem) => {
      if (activeSessions.length >= MAX_CONCURRENT_CHATS) {
        alert(`You already have ${MAX_CONCURRENT_CHATS} active chats`);
        return;
      }

      try {
        const batch = writeBatch(db);

        // Update session
        batch.update(doc(db, "chatSessions", queueItem.sessionId), {
          status: "active",
          agentId: agentId,
          agentName: agentProfile.name,
          startedAt: serverTimestamp(),
        });

        // Remove from queue
        batch.delete(doc(db, "chatQueue", queueItem.queueId));

        await batch.commit();

        // Send greeting message
        await addDoc(
          collection(db, "chatSessions", queueItem.sessionId, "messages"),
          {
            text: `Hello ${queueItem.session.customerName}! I'm Raunak from ${
              agentProfile.department || "Support"
            }. How can I help you today?`,
            senderId: agentId,
            senderName: agentProfile.name,
            senderType: "agent",
            timestamp: serverTimestamp(),
            status: "delivered",
          }
        );

        // Select the chat
        const updatedSession = {
          ...queueItem.session,
          id: queueItem.sessionId,
          status: "active",
          agentId: agentId,
          agentName: agentProfile.name,
        };
        setSelectedSession(updatedSession);

        // Play notification sound
        playNotificationSound();
      } catch (error) {
        console.error("Error accepting chat:", error);
        alert("Failed to accept chat. Please try again.");
      }
    },
    [agentId, agentProfile, activeSessions.length]
  );

  // Send message
  const sendMessage = useCallback(async () => {
    if (!currentMessage.trim() || !selectedSession) return;

    const messageText = currentMessage.trim();
    setCurrentMessage("");

    try {
      await addDoc(
        collection(db, "chatSessions", selectedSession.id, "messages"),
        {
          text: messageText,
          senderId: agentId,
          senderName: agentProfile.name,
          senderType: "agent",
          timestamp: serverTimestamp(),
          status: "delivered",
        }
      );

      // Update session
      await updateDoc(doc(db, "chatSessions", selectedSession.id), {
        lastMessageAt: serverTimestamp(),
        "unreadCount.customer":
          (selectedSession.unreadCount?.customer || 0) + 1,
      });

      stopTyping();
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  }, [currentMessage, selectedSession, agentId, agentProfile]);

  // Handle typing indicator
  const handleTyping = useCallback(async () => {
    if (!selectedSession) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (!isTyping) {
      setIsTyping(true);

      // Update agent typing status
      try {
        const agentRef = doc(db, "supportAgents", agentId);
        const agentDoc = await getDoc(agentRef);
        const currentTyping = agentDoc.data()?.typing || [];

        if (!currentTyping.includes(selectedSession.id)) {
          await updateDoc(agentRef, {
            typing: [...currentTyping, selectedSession.id],
          });
        }
      } catch (error) {
        console.error("Error updating typing status:", error);
      }
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, TYPING_TIMEOUT);
  }, [selectedSession, isTyping, agentId]);

  // Stop typing
  const stopTyping = useCallback(async () => {
    if (!selectedSession || !isTyping) return;

    setIsTyping(false);

    try {
      // Remove from typing array
      const agentRef = doc(db, "supportAgents", agentId);
      const agentDoc = await getDoc(agentRef);
      const currentTyping = agentDoc.data()?.typing || [];

      await updateDoc(agentRef, {
        typing: currentTyping.filter((id) => id !== selectedSession.id),
      });
    } catch (error) {
      console.error("Error stopping typing status:", error);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [selectedSession, isTyping, agentId]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async () => {
    if (!selectedSession) return;

    try {
      await updateDoc(doc(db, "chatSessions", selectedSession.id), {
        "unreadCount.agent": 0,
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }, [selectedSession]);

  // Transfer chat to another agent
  const transferChat = useCallback(
    async (sessionId) => {
      // In a real implementation, you would show a modal to select the target agent
      const targetAgentId = prompt("Enter target agent ID:");
      if (!targetAgentId) return;

      try {
        await updateDoc(doc(db, "chatSessions", sessionId), {
          agentId: targetAgentId,
          transferredAt: serverTimestamp(),
          transferredFrom: agentId,
        });

        // Add system message
        await addDoc(collection(db, "chatSessions", sessionId, "messages"), {
          text: "Chat has been transferred to another agent",
          senderId: "system",
          senderName: "System",
          senderType: "system",
          timestamp: serverTimestamp(),
          status: "delivered",
        });

        // Remove from active sessions
        if (selectedSession?.id === sessionId) {
          setSelectedSession(null);
        }

        alert("Chat transferred successfully");
      } catch (error) {
        console.error("Error transferring chat:", error);
        alert("Failed to transfer chat");
      }
    },
    [agentId, selectedSession]
  );

  // Close chat
  const closeChat = useCallback(
    async (sessionId) => {
      if (!confirm("Are you sure you want to close this chat?")) return;

      try {
        await updateDoc(doc(db, "chatSessions", sessionId), {
          status: "closed",
          closedAt: serverTimestamp(),
          closedBy: agentId,
        });

        // Add system message
        await addDoc(collection(db, "chatSessions", sessionId, "messages"), {
          text: "Chat has been closed by the agent. Thank you for contacting support!",
          senderId: "system",
          senderName: "System",
          senderType: "system",
          timestamp: serverTimestamp(),
          status: "delivered",
        });

        if (selectedSession?.id === sessionId) {
          setSelectedSession(null);
        }

        alert("Chat closed successfully");
      } catch (error) {
        console.error("Error closing chat:", error);
        alert("Failed to close chat");
      }
    },
    [agentId, selectedSession]
  );

  // Handle canned response selection
  const handleCannedResponse = useCallback((response) => {
    setCurrentMessage(response);
    inputRef.current?.focus();
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current
        .play()
        .catch((e) => console.log("Audio play failed:", e));
    }
  }, [soundEnabled]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Format timestamp
  const formatTime = useCallback((timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  // Calculate wait time
  const calculateWaitTime = useCallback((createdAt) => {
    if (!createdAt) return "0 min";
    const created = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const now = new Date();
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "< 1 min";
    if (diffMins === 1) return "1 min";
    return `${diffMins} mins`;
  }, []);

  // Canned responses
  const cannedResponses = [
    "Thank you for contacting Nasosend Support. How can I help you today?",
    "I understand your concern. Let me look into this for you.",
    "Could you please provide more details about the issue you're experiencing?",
    "I've checked your account and here's what I found...",
    "Is there anything else I can help you with today?",
    "Thank you for your patience. The issue has been resolved.",
  ];

  // Filter sessions based on search
  const filteredSessions = activeSessions.filter(
    (s) =>
      s.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[800px] bg-gray-100">
      {/* Sidebar - Chat List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Chat Dashboard</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1 hover:bg-gray-100 rounded"
                title={soundEnabled ? "Mute" : "Unmute"}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>
              <select
                value={agentStatus}
                onChange={(e) => setAgentStatus(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="online">Online</option>
                <option value="away">Away</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {activeSessions.length}
              </p>
              <p className="text-xs text-gray-600">Active Chats</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {queuedSessions.length}
              </p>
              <p className="text-xs text-gray-600">In Queue</p>
            </div>
          </div>
        </div>

        {/* Queue */}
        {queuedSessions.length > 0 && agentStatus === "online" && (
          <div className="p-4 border-b border-gray-200 bg-yellow-50">
            <h3 className="font-semibold mb-2 text-sm">Waiting Queue</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {queuedSessions.slice(0, 3).map((item) => (
                <div
                  key={item.queueId}
                  className="flex items-center justify-between p-2 bg-white rounded border"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.session.customerName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Waiting {calculateWaitTime(item.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => acceptChat(item)}
                    disabled={activeSessions.length >= MAX_CONCURRENT_CHATS}
                    className={`px-3 py-1 text-xs rounded ${
                      activeSessions.length >= MAX_CONCURRENT_CHATS
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    Accept
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Chats */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold mb-2 text-sm">Active Chats</h3>
            <div className="space-y-2">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedSession?.id === session.id
                      ? "bg-blue-100 border-blue-500"
                      : "hover:bg-gray-50 border-transparent"
                  } border`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {session.customerName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session.customerEmail}
                      </p>
                    </div>
                    {session.unreadCount?.agent > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {session.unreadCount.agent}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-400">
                      {formatTime(session.lastMessageAt)}
                    </p>
                    {session.priority === "high" && (
                      <AlertCircle className="w-3 h-3 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
              {filteredSessions.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-4">
                  No active chats
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedSession ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedSession.customerName?.charAt(0).toUpperCase() ||
                      "U"}
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {selectedSession.customerName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedSession.customerEmail}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => transferChat(selectedSession.id)}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Transfer Chat"
                  >
                    <Users className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => closeChat(selectedSession.id)}
                    className="p-2 hover:bg-gray-100 rounded text-red-500"
                    title="Close Chat"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderType === "agent"
                        ? "justify-end"
                        : message.senderType === "system"
                        ? "justify-center"
                        : "justify-start"
                    }`}
                  >
                    {message.senderType === "system" ? (
                      <div className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs">
                        {message.text}
                      </div>
                    ) : (
                      <div
                        className={`max-w-md ${
                          message.senderType === "agent"
                            ? "bg-blue-600 text-white"
                            : "bg-white border border-gray-200"
                        } rounded-lg p-3`}
                      >
                        <p className="text-sm">{message.text}</p>

                        {/* Attachments */}
                        {message.attachments?.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.attachments.map((attachment, idx) => (
                              <a
                                key={idx}
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center space-x-2 text-xs ${
                                  message.senderType === "agent"
                                    ? "text-blue-100 hover:text-white"
                                    : "text-blue-600 hover:text-blue-800"
                                } underline`}
                              >
                                {attachment.type?.startsWith("image/") ? (
                                  <ImageIcon className="w-4 h-4" />
                                ) : attachment.type?.startsWith("audio/") ? (
                                  <Mic className="w-4 h-4" />
                                ) : (
                                  <FileText className="w-4 h-4" />
                                )}
                                <span>{attachment.name}</span>
                              </a>
                            ))}
                          </div>
                        )}

                        <p
                          className={`text-xs mt-1 ${
                            message.senderType === "agent"
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Customer Typing Indicator */}
                {customerTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
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
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Canned Responses */}
            <div className="bg-white border-t border-gray-200 p-2">
              <div className="flex items-center space-x-2 overflow-x-auto">
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  Quick:
                </span>
                {cannedResponses.slice(0, 3).map((response, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCannedResponse(response)}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs whitespace-nowrap"
                  >
                    {response.substring(0, 30)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-end space-x-2">
                <textarea
                  ref={inputRef}
                  value={currentMessage}
                  onChange={(e) => {
                    setCurrentMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
                <button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim()}
                  className={`px-4 py-2 rounded-lg ${
                    currentMessage.trim()
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Select a chat to start
              </h3>
              <p className="text-sm text-gray-500">
                Choose an active chat from the sidebar or accept a new one from
                the queue
              </p>
              {queuedSessions.length > 0 && (
                <p className="text-sm text-yellow-600 mt-4">
                  {queuedSessions.length} customer(s) waiting in queue
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportChatDashboard;
