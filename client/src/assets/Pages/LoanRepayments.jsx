import { useEffect, useMemo, useState } from "react";
import axios from "../Utils/axios";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";

import { FaMoneyBillWave, FaSearch } from "react-icons/fa";

const ITEMS_PER_PAGE = 10;

const LoanRepayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [page, setPage] = useState(1);

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/loan-payments");

      setPayments(
        Array.isArray(res.data)
          ? res.data
          : res.data.data || res.data.payments || []
      );
    } catch (error) {
      console.log(error);
      Swal.fire("Error", "Failed to fetch loan repayments", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  /* ================= SUMMARY ================= */

  const totalCollected = useMemo(
    () => payments.reduce((sum, p) => sum + Number(p.amount || 0), 0),
    [payments]
  );

  const totalPrincipal = useMemo(
    () => payments.reduce((sum, p) => sum + Number(p.principal_paid || 0), 0),
    [payments]
  );

  const totalInterest = useMemo(
    () => payments.reduce((sum, p) => sum + Number(p.interest_paid || 0), 0),
    [payments]
  );

  /* ================= FILTERS ================= */

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch =
        (payment.fullname || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        String(payment.loan_number || "").includes(search);

      const matchesGroup =
        groupFilter === "all" || payment.group_name === groupFilter;

      return matchesSearch && matchesGroup;
    });
  }, [payments, search, groupFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPayments.length / ITEMS_PER_PAGE)
  );

  const paginatedPayments = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;

    return filteredPayments.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPayments, page]);

  const groups = [
    ...new Set(payments.map((p) => p.group_name).filter(Boolean)),
  ];

  const format = (value) => Number(value || 0).toLocaleString();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[65vh]">
        <ClipLoader size={28} color="#16a34a" />
      </div>
    );
  }

  return (
    <div className="space-y-2.5 text-[9px]">

      {/* ================= HEADER ================= */}

      <div className="bg-white border rounded-lg shadow-sm px-3 py-2 flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center">
          <FaMoneyBillWave className="text-[11px] text-green-600" />
        </div>

        <div>
          <h2 className="text-[11px] font-semibold text-gray-800">
            Loan Repayments Ledger
          </h2>

          <p className="text-[9px] text-gray-400">
            Repayment transactions overview
          </p>
        </div>
      </div>

      {/* ================= SUMMARY CARDS ================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">

        <div className="bg-white border rounded-md p-2 shadow-sm">
          <p className="text-[8px] uppercase tracking-wide text-gray-400">
            Total Collected
          </p>

          <p className="mt-1 text-[11px] font-bold text-green-600">
            KES {format(totalCollected)}
          </p>
        </div>

        <div className="bg-white border rounded-md p-2 shadow-sm">
          <p className="text-[8px] uppercase tracking-wide text-gray-400">
            Principal
          </p>

          <p className="mt-1 text-[11px] font-bold text-blue-600">
            KES {format(totalPrincipal)}
          </p>
        </div>

        <div className="bg-white border rounded-md p-2 shadow-sm">
          <p className="text-[8px] uppercase tracking-wide text-gray-400">
            Interest Earned
          </p>

          <p className="mt-1 text-[11px] font-bold text-orange-600">
            KES {format(totalInterest)}
          </p>
        </div>

      </div>

      {/* ================= FILTERS ================= */}

      <div className="bg-white border rounded-lg shadow-sm p-2.5">

        <div className="flex flex-wrap items-center gap-2">

          <div className="relative flex-1 min-w-[220px]">
            <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] text-gray-400" />

            <input
              type="text"
              placeholder="Search member or loan..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full h-8 rounded-md border pl-7 pr-2 text-[9px] focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          <select
            value={groupFilter}
            onChange={(e) => {
              setGroupFilter(e.target.value);
              setPage(1);
            }}
            className="h-8 min-w-[150px] rounded-md border px-2 text-[9px] focus:ring-2 focus:ring-green-500 focus:outline-none"
          >
            <option value="all">All Groups</option>

            {groups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>

        </div>
      </div>

      {/* ================= TABLE ================= */}

       {/* ================= TABLE ================= */}

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[9px]">
            <thead className="bg-gray-50 border-b">
              <tr className="text-gray-600 font-semibold">
                <th className="px-2 py-1.5 text-left whitespace-nowrap">
                  Date
                </th>

                <th className="px-2 py-1.5 text-left whitespace-nowrap">
                  Member
                </th>

                <th className="px-2 py-1.5 text-left whitespace-nowrap">
                  Group
                </th>

                <th className="px-2 py-1.5 text-left whitespace-nowrap">
                  Loan #
                </th>

                <th className="px-2 py-1.5 text-right whitespace-nowrap">
                  Amount
                </th>

                <th className="px-2 py-1.5 text-right whitespace-nowrap">
                  Principal
                </th>

                <th className="px-2 py-1.5 text-right whitespace-nowrap">
                  Interest
                </th>

                <th className="px-2 py-1.5 text-center whitespace-nowrap">
                  Method
                </th>

                <th className="px-2 py-1.5 text-right whitespace-nowrap">
                  Balance
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedPayments.length > 0 ? (
                paginatedPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-2 py-1.5 whitespace-nowrap text-gray-600">
                      {payment.created_at
                        ? new Date(payment.created_at).toLocaleDateString(
                            "en-GB"
                          )
                        : "-"}
                    </td>

                    <td className="px-2 py-1.5">
                      <div className="font-medium text-[9px]">
                        {payment.fullname}
                      </div>

                      <div className="text-[8px] text-gray-400">
                        #{payment.loan_number}
                      </div>
                    </td>

                    <td className="px-2 py-1.5 whitespace-nowrap">
                      {payment.group_name}
                    </td>

                    <td className="px-2 py-1.5 text-center">
                      #{payment.loan_number}
                    </td>

                    <td className="px-2 py-1.5 text-right font-semibold text-green-600 whitespace-nowrap">
                      KES {format(payment.amount)}
                    </td>

                    <td className="px-2 py-1.5 text-right whitespace-nowrap">
                      KES {format(payment.principal_paid)}
                    </td>

                    <td className="px-2 py-1.5 text-right whitespace-nowrap text-orange-600">
                      KES {format(payment.interest_paid)}
                    </td>

                    <td className="px-2 py-1.5 text-center uppercase whitespace-nowrap">
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-gray-100 text-[8px] font-medium">
                        {payment.payment_method}
                      </span>
                    </td>

                    <td className="px-2 py-1.5 text-right font-semibold text-red-600 whitespace-nowrap">
                      KES {format(payment.balance_after)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="py-8 text-center text-[9px] text-gray-400"
                  >
                    No repayments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ================= PAGINATION ================= */}

        <div className="border-t bg-gray-50 px-3 py-2 flex items-center justify-between text-[9px]">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="h-7 px-3 border rounded-md bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>

          <span className="font-medium text-gray-600">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="h-7 px-3 border rounded-md bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoanRepayments;