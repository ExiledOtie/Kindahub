import { useEffect, useState } from "react";
import axios from "../../Utils/axios";
import { ClipLoader } from "react-spinners";

import {
  FaUserCircle,
  FaMoneyBillWave,
  FaWallet,
  FaUsers,
} from "react-icons/fa";

import { MdSavings, MdLockReset, MdOutlineCalendarMonth } from "react-icons/md";
import { FaPiggyBank } from "react-icons/fa";

const SummaryTab = ({ memberId }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const currentUser = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    fetchSummary();
  }, [memberId]);

  const fetchSummary = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`/users/member-summary/${memberId}`);

      setData(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!password) return;

    try {
      setResetLoading(true);

      await axios.put(`/users/${memberId}/reset-password`, { password });

      setShowModal(false);
      setPassword("");

      alert("Password reset successfully");
    } catch (error) {
      console.log(error);
      alert("Failed to reset password");
    } finally {
      setResetLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <ClipLoader size={35} color="#16a34a" />
      </div>
    );
  }

  const member = data?.user;
  const stats = data?.stats || {};
  const activities = data?.activities || [];

  return (
    <div className="space-y-4">
      {/* PROFILE CARD */}
      <div className="bg-white rounded-2xl border p-4 shadow-sm">
        <div className="flex justify-between flex-col lg:flex-row gap-5">
          {/* LEFT */}
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg">
              {member?.fullname?.charAt(0)}
              {member?.username?.charAt(0)}
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-800">
                {member?.fullname}
              </h2>

              <p className="text-[11px] text-gray-500">@{member?.username}</p>

              <p className="text-[11px] text-gray-400 mt-2">
                Member since:{" "}
                {member?.created_at
                  ? new Date(member.created_at).toDateString()
                  : "Unknown"}
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col lg:items-end gap-3">
            <div className="text-left lg:text-right">
              <p className="text-[10px] text-gray-400">Last Login</p>

              <p className="text-[11px] font-medium text-gray-700">
                {member?.last_login
                  ? new Date(member.last_login).toLocaleString()
                  : "Never"}
              </p>
            </div>

            {currentUser?.is_super_admin && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-[11px] hover:bg-blue-50"
              >
                <MdLockReset />
                Reset Password
              </button>
            )}
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard
          icon={<FaMoneyBillWave />}
          title="Total Contributions"
          value={`KES ${Number(stats.totalContributions || 0).toLocaleString()}`}
          bg="bg-green-100"
          color="text-green-600"
        />

        <StatCard
          icon={<MdSavings />}
          title="Total Savings"
          value={`KES ${Number(stats.totalSavings || 0).toLocaleString()}`}
          bg="bg-blue-100"
          color="text-blue-600"
        />

        <StatCard
          icon={<FaWallet />}
          title="Current Balance"
          value={`KES ${Number(stats.currentBalance || 0).toLocaleString()}`}
          bg="bg-yellow-100"
          color="text-yellow-600"
        />

        <StatCard
          icon={<MdOutlineCalendarMonth />}
          title="Active Loans"
          value={stats.activeLoans || 0}
          bg="bg-purple-100"
          color="text-purple-600"
        />

        <StatCard
          icon={<FaPiggyBank />}
          title="Credit Wallet"
          value={`KES ${Number(stats.walletBalance || 0).toLocaleString()}`}
          bg="bg-emerald-100"
          color="text-emerald-600"
        />
      </div>

      {/* GROUP INFO */}
      <div className="bg-white border rounded-xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <FaUsers className="text-green-600" />
          <h3 className="font-semibold text-sm">Group Information</h3>
        </div>

        <div className="grid grid-cols-3 text-[11px]">
          <div>
            <p className="text-gray-400">Group</p>
            <p className="font-medium">{member?.group_name || "N/A"}</p>
          </div>

          <div>
            <p className="text-gray-400">Role</p>
            <p className="font-medium">{member?.group_role || "Member"}</p>
          </div>

          <div>
            <p className="text-gray-400">Status</p>
            <p className="font-medium text-green-600">{member?.status}</p>
          </div>
        </div>
      </div>

      {/* ACTIVITIES */}
      <div className="bg-white border rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>

        <div className="space-y-3">
          {activities.map((a, i) => (
            <div
              key={i}
              className="flex justify-between border-b pb-3 last:border-none"
            >
              <div>
                <p className="text-[11px] font-medium">{a.description}</p>
                <p className="text-[10px] text-gray-400">{a.type}</p>
              </div>

              <p className="text-[10px] text-gray-400">
                {new Date(a.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* RESET PASSWORD MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-5 rounded-xl w-[300px]">
            <h3 className="font-semibold mb-3">Reset Password</h3>

            <input
              type="password"
              placeholder="New password"
              className="border w-full p-2 rounded text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="text-sm text-gray-500"
              >
                Cancel
              </button>

              <button
                onClick={handleResetPassword}
                disabled={resetLoading}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                {resetLoading ? "Saving..." : "Reset"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* SMALL STATS COMPONENT */
const StatCard = ({ icon, title, value, bg, color }) => (
  <div className="bg-white border rounded-xl p-3 shadow-sm">
    <div className="flex gap-2 items-center">
      <div className={`p-2 rounded-full ${bg} ${color}`}>{icon}</div>

      <div>
        <p className="text-[8px] text-gray-500">{title}</p>
        <p className="font-semibold text-[12px]">{value}</p>
      </div>
    </div>
  </div>
);

export default SummaryTab;
