import { useEffect, useMemo, useState } from "react";
import axios from "../Utils/axios";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";

import {
  FaMoneyBillWave,
  FaSearch,
} from "react-icons/fa";

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

      setPayments(res.data);
    } catch (error) {
      console.log(error);

      Swal.fire(
        "Error",
        "Failed to fetch loan repayments",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Summary cards
  const totalCollected = useMemo(() => {
    return payments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );
  }, [payments]);

  const totalPrincipal = useMemo(() => {
    return payments.reduce(
      (sum, payment) =>
        sum + Number(payment.principal_paid || 0),
      0
    );
  }, [payments]);

  const totalInterest = useMemo(() => {
    return payments.reduce(
      (sum, payment) =>
        sum + Number(payment.interest_paid || 0),
      0
    );
  }, [payments]);

  // Filters
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch =
        payment.fullname
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        payment.loan_number
          ?.toString()
          .includes(search);

      const matchesGroup =
        groupFilter === "all" ||
        payment.group_name === groupFilter;

      return matchesSearch && matchesGroup;
    });
  }, [payments, search, groupFilter]);

  const totalPages = Math.ceil(
    filteredPayments.length / ITEMS_PER_PAGE
  );

  const paginatedPayments = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;

    return filteredPayments.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [filteredPayments, page]);

  const groups = [
    ...new Set(
      payments
        .map((payment) => payment.group_name)
        .filter(Boolean)
    ),
  ];

  const format = (value) =>
    Number(value || 0).toLocaleString();

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
    <div className="space-y-4 text-[11px]">

      {/* HEADER */}
      <div className="bg-white p-4 rounded-xl border flex items-center gap-2">
        <FaMoneyBillWave className="text-green-600" />

        <h2 className="font-semibold">
          Loan Repayments Ledger
        </h2>
      </div>

      {/* SUMMARY */}
      <div className="grid md:grid-cols-3 gap-3">

        <div className="bg-white border rounded-xl p-4">
          <p className="text-gray-400">
            Total Collected
          </p>

          <p className="text-lg font-semibold text-green-600">
            KES {format(totalCollected)}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <p className="text-gray-400">
            Principal Recovered
          </p>

          <p className="text-lg font-semibold text-blue-600">
            KES {format(totalPrincipal)}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <p className="text-gray-400">
            Interest Earned
          </p>

          <p className="text-lg font-semibold text-orange-600">
            KES {format(totalInterest)}
          </p>
        </div>

      </div>

      {/* FILTERS */}
      <div className="bg-white border rounded-xl p-3 flex flex-wrap gap-2">

        <div className="relative">

          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            placeholder="Search member / loan ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border rounded-lg pl-9 pr-3 py-2"
          />
        </div>

        <select
          value={groupFilter}
          onChange={(e) => {
            setGroupFilter(e.target.value);
            setPage(1);
          }}
          className="border rounded-lg px-3 py-2"
        >
          <option value="all">
            All Groups
          </option>

          {groups.map((group) => (
            <option
              key={group}
              value={group}
            >
              {group}
            </option>
          ))}
        </select>

      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-[11px]">

            <thead className="bg-gray-50">

              <tr>

                <th className="px-3 py-3 text-left">
                  Date
                </th>

                <th className="px-3 py-3 text-left">
                  Member
                </th>

                <th className="px-3 py-3 text-left">
                  Group
                </th>

                <th className="px-3 py-3 text-left">
                  Loan #
                </th>

                <th className="px-3 py-3 text-left">
                  Amount
                </th>

                <th className="px-3 py-3 text-left">
                  Principal
                </th>

                <th className="px-3 py-3 text-left">
                  Interest
                </th>

                <th className="px-3 py-3 text-left">
                  Method
                </th>

                <th className="px-3 py-3 text-left">
                  Balance After
                </th>

              </tr>

            </thead>

            <tbody>

              {paginatedPayments.length > 0 ? (

                paginatedPayments.map((payment) => (

                  <tr
                    key={payment.id}
                    className="border-b hover:bg-gray-50"
                  >

                    <td className="px-3 py-3">
                      {new Date(
                        payment.created_at
                      ).toLocaleDateString()}
                    </td>

                    <td className="px-3 py-3">
                      {payment.fullname}
                    </td>

                    <td className="px-3 py-3">
                      {payment.group_name}
                    </td>

                    <td className="px-3 py-3">
                      #{payment.loan_number}
                    </td>

                    <td className="px-3 py-3 font-semibold text-green-600">
                      KES {format(payment.amount)}
                    </td>

                    <td className="px-3 py-3">
                      KES {format(payment.principal_paid)}
                    </td>

                    <td className="px-3 py-3">
                      KES {format(payment.interest_paid)}
                    </td>

                    <td className="px-3 py-3 uppercase">
                      {payment.payment_method}
                    </td>

                    <td className="px-3 py-3 text-red-600">
                      KES {format(payment.balance_after)}
                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="9"
                    className="text-center py-6 text-gray-400"
                  >
                    No repayments found
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* PAGINATION */}
        <div className="flex justify-between items-center p-3 border-t">

          <button
            disabled={page === 1}
            onClick={() =>
              setPage(page - 1)
            }
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span>
            Page {page} of {totalPages || 1}
          </span>

          <button
            disabled={
              page === totalPages ||
              totalPages === 0
            }
            onClick={() =>
              setPage(page + 1)
            }
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>

        </div>

      </div>

    </div>
  );
};

export default LoanRepayments;