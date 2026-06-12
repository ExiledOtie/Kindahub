import { useEffect, useMemo, useState } from "react";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";
import { FaMoneyBillWave, FaSearch } from "react-icons/fa";

import axios from "../Utils/axios";

const ITEMS_PER_PAGE = 10;

const Contributions = () => {
  const [loading, setLoading] = useState(true);
  const [contributions, setContributions] = useState([]);

  // filters
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
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load contributions",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString();

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // totals
  const totalAmount = useMemo(
    () =>
      contributions.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      ),
    [contributions]
  );

  // unique filters
  const groups = [...new Set(contributions.map(c => c.group_name).filter(Boolean))];
  const statuses = [...new Set(contributions.map(c => c.status).filter(Boolean))];

  // filtering
  const filtered = useMemo(() => {
    return contributions.filter((c) => {
      const matchesSearch =
        c.fullname?.toLowerCase().includes(search.toLowerCase()) ||
        c.group_name?.toLowerCase().includes(search.toLowerCase());

      const matchesGroup =
        groupFilter === "all" || c.group_name === groupFilter;

      const matchesStatus =
        statusFilter === "all" || c.status === statusFilter;

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

  return (
    <div className="space-y-3 text-[10px]">

      {/* HEADER */}
      <div className="bg-white border rounded-xl p-3 flex items-center gap-2">
        <FaMoneyBillWave className="text-green-600 text-sm" />
        <div>
          <h2 className="font-semibold text-sm">Contributions</h2>
          <p className="text-[10px] text-gray-400">
            View all member contributions
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="bg-white border rounded-xl p-3">
          <p className="text-gray-500 text-[10px]">Total Records</p>
          <h3 className="text-base font-bold">{contributions.length}</h3>
        </div>

        <div className="bg-white border rounded-xl p-3">
          <p className="text-gray-500 text-[10px]">Total Amount</p>
          <h3 className="text-base font-bold text-green-600">
            KES {formatCurrency(totalAmount)}
          </h3>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white border rounded-xl p-3 flex flex-wrap gap-2 text-[10px]">

        {/* SEARCH */}
        <div className="relative">
          <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input
            className="border rounded-lg pl-7 pr-2 py-1 text-[10px]"
            placeholder="Search member / group"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* GROUP FILTER */}
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

        {/* STATUS FILTER */}
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
              </tr>
            </thead>

            <tbody>
              {paginated.length > 0 ? (
                paginated.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">

                    <td className="px-2 py-2">{c.fullname}</td>
                    <td className="px-2 py-2">{c.group_name}</td>

                    <td className="px-2 py-2 font-medium text-green-600">
                      KES {formatCurrency(c.amount)}
                    </td>

                    <td className="px-2 py-2 capitalize">
                      {c.payment_method}
                    </td>

                    <td className="px-2 py-2">
                      {c.mpesa_code || "-"}
                    </td>

                    <td className="px-2 py-2">
                      <span className="px-2 py-1 rounded-full text-[9px] bg-green-100 text-green-700">
                        {c.status}
                      </span>
                    </td>

                    <td className="px-2 py-2">
                      {formatDate(c.created_at)}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-400">
                    No contributions found
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-between items-center p-3 border-t text-[10px]">

          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span>
            Page {page} of {totalPages || 1}
          </span>

          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(page + 1)}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>

        </div>

      </div>

    </div>
  );
};

export default Contributions;