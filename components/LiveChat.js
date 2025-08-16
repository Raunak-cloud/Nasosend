// components/LiveChat.js
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { db, storage } from "@/lib/firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  where,
  limit,
  writeBatch,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  MessageCircle,
  Check,
  X,
  Send,
  Mic,
  Minimize2,
  Clock,
  CheckCheck,
  Paperclip,
  Smile,
  RefreshCw,
  Image as ImageIcon,
  FileText,
} from "lucide-react";

const LiveChat = ({ userId, userName, userEmail }) => {
  // Core state
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [chatSession, setChatSession] = useState(null);
  const [supportAgent, setSupportAgent] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  // Enhanced state
  const [queuePosition, setQueuePosition] = useState(0);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(0);
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const unsubscribeMessagesRef = useRef(null);
  const unsubscribeSessionRef = useRef(null);
  const unsubscribeQueueRef = useRef(null);

  // Constants
  const MAX_MESSAGE_LENGTH = 1000;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const TYPING_TIMEOUT = 3000;

  const emojis = ["😊", "😂", "❤️", "👍", "👎", "🙏", "🎉", "😢", "😡", "🤔"];

  // Listen for custom event to open chat
  useEffect(() => {
    const handleOpenChat = () => {
      console.log("LiveChat: openLiveChat event received");
      setIsOpen(true);
      localStorage.setItem("liveChatOpen", "true");
    };

    // Add event listener
    window.addEventListener("openLiveChat", handleOpenChat);
    console.log("LiveChat: Event listener added");

    // Check localStorage on mount
    const checkStorage = () => {
      const wasOpen = localStorage.getItem("liveChatOpen");
      console.log("LiveChat: Checking localStorage, wasOpen:", wasOpen);
      if (wasOpen === "true") {
        setIsOpen(true);
      }
    };

    // Check immediately
    checkStorage();

    // Also check after a small delay (for hydration issues)
    setTimeout(checkStorage, 100);

    return () => {
      window.removeEventListener("openLiveChat", handleOpenChat);
      console.log("LiveChat: Event listener removed");
    };
  }, []);

  // Initialize or restore chat session
  const initializeChat = useCallback(async () => {
    if (!userId) return;

    setConnectionStatus("connecting");

    try {
      // Check for existing active session
      const sessionsQuery = query(
        collection(db, "chatSessions"),
        where("customerId", "==", userId),
        where("status", "in", ["waiting", "active"]),
        limit(1)
      );

      const sessionSnapshot = await getDocs(sessionsQuery);

      if (!sessionSnapshot.empty) {
        // Restore existing session
        const existingSession = sessionSnapshot.docs[0];
        setSessionId(existingSession.id);
        setChatSession(existingSession.data());

        if (
          existingSession.data().status === "active" &&
          existingSession.data().agentId
        ) {
          // Fetch agent details
          const agentDoc = await getDoc(
            doc(db, "supportAgents", existingSession.data().agentId)
          );
          if (agentDoc.exists()) {
            setSupportAgent(agentDoc.data());
          }
        }

        setConnectionStatus("connected");
      } else {
        // Create new session
        const newSession = {
          customerId: userId,
          customerName: userName || "Guest",
          customerEmail: userEmail || "",
          agentId: null,
          agentName: null,
          status: "waiting",
          department: "general",
          priority: "normal",
          createdAt: serverTimestamp(),
          lastMessageAt: serverTimestamp(),
          unreadCount: { customer: 0, agent: 0 },
        };

        const sessionRef = await addDoc(
          collection(db, "chatSessions"),
          newSession
        );
        setSessionId(sessionRef.id);
        setChatSession(newSession);

        // Add to queue
        await addDoc(collection(db, "chatQueue"), {
          sessionId: sessionRef.id,
          customerId: userId,
          priority: "normal",
          department: "general",
          createdAt: serverTimestamp(),
        });

        // Send initial system message
        await addDoc(
          collection(db, "chatSessions", sessionRef.id, "messages"),
          {
            text: "Welcome to Nasosend Support! You're being connected to the next available agent.",
            senderId: "system",
            senderName: "System",
            senderType: "system",
            timestamp: serverTimestamp(),
            status: "delivered",
          }
        );

        setConnectionStatus("connected");
      }
    } catch (error) {
      console.error("Error initializing chat:", error);
      setConnectionStatus("failed");
    }
  }, [userId, userName, userEmail]);

  // Subscribe to chat session updates
  useEffect(() => {
    if (!sessionId) return;

    const sessionRef = doc(db, "chatSessions", sessionId);

    unsubscribeSessionRef.current = onSnapshot(sessionRef, (snapshot) => {
      if (snapshot.exists()) {
        const sessionData = snapshot.data();
        setChatSession(sessionData);

        // Check if agent joined
        if (
          sessionData.status === "active" &&
          sessionData.agentId &&
          !supportAgent
        ) {
          // Fetch agent details
          getDoc(doc(db, "supportAgents", sessionData.agentId)).then(
            (agentDoc) => {
              if (agentDoc.exists()) {
                setSupportAgent(agentDoc.data());
              }
            }
          );
        }

        // Update unread count
        setUnreadCount(sessionData.unreadCount?.customer || 0);
      }
    });

    return () => {
      if (unsubscribeSessionRef.current) {
        unsubscribeSessionRef.current();
      }
    };
  }, [sessionId, supportAgent]);

  // Subscribe to messages
  useEffect(() => {
    if (!sessionId) return;

    const messagesRef = collection(db, "chatSessions", sessionId, "messages");
    const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));

    unsubscribeMessagesRef.current = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = [];
      let hasNewAgentMessage = false;

      snapshot.forEach((doc) => {
        const message = { id: doc.id, ...doc.data() };
        newMessages.push(message);

        // Check for new agent messages
        if (message.senderType === "agent" && !message.read) {
          hasNewAgentMessage = true;
        }
      });

      setMessages(newMessages);

      // Mark messages as read if chat is open
      if (isOpen && hasNewAgentMessage) {
        markMessagesAsRead();
      }

      scrollToBottom();
    });

    return () => {
      if (unsubscribeMessagesRef.current) {
        unsubscribeMessagesRef.current();
      }
    };
  }, [sessionId, isOpen]);

  // Subscribe to queue position
  useEffect(() => {
    if (!sessionId || chatSession?.status !== "waiting") return;

    const queueRef = collection(db, "chatQueue");
    const queueQuery = query(queueRef, orderBy("createdAt", "asc"));

    unsubscribeQueueRef.current = onSnapshot(queueQuery, (snapshot) => {
      let position = 0;
      snapshot.forEach((doc) => {
        position++;
        if (doc.data().sessionId === sessionId) {
          setQueuePosition(position);
          setEstimatedWaitTime(position * 2); // 2 minutes per position
        }
      });
    });

    return () => {
      if (unsubscribeQueueRef.current) {
        unsubscribeQueueRef.current();
      }
    };
  }, [sessionId, chatSession?.status]);

  // Subscribe to agent typing indicator
  useEffect(() => {
    if (!sessionId || !chatSession?.agentId) return;

    const agentRef = doc(db, "supportAgents", chatSession.agentId);

    const unsubscribe = onSnapshot(agentRef, (snapshot) => {
      if (snapshot.exists()) {
        const agentData = snapshot.data();
        setAgentTyping(agentData.typing?.includes(sessionId) || false);
      }
    });

    return () => unsubscribe();
  }, [sessionId, chatSession?.agentId]);

  // Send message
  const sendMessage = useCallback(async () => {
    if (!currentMessage.trim() || !sessionId) return;

    const messageText = currentMessage.trim();
    setCurrentMessage("");

    try {
      // Add message to Firestore
      await addDoc(collection(db, "chatSessions", sessionId, "messages"), {
        text: messageText,
        senderId: userId,
        senderName: userName || "Customer",
        senderType: "customer",
        timestamp: serverTimestamp(),
        status: "sent",
        attachments: attachments.map((a) => ({
          url: a.url,
          name: a.name,
          type: a.type,
          size: a.size,
        })),
      });

      // Update session last message time
      await updateDoc(doc(db, "chatSessions", sessionId), {
        lastMessageAt: serverTimestamp(),
        "unreadCount.agent": (chatSession?.unreadCount?.agent || 0) + 1,
      });

      // Clear attachments after sending
      setAttachments([]);

      // Stop typing indicator
      stopTyping();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }, [currentMessage, sessionId, userId, userName, attachments, chatSession]);

  // Handle typing indicator
  const handleTyping = useCallback(async () => {
    if (!sessionId) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set typing status
    if (!isTyping) {
      setIsTyping(true);
      await updateDoc(doc(db, "chatSessions", sessionId), {
        customerTyping: true,
      });
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, TYPING_TIMEOUT);
  }, [sessionId, isTyping]);

  // Stop typing indicator
  const stopTyping = useCallback(async () => {
    if (!sessionId || !isTyping) return;

    setIsTyping(false);
    await updateDoc(doc(db, "chatSessions", sessionId), {
      customerTyping: false,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [sessionId, isTyping]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async () => {
    if (!sessionId) return;

    try {
      const batch = writeBatch(db);

      // Update unread count
      batch.update(doc(db, "chatSessions", sessionId), {
        "unreadCount.customer": 0,
      });

      await batch.commit();
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }, [sessionId]);

  // Handle file upload
  const handleFileUpload = useCallback(
    async (event) => {
      const files = Array.from(event.target.files);

      for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
          alert(`File ${file.name} exceeds 10MB limit`);
          continue;
        }

        setIsUploading(true);

        try {
          // Upload to Firebase Storage
          const storageRef = ref(
            storage,
            `chat-attachments/${sessionId}/${Date.now()}_${file.name}`
          );
          const snapshot = await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);

          setAttachments((prev) => [
            ...prev,
            {
              id: Date.now(),
              url: downloadURL,
              name: file.name,
              type: file.type,
              size: file.size,
            },
          ]);
        } catch (error) {
          console.error("Error uploading file:", error);
          alert("Failed to upload file");
        } finally {
          setIsUploading(false);
        }
      }
    },
    [sessionId]
  );

  // Handle emoji selection
  const handleEmojiSelect = useCallback((emoji) => {
    setCurrentMessage((prev) => prev + emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  }, []);

  // Close chat
  const closeChat = useCallback(async () => {
    // Clear localStorage
    localStorage.removeItem("liveChatOpen");

    if (sessionId && chatSession?.status === "active") {
      // Show rating modal
    } else {
      // Clean up
      if (unsubscribeMessagesRef.current) unsubscribeMessagesRef.current();
      if (unsubscribeSessionRef.current) unsubscribeSessionRef.current();
      if (unsubscribeQueueRef.current) unsubscribeQueueRef.current();

      setIsOpen(false);
      setMessages([]);
      setSessionId(null);
      setChatSession(null);
      setSupportAgent(null);
    }
  }, [sessionId, chatSession]);

  // Auto-scroll to bottom
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

  // Initialize chat when opened
  useEffect(() => {
    if (isOpen && !sessionId) {
      initializeChat();
    }
  }, [isOpen, sessionId, initializeChat]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      markMessagesAsRead();
    }
  }, [isOpen, unreadCount, markMessagesAsRead]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeMessagesRef.current) unsubscribeMessagesRef.current();
      if (unsubscribeSessionRef.current) unsubscribeSessionRef.current();
      if (unsubscribeQueueRef.current) unsubscribeQueueRef.current();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          localStorage.setItem("liveChatOpen", "true");
        }}
        className={`fixed bottom-4 right-4 w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-40 ${
          unreadCount > 0 ? "animate-pulse" : ""
        } bg-gradient-to-r from-blue-600 to-green-600 text-white`}
        style={{ display: isOpen ? "none" : "flex" }}
      >
        <div className="relative flex items-center justify-center w-full h-full">
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </div>
          )}
        </div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
            isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
          }`}
        >
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col h-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {supportAgent ? (
                      <Image
                        src={
                          supportAgent.avatar ||
                          `https://ui-avatars.com/api/?name=${supportAgent.name}&background=ffffff&color=000000`
                        }
                        alt={supportAgent.name}
                        width={40}
                        height={40}
                        className="rounded-full border-2 border-white"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                    )}
                    {chatSession?.status === "active" && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {supportAgent ? supportAgent.name : "Nasosend Support"}
                    </h3>
                    <p className="text-xs text-blue-100">
                      {chatSession?.status === "waiting"
                        ? `Queue position: ${queuePosition} • Wait time: ~${estimatedWaitTime} min`
                        : chatSession?.status === "active"
                        ? "Online - We typically reply in seconds"
                        : "Connecting..."}
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
            </div>

            {!isMinimized && (
              <>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderType === "customer"
                          ? "justify-end"
                          : message.senderType === "system"
                          ? "justify-center"
                          : "justify-start"
                      }`}
                    >
                      {message.senderType === "system" ? (
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">
                          {message.text}
                        </div>
                      ) : (
                        <div
                          className={`flex items-end space-x-2 max-w-[70%] ${
                            message.senderType === "customer"
                              ? "flex-row-reverse space-x-reverse"
                              : ""
                          }`}
                        >
                          {message.senderType === "agent" && (
                            <Image
                              src={
                                supportAgent?.avatar ||
                                `https://ui-avatars.com/api/?name=${message.senderName}&background=3b82f6&color=ffffff`
                              }
                              alt={message.senderName}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                          )}
                          <div
                            className={`px-4 py-2 rounded-lg ${
                              message.senderType === "customer"
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-900 border"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.text}
                            </p>

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
                                      message.senderType === "customer"
                                        ? "text-blue-100 hover:text-white"
                                        : "text-blue-600 hover:text-blue-800"
                                    }`}
                                  >
                                    {attachment.type?.startsWith("image/") ? (
                                      <ImageIcon className="w-4 h-4" />
                                    ) : attachment.type?.startsWith(
                                        "audio/"
                                      ) ? (
                                      <Mic className="w-4 h-4" />
                                    ) : (
                                      <FileText className="w-4 h-4" />
                                    )}
                                    <span className="truncate underline">
                                      {attachment.name}
                                    </span>
                                  </a>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-1">
                              <span
                                className={`text-xs ${
                                  message.senderType === "customer"
                                    ? "text-blue-100"
                                    : "text-gray-500"
                                }`}
                              >
                                {formatTime(message.timestamp)}
                              </span>
                              {message.senderType === "customer" && (
                                <span className="ml-2">
                                  {message.status === "sent" ? (
                                    <Check className="w-3 h-3" />
                                  ) : message.status === "delivered" ? (
                                    <CheckCheck className="w-3 h-3" />
                                  ) : message.status === "read" ? (
                                    <CheckCheck className="w-3 h-3 text-blue-200" />
                                  ) : (
                                    <Clock className="w-3 h-3" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {agentTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-end space-x-2 max-w-[70%]">
                        <Image
                          src={
                            supportAgent?.avatar ||
                            `https://ui-avatars.com/api/?name=Agent&background=3b82f6&color=ffffff`
                          }
                          alt="Agent"
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <div className="px-4 py-2 bg-white border rounded-lg">
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
                <div className="border-t p-4 bg-white">
                  {/* Attachments Preview */}
                  {attachments.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2 text-sm"
                        >
                          <Paperclip className="w-4 h-4 text-gray-500" />
                          <span className="truncate max-w-[150px]">
                            {attachment.name}
                          </span>
                          <button
                            onClick={() =>
                              setAttachments((prev) =>
                                prev.filter((a) => a.id !== attachment.id)
                              )
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Emoji Picker */}
                  {showEmoji && (
                    <div className="absolute bottom-20 right-4 bg-white border rounded-lg shadow-lg p-2">
                      <div className="grid grid-cols-5 gap-2">
                        {emojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleEmojiSelect(emoji)}
                            className="text-2xl hover:bg-gray-100 rounded p-1"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={1}
                        style={{ minHeight: "38px", maxHeight: "100px" }}
                        maxLength={MAX_MESSAGE_LENGTH}
                        disabled={chatSession?.status === "closed"}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-1">
                      {/* File Upload */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*,application/pdf,.doc,.docx"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {isUploading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Paperclip className="w-4 h-4" />
                        )}
                      </button>

                      {/* Emoji */}
                      <button
                        onClick={() => setShowEmoji(!showEmoji)}
                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <Smile className="w-4 h-4" />
                      </button>

                      {/* Send */}
                      <button
                        onClick={sendMessage}
                        disabled={
                          (!currentMessage.trim() &&
                            attachments.length === 0) ||
                          chatSession?.status === "closed"
                        }
                        className={`p-2 rounded-lg transition-colors ${
                          currentMessage.trim() || attachments.length > 0
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>Press Enter to send, Shift+Enter for new line</span>
                    {currentMessage.length > 0 && (
                      <span
                        className={
                          currentMessage.length > MAX_MESSAGE_LENGTH * 0.9
                            ? "text-red-500"
                            : ""
                        }
                      >
                        {currentMessage.length}/{MAX_MESSAGE_LENGTH}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default LiveChat;
