"use client";
import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, HelpCircle } from "lucide-react";
import io from "socket.io-client";
import axios from "axios";

const AnonymousCustomerCareModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  // Generate or retrieve session ID
  const getSessionId = () => {
    if (typeof window !== "undefined") {
      let session = localStorage.getItem("anonChatSession");
      if (!session) {
        session = "anon_" + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("anonChatSession", session);
      }
      return session;
    }
    return null;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Initialize when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const session = getSessionId();
    setSessionId(session);

    const initializeChat = async () => {
      try {
        // Setup socket connection
        setupSocketConnection(session);

        // Load existing messages
        await loadMessages(session);
      } catch (error) {
        console.error("Initialization error:", error);
        setConnectionStatus("error");
      }
    };

    initializeChat();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isOpen]);
// Updated setupSocketConnection function in AnonymousCustomerCareModal
const setupSocketConnection = (session) => {
  setConnectionStatus("connecting");

  if (socketRef.current) {
    socketRef.current.disconnect();
  }

  const socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER, {
    query: { sessionId: session, isAnonymous: true },
    reconnectionAttempts: 3,
    reconnectionDelay: 1000,
    timeout: 5000,
  });

  socketRef.current = socket;

  socket.on("connect", () => {
    setConnectionStatus("connected");
    socket.emit("join", { sessionId: session });
    
    // Make sure to join the anonymous room for this session
    socket.emit("join", { room: `anon_${session}` });
  });

  socket.on("disconnect", () => {
    setConnectionStatus("disconnected");
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err);
    setConnectionStatus("error");
    attemptReconnect(session);
  });


  socket.on("receiveMessage", (message) => {
    setMessages((prev) => {
      const isDuplicate = prev.some(
        (m) =>
          (m._id && m._id === message._id) || 
          (m.isLocal && m.content === message.content && !m.isSupport)
      );
  
      if (isDuplicate) return prev;
      const cleanedPrev = prev.filter(
        (m) => !(m.isLocal && m.content === message.content && !m.isSupport)
      );
  
      return [...cleanedPrev, message];
    });
  });
  
};
  

  const attemptReconnect = (session) => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    retryTimeoutRef.current = setTimeout(() => {
      if (connectionStatus !== "connected" && isOpen) {
        console.log("Attempting to reconnect...");
        setupSocketConnection(session);
      }
    }, 3000);
  };

  const loadMessages = async (session) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_NAME}anonymous/${session}`,
        {
          headers: {
            "X-Anon-Session": session, 
          },
        }
      );
      setMessages(response.data);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !sessionId) return;
  
    const tempId = Date.now().toString();
  
    const message = {
      _id: tempId,
      sessionId,
      content: newMessage,
      timestamp: new Date(),
      isSupport: false,
      isLocal: true, // <-- Mark as local
    };
  
    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_NAME}anonymous/${sessionId}/send`,
        { content: newMessage }
      );
  
      if (socketRef.current?.connected) {
        socketRef.current.emit("sendMessage", {
          sessionId,
          message: newMessage,
          receiverId: "propeneers",
        });
      }
  
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
    }
  };
  

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col h-[80vh]">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center">
            <MessageCircle className="text-primary-600 mr-2" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">
              Live Support Chat
            </h2>
            <span
              className={`ml-2 text-xs px-2 py-1 rounded ${
                connectionStatus === "connected"
                  ? "bg-green-100 text-green-800"
                  : connectionStatus === "connecting"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {connectionStatus === "connected"
                ? "Connected"
                : connectionStatus === "connecting"
                ? "Connecting..."
                : "Disconnected"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {connectionStatus === "error" ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-red-100 text-red-800 p-4 rounded-lg max-w-md">
                <h3 className="font-medium">Connection Error</h3>
                <p className="mt-2 text-sm">
                  Could not connect to chat service. You can still send
                  messages, but they may not be received until connection is
                  restored.
                </p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <MessageCircle size={48} className="mb-4 text-gray-300" />
              <h3 className="text-lg font-medium">No messages yet</h3>
              <p className="text-sm">
                Start a conversation with our support team
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${
                  !message.isSupport ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                    !message.isSupport
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p>{message.content}</p>
                  <div className="flex items-center justify-end mt-1 space-x-2">
                    <p
                      className={`text-xs ${
                        !message.isSupport
                          ? "text-primary-100"
                          : "text-gray-500"
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your message..."
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={connectionStatus === "error"}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || connectionStatus === "error"}
              className="p-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AnonymousFloatingButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);

  // Listen for new messages when chat is closed
  useEffect(() => {
    if (!isModalOpen) {
      const session = localStorage.getItem("anonChatSession");
      if (!session) return;

      const socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER, {
        query: { sessionId: session, isAnonymous: true },
      });

      socketRef.current = socket;

      socket.on("receiveMessage", (message) => {
        if (message.isSupport) {
          setUnreadCount((prev) => prev + 1);
        }
      });

      return () => {
        socket.off("receiveMessage");
        socket.disconnect();
      };
    }
  }, [isModalOpen]);

  const openModal = () => {
    setIsModalOpen(true);
    setUnreadCount(0);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={openModal}
          className="w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 transition-colors relative"
          aria-label="Customer Support"
        >
          <HelpCircle size={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      <AnonymousCustomerCareModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
};

export default AnonymousFloatingButton;
