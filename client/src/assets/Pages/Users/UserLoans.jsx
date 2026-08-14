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

  const [showRequestModal, setShowRequestModal] = useState(false);

  const [showRepaymentModal, setShowRepaymentModal] = useState(false);

  const [page, setPage] = useState(1);

  /*
  |--------------------------------------------------------------------------
  | FETCH LOANS
  |--------------------------------------------------------------------------
  */

  const fetchLoans = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/loans/my");

      setLoans(res.data || []);

      /*
      |----------------------------------------------------------------------
      | RESET TO FIRST PAGE
      |----------------------------------------------------------------------
      */

      setPage(1);
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

  /*
  |--------------------------------------------------------------------------
  | APPROVED LOANS
  |--------------------------------------------------------------------------
  |
  | Only approved loans are considered for financial metrics.
  |
  */

  const approvedLoans = useMemo(() => {
    return loans.filter(
      (loan) => String(loan.status).toLowerCase() === "approved",
    );
  }, [loans]);

  /*
  |--------------------------------------------------------------------------
  | ACTIVE LOAN
  |--------------------------------------------------------------------------
  |
  | The current loan is the most recent approved loan.
  |
  */

  const activeLoan = useMemo(() => {
    if (approvedLoans.length === 0) {
      return null;
    }

    return [...approvedLoans].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    )[0];
  }, [approvedLoans]);

  /*
  |--------------------------------------------------------------------------
  | TOTAL LOANS
  |--------------------------------------------------------------------------
  |
  | Only approved loans count.
  |
  */

  const totalLoans = useMemo(() => {
    return approvedLoans.length;
  }, [approvedLoans]);

  /*
  |--------------------------------------------------------------------------
  | TOTAL BORROWED
  |--------------------------------------------------------------------------
  |
  | Only approved loans contribute to the total.
  |
  */

  const totalBorrowed = useMemo(() => {
    return approvedLoans.reduce(
      (sum, loan) => sum + Number(loan.amount || 0),
      0,
    );
  }, [approvedLoans]);

  /*
  |--------------------------------------------------------------------------
  | PAGINATION
  |--------------------------------------------------------------------------
  |
  | The table continues to show ALL loan records,
  | including pending and rejected applications.
  |
  */

  const totalPages = Math.ceil(loans.length / ITEMS_PER_PAGE);

  const paginatedLoans = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;

    return loans.slice(start, start + ITEMS_PER_PAGE);
  }, [loans, page]);

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <ClipLoader size={30} color="#16a34a" />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-3">
      {/* HEADER */}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[11px] font-semibold text-gray-800">Loans</h2>

          <p className="text-[9px] text-gray-500">Manage your loans</p>
        </div>

        {activeLoan ? (
          <button
            onClick={() => setShowRepaymentModal(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-[9px]"
          >
            <CreditCard size={12} />
            Loan Repay
          </button>
        ) : (
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-[9px]"
          >
            <Plus size={12} />
            Loan Request
          </button>
        )}
      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* TOTAL LOANS */}

        <div className="bg-white border rounded-xl p-3">
          <p className="text-[9px] text-gray-500">Total Loans</p>

          <h3 className="text-base font-bold text-green-600 mt-1">
            {totalLoans}
          </h3>
        </div>

        {/* TOTAL BORROWED */}

        <div className="bg-white border rounded-xl p-3">
          <p className="text-[9px] text-gray-500">Total Borrowed</p>

          <h3 className="text-base font-bold text-blue-600 mt-1">
            KES {totalBorrowed.toLocaleString()}
          </h3>
        </div>

        {/* ACTIVE LOAN */}

        <div className="bg-white border rounded-xl p-3">
          <p className="text-[9px] text-gray-500">Active Loan</p>

          <h3 className="text-base font-bold text-orange-600 mt-1">
            {activeLoan
              ? `KES ${Number(activeLoan.amount || 0).toLocaleString()}`
              : "None"}
          </h3>
        </div>
      </div>

      {/* TABLE */}

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[9px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">#</th>

                <th className="px-3 py-2 text-left font-semibold">Date</th>

                <th className="px-3 py-2 text-left font-semibold">Amount</th>

                <th className="px-3 py-2 text-left font-semibold">Duration</th>

                <th className="px-3 py-2 text-left font-semibold">Purpose</th>

                <th className="px-3 py-2 text-left font-semibold">Status</th>
              </tr>
            </thead>

            <tbody>
              {paginatedLoans.length > 0 ? (
                paginatedLoans.map((loan, index) => (
                  <tr key={loan.id} className="border-b hover:bg-gray-50">
                    {/* NUMBER */}

                    <td className="px-3 py-2">
                      {(page - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>

                    {/* DATE */}

                    <td className="px-3 py-2">
                      {new Date(loan.created_at).toLocaleDateString("en-KE", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    {/* AMOUNT */}

                    <td className="px-3 py-2 font-medium">
                      KES {Number(loan.amount || 0).toLocaleString()}
                    </td>

                    {/* DURATION */}

                    <td className="px-3 py-2">{loan.duration_months} Months</td>

                    {/* PURPOSE */}

                    <td className="px-3 py-2">{loan.purpose || "—"}</td>

                    {/* STATUS */}

                    <td className="px-3 py-2">
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[8px] font-medium ${
                          String(loan.status).toLowerCase() === "approved"
                            ? "bg-green-100 text-green-700"
                            : String(loan.status).toLowerCase() === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {loan.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-8 text-[9px] text-gray-500"
                  >
                    No loans found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}

        <div className="flex justify-between items-center p-2.5 border-t text-[9px]">
          <button
            disabled={page === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="border px-2.5 py-1 rounded disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>

          <span className="text-gray-500">
            Page {page} of {totalPages || 1}
          </span>

          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            className="border px-2.5 py-1 rounded disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* LOAN REQUEST MODAL */}

      <LoanRequestModal
        open={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSuccess={fetchLoans}
      />

      {/* LOAN REPAYMENT MODAL */}

      {activeLoan && (
        <LoanRepaymentModal
          open={showRepaymentModal}
          onClose={() => setShowRepaymentModal(false)}
          loan={activeLoan}
          onSuccess={() => {
            fetchLoans();
            setShowRepaymentModal(false);
          }}
        />
      )}
    </div>
  );
};

export default UserLoans;
