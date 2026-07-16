import React, { useEffect, useRef, useState } from "react";
import { FaUsers } from "react-icons/fa";
import api from "../../Utils/axios";
import ConversationList from "./Components/ConversationList";
import MessageBubble from "./Components/MessageBubble";
import MessageInput from "./Components/MessageInput";

const GroupChats = () => {
  const messagesEndRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");

  const [groups, setGroups] = useState([]);
  const [messages, setMessages] = useState([]);

  const [selectedConversation, setSelectedConversation] = useState(null);

  const [conversationId, setConversationId] = useState(null);

  const currentUser = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await api.get("/groups");

      const formatted = res.data.map((group) => ({
        id: group.id,
        name: group.name,
        avatar: group.name?.charAt(0),
        members: group.member_count || 0,
        unread: 0,
      }));

      setGroups(formatted);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMessages = async (id) => {
    try {
      const res = await api.get(`/communications/${id}/messages`);

      const formatted = res.data.data.map((msg) => ({
        id: msg.id,
        sender: msg.sender_name,
        text: msg.message,
        time: new Date(msg.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isMe: Number(msg.sender_id) === Number(currentUser.id),
      }));

      setMessages(formatted);
    } catch (error) {
      console.error(error);
    }
  };

const handleSelectConversation = async (group) => {
  console.log("GROUP CLICKED:", group);

  try {
    setSelectedConversation(group);

    const res = await api.get(
      `/communications/groups/${group.id}`
    );

    console.log("GROUP RESPONSE:", res.data);

    const id = res.data.data.id;

    setConversationId(id);

    fetchMessages(id);
  } catch (error) {
    console.error(error);
  }
};

 const handleSend = async () => {
  console.log("conversationId:", conversationId);
  console.log("message:", message);

  if (!message.trim()) return;

  if (!conversationId) {
    console.log("No conversation selected");
    return;
  }

  try {
    await api.post(
      `/communications/${conversationId}/messages`,
      { message }
    );

    setMessage("");

    fetchMessages(conversationId);
  } catch (error) {
    console.error(error);
  }
};

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="h-[calc(100vh-110px)] bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="flex h-full">
        {/* LEFT SIDEBAR */}
        <ConversationList
          title="Group Chats"
          conversations={groups}
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* RIGHT CHAT SECTION */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* CHAT HEADER */}
          <div className="bg-white border-b border-gray-200 px-3 md:px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold text-xs">
                {selectedConversation?.avatar}
              </div>

              <div>
                <h2 className="font-semibold text-xs md:text-sm text-gray-800">
                  {selectedConversation?.name || "Select Group"}
                </h2>

                <p className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1">
                  <FaUsers size={10} />
                  {selectedConversation?.members || 0}
                  Members
                </p>
              </div>
            </div>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-2 md:p-3">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                No messages yet.
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
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
