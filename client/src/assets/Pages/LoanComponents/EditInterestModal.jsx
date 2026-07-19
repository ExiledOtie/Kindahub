import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "../../Utils/axios";
import { FaPercentage, FaTimes } from "react-icons/fa";

const EditInterestModal = ({ open, loan, onClose, onSuccess }) => {
  const [interestRate, setInterestRate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loan) {
      setInterestRate(loan.interest_rate);
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

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="border-b p-4 flex justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <FaPercentage />
            Change Interest Rate
          </h2>

          <button onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-[11px] text-gray-500">Member</label>

            <p className="font-semibold">{loan.fullname}</p>
          </div>

          <div>
            <label className="text-[11px] text-gray-500">Loan Amount</label>

            <p className="font-semibold text-green-600">
              KES {Number(loan.amount).toLocaleString()}
            </p>
          </div>

          <div>
            <label className="text-[11px] text-gray-500">
              New Interest Rate (%)
            </label>

            <input
              type="number"
              min="0"
              max="100"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="w-full border rounded-lg mt-1 p-2"
            />
          </div>
        </div>

        <div className="border-t p-4 flex justify-end gap-2">
          <button onClick={onClose} className="border px-4 py-2 rounded-lg">
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={saveInterest}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditInterestModal;
