import { useEffect, useMemo, useState } from "react";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";
import { FaMoneyBillWave, FaSearch } from "react-icons/fa";
import { GiPayMoney, GiTakeMyMoney } from "react-icons/gi";
import { SiAdblock } from "react-icons/si";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";

import axios from "../Utils/axios";

const ITEMS_PER_PAGE = 10;

const Contributions = () => {
  const [loading, setLoading] = useState(true);
  const [contributions, setContributions] = useState([]);

  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchContributions();
  }, []);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/contributions");
      setContributions(res.data || []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load contributions",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => Number(amount || 0).toLocaleString();

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // ========================
  // TOTAL CONTRIBUTIONS
  // ========================
  const totalAmount = useMemo(
    () =>
      contributions.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [contributions],
  );

  // ========================
  // GROUP TOTALS (SINGLE SOURCE OF TRUTH)
  // ========================
  const groupTotalsArray = useMemo(() => {
    const map = {};

    contributions.forEach((c) => {
      if (!c.group_name) return;

      if (!map[c.group_name]) {
        map[c.group_name] = 0;
      }

      map[c.group_name] += Number(c.amount || 0);
    });

    return Object.entries(map).map(([group, total]) => ({
      group,
      total,
    }));
  }, [contributions]);

  // ========================
  // SORTED GROUPS (ONLY ONCE)
  // ========================
  const sortedGroups = useMemo(() => {
    return [...groupTotalsArray].sort((a, b) => b.total - a.total);
  }, [groupTotalsArray]);

  const topGroup = sortedGroups[0]?.group || "-";
  const topAmount = sortedGroups[0]?.total || 0;

  const baseGroupAmount =
    sortedGroups.find((g) => g.group === "13 Amigos")?.total || 0;

  const groups = [
    ...new Set(contributions.map((c) => c.group_name).filter(Boolean)),
  ];

  const statuses = [
    ...new Set(contributions.map((c) => c.status).filter(Boolean)),
  ];

  // ========================
  // FILTERING
  // ========================
  const filtered = useMemo(() => {
    return contributions.filter((c) => {
      const matchesSearch =
        c.fullname?.toLowerCase().includes(search.toLowerCase()) ||
        c.group_name?.toLowerCase().includes(search.toLowerCase());

      const matchesGroup =
        groupFilter === "all" || c.group_name === groupFilter;

      const matchesStatus = statusFilter === "all" || c.status === statusFilter;

      return matchesSearch && matchesGroup && matchesStatus;
    });
  }, [contributions, search, groupFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <ClipLoader size={35} color="#16a34a" />
      </div>
    );
  }
  const approveContribution = async (id) => {
    try {
      await axios.put(`/contributions/${id}/approve`);

      Swal.fire({
        icon: "success",
        title: "Approved",
        text: "Contribution approved successfully",
      });

      fetchContributions();
    } catch (error) {
      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to approve contribution",
      });
    }
  };

  const rejectContribution = async (id) => {
    try {
      await axios.put(`/contributions/${id}/reject`);

      Swal.fire({
        icon: "success",
        title: "Rejected",
        text: "Contribution rejected successfully",
      });

      fetchContributions();
    } catch (error) {
      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to reject contribution",
      });
    }
  };

  return (
    <div className="space-y-3 text-[10px]">
      {/* HEADER */}
      <div className="bg-white border rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaMoneyBillWave className="text-green-600 text-sm" />
          <div>
            <h2 className="font-semibold text-sm">Contributions</h2>
            <p className="text-[10px] text-gray-400">
              Manage and track all group contributions
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-lg border">
            <GiPayMoney className="text-purple-600 text-sm" />
            <div className="text-right">
              <p className="text-[9px] text-gray-500">Top Group</p>
              <p className="text-[11px] font-bold text-purple-700">
                {topGroup}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-lg border">
            <GiTakeMyMoney className="text-blue-600 text-sm" />
            <div className="text-right">
              <p className="text-[9px] text-gray-500">Top Amount</p>
              <p className="text-[11px] font-bold text-blue-700">
                KES {formatCurrency(topAmount)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-lg border">
            <GiPayMoney className="text-green-600 text-sm" />
            <div className="text-right">
              <p className="text-[9px] text-gray-500">13 Amigos</p>
              <p className="text-[11px] font-bold text-green-700">
                KES {formatCurrency(baseGroupAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-2">
        <div className="bg-white border rounded-lg p-2 flex items-center gap-2">
          <GiTakeMyMoney className="text-green-600 text-sm" />
          <div>
            <p className="text-gray-500 text-[9px]">Total</p>
            <h3 className="text-sm font-bold text-green-600">
              KES {formatCurrency(totalAmount)}
            </h3>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-2 flex items-center gap-2">
          <FaMoneyBillWave className="text-blue-600 text-sm" />
          <div>
            <p className="text-gray-500 text-[9px]">Groups</p>
            <h3 className="text-sm font-bold text-blue-600">
              {groupTotalsArray.length}
            </h3>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-2 flex items-center gap-2">
          <GiPayMoney className="text-purple-600 text-sm" />
          <div>
            <p className="text-gray-500 text-[9px]">Top Amount</p>
            <h3 className="text-sm font-bold text-purple-600">
              KES {formatCurrency(topAmount)}
            </h3>
          </div>
        </div>
      </div>

      {/* FILTERS + TABLE */}
      <div className="bg-white border rounded-xl p-3 flex flex-wrap gap-2">
        <div className="relative">
          <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input
            className="border rounded-lg pl-7 pr-2 py-1 text-[10px]"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          className="border rounded-lg px-2 py-1 text-[10px]"
          value={groupFilter}
          onChange={(e) => {
            setGroupFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All Groups</option>
          {groups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <select
          className="border rounded-lg px-2 py-1 text-[10px]"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All Status</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left">Member</th>
                <th className="px-2 py-2 text-left">Group</th>
                <th className="px-2 py-2 text-left">Amount</th>
                <th className="px-2 py-2 text-left">Method</th>
                <th className="px-2 py-2 text-left">MPESA</th>
                <th className="px-2 py-2 text-left">Status</th>
                <th className="px-2 py-2 text-left">Date</th>
                <th className="px-2 py-2 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((c) => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="px-2 py-2">{c.fullname}</td>
                  <td className="px-2 py-2">{c.group_name}</td>
                  <td className="px-2 py-2 text-green-600 font-medium">
                    KES {formatCurrency(c.amount)}
                  </td>
                  <td className="px-2 py-2 capitalize">{c.payment_method}</td>
                  <td className="px-2 py-2">{c.mpesa_code || "-"}</td>
                  <td className="px-2 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                        c.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : c.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-2 py-2">{formatDate(c.created_at)}</td>
                  <td className="px-2 py-2">
                    {c.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => approveContribution(c.id)}
                          className="
          px-2 py-1
          bg-green-600
          hover:bg-green-700
          text-white
          rounded
        "
                        >
                          <IoCheckmarkDoneCircleSharp />
                        </button>

                        <button
                          onClick={() => rejectContribution(c.id)}
                          className="
          px-2 py-1
          bg-red-600
          hover:bg-red-700
          text-white
          rounded
        "
                        >
                          <SiAdblock />
                        </button>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Contributions;
