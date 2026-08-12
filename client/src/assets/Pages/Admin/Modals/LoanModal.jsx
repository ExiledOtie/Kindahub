import { useState } from "react";
import Swal from "sweetalert2";
import axios from "../../../Utils/axios";

const LoanModal = ({ open, onClose, memberId, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    amount: "",
    purpose: "",
    interest_rate: "",
    duration_months: "",
  });

  if (!open) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.amount ||
      !formData.purpose ||
      !formData.interest_rate ||
      !formData.duration_months
    ) {
      return Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all fields",
      });
    }

    try {
      setLoading(true);

      await axios.post("/loans", {
        user_id: memberId,
        amount: formData.amount,
        purpose: formData.purpose,
        interest_rate: formData.interest_rate,
        duration_months: formData.duration_months,
      });

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Loan request submitted successfully",
      });

      setFormData({
        amount: "",
        purpose: "",
        interest_rate: "",
        duration_months: "",
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "Failed to submit loan request",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
        {/* HEADER */}

        <div className="px-5 py-4 border-b">
          <h2 className="text-sm font-semibold text-gray-800">Request Loan</h2>

          <p className="text-xs text-gray-500 mt-1">
            Submit a new loan application
          </p>
        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Amount */}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Amount (KES)
            </label>

            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="50000"
            />
          </div>

          {/* Purpose */}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Loan Purpose
            </label>

            <textarea
              rows="3"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Business expansion, school fees, farming..."
            />
          </div>

          {/* Interest */}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Interest Rate (%)
            </label>

            <input
              type="number"
              step="0.01"
              name="interest_rate"
              value={formData.interest_rate}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="10"
            />
          </div>

          {/* Duration */}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Duration (Months)
            </label>

            <input
              type="number"
              name="duration_months"
              value={formData.duration_months}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="12"
            />
          </div>

          {/* BUTTONS */}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {loading ? "Submitting..." : "Submit Loan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanModal;
