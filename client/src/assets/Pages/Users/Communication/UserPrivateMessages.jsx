import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import { FaCircle } from "react-icons/fa";

import api from "../../../Utils/axios";

import ConversationList from "../../Communication/Components/ConversationList";
import MessageBubble from "../../Communication/Components/MessageBubble";
import MessageInput from "../../Communication/Components/MessageInput";

const UserPrivateMessages = () => {
  const messagesEndRef = useRef(null);

  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );

  const [contacts, setContacts] = useState([]);

  const [messages, setMessages] = useState([]);

  const [
    selectedConversation,
    setSelectedConversation,
  ] = useState(null);

  const [conversationId, setConversationId] =
    useState(null);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const fetchContacts = async () => {
    try {
      const res = await api.get(
        "/communications/my-group-members"
      );

      const users = res.data.data.map(
        (user) => ({
          id: user.id,
          name: user.fullname,
          avatar:
            user.fullname?.charAt(0),
          online: false,
          unread: 0,
        })
      );

      setContacts(users);
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
          sender: msg.sender_name || "",
          text: msg.message,
          time: new Date(
            msg.created_at
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isMe:
            msg.sender_id ===
            currentUser.id,
        })
      );

      setMessages(formatted);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectConversation =
    async (user) => {
      try {
        setSelectedConversation(user);

        const res = await api.post(
          "/communications/private",
          {
            recipientId: user.id,
          }
        );

        const id = res.data.data.id;

        setConversationId(id);

        fetchMessages(id);
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
        {
          message,
        }
      );

      setMessage("");

      fetchMessages(conversationId);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="flex h-full overflow-hidden">
        {/* SIDEBAR */}
        <div
          className={`
          ${
            selectedConversation
              ? "hidden md:block"
              : "block"
          }
          w-full md:w-72
          border-r border-gray-200
        `}
        >
          <ConversationList
            title="Members"
            conversations={contacts}
            selectedConversation={
              selectedConversation
            }
            onSelectConversation={
              handleSelectConversation
            }
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>

        {/* CHAT */}
        <div
          className={`
          ${
            selectedConversation
              ? "flex"
              : "hidden md:flex"
          }
          flex-1 flex-col bg-gray-50
        `}
        >
          {!selectedConversation ? (
            <div className="flex-1 flex items-center justify-center text-xs text-gray-500">
              Select a member
            </div>
          ) : (
            <>
              {/* HEADER */}
              <div className="bg-white border-b border-gray-200 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold">
                    {
                      selectedConversation.avatar
                    }
                  </div>

                  <div>
                    <h2 className="text-xs font-semibold text-gray-800">
                      {
                        selectedConversation.name
                      }
                    </h2>

                    <p className="text-[10px] text-gray-500 flex items-center gap-1">
                      <FaCircle size={6} />
                      Member
                    </p>
                  </div>
                </div>
              </div>

              {/* MESSAGES */}
              <div className="flex-1 overflow-y-auto px-3 py-2">
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
                placeholder={`Message ${selectedConversation.name}`}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPrivateMessages;