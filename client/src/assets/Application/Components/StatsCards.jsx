// Application/Components/StatsCards.jsx

import React from "react";
import {
  FaUsers,
  FaLayerGroup,
  FaMoneyCheckAlt,
  FaWallet,
} from "react-icons/fa";

const StatsCards = ({ dashboard }) => {
  if (!dashboard) return null;

  const stats = [
    {
      title: "Members",
      value: dashboard.members ?? 0,
      note: "Registered members",
      icon: <FaUsers />,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
    {
      title: "Groups",
      value: dashboard.groups ?? 0,
      note: "Active groups",
      icon: <FaLayerGroup />,
      bg: "bg-green-100",
      color: "text-green-600",
    },
    {
      title: "Pending Loans",
      value: dashboard.pendingLoans ?? 0,
      note: "Awaiting approval",
      icon: <FaMoneyCheckAlt />,
      bg: "bg-yellow-100",
      color: "text-yellow-600",
    },
    {
      title: "Chama Wallet",
      value: `KES ${Number(
        dashboard.chamaWallet ?? 0
      ).toLocaleString()}`,
      note: "Outstanding loan balance",
      icon: <FaWallet />,
      bg: "bg-purple-100",
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] text-gray-500 font-medium">
                {item.title}
              </p>

              <h2 className="text-lg font-bold text-gray-800 mt-1">
                {item.value}
              </h2>

              <p className="text-[10px] text-gray-400 mt-1">
                {item.note}
              </p>
            </div>

            <div
              className={`w-10 h-10 rounded-md flex items-center justify-center ${item.bg}`}
            >
              <span className={`text-lg ${item.color}`}>
                {item.icon}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;