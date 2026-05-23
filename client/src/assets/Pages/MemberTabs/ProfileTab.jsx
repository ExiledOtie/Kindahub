import { useState } from "react";
import {
  FaUserCircle,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaClock,
  FaUsers,
} from "react-icons/fa";

const ProfileTab = ({
  member,
  totalUsers = 0,
}) => {
  const [activeTab, setActiveTab] =
    useState("overview");

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleString()
      : "N/A";

  if (!member) {
    return (
      <div className="text-center py-10 text-gray-500">
        Member not found
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}

      <div className="bg-white border rounded-2xl p-4 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FaUserCircle
            size={45}
            className="text-gray-400"
          />

          <div>
            <h2 className="text-sm font-semibold text-gray-800">
              {member.fullname}
            </h2>

            <p className="text-[11px] text-gray-500">
              #{member.id}
            </p>
          </div>
        </div>
      </div>

      {/* Cards */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white border rounded-xl p-4 shadow-sm flex items-center gap-3">
          <FaUser className="text-purple-500" />

          <div>
            <p className="text-[10px] text-gray-400">
              Full Name
            </p>

            <p className="text-sm font-semibold">
              {member.fullname}
            </p>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-sm flex items-center gap-3">
          <FaEnvelope className="text-blue-500" />

          <div>
            <p className="text-[10px] text-gray-400">
              Email
            </p>

            <p className="text-sm font-semibold">
              {member.email}
            </p>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-sm flex items-center gap-3">
          <FaPhone className="text-green-500" />

          <div>
            <p className="text-[10px] text-gray-400">
              Phone
            </p>

            <p className="text-sm font-semibold">
              {member.phone || "N/A"}
            </p>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-sm flex items-center gap-3">
          <FaUsers className="text-orange-500" />

          <div>
            <p className="text-[10px] text-gray-400">
              Total Users
            </p>

            <p className="text-sm font-semibold">
              {totalUsers}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}

      <div className="flex gap-2 text-xs">
        {["overview", "activity"].map(
          (tab) => (
            <button
              key={tab}
              onClick={() =>
                setActiveTab(tab)
              }
              className={`px-3 py-2 rounded-lg border ${
                activeTab === tab
                  ? "bg-green-600 text-white"
                  : "bg-white"
              }`}
            >
              {tab.toUpperCase()}
            </button>
          )
        )}
      </div>

      {/* Overview */}

      {activeTab === "overview" && (
        <div className="bg-white border rounded-xl p-4 shadow-sm space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Username</span>

            <span>
              {member.username}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Role</span>

            <span>
              {member.role}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Status</span>

            <span className="text-green-600">
              {member.status}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Joined</span>

            <span>
              {formatDate(
                member.created_at
              )}
            </span>
          </div>
        </div>
      )}

      {/* Activity */}

      {activeTab === "activity" && (
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <FaClock />
            <span>
              Account Created
            </span>
          </div>

          <div className="mt-2 text-xs text-gray-500">
            {formatDate(
              member.created_at
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileTab;