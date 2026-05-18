// Pages/UserDashboard.jsx

import React from "react";
import Sidebar from "../Components/Sidebar";

import {
  FaPiggyBank,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaWallet,
} from "react-icons/fa";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const stats = [
  {
    title: "Total Savings",
    value: "KES 24,500",
    note: "All time savings",
    icon: <FaPiggyBank />,
    bg: "bg-green-100",
    color: "text-green-600",
  },
  {
    title: "This Month Contribution",
    value: "KES 2,000",
    note: "Monthly target",
    icon: <FaWallet />,
    bg: "bg-blue-100",
    color: "text-blue-600",
  },
  {
    title: "Loan Balance",
    value: "KES 30,000",
    note: "Outstanding",
    icon: <FaMoneyBillWave />,
    bg: "bg-purple-100",
    color: "text-purple-600",
  },
  {
    title: "Next Contribution Date",
    value: "25 May 2024",
    note: "In 7 days",
    icon: <FaCalendarAlt />,
    bg: "bg-orange-100",
    color: "text-orange-500",
  },
];

const savingsData = [
  { month: "Jan", amount: 2000 },
  { month: "Feb", amount: 4000 },
  { month: "Mar", amount: 7000 },
  { month: "Apr", amount: 6000 },
  { month: "May", amount: 9000 },
  { month: "Jun", amount: 8000 },
  { month: "Jul", amount: 12000 },
  { month: "Aug", amount: 15000 },
  { month: "Sep", amount: 16000 },
  { month: "Oct", amount: 14000 },
  { month: "Nov", amount: 20000 },
  { month: "Dec", amount: 24500 },
];

const loanData = [
  { name: "Paid", value: 60, color: "#16a34a" },
  { name: "Balance", value: 40, color: "#d1d5db" },
];

const UserDashboard = () => {
  return (
    <div className="flex bg-[#f5f7fb] min-h-screen">
      {/* Sidebar */}
      <Sidebar role="user" />

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
            Member Dashboard (User View)
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-4">
          {/* Savings Growth */}
          <div className="lg:col-span-2 bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[11px] font-semibold text-gray-700">
                Savings Growth
              </h2>

              <select className="text-[10px] border rounded px-2 py-1 outline-none">
                <option>Yearly</option>
              </select>
            </div>

            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={savingsData}>
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#4f46e5"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Loan Progress */}
          <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[11px] font-semibold text-gray-700">
                Loan Repayment Progress
              </h2>
            </div>

            <div className="h-[180px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={loanData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={60}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                  >
                    {loanData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.color}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <h2 className="text-xl font-bold text-gray-700">
                  60%
                </h2>

                <p className="text-[10px] text-gray-400">
                  Paid
                </p>
              </div>
            </div>

            {/* Loan Details */}
            <div className="space-y-2 mt-2 text-[10px]">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Total Loan
                </span>

                <span className="font-semibold text-gray-700">
                  KES 50,000
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Paid
                </span>

                <span className="font-semibold text-green-600">
                  KES 30,000
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Balance
                </span>

                <span className="font-semibold text-red-500">
                  KES 20,000
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
          {/* Recent Contributions */}
          <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
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
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>

              <tbody>
                {[1, 2, 3, 4].map((item) => (
                  <tr
                    key={item}
                    className="border-b last:border-none"
                  >
                    <td className="py-2">10 May 2024</td>
                    <td>Monthly</td>
                    <td>KES 2,000</td>

                    <td className="text-green-600 font-semibold">
                      Paid
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* My Loans */}
          <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[11px] font-semibold text-gray-700">
                My Loans
              </h2>

              <button className="text-[10px] text-indigo-600 font-medium">
                View all
              </button>
            </div>

            <div className="border rounded-lg p-3 text-[10px]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700">
                  Loan #LN-2024-001
                </h3>

                <span className="px-2 py-1 rounded bg-green-100 text-green-600 text-[9px] font-semibold">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-400">
                    Amount
                  </p>

                  <h4 className="font-semibold text-gray-700">
                    KES 50,000
                  </h4>
                </div>

                <div>
                  <p className="text-gray-400">
                    Paid
                  </p>

                  <h4 className="font-semibold text-green-600">
                    KES 30,000
                  </h4>
                </div>

                <div>
                  <p className="text-gray-400">
                    Balance
                  </p>

                  <h4 className="font-semibold text-red-500">
                    KES 20,000
                  </h4>
                </div>

                <div>
                  <p className="text-gray-400">
                    Next Payment
                  </p>

                  <h4 className="font-semibold text-gray-700">
                    25 May 2024
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
          {/* Announcement */}
          <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
            <h2 className="text-[11px] font-semibold text-gray-700 mb-2">
              Latest Announcement
            </h2>

            <p className="text-[10px] text-gray-500 leading-relaxed">
              Monthly meeting will be held on 25 May 2024 at
              10:00 AM. All members are encouraged to attend.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
            <h2 className="text-[11px] font-semibold text-gray-700 mb-3">
              Quick Actions
            </h2>

            <div className="flex gap-3">
              <button className="flex-1 border border-green-500 text-green-600 rounded-lg py-2 text-[10px] font-semibold hover:bg-green-50 transition">
                Make Contribution
              </button>

              <button className="flex-1 border border-indigo-500 text-indigo-600 rounded-lg py-2 text-[10px] font-semibold hover:bg-indigo-50 transition">
                Request Loan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;