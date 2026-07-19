import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "../../Utils/axios";

const ApproveLoanModal = ({ open, loan, onClose, onSuccess }) => {
  const [interestRate, setInterestRate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loan) {
      setInterestRate(loan.interest_rate);
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
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg">
        <div className="border-b p-4">
          <h2 className="font-semibold">Approve Loan</h2>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between">
              <span>Member</span>

              <span className="font-semibold">{loan.fullname}</span>
            </div>

            <div className="flex justify-between mt-2">
              <span>Loan Amount</span>

              <span className="font-semibold">
                KES {Number(loan.amount).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between mt-2">
              <span>Duration</span>

              <span>{loan.duration_months} Months</span>
            </div>
          </div>

          <div>
            <label className="text-[11px]">Interest Rate (%)</label>

            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="w-full border rounded-lg p-2 mt-1"
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg text-[11px]">
            Total Payable
            <div className="font-semibold text-blue-700 mt-1">
              KES{" "}
              {(
                Number(loan.amount) +
                (Number(loan.amount) * Number(interestRate || 0)) / 100
              ).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="border-t p-4 flex justify-end gap-2">
          <button onClick={onClose} className="border px-4 py-2 rounded-lg">
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={approveLoan}
            className="bg-green-600 text-white px-5 py-2 rounded-lg"
          >
            {loading ? "Approving..." : "Approve Loan"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveLoanModal;
