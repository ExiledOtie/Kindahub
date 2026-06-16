import React, { useEffect, useRef, useState } from "react";
import { FaCircle } from "react-icons/fa";

import ConversationList from "./Components/ConversationList";
import MessageBubble from "./Components/MessageBubble";
import MessageInput from "./Components/MessageInput";

const PrivateMessages = () => {
  const messagesEndRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");

  const [contacts] = useState([
    {
      id: 1,
      name: "Mary Wanjiku",
      avatar: "M",
      unread: 2,
      online: true,
      lastMessage: "See you at the meeting.",
      time: "10:30 AM",
    },
    {
      id: 2,
      name: "Peter Mutiso",
      avatar: "P",
      unread: 0,
      online: false,
      lastMessage: "Loan documents submitted.",
      time: "Yesterday",
    },
    {
      id: 3,
      name: "Jane Njeri",
      avatar: "J",
      unread: 1,
      online: true,
      lastMessage: "Thank you.",
      time: "Mon",
    },
  ]);

  const [selectedConversation, setSelectedConversation] =
    useState(contacts[0]);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "Mary Wanjiku",
      text: "Hi Joseph, have you submitted your contribution?",
      time: "09:00 AM",
      isMe: false,
    },
    {
      id: 2,
      sender: "You",
      text: "Yes, I submitted it yesterday.",
      time: "09:02 AM",
      isMe: true,
      read: true,
    },
    {
      id: 3,
      sender: "Mary Wanjiku",
      text: "Perfect. Thank you!",
      time: "09:05 AM",
      isMe: false,
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
    // socket.emit("send_private_message", {
    //   receiverId: selectedConversation.id,
    //   message: newMessage,
    // });

    setMessage("");
  };

  return (
    <div className="h-[calc(100vh-110px)] bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="flex h-full">
        {/* CONTACT LIST */}
        <ConversationList
          title="Private Messages"
          conversations={contacts}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* CHAT AREA */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* HEADER */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  {selectedConversation?.avatar}
                </div>

                {selectedConversation?.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                )}
              </div>

              <div>
                <h2 className="font-semibold text-gray-800">
                  {selectedConversation?.name}
                </h2>

                <p
                  className={`text-xs flex items-center gap-1 ${
                    selectedConversation?.online
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  <FaCircle size={8} />

                  {selectedConversation?.online
                    ? "Online"
                    : "Offline"}
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

          {/* INPUT */}
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

export default PrivateMessages;