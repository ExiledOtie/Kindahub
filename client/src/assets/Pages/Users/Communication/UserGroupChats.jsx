import React, { useEffect, useRef, useState } from "react";
import { FaUsers } from "react-icons/fa";
import api from "../../../Utils/axios";

import MessageBubble from "./Components/MessageBubble";
import MessageInput from "./Components/MessageInput";

const UserGroupChats = () => {
  const messagesEndRef = useRef(null);

  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );

  const [group, setGroup] = useState(null);

  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState("");

  const [conversationId, setConversationId] =
    useState(null);

  useEffect(() => {
    loadGroupChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const loadGroupChat = async () => {
    try {
      const groupRes = await api.get(
        "/communications/my-group"
      );

      const myGroup = groupRes.data.data;

      setGroup(myGroup);

      const convoRes = await api.get(
        `/communications/groups/${myGroup.id}`
      );

      const conversation =
        convoRes.data.data;

      setConversationId(conversation.id);

      fetchMessages(conversation.id);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMessages = async (id) => {
    try {
      const res = await api.get(
        `/communications/${id}/messages`
      );

      const formatted = res.data.data.map(
        (msg) => ({
          id: msg.id,
          sender: msg.sender_name,
          text: msg.message,
          time: new Date(
            msg.created_at
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isMe:
            Number(msg.sender_id) ===
            Number(currentUser.id),
        })
      );

      setMessages(formatted);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    if (!conversationId) return;

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

  return (
    <div className="h-[calc(100vh-120px)] bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="flex flex-col h-full">
        {/* HEADER */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
            {group?.name?.charAt(0)}
          </div>

          <div>
            <h2 className="text-xs font-semibold text-gray-800">
              {group?.name || "My Group"}
            </h2>

            <p className="text-[10px] text-gray-500 flex items-center gap-1">
              <FaUsers size={10} />
              Group Chat
            </p>
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-3 py-2 bg-gray-50">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-gray-500">
              No messages yet
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
          placeholder={`Message ${group?.name || ""}`}
        />
      </div>
    </div>
  );
};

export default UserGroupChats;