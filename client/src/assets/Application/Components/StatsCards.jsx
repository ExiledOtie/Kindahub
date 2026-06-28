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
    title: "Groups",
    value: dashboard.groups ?? 0,
    note: "Active groups",
    icon: "🏢",
    bg: "bg-green-100",
    color: "text-green-600",
  },
  {
    title: "Members",
    value: dashboard.members ?? 0,
    note: "Registered members",
    icon: <FaUsers />,
    bg: "bg-blue-100",
    color: "text-blue-600",
  },
  {
    title: "Total Savings",
    value: `KES ${Number(
      dashboard.totalSavings ?? 0
    ).toLocaleString()}`,
    note: "Accumulated member savings",
    icon: <FaLayerGroup />,
    bg: "bg-emerald-100",
    color: "text-emerald-600",
  },
  {
    title: "Active Loans",
    value: `KES ${Number(
      dashboard.activeLoans ?? 0
    ).toLocaleString()}`,
    note: "Outstanding loan balance",
    icon: <FaMoneyCheckAlt />,
    bg: "bg-yellow-100",
    color: "text-yellow-600",
  },
  {
    title: "Pending Loans",
    value: dashboard.pendingLoans ?? 0,
    note: "Awaiting approval",
    icon: "⏳",
    bg: "bg-orange-100",
    color: "text-orange-600",
  },
  {
    title: "Kinda Family",
    value: `KES ${Number(
      dashboard.kindaFamilyContributions ?? 0
    ).toLocaleString()}`,
    note: "Total contributions",
    icon: "👨‍👩‍👧‍👦",
    bg: "bg-indigo-100",
    color: "text-indigo-600",
  },
  {
    title: "13 Amigos",
    value: `KES ${Number(
      dashboard.amigosContributions ?? 0
    ).toLocaleString()}`,
    note: "Total contributions",
    icon: "🤝",
    bg: "bg-pink-100",
    color: "text-pink-600",
  },
  {
    title: "Chama Wallet",
    value: `KES ${Number(
      dashboard.chamaWallet ?? 0
    ).toLocaleString()}`,
    note: "Interest collected",
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