import React from "react";
import { FaSearch } from "react-icons/fa";

const ConversationList = ({
  title = "Conversations",
  conversations = [],
  selectedConversation,
  onSelectConversation,
  searchTerm,
  setSearchTerm,
}) => {
  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full md:w-[280px] bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-800">
          {title}
        </h2>

        <div className="mt-2 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]" />

          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="w-full pl-8 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-xs">
            No conversations found
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const isActive =
              selectedConversation?.id ===
              conversation.id;

            return (
              <button
                key={conversation.id}
                onClick={() =>
                  onSelectConversation(
                    conversation
                  )
                }
                className={`w-full flex items-center justify-between px-3 py-2 border-b border-gray-100 text-left transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-50 border-l-4 border-l-emerald-600"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center font-semibold text-xs text-emerald-700">
                    {conversation.avatar ||
                      conversation.name
                        .charAt(0)
                        .toUpperCase()}
                  </div>

                  <div className="overflow-hidden">
                    <h3 className="font-medium text-xs text-gray-800 truncate">
                      {conversation.name}
                    </h3>

                    <p className="text-[10px] text-gray-500 truncate max-w-[140px]">
                      {conversation.lastMessage ||
                        "No messages yet"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="text-[9px] text-gray-400">
                    {conversation.time}
                  </span>

                  {conversation.unread > 0 && (
                    <span className="min-w-[18px] h-4 px-1 rounded-full bg-emerald-600 text-white text-[9px] flex items-center justify-center">
                      {conversation.unread}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;