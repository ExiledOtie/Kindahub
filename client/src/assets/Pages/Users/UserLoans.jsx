import { useEffect, useMemo, useState } from "react";
import axios from "../../Utils/axios";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";
import { Plus, CreditCard } from "lucide-react";

import LoanRequestModal from "./Modals/LoanRequestModal";
import LoanRepaymentModal from "./Modals/LoanRepaymentModal";

const ITEMS_PER_PAGE = 10;

const UserLoans = () => {
  const [loading, setLoading] = useState(true);

  const [loans, setLoans] = useState([]);

  const [showRequestModal, setShowRequestModal] =
    useState(false);

  const [showRepaymentModal, setShowRepaymentModal] =
    useState(false);

  const fetchLoans = async () => {
    try {
      setLoading(true);

      const res =
        await axios.get("/loans/my");

      setLoans(res.data);

    } catch (error) {

      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load loans",
      });

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const activeLoan = useMemo(() => {

    return loans.find(
      (loan) =>
        loan.status === "approved"
    );

  }, [loans]);

  const totalBorrowed = useMemo(() => {

    return loans.reduce(
      (sum, loan) =>
        sum + Number(loan.amount || 0),
      0
    );

  }, [loans]);

  const totalPages = Math.ceil(
    loans.length / ITEMS_PER_PAGE
  );

  const [page, setPage] =
    useState(1);

  const paginatedLoans =
    useMemo(() => {

      const start =
        (page - 1) *
        ITEMS_PER_PAGE;

      return loans.slice(
        start,
        start + ITEMS_PER_PAGE
      );

    }, [loans, page]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <ClipLoader
          size={35}
          color="#16a34a"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* HEADER */}

      <div className="flex justify-between items-center">

        <div>

          <h2 className="text-sm font-semibold">
            Loans
          </h2>

          <p className="text-[11px] text-gray-500">
            Manage your loans
          </p>

        </div>

        {activeLoan ? (
          <button
            onClick={() =>
              setShowRepaymentModal(
                true
              )
            }
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-[11px]"
          >
            <CreditCard size={14} />
            Loan Repay
          </button>
        ) : (
          <button
            onClick={() =>
              setShowRequestModal(
                true
              )
            }
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-[11px]"
          >
            <Plus size={14} />
            Loan Request
          </button>
        )}

      </div>

      {/* STATS */}

      <div className="grid md:grid-cols-3 gap-3">

        <div className="bg-white border rounded-xl p-4">
          <p className="text-[11px] text-gray-500">
            Total Loans
          </p>

          <h3 className="text-lg font-bold text-green-600">
            {loans.length}
          </h3>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <p className="text-[11px] text-gray-500">
            Total Borrowed
          </p>

          <h3 className="text-lg font-bold text-blue-600">
            KES {totalBorrowed.toLocaleString()}
          </h3>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <p className="text-[11px] text-gray-500">
            Active Loan
          </p>

          <h3 className="text-lg font-bold text-orange-600">
            {activeLoan
              ? `KES ${Number(
                  activeLoan.amount
                ).toLocaleString()}`
              : "None"}
          </h3>
        </div>

      </div>

      {/* TABLE */}

      <div className="bg-white border rounded-xl overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-[11px]">

            <thead className="bg-gray-50">

              <tr>
                <th className="px-3 py-3 text-left">
                  #
                </th>

                <th className="px-3 py-3 text-left">
                  Date
                </th>

                <th className="px-3 py-3 text-left">
                  Amount
                </th>

                <th className="px-3 py-3 text-left">
                  Duration
                </th>

                <th className="px-3 py-3 text-left">
                  Purpose
                </th>

                <th className="px-3 py-3 text-left">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {paginatedLoans.length > 0 ? (
                paginatedLoans.map(
                  (
                    loan,
                    index
                  ) => (
                    <tr
                      key={loan.id}
                      className="border-b"
                    >
                      <td className="px-3 py-3">
                        {index + 1}
                      </td>

                      <td className="px-3 py-3">
                        {new Date(
                          loan.created_at
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-3 py-3">
                        KES{" "}
                        {Number(
                          loan.amount
                        ).toLocaleString()}
                      </td>

                      <td className="px-3 py-3">
                        {
                          loan.duration_months
                        }{" "}
                        Months
                      </td>

                      <td className="px-3 py-3">
                        {loan.purpose}
                      </td>

                      <td className="px-3 py-3">

                        <span
                          className={`px-2 py-1 rounded-full text-[10px]
                          ${
                            loan.status ===
                            "approved"
                              ? "bg-green-100 text-green-700"
                              : loan.status ===
                                "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {loan.status}
                        </span>

                      </td>

                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-8 text-gray-500"
                  >
                    No loans found
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

        <div className="flex justify-between items-center p-3 border-t text-[11px]">

          <button
            disabled={page === 1}
            onClick={() =>
              setPage(page - 1)
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
              page === totalPages ||
              totalPages === 0
            }
            onClick={() =>
              setPage(page + 1)
            }
            className="border px-3 py-1 rounded disabled:opacity-50"
          >
            Next
          </button>

        </div>

      </div>

      <LoanRequestModal
        open={showRequestModal}
        onClose={() =>
          setShowRequestModal(false)
        }
        onSuccess={fetchLoans}
      />

      {activeLoan && (
        <LoanRepaymentModal
          open={showRepaymentModal}
          onClose={() =>
            setShowRepaymentModal(
              false
            )
          }
          loan={activeLoan}
        />
      )}

    </div>
  );
};

export default UserLoans;