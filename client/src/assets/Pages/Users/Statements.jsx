import { useEffect, useMemo, useState } from "react";
import { FaClipboard } from "react-icons/fa";
import axios from "../../Utils/axios";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const ITEMS_PER_PAGE = 10;

const TABS = [
  "contributions",
  "savings",
  "loans",
  "repayments",
];

const Statements = () => {
  const [activeTab, setActiveTab] =
    useState("contributions");

  const [records, setRecords] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [page, setPage] =
    useState(1);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [summary, setSummary] =
    useState({
      contributions: 0,
      savings: 0,
      loans: 0,
      repayments: 0,
      balance: 0,
    });

  const getEndpoint = () => {
    switch (activeTab) {
      case "contributions":
        return "/contributions/my";

      case "savings":
        return "/savings/my";

      case "loans":
        return "/loans/my";

      case "repayments":
        return "/loan-payments/my";

      default:
        return "/contributions/my";
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const [
        contributionsRes,
        savingsRes,
        loansRes,
      ] = await Promise.all([
        axios.get("/contributions/my"),
        axios.get("/savings/my"),
        axios.get("/loans/my"),
      ]);

      let repayments = [];

      try {
        const repaymentsRes =
          await axios.get(
            "/loan-payments/my"
          );

        repayments =
          repaymentsRes.data || [];
      } catch {
        repayments = [];
      }

      setSummary({
        contributions:
          contributionsRes.data.reduce(
            (sum, item) =>
              sum +
              Number(
                item.amount || 0
              ),
            0
          ),

        savings:
          savingsRes.data.reduce(
            (sum, item) =>
              sum +
              Number(
                item.amount || 0
              ),
            0
          ),

        loans:
          loansRes.data.reduce(
            (sum, item) =>
              sum +
              Number(
                item.amount || 0
              ),
            0
          ),

        repayments:
          repayments.reduce(
            (sum, item) =>
              sum +
              Number(
                item.amount || 0
              ),
            0
          ),

        balance:
          loansRes.data
            .filter(
              (loan) =>
                loan.status ===
                "approved"
            )
            .reduce(
              (sum, loan) =>
                sum +
                Number(
                  loan.balance || 0
                ),
              0
            ),
      });

      const res =
        await axios.get(
          getEndpoint()
        );

      setRecords(res.data || []);

    } catch (error) {

      console.log(error);

      Swal.fire(
        "Error",
        "Failed to load statement",
        "error"
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchData();
    setPage(1);
  }, [activeTab]);

  const filteredData =
    useMemo(() => {
      return records.filter(
        (item) => {
          const matchesSearch =
            JSON.stringify(item)
              .toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchesStatus =
            statusFilter ===
              "all" ||
            item.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      records,
      search,
      statusFilter,
    ]);

  const statuses = [
    ...new Set(
      records
        .map(
          (item) =>
            item.status
        )
        .filter(Boolean)
    ),
  ];

  const totalPages =
    Math.ceil(
      filteredData.length /
        ITEMS_PER_PAGE
    );

  const paginatedData =
    useMemo(() => {
      const start =
        (page - 1) *
        ITEMS_PER_PAGE;

      return filteredData.slice(
        start,
        start +
          ITEMS_PER_PAGE
      );
    }, [
      filteredData,
      page,
    ]);

  const exportCSV = () => {
    const worksheet =
      XLSX.utils.json_to_sheet(
        filteredData
      );

    const csv =
      XLSX.utils.sheet_to_csv(
        worksheet
      );

    const blob =
      new Blob([csv], {
        type: "text/csv",
      });

    saveAs(
      blob,
      `my-${activeTab}.csv`
    );
  };

  const exportExcel = () => {
    const workbook =
      XLSX.utils.book_new();

    const worksheet =
      XLSX.utils.json_to_sheet(
        filteredData
      );

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      activeTab
    );

    XLSX.writeFile(
      workbook,
      `my-${activeTab}.xlsx`
    );
  };

  const formatCurrency = (
    value
  ) =>
    Number(
      value || 0
    ).toLocaleString();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <ClipLoader
          size={35}
          color="#16a34a"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 text-[11px]">

      {/* HEADER */}

      <div className="bg-white border rounded-xl p-3 flex items-center gap-2">
        <FaClipboard className="text-green-600" />
        <h2 className="font-semibold text-[11px]">
          My Statements
        </h2>
      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">

        <div className="bg-white border rounded-xl p-3">
          <p className="text-[10px] text-gray-500">
            Contributions
          </p>

          <p className="font-semibold">
            KES{" "}
            {formatCurrency(
              summary.contributions
            )}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-3">
          <p className="text-[10px] text-gray-500">
            Savings
          </p>

          <p className="font-semibold">
            KES{" "}
            {formatCurrency(
              summary.savings
            )}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-3">
          <p className="text-[10px] text-gray-500">
            Loans
          </p>

          <p className="font-semibold">
            KES{" "}
            {formatCurrency(
              summary.loans
            )}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-3">
          <p className="text-[10px] text-gray-500">
            Repayments
          </p>

          <p className="font-semibold">
            KES{" "}
            {formatCurrency(
              summary.repayments
            )}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-3">
          <p className="text-[10px] text-gray-500">
            Outstanding
          </p>

          <p className="font-semibold text-red-600">
            KES{" "}
            {formatCurrency(
              summary.balance
            )}
          </p>
        </div>

      </div>

      {/* TABS */}

      <div className="flex flex-wrap gap-2">

        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() =>
              setActiveTab(tab)
            }
            className={`px-3 py-2 rounded-lg border capitalize ${
              activeTab === tab
                ? "bg-green-600 text-white"
                : "bg-white"
            }`}
          >
            {tab}
          </button>
        ))}

      </div>

      {/* FILTERS */}

      <div className="bg-white border rounded-xl p-3 flex flex-wrap gap-2">

        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="border rounded px-3 py-2"
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
          className="border rounded px-3 py-2"
        >
          <option value="all">
            All Status
          </option>

          {statuses.map(
            (status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            )
          )}
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

      {/* TABLE */}

      <div className="bg-white border rounded-xl overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-[10px]">

            <thead className="bg-gray-50">

              <tr>

                {paginatedData[0] &&
                  Object.keys(
                    paginatedData[0]
                  ).map((key) => (
                    <th
                      key={key}
                      className="px-3 py-2 text-left capitalize"
                    >
                      {key.replaceAll(
                        "_",
                        " "
                      )}
                    </th>
                  ))}

              </tr>

            </thead>

            <tbody>

              {paginatedData.length >
              0 ? (
                paginatedData.map(
                  (
                    row,
                    index
                  ) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-gray-50"
                    >
                      {Object.values(
                        row
                      ).map(
                        (
                          value,
                          i
                        ) => (
                          <td
                            key={i}
                            className="px-3 py-2"
                          >
                            {String(
                              value ??
                                "-"
                            )}
                          </td>
                        )
                      )}
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan="20"
                    className="text-center py-6"
                  >
                    No records found
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

        {/* PAGINATION */}

        <div className="flex justify-between items-center border-t p-3">

          <button
            disabled={page === 1}
            onClick={() =>
              setPage(
                page - 1
              )
            }
            className="border px-3 py-1 rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span>
            Page {page} of{" "}
            {totalPages || 1}
          </span>

          <button
            disabled={
              page ===
                totalPages ||
              totalPages === 0
            }
            onClick={() =>
              setPage(
                page + 1
              )
            }
            className="border px-3 py-1 rounded disabled:opacity-50"
          >
            Next
          </button>

        </div>

      </div>

    </div>
  );
};

export default Statements;