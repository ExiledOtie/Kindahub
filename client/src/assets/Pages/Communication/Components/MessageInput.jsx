import React from "react";
import { FaPaperPlane } from "react-icons/fa";

const MessageInput = ({
  message,
  setMessage,
  onSend,
  placeholder = "Type a message...",
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    onSend();
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-3"
      >
        {/* Message Input */}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className="
            flex-1
            px-4 py-3
            rounded-full
            border border-gray-300
            focus:outline-none
            focus:ring-2
            focus:ring-emerald-500
            focus:border-transparent
            text-sm
          "
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim()}
          className={`
            w-12 h-12 rounded-full
            flex items-center justify-center
            transition-all duration-200

            ${
              message.trim()
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          <FaPaperPlane size={16} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;