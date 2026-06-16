import React, { useEffect, useRef, useState } from "react";
import { FaUsers } from "react-icons/fa";

import ConversationList from "./Components/ConversationList";
import MessageBubble from "./Components/MessageBubble";
import MessageInput from "./Components/MessageInput";

const GroupChats = () => {
  const messagesEndRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");

  const [groups] = useState([
    {
      id: 1,
      name: "Family Chama",
      avatar: "F",
      unread: 3,
      members: 18,
      lastMessage: "Meeting starts at 6 PM.",
      time: "10:45 AM",
    },
    {
      id: 2,
      name: "Investment Club",
      avatar: "I",
      unread: 1,
      members: 12,
      lastMessage: "Contributions close tomorrow.",
      time: "Yesterday",
    },
    {
      id: 3,
      name: "Business Chama",
      avatar: "B",
      unread: 0,
      members: 9,
      lastMessage: "Loan approved.",
      time: "Mon",
    },
  ]);

  const [selectedConversation, setSelectedConversation] = useState(groups[0]);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "Mary Wanjiku",
      text: "Good morning everyone.",
      time: "09:15 AM",
      isMe: false,
    },
    {
      id: 2,
      sender: "You",
      text: "Morning Mary 👋",
      time: "09:16 AM",
      isMe: true,
      read: true,
    },
    {
      id: 3,
      sender: "Peter Mutiso",
      text: "Meeting starts at 6 PM today.",
      time: "09:20 AM",
      isMe: false,
    },
    {
      id: 4,
      sender: "You",
      text: "Noted. I'll be there.",
      time: "09:22 AM",
      isMe: true,
      read: false,
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: "You",
      text: message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isMe: true,
      read: false,
    };

    setMessages((prev) => [...prev, newMessage]);

    // TODO:
    // socket.emit("send_group_message", newMessage)

    setMessage("");
  };

  return (
    <div className="h-[calc(100vh-110px)] bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="flex h-full">
        {/* LEFT SIDEBAR */}
        <ConversationList
          title="Group Chats"
          conversations={groups}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* RIGHT CHAT SECTION */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* CHAT HEADER */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                {selectedConversation?.avatar}
              </div>

              <div>
                <h2 className="font-semibold text-gray-800">
                  {selectedConversation?.name}
                </h2>

                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <FaUsers />
                  {selectedConversation?.members} Members
                </p>
              </div>
            </div>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                No messages yet.
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                />
              ))
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* MESSAGE INPUT */}
          <MessageInput
            message={message}
            setMessage={setMessage}
            onSend={handleSend}
            placeholder={`Message ${selectedConversation?.name}`}
          />
        </div>
      </div>
    </div>
  );
};

export default GroupChats;