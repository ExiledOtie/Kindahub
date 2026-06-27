import React, { useEffect, useMemo, useState } from "react";

import {
  FaUsers,
  FaPiggyBank,
  FaMoneyBillWave,
  FaClock,
  FaWallet,
} from "react-icons/fa";

import { ResponsiveContainer, PieChart, Pie } from "recharts";

import Swal from "sweetalert2";

import { getAdminDashboard } from "../Pages/Services/dashboardService";

const loanStatusData = [
  { name: "Approved", value: 45, fill: "#4f46e5" },
  { name: "Pending", value: 25, fill: "#f59e0b" },
  { name: "Rejected", value: 15, fill: "#ef4444" },
  { name: "Repaid", value: 15, fill: "#10b981" },
];

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const fetchDashboard = async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const data = await getAdminDashboard();

      setDashboard(data);

      setError("");
    } catch (err) {
      console.error(err);

      setError("Failed to load dashboard.");

      Swal.fire("Error", "Unable to load dashboard.", "error");
    } finally {
      setLoading(false);

      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard(true);

    const interval = setInterval(() => {
      fetchDashboard(false);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const currency = (value) => `KES ${Number(value || 0).toLocaleString()}`;

  const stats = useMemo(() => {
    if (!dashboard) return [];

    return [
      {
        title: "Total Members",
        value: dashboard.members,
        note: "Registered Members",
        icon: <FaUsers />,
        bg: "bg-blue-100",
        color: "text-blue-600",
      },

      {
        title: "Monthly Savings",
        value: currency(dashboard.monthlySavings),
        note: "Current Month",
        icon: <FaPiggyBank />,
        bg: "bg-purple-100",
        color: "text-purple-600",
      },

      {
        title: "Approved Loans",
        value: dashboard.approvedLoans,
        note: "Approved Loans",
        icon: <FaMoneyBillWave />,
        bg: "bg-orange-100",
        color: "text-orange-600",
      },

      {
        title: "Pending Loans",
        value: dashboard.pendingLoans,
        note: "Awaiting Approval",
        icon: <FaClock />,
        bg: "bg-yellow-100",
        color: "text-yellow-600",
      },

      {
        title: "Monthly Contributions",
        value: currency(dashboard.monthlyContributions),
        note: "Current Month",
        icon: <FaPiggyBank />,
        bg: "bg-indigo-100",
        color: "text-indigo-600",
      },

      {
        title: "Notifications",
        value: dashboard.notifications,
        note: "Unread Notifications",
        icon: <FaUsers />,
        bg: "bg-red-100",
        color: "text-red-600",
      },

      {
        title: "Chama Wallet",
        value: currency(dashboard.chamaWallet),
        note: "Interest Earned",
        icon: <FaWallet />,
        bg: "bg-emerald-100",
        color: "text-emerald-600",
      },

      {
        title: "Groups",
        value: dashboard.groups,
        note: "Registered Groups",
        icon: <FaUsers />,
        bg: "bg-cyan-100",
        color: "text-cyan-600",
      },
    ];
  }, [dashboard]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-500">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="space-y-4">
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

                  <p className="text-[9px] text-gray-400 mt-1">{item.note}</p>
                </div>

                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center ${item.bg}`}
                >
                  <span className={`text-xs ${item.color}`}>{item.icon}</span>
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
              {dashboard?.savingsChart?.map((item, index) => {
                const max = Math.max(
                  ...dashboard.savingsChart.map((i) => Number(i.amount)),
                );

                const height =
                  max === 0 ? 10 : (Number(item.amount) / max) * 160;

                return (
                  <div
                    key={index}
                    className="flex-1 bg-indigo-400 rounded-t-sm hover:bg-indigo-500 transition-all"
                    style={{
                      height: `${height}px`,
                    }}
                    title={`KES ${Number(item.amount).toLocaleString()}`}
                  />
                );
              })}
            </div>

            {/* Months */}
            <div className="flex justify-between mt-2 text-[9px] text-gray-400">
              {dashboard?.savingsChart?.map((item) => (
                <span key={item.month}>{item.month}</span>
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
                  />
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
                        backgroundColor: item.fill,
                      }}
                    ></span>

                    <span className="text-gray-600">{item.name}</span>
                  </div>

                  <span className="text-gray-500">{item.value}%</span>
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

                    <p className="text-[9px] text-gray-400">Loan Request</p>
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
                  <tr key={item} className="border-b last:border-none">
                    <td className="py-2">John Kamau</td>
                    <td>Monthly</td>
                    <td>KES 12,000</td>
                    <td>10 May 2024</td>
                    <td className="text-green-600 font-semibold">Paid</td>
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
                  <tr key={item} className="border-b last:border-none">
                    <td className="py-2">Grace Atieno</td>
                    <td>KES 75,000</td>
                    <td>10 May 2024</td>
                    <td className="text-red-500 font-semibold">KES 45,000</td>
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
