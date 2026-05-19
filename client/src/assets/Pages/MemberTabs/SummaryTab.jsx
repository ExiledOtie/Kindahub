import React from "react";
import { ClipLoader } from "react-spinners";

import {
  FaUserCircle,
  FaMoneyBillWave,
  FaWallet,
  FaUsers,
} from "react-icons/fa";

import {
  MdSavings,
  MdLockReset,
  MdOutlineCalendarMonth,
} from "react-icons/md";

const SummaryTab = ({ loading = false }) => {
  const member = {
    initials: "JD",
    name: "John Doe",
    status: "Active",
    memberNo: "MBR001",
    joinedDate: "12 Jan 2025",
    memberSince: "Jan 2025",
    memberSinceText: "4 months ago",
    lastLogin: "16 May 2026 10:23 AM",
    groupType: "ROSCA",
    role: "Member",
  };

  const stats = [
    {
      title: "Total Contributions",
      value: "KES 50,000",
      subtitle: "All time contributions",
      icon: <FaMoneyBillWave />,
      bg: "bg-green-100",
      color: "text-green-600",
    },
    {
      title: "Total Savings",
      value: "KES 120,000",
      subtitle: "All time savings",
      icon: <MdSavings />,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
    {
      title: "Current Balance",
      value: "KES 170,000",
      subtitle: "Total savings + contributions",
      icon: <FaWallet />,
      bg: "bg-yellow-100",
      color: "text-yellow-600",
    },
    {
      title: "Member Since",
      value: member.memberSince,
      subtitle: member.memberSinceText,
      icon: <MdOutlineCalendarMonth />,
      bg: "bg-purple-100",
      color: "text-purple-600",
    },
  ];

  const activities = [
    {
      title: "Contribution of KES 5,000 added",
      date: "12 May 2026 09:15 AM",
      icon: <FaMoneyBillWave />,
      color: "text-green-500",
      bg: "bg-green-100",
    },
    {
      title: "Savings of KES 10,000 added",
      date: "10 May 2026 11:30 AM",
      icon: <MdSavings />,
      color: "text-blue-500",
      bg: "bg-blue-100",
    },
    {
      title: "Password reset",
      date: "08 May 2026 02:45 PM",
      icon: <MdLockReset />,
      color: "text-yellow-500",
      bg: "bg-yellow-100",
    },
    {
      title: "Member profile updated",
      date: "05 May 2026 04:20 PM",
      icon: <FaUserCircle />,
      color: "text-purple-500",
      bg: "bg-purple-100",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <ClipLoader size={35} color="#16a34a" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* PROFILE CARD */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* LEFT */}
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg">
              {member.initials}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-semibold text-gray-800">
                  {member.name}
                </h2>

                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-600 text-[10px] font-medium">
                  {member.status}
                </span>
              </div>

              <div className="mt-2 space-y-1">
                <p className="text-[11px] text-gray-500">
                  Member No: {member.memberNo}
                </p>

                <p className="text-[11px] text-gray-500">
                  Joined on {member.joinedDate}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col lg:items-end gap-3">
            <div className="text-left lg:text-right">
              <p className="text-[10px] text-gray-400">Last Login</p>

              <p className="text-[11px] text-gray-700 font-medium mt-1">
                {member.lastLogin}
              </p>
            </div>

            <button className="flex items-center justify-center gap-2 border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-[11px] hover:bg-blue-50 transition-all duration-200">
              <MdLockReset className="text-sm" />
              Reset Password
            </button>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start gap-3">
              <div
                className={`h-11 w-11 rounded-full flex items-center justify-center text-lg ${item.bg} ${item.color}`}
              >
                {item.icon}
              </div>

              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-wide text-gray-500">
                  {item.title}
                </p>

                <h3 className="text-lg font-bold text-gray-800 mt-1">
                  {item.value}
                </h3>

                <p className="text-[10px] text-gray-400 mt-1">
                  {item.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* INFO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* GROUP INFO */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
              <FaUsers />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                Group Information
              </h3>

              <p className="text-[10px] text-gray-400">
                Group Type & Member Details
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-[11px]">
            <div>
              <p className="text-gray-400">Group Type</p>

              <p className="font-medium text-gray-700 mt-1">
                {member.groupType}
              </p>
            </div>

            <div>
              <p className="text-gray-400">Role</p>

              <p className="font-medium text-gray-700 mt-1">
                {member.role}
              </p>
            </div>

            <div>
              <p className="text-gray-400">Status</p>

              <p className="font-medium text-green-600 mt-1">
                {member.status}
              </p>
            </div>
          </div>
        </div>

        {/* ACCOUNT STATUS */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-5">
            Account Status
          </h3>

          <div className="space-y-4 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Status</span>

              <span className="text-green-600 font-medium">
                {member.status}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Last Login</span>

              <span className="text-gray-700">
                {member.lastLogin}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Account Created</span>

              <span className="text-gray-700">
                {member.joinedDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Recent Activity
            </h3>

            <p className="text-[10px] text-gray-400 mt-1">
              Latest member account activities
            </p>
          </div>

          <button className="text-[11px] text-blue-600 hover:underline">
            View all logs
          </button>
        </div>

        <div className="space-y-4">
          {activities.map((item, index) => (
            <div
              key={index}
              className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4 last:border-none last:pb-0"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center ${item.bg} ${item.color}`}
                >
                  {item.icon}
                </div>

                <div>
                  <p className="text-[11px] text-gray-700 font-medium">
                    {item.title}
                  </p>

                  <p className="text-[10px] text-gray-400 mt-1">
                    Admin User
                  </p>
                </div>
              </div>

              <p className="text-[10px] text-gray-400 whitespace-nowrap">
                {item.date}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SummaryTab;