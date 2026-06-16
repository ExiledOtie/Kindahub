import React from "react";

const MessageBubble = ({ message }) => {
  const isMe = message.isMe;

  return (
    <div
      className={`flex mb-3 ${
        isMe ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`
          max-w-[85%] sm:max-w-[70%]
          px-4 py-2 rounded-2xl shadow-sm
          ${
            isMe
              ? "bg-emerald-600 text-white rounded-br-md"
              : "bg-white text-gray-800 rounded-bl-md border border-gray-200"
          }
        `}
      >
        {/* Sender Name */}
        {!isMe && (
          <p className="text-xs font-semibold text-emerald-600 mb-1">
            {message.sender}
          </p>
        )}

        {/* Message */}
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.text}
        </p>

        {/* Timestamp */}
        <div
          className={`flex items-center justify-end gap-1 mt-2 text-[10px] ${
            isMe ? "text-emerald-100" : "text-gray-400"
          }`}
        >
          <span>{message.time}</span>

          {/* Read status (placeholder) */}
          {isMe && (
            <span title="Sent">
              {message.read ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;