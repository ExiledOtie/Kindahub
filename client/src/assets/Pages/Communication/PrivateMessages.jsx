import React, { useEffect, useRef, useState } from "react";
import { FaCircle } from "react-icons/fa";
import api from "../../Utils/axios";
import ConversationList from "./Components/ConversationList";
import MessageBubble from "./Components/MessageBubble";
import MessageInput from "./Components/MessageInput";

const PrivateMessages = () => {
  const messagesEndRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);

  const [selectedConversation, setSelectedConversation] = useState(null);

  const [conversationId, setConversationId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const fetchContacts = async () => {
    try {
      const res = await api.get("/users");

      const users = res.data
        .filter((user) => user.id !== currentUser.id)
        .map((user) => ({
          id: user.id,
          name: user.fullname,
          avatar: user.fullname?.charAt(0),
          online: false,
          unread: 0,
        }));

      setContacts(users);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMessages = async (id) => {
    try {
      const res = await api.get(`/communications/${id}/messages`);

      const formatted = res.data.data.map((msg) => ({
        id: msg.id,
        sender: msg.sender_name || "",
        text: msg.message,
        time: new Date(msg.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isMe: msg.sender_id === currentUser.id,
      }));

      setMessages(formatted);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectConversation = async (user) => {
    try {
      setSelectedConversation(user);

      const res = await api.post("/communications/private", {
        recipientId: user.id,
      });

      const id = res.data.data.id;

      setConversationId(id);

      fetchMessages(id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    if (!conversationId) return;

    try {
      await api.post(`/communications/${conversationId}/messages`, {
        message,
      });

      setMessage("");

      fetchMessages(conversationId);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="flex h-full overflow-hidden">
        {/* CONTACT LIST */}
        <div
          className={`
    ${selectedConversation ? "hidden md:block" : "block"}
    w-full md:w-80
    border-r border-gray-200
    bg-white
  `}
        >
          <ConversationList
            title="Private Messages"
            conversations={contacts}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>

        {/* CHAT AREA */}
        <div
          className={`
    ${selectedConversation ? "flex" : "hidden md:flex"}
    flex-1 flex-col bg-gray-50 min-w-0
  `}
        >
          {!selectedConversation ? (
            <div className="flex-1 flex items-center justify-center text-xs text-gray-500">
              Select a member to start chatting
            </div>
          ) : (
            <>
              {/* HEADER */}
              <div className="bg-white border-b border-gray-200 px-3 md:px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold text-xs md:text-sm">
                      {selectedConversation.avatar}
                    </div>

                    {selectedConversation.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border border-white" />
                    )}
                  </div>

                  <div>
                    <h2 className="font-medium text-xs md:text-sm text-gray-800">
                      {selectedConversation.name}
                    </h2>

                    <p
                      className={`text-[10px] flex items-center gap-1 ${
                        selectedConversation.online
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      <FaCircle size={6} />

                      {selectedConversation.online ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
              </div>

              {/* MESSAGES */}
              <div className="flex-1 overflow-y-auto px-3 py-2 md:px-4 md:py-3">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-gray-500">
                    No messages yet.
                  </div>
                ) : (
                  messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* INPUT */}
              <MessageInput
                message={message}
                setMessage={setMessage}
                onSend={handleSend}
                placeholder={`Message ${selectedConversation.name}`}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivateMessages;
