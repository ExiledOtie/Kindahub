import React from "react";
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

const SummaryTab = () => {
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
      value: "Jan 2025",
      subtitle: "4 months ago",
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

  return (
    <div className="space-y-4">
      {/* TOP PROFILE CARD */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* LEFT */}
          <div className="flex items-start gap-3">
            <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg">
              JD
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-semibold text-gray-800">
                  John Doe
                </h2>

                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-600 text-[10px] font-medium">
                  Active
                </span>
              </div>

              <p className="text-[11px] text-gray-500 mt-1">
                Member No: MBR001
              </p>

              <p className="text-[11px] text-gray-500">
                Joined on 12 Jan 2025
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col lg:items-end gap-2">
            <div className="text-right">
              <p className="text-[10px] text-gray-400">
                Last Login
              </p>

              <p className="text-[11px] text-gray-700 font-medium">
                16 May 2026 10:23 AM
              </p>
            </div>

            <button className="flex items-center gap-2 border border-blue-200 text-blue-600 px-3 py-1.5 rounded-lg text-[11px] hover:bg-blue-50 transition">
              <MdLockReset className="text-sm" />
              Reset Password
            </button>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center text-lg ${item.bg} ${item.color}`}
              >
                {item.icon}
              </div>

              <div>
                <p className="text-[10px] text-gray-500">
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

      {/* BOTTOM CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* GROUP INFO */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-9 w-9 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
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

          <div className="grid grid-cols-3 gap-3 text-[11px]">
            <div>
              <p className="text-gray-400">Group Type</p>
              <p className="font-medium text-gray-700 mt-1">
                ROSCA
              </p>
            </div>

            <div>
              <p className="text-gray-400">Savings Group</p>
              <p className="font-medium text-gray-700 mt-1">
                Member
              </p>
            </div>

            <div>
              <p className="text-gray-400">Status</p>
              <p className="font-medium text-green-600 mt-1">
                Active
              </p>
            </div>
          </div>
        </div>

        {/* ACCOUNT STATUS */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            Account Status
          </h3>

          <div className="space-y-3 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Status</span>

              <span className="text-green-600 font-medium">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Last Login</span>

              <span className="text-gray-700">
                16 May 2026 10:23 AM
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Account Created</span>

              <span className="text-gray-700">
                12 Jan 2025
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-800">
            Recent Activity
          </h3>

          <button className="text-[11px] text-blue-600 hover:underline">
            View all logs
          </button>
        </div>

        <div className="space-y-4">
          {activities.map((item, index) => (
            <div
              key={index}
              className="flex items-start justify-between gap-3"
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