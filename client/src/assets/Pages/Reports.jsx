import { useEffect, useMemo, useState } from "react";
import { FaClipboard } from "react-icons/fa";
import axios from "../Utils/axios";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const ITEMS_PER_PAGE = 10;
const TABS = ["contributions", "loans", "repayments", "savings", "interest"];

const Reports = () => {
  const [activeTab, setActiveTab] = useState("contributions");
  const [summary, setSummary] = useState({});
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [summaryRes, reportsRes] = await Promise.all([
        axios.get("/reports/summary"),
        axios.get(`/reports?type=${activeTab}`),
      ]);

      setSummary(summaryRes.data || {});
      setReports(reportsRes.data || []);
    } catch (error) {
      console.log(error);
      Swal.fire("Error", "Failed to load reports", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setPage(1);
  }, [activeTab]);

  const filteredData = useMemo(() => {
    return reports.filter((item) => {
      const matchesSearch = JSON.stringify(item)
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesGroup =
        groupFilter === "all" || item.group_name === groupFilter;

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesGroup && matchesStatus;
    });
  }, [reports, search, groupFilter, statusFilter]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;

    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, page]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const groups = [...new Set(reports.map((r) => r.group_name).filter(Boolean))];

  const statuses = [...new Set(reports.map((r) => r.status).filter(Boolean))];

  const exportCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);

    const csv = XLSX.utils.sheet_to_csv(worksheet);

    const blob = new Blob([csv], {
      type: "text/csv",
    });

    saveAs(blob, `${activeTab}-report.csv`);
  };

  const exportExcel = () => {
    const workbook = XLSX.utils.book_new();

    const worksheet = XLSX.utils.json_to_sheet(filteredData);

    XLSX.utils.book_append_sheet(workbook, worksheet, activeTab);

    XLSX.writeFile(workbook, `${activeTab}-report.xlsx`);
  };

  const formatCurrency = (amount) => Number(amount || 0).toLocaleString();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <ClipLoader size={35} color="#16a34a" />
      </div>
    );
  }

  return (
    <div className="space-y-4 text-[11px] p-4">
      {/* HEADER */}
      <div className="bg-white p-3 rounded-xl border flex items-center gap-2">
        <FaClipboard className="text-green-600" />
        <h2 className="font-semibold text-[11px]">
          {activeTab === "interest" ? "Interest Report" : "Reports"}
        </h2>
      </div>

      {activeTab !== "interest" && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            ["Total Contributions", summary.total_contributions],
            ["Loans Issued", summary.total_loans_issued],
            ["Repayments", summary.total_loan_repayments],
            ["Outstanding", summary.outstanding_balances],
            ["Savings", summary.total_savings],
            ["Interest", summary.total_interest],
          ].map(([label, value]) => (
            <div key={label} className="bg-white border rounded-xl p-3">
              <p className="text-[10px] text-gray-500">{label}</p>

              <p className="font-semibold">KES {formatCurrency(value)}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 rounded-lg border ${
              activeTab === tab ? "bg-green-600 text-white" : "bg-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "interest" ? (
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="flex justify-between items-center border-b px-6 py-4">
            <div>
              <h3 className="text-[15px] font-semibold">💰 Interest Report</h3>

              <p className="text-[10px] text-gray-500 mt-1">
                View all interest collected from member loan repayments.
              </p>
            </div>

            <button
              onClick={exportExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-[11px]"
            >
              Export Excel
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5">
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-[10px] text-gray-500">Total Interest</p>

              <h2 className="font-bold text-[18px] text-green-700">
                KES {formatCurrency(summary.total_interest)}
              </h2>
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-[10px] text-gray-500">This Month</p>

              <h2 className="font-bold text-[18px] text-blue-700">
                KES {formatCurrency(summary.monthly_interest)}
              </h2>
            </div>

            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-[10px] text-gray-500">Kinda Family</p>

              <h2 className="font-bold text-[18px] text-purple-700">
                KES {formatCurrency(summary.kinda_family_interest)}
              </h2>
            </div>

            <div className="bg-orange-50 rounded-xl p-4">
              <p className="text-[10px] text-gray-500">13 Amigos</p>

              <h2 className="font-bold text-[18px] text-orange-700">
                KES {formatCurrency(summary.amigos_interest)}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 px-5 pb-5">
            <input
              type="text"
              placeholder="Search member..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-3 py-2 w-72"
            />

            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="all">All Groups</option>

              {groups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>

            <button
              onClick={exportCSV}
              className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              CSV
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border rounded-xl p-3 flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search..."
            className="border rounded px-3 py-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="border rounded px-3 py-2"
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
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">All Status</option>

            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <button
            onClick={exportCSV}
            className="px-3 py-2 bg-blue-600 text-white rounded"
          >
            Export CSV
          </button>

          <button
            onClick={exportExcel}
            className="px-3 py-2 bg-green-600 text-white rounded"
          >
            Export Excel
          </button>
        </div>
      )}

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === "interest" ? (
            <table className="w-full text-[11px]">
              <thead className="bg-gray-100">
                <tr className="text-[11px] uppercase tracking-wide text-gray-600">
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Member</th>
                  <th className="px-4 py-3 text-left">Group</th>
                  <th className="px-4 py-3 text-left">Loan Ref</th>
                  <th className="px-4 py-3 text-right">Interest Collected</th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.length ? (
                  paginatedData.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-3">
                        {new Date(row.date).toLocaleDateString()}
                      </td>

                      <td className="px-3 py-3 font-medium">{row.member}</td>

                      <td className="px-3 py-3">
                        <span className="px-2 py-1 rounded-full bg-green-100 text-green-700">
                          {row.group_name}
                        </span>
                      </td>

                      <td className="px-3 py-3 font-mono">
                        {row.loan_reference}
                      </td>

                      <td className="px-3 py-3 text-right font-semibold text-green-700">
                        KES {formatCurrency(row.interest_collected)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No interest has been collected yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-[10px]">
              <thead className="bg-gray-50">
                <tr>
                  {paginatedData[0] &&
                    Object.keys(paginatedData[0]).map((key) => (
                      <th key={key} className="px-3 py-2 text-left">
                        {key}
                      </th>
                    ))}
                </tr>
              </thead>

              <tbody>
                {paginatedData.length ? (
                  paginatedData.map((row, index) => (
                    <tr key={index} className="border-b">
                      {Object.values(row).map((value, i) => (
                        <td key={i} className="px-3 py-2">
                          {String(value ?? "-")}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-6 text-center">No data found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-between p-3 border-t">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="border px-3 py-1 rounded"
          >
            Previous
          </button>

          <span>
            Page {page} of {totalPages || 1}
          </span>

          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(page + 1)}
            className="border px-3 py-1 rounded"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
