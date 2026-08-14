import { useState } from "react";
import {
  FaUserCircle,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaClock,
  FaUsers,
} from "react-icons/fa";

const ProfileTab = ({ member, totalUsers = 0 }) => {
  const [activeTab, setActiveTab] = useState("overview");

  const formatDate = (date) => (date ? new Date(date).toLocaleString() : "N/A");

  if (!member) {
    return (
      <div className="text-center py-8 text-[9px] text-gray-500">
        Member not found
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* ================================================================
          HEADER
      ================================================================= */}

      <div className="bg-white border rounded-xl p-3 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <FaUserCircle size={36} className="text-gray-400" />

          <div>
            <h2 className="text-[11px] font-semibold text-gray-800">
              {member.fullname}
            </h2>

            <p className="text-[8px] text-gray-500">#{member.id}</p>
          </div>
        </div>
      </div>

      {/* ================================================================
          CARDS
      ================================================================= */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        {/* FULL NAME */}

        <div className="bg-white border rounded-lg p-2.5 shadow-sm flex items-center gap-2">
          <FaUser className="text-purple-500 text-[12px]" />

          <div className="min-w-0">
            <p className="text-[8px] text-gray-400">Full Name</p>

            <p className="text-[10px] font-semibold truncate">
              {member.fullname}
            </p>
          </div>
        </div>

        {/* EMAIL */}

        <div className="bg-white border rounded-lg p-2.5 shadow-sm flex items-center gap-2">
          <FaEnvelope className="text-blue-500 text-[12px]" />

          <div className="min-w-0">
            <p className="text-[8px] text-gray-400">Email</p>

            <p className="text-[10px] font-semibold truncate">{member.email}</p>
          </div>
        </div>

        {/* PHONE */}

        <div className="bg-white border rounded-lg p-2.5 shadow-sm flex items-center gap-2">
          <FaPhone className="text-green-500 text-[12px]" />

          <div>
            <p className="text-[8px] text-gray-400">Phone</p>

            <p className="text-[10px] font-semibold">{member.phone || "N/A"}</p>
          </div>
        </div>

        {/* TOTAL USERS */}

        <div className="bg-white border rounded-lg p-2.5 shadow-sm flex items-center gap-2">
          <FaUsers className="text-orange-500 text-[12px]" />

          <div>
            <p className="text-[8px] text-gray-400">Total Users</p>

            <p className="text-[10px] font-semibold">{totalUsers}</p>
          </div>
        </div>
      </div>

      {/* ================================================================
          TABS
      ================================================================= */}

      <div className="flex gap-1.5 text-[9px]">
        {["overview", "activity"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-2.5 py-1.5 rounded-md border ${
              activeTab === tab
                ? "bg-green-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ================================================================
          OVERVIEW
      ================================================================= */}

      {activeTab === "overview" && (
        <div className="bg-white border rounded-lg p-3 shadow-sm space-y-2 text-[9px]">
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">Username</span>

            <span className="font-medium text-gray-800">{member.username}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-gray-500">Role</span>

            <span className="font-medium text-gray-800">{member.role}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-gray-500">Status</span>

            <span className="text-green-600 font-medium">{member.status}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-gray-500">Joined</span>

            <span className="font-medium text-gray-800">
              {formatDate(member.created_at)}
            </span>
          </div>
        </div>
      )}

      {/* ================================================================
          ACTIVITY
      ================================================================= */}

      {activeTab === "activity" && (
        <div className="bg-white border rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-1.5 text-[9px] text-gray-600">
            <FaClock size={10} />

            <span>Account Created</span>
          </div>

          <div className="mt-1.5 text-[8px] text-gray-500">
            {formatDate(member.created_at)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileTab;
