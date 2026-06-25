import React from "react";

const MessageBubble = ({ message }) => {
  const isMe = message.isMe;

  return (
    <div
      className={`flex mb-2 ${
        isMe ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[70%] px-3 py-2 rounded-2xl shadow-sm ${
          isMe
            ? "bg-emerald-600 text-white rounded-br-md"
            : "bg-white text-gray-800 rounded-bl-md border border-gray-200"
        }`}
      >
        {!isMe && (
          <p className="text-[10px] font-semibold text-emerald-600 mb-1">
            {message.sender}
          </p>
        )}

        <p className="text-xs whitespace-pre-wrap break-words">
          {message.text}
        </p>

        <div
          className={`flex justify-end items-center gap-1 mt-1 text-[9px] ${
            isMe
              ? "text-emerald-100"
              : "text-gray-400"
          }`}
        >
          <span>{message.time}</span>

          {isMe && (
            <span>
              {message.read
                ? "✓✓"
                : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;