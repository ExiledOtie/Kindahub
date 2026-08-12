import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "../../../Utils/axios";

const ApproveLoanModal = ({ open, loan, onClose, onSuccess }) => {
  const [interestRate, setInterestRate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loan) {
      setInterestRate(loan.interest_rate || "");
    }
  }, [loan]);

  if (!open || !loan) return null;

  const approveLoan = async () => {
    try {
      setLoading(true);

      await axios.patch(`/loans/${loan.id}/approve`, {
        interest_rate: interestRate,
      });

      Swal.fire("Approved", "Loan approved successfully.", "success");

      onSuccess?.();
      onClose();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Approval failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const totalPayable =
    Number(loan.amount) +
    (Number(loan.amount) * Number(interestRate || 0)) / 100;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="border-b px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-800">
            Approve Loan
          </h2>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3 text-[11px]">
          <div className="bg-gray-50 rounded-md p-3 space-y-2 border">
            <div className="flex justify-between">
              <span className="text-gray-500">Member</span>
              <span className="font-semibold text-gray-800">
                {loan.fullname}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Loan Amount</span>
              <span className="font-semibold text-green-600">
                KES {Number(loan.amount).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Duration</span>
              <span>{loan.duration_months} Months</span>
            </div>
          </div>

          <div>
            <label className="block mb-1 text-[10px] font-medium text-gray-600">
              Interest Rate (%)
            </label>

            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-[11px] focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
            <p className="text-[10px] text-gray-600">Total Payable</p>

            <p className="text-sm font-bold text-blue-700 mt-1">
              KES {totalPayable.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-3 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-[11px] border rounded-md hover:bg-gray-50 transition"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={approveLoan}
            className="px-4 py-1.5 text-[11px] bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-60 transition"
          >
            {loading ? "Approving..." : "Approve Loan"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveLoanModal;