import { useEffect, useMemo, useState } from "react";
import axios from "../Utils/axios";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";

import { FaSearch, FaCheck, FaTimes, FaPiggyBank } from "react-icons/fa";

const ITEMS_PER_PAGE = 10;

const Savings = () => {
  const [loading, setLoading] = useState(true);
  const [savings, setSavings] = useState([]);

  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchSavings();
  }, []);

  const fetchSavings = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/savings");

      setSavings(res.data || []);
    } catch (error) {
      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load savings",
      });
    } finally {
      setLoading(false);
    }
  };

  const approveSaving = async (id) => {
    const result = await Swal.fire({
      title: "Approve Saving?",
      text: "This saving will be marked as completed.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Approve",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.put(`/savings/${id}/approve`);

      Swal.fire({
        icon: "success",
        title: "Approved",
        text: "Saving approved successfully",
      });

      fetchSavings();
    } catch (error) {
      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to approve saving",
      });
    }
  };

  const rejectSaving = async (id) => {
    const result = await Swal.fire({
      title: "Reject Saving?",
      text: "This saving will be rejected.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Reject",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.put(`/savings/${id}/reject`);

      Swal.fire({
        icon: "success",
        title: "Rejected",
        text: "Saving rejected successfully",
      });

      fetchSavings();
    } catch (error) {
      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to reject saving",
      });
    }
  };

  const totalAmount = useMemo(() => {
    return savings.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [savings]);

  const pendingCount = useMemo(() => {
    return savings.filter((s) => s.status === "pending").length;
  }, [savings]);

  const approvedCount = useMemo(() => {
    return savings.filter((s) => s.status === "completed").length;
  }, [savings]);

  const groups = [...new Set(savings.map((s) => s.group_name).filter(Boolean))];

  const statuses = [...new Set(savings.map((s) => s.status).filter(Boolean))];

  const filteredSavings = useMemo(() => {
    return savings.filter((s) => {
      const matchesSearch =
        s.fullname?.toLowerCase().includes(search.toLowerCase()) ||
        s.username?.toLowerCase().includes(search.toLowerCase());

      const matchesGroup =
        groupFilter === "all" || s.group_name === groupFilter;

      const matchesStatus = statusFilter === "all" || s.status === statusFilter;

      return matchesSearch && matchesGroup && matchesStatus;
    });
  }, [savings, search, groupFilter, statusFilter]);

  const totalPages = Math.ceil(filteredSavings.length / ITEMS_PER_PAGE);

  const paginatedSavings = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;

    return filteredSavings.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSavings, page]);

  const formatCurrency = (amount) => Number(amount || 0).toLocaleString();

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <ClipLoader size={35} color="#16a34a" />
      </div>
    );
  }

  return (
    <div className="space-y-3 text-[10px]">
      {/* HEADER */}
      <div className="bg-white border rounded-xl p-3 flex items-center gap-2">
        <FaPiggyBank className="text-green-600 text-sm" />

        <div>
          <h2 className="font-semibold text-sm">Savings Management</h2>

          <p className="text-[10px] text-gray-500">
            Verify and manage all member savings
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-2">
        <div className="bg-white border rounded-lg p-3">
          <p className="text-[10px] text-gray-500">Total Savings</p>

          <h3 className="text-sm font-bold text-green-600">
            KES {formatCurrency(totalAmount)}
          </h3>
        </div>

        <div className="bg-white border rounded-lg p-3">
          <p className="text-[10px] text-gray-500">Pending Verification</p>

          <h3 className="text-sm font-bold text-orange-600">{pendingCount}</h3>
        </div>

        <div className="bg-white border rounded-lg p-3">
          <p className="text-[10px] text-gray-500">Approved Savings</p>

          <h3 className="text-sm font-bold text-blue-600">{approvedCount}</h3>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white border rounded-xl p-3 flex flex-wrap gap-2">
        <div className="relative">
          <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />

          <input
            placeholder="Search member..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border rounded-lg pl-7 pr-2 py-1 text-[10px]"
          />
        </div>

        <select
          value={groupFilter}
          onChange={(e) => {
            setGroupFilter(e.target.value);
            setPage(1);
          }}
          className="border rounded-lg px-2 py-1 text-[10px]"
        >
          <option value="all">All Groups</option>

          {groups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="border rounded-lg px-2 py-1 text-[10px]"
        >
          <option value="all">All Status</option>

          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
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

                <th className="px-2 py-2 text-left">Username</th>

                <th className="px-2 py-2 text-left">Group</th>

                <th className="px-2 py-2 text-left">Amount</th>

                <th className="px-2 py-2 text-left">Method</th>

                <th className="px-2 py-2 text-left">Reference</th>

                <th className="px-2 py-2 text-left">Status</th>

                <th className="px-2 py-2 text-left">Date</th>

                <th className="px-2 py-2 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedSavings.map((saving) => (
                <tr key={saving.id} className="border-b hover:bg-gray-50">
                  <td className="px-2 py-2">{saving.fullname}</td>

                  <td className="px-2 py-2">{saving.username}</td>

                  <td className="px-2 py-2">{saving.group_name}</td>

                  <td className="px-2 py-2 font-medium text-green-600">
                    KES {formatCurrency(saving.amount)}
                  </td>

                  <td className="px-2 py-2 capitalize">
                    {saving.payment_method}
                  </td>

                  <td className="px-2 py-2">
                    {saving.payment_method === "mpesa"
                      ? saving.mpesa_code || "-"
                      : saving.payment_method === "bank"
                        ? saving.bank_reference || "-"
                        : "-"}
                  </td>

                  <td className="px-2 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-[9px]
                      ${
                        saving.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : saving.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {saving.status}
                    </span>
                  </td>

                  <td className="px-2 py-2">{formatDate(saving.created_at)}</td>

                  <td className="px-2 py-2">
                    {saving.status === "pending" && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => approveSaving(saving.id)}
                          className="bg-green-600 text-white px-2 py-1 rounded"
                        >
                          <FaCheck />
                        </button>

                        <button
                          onClick={() => rejectSaving(saving.id)}
                          className="bg-red-600 text-white px-2 py-1 rounded"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}

        <div className="flex justify-end items-center gap-2 p-3 border-t">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="border px-3 py-1 rounded text-[10px]"
          >
            Prev
          </button>

          <span className="text-[10px]">
            {page} / {totalPages || 1}
          </span>

          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(page + 1)}
            className="border px-3 py-1 rounded text-[10px]"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Savings;
