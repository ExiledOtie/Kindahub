// Pages/Dashboard.jsx

import React from "react";
import Sidebar from "../Components/Sidebar";

import {
  FaUsers,
  FaPiggyBank,
  FaMoneyBillWave,
  FaClock,
  FaWallet,
} from "react-icons/fa";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const stats = [
  {
    title: "Total Members",
    value: "128",
    note: "+12 this month",
    icon: <FaUsers />,
    bg: "bg-blue-100",
    color: "text-blue-600",
  },
  {
    title: "Total Savings",
    value: "KES 1,245,000",
    note: "+8% this month",
    icon: <FaPiggyBank />,
    bg: "bg-purple-100",
    color: "text-purple-600",
  },
  {
    title: "Active Loans",
    value: "KES 850,000",
    note: "24 active loans",
    icon: <FaMoneyBillWave />,
    bg: "bg-orange-100",
    color: "text-orange-500",
  },
  {
    title: "Pending Loans",
    value: "14",
    note: "View requests",
    icon: <FaClock />,
    bg: "bg-yellow-100",
    color: "text-yellow-600",
  },
  {
    title: "Weekly Contributions",
    value: "KES 85,300",
    note: "This week",
    icon: <FaPiggyBank />,
    bg: "bg-indigo-100",
    color: "text-indigo-600",
  },
  {
    title: "Monthly Contributions",
    value: "KES 320,600",
    note: "This month",
    icon: <FaPiggyBank />,
    bg: "bg-green-100",
    color: "text-green-600",
  },
  {
    title: "Overdue Loans",
    value: "KES 120,500",
    note: "5 overdue loans",
    icon: <FaMoneyBillWave />,
    bg: "bg-red-100",
    color: "text-red-600",
  },
  {
    title: "Chama Wallet Balance",
    value: "KES 75,600",
    note: "Available balance",
    icon: <FaWallet />,
    bg: "bg-emerald-100",
    color: "text-emerald-600",
  },
];

const loanStatusData = [
  { name: "Approved", value: 45, color: "#4f46e5" },
  { name: "Pending", value: 25, color: "#f59e0b" },
  { name: "Rejected", value: 15, color: "#ef4444" },
  { name: "Repaid", value: 15, color: "#10b981" },
];

const Dashboard = () => {
  return (
    <div className="flex bg-[#f5f7fb] min-h-screen">
      {/* Sidebar */}
      <Sidebar role="admin" />

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
            Dashboard (Super Admin View)
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9px] text-gray-500 font-medium">
                    {item.title}
                  </p>

                  <h2 className="text-sm font-bold text-gray-800 mt-1">
                    {item.value}
                  </h2>

                  <p className="text-[9px] text-gray-400 mt-1">
                    {item.note}
                  </p>
                </div>

                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center ${item.bg}`}
                >
                  <span className={`text-xs ${item.color}`}>
                    {item.icon}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts + Pie Chart + Loan Requests */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mt-4">
          {/* Contributions Overview */}
          <div className="lg:col-span-2 bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[11px] font-semibold text-gray-700">
                Contributions Overview (This Year)
              </h2>

              <select className="text-[10px] border rounded px-2 py-1 outline-none">
                <option>Monthly</option>
              </select>
            </div>

            {/* Bar Chart */}
            <div className="h-[180px] flex items-end gap-2">
              {[40, 60, 55, 75, 90, 80, 110, 120, 95, 130, 125, 140].map(
                (height, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-indigo-400 rounded-t-sm hover:bg-indigo-500 transition-all"
                    style={{ height: `${height}px` }}
                  ></div>
                )
              )}
            </div>

            {/* Months */}
            <div className="flex justify-between mt-2 text-[9px] text-gray-400">
              {[
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ].map((month) => (
                <span key={month}>{month}</span>
              ))}
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[11px] font-semibold text-gray-700">
                Loan Status Distribution
              </h2>
            </div>

            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={loanStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={58}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {loanStatusData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.color}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="space-y-2 mt-2">
              {loanStatusData.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-[9px]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: item.color,
                      }}
                    ></span>

                    <span className="text-gray-600">
                      {item.name}
                    </span>
                  </div>

                  <span className="text-gray-500">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Loan Requests */}
          <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[11px] font-semibold text-gray-700">
                Recent Loan Requests
              </h2>

              <button className="text-[10px] text-indigo-600 font-medium">
                View all
              </button>
            </div>

            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between border-b pb-2 last:border-none"
                >
                  <div>
                    <h3 className="text-[10px] font-semibold text-gray-700">
                      John Kamau
                    </h3>

                    <p className="text-[9px] text-gray-400">
                      Loan Request
                    </p>
                  </div>

                  <div className="text-right">
                    <h4 className="text-[10px] font-semibold text-gray-700">
                      KES 75,000
                    </h4>

                    <p className="text-[9px] text-yellow-500 font-medium">
                      Pending
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
          {/* Recent Contributions */}
          <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm overflow-x-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[11px] font-semibold text-gray-700">
                Recent Contributions
              </h2>

              <button className="text-[10px] text-indigo-600 font-medium">
                View all
              </button>
            </div>

            <table className="w-full text-[10px]">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Member</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>

              <tbody>
                {[1, 2, 3, 4].map((item) => (
                  <tr
                    key={item}
                    className="border-b last:border-none"
                  >
                    <td className="py-2">John Kamau</td>
                    <td>Monthly</td>
                    <td>KES 12,000</td>
                    <td>10 May 2024</td>
                    <td className="text-green-600 font-semibold">
                      Paid
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Overdue Loans */}
          <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm overflow-x-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[11px] font-semibold text-gray-700">
                Overdue Loans
              </h2>

              <button className="text-[10px] text-red-500 font-medium">
                View all
              </button>
            </div>

            <table className="w-full text-[10px]">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Member</th>
                  <th className="pb-2">Loan Amount</th>
                  <th className="pb-2">Overdue Since</th>
                  <th className="pb-2">Balance</th>
                </tr>
              </thead>

              <tbody>
                {[1, 2, 3, 4].map((item) => (
                  <tr
                    key={item}
                    className="border-b last:border-none"
                  >
                    <td className="py-2">Grace Atieno</td>
                    <td>KES 75,000</td>
                    <td>10 May 2024</td>
                    <td className="text-red-500 font-semibold">
                      KES 45,000
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;