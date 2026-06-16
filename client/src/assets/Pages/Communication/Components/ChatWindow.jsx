import React, { useEffect, useRef } from "react";
import { FaCircle, FaUsers } from "react-icons/fa";

import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

const ChatWindow = ({
  conversation,
  messages = [],
  message,
  setMessage,
  onSend,
  type = "group", // "group" or "private"
}) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-500">
        Select a conversation to start chatting.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              {conversation.avatar}
            </div>

            {/* Online indicator for private chats */}
            {type === "private" && conversation.online && (
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
            )}
          </div>

          {/* Details */}
          <div>
            <h2 className="font-semibold text-gray-800">
              {conversation.name}
            </h2>

            {type === "group" ? (
              <p className="text-xs text-gray-500 flex items-center gap-2">
                <FaUsers />
                {conversation.members || 0} Members
              </p>
            ) : (
              <p
                className={`text-xs flex items-center gap-1 ${
                  conversation.online
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                <FaCircle size={8} />

                {conversation.online ? "Online" : "Offline"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
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

      {/* Input */}
      <MessageInput
        message={message}
        setMessage={setMessage}
        onSend={onSend}
        placeholder={`Message ${conversation.name}`}
      />
    </div>
  );
};

export default ChatWindow;