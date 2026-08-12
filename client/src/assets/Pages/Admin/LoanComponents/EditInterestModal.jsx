import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "../../../Utils/axios";
import { FaPercentage, FaTimes } from "react-icons/fa";

const EditInterestModal = ({ open, loan, onClose, onSuccess }) => {
  const [interestRate, setInterestRate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loan) {
      setInterestRate(loan.interest_rate || "");
    }
  }, [loan]);

  if (!open || !loan) return null;

  const saveInterest = async () => {
    try {
      setLoading(true);

      await axios.patch(`/loans/${loan.id}/interest`, {
        interest_rate: interestRate,
      });

      Swal.fire("Success", "Interest rate updated successfully.", "success");

      onSuccess?.();
      onClose();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to update interest.",
        "error",
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
        <div className="border-b px-4 py-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <FaPercentage className="text-yellow-500 text-xs" />
            Change Interest Rate
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3 text-[11px]">
          <div className="bg-gray-50 border rounded-md p-3 space-y-2">
            <div>
              <p className="text-[10px] text-gray-500">Member</p>
              <p className="font-semibold text-gray-800">{loan.fullname}</p>
            </div>

            <div>
              <p className="text-[10px] text-gray-500">Loan Amount</p>
              <p className="font-semibold text-green-600">
                KES {Number(loan.amount).toLocaleString()}
              </p>
            </div>
          </div>

          <div>
            <label className="block mb-1 text-[10px] font-medium text-gray-600">
              New Interest Rate (%)
            </label>

            <input
              type="number"
              min="0"
              max="100"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-[11px] focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-100 rounded-md p-3">
            <p className="text-[10px] text-gray-600">Updated Total Payable</p>

            <p className="mt-1 text-sm font-bold text-yellow-700">
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
            onClick={saveInterest}
            className="px-4 py-1.5 text-[11px] bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-60 transition"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditInterestModal;
