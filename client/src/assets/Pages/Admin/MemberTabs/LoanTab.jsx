import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import { FaMoneyBillWave, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";

import axios from "../../../Utils/axios";
import LoanModal from "../Modals/LoanModal";

const LoanTab = ({ memberId }) => {
  const [loading, setLoading] = useState(true);

  const [loans, setLoans] = useState([]);

  const [showModal, setShowModal] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | FETCH LOANS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (memberId) {
      fetchLoans();
    }
  }, [memberId]);

  const fetchLoans = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`/loans/user/${memberId}`);

      setLoans(res.data || []);
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

  /*
  |--------------------------------------------------------------------------
  | FORMAT CURRENCY
  |--------------------------------------------------------------------------
  */

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString();
  };

  /*
  |--------------------------------------------------------------------------
  | FORMAT DATE
  |--------------------------------------------------------------------------
  */

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | GET REFERENCE
  |--------------------------------------------------------------------------
  */

  const getReference = (loan) => {
    return loan.mpesa_code || loan.bank_reference || "—";
  };

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

      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[11px]">
              <FaMoneyBillWave />
            </div>

            <div>
              <h2 className="text-[11px] font-semibold text-gray-800">Loans</h2>

              <p className="text-[9px] text-gray-400">
                View and manage member loan applications
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-[9px] hover:bg-green-700 transition-all duration-200"
          >
            <FaPlus size={10} />
            Request Loan
          </button>
        </div>
      </div>

      {/* TABLE */}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[9px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">#</th>

                <th className="px-3 py-2 text-left font-semibold">Date</th>

                <th className="px-3 py-2 text-left font-semibold">Amount</th>

                <th className="px-3 py-2 text-left font-semibold">Interest</th>

                <th className="px-3 py-2 text-left font-semibold">Duration</th>

                <th className="px-3 py-2 text-left font-semibold">Purpose</th>

                <th className="px-3 py-2 text-left font-semibold">Reference</th>

                <th className="px-3 py-2 text-left font-semibold">Status</th>
              </tr>
            </thead>

            <tbody>
              {loans.length > 0 ? (
                loans.map((loan, index) => (
                  <tr key={loan.id} className="border-b hover:bg-gray-50">
                    {/* NUMBER */}

                    <td className="px-3 py-2">{index + 1}</td>

                    {/* DATE */}

                    <td className="px-3 py-2">{formatDate(loan.created_at)}</td>

                    {/* AMOUNT */}

                    <td className="px-3 py-2 font-medium">
                      KES {formatCurrency(loan.amount)}
                    </td>

                    {/* INTEREST */}

                    <td className="px-3 py-2">{loan.interest_rate}%</td>

                    {/* DURATION */}

                    <td className="px-3 py-2">{loan.duration_months} Months</td>

                    {/* PURPOSE */}

                    <td className="px-3 py-2">{loan.purpose || "—"}</td>

                    {/* REFERENCE */}

                    <td className="px-3 py-2 font-mono text-[8px] text-gray-600">
                      {getReference(loan)}
                    </td>

                    {/* STATUS */}

                    <td className="px-3 py-2">
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[8px] font-medium ${
                          loan.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : loan.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
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
                    colSpan="8"
                    className="text-center py-8 text-[9px] text-gray-500"
                  >
                    No loan records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}

      <LoanModal
        open={showModal}
        memberId={memberId}
        onClose={() => setShowModal(false)}
        onSuccess={fetchLoans}
      />
    </div>
  );
};

export default LoanTab;
