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
  const filteredConversations = conversations.filter((conversation) =>
    conversation.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full md:w-[320px] bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>

        {/* Search */}
        <div className="mt-3 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />

          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
              w-full
              pl-10
              pr-4
              py-2
              text-sm
              border
              border-gray-300
              rounded-lg
              focus:outline-none
              focus:ring-2
              focus:ring-emerald-500
            "
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            No conversations found.
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const isActive =
              selectedConversation?.id === conversation.id;

            return (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`
                  w-full
                  flex
                  items-center
                  justify-between
                  px-4
                  py-3
                  border-b
                  border-gray-100
                  text-left
                  transition-all
                  duration-200

                  ${
                    isActive
                      ? "bg-emerald-50 border-l-4 border-l-emerald-600"
                      : "hover:bg-gray-50"
                  }
                `}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center font-semibold text-emerald-700">
                    {conversation.avatar ||
                      conversation.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Name + Last Message */}
                  <div className="overflow-hidden">
                    <h3 className="font-medium text-sm text-gray-800 truncate">
                      {conversation.name}
                    </h3>

                    <p className="text-xs text-gray-500 truncate max-w-[160px]">
                      {conversation.lastMessage ||
                        "No messages yet"}
                    </p>
                  </div>
                </div>

                {/* Time + Badge */}
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] text-gray-400">
                    {conversation.time}
                  </span>

                  {conversation.unread > 0 && (
                    <span className="min-w-[20px] h-5 px-1 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center">
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