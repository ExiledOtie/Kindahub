import { useState } from "react";
import axios from "../../Utils/axios";
import Swal from "sweetalert2";

const SavingsModal = ({ open, onClose, userId, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    amount: "",
    payment_method: "cash",
    mpesa_code: "",
    bank_reference: "",
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

    if (!formData.amount) {
      return Swal.fire({
        icon: "warning",
        title: "Missing Amount",
        text: "Please enter the savings amount.",
      });
    }

    try {
      setLoading(true);

      await axios.post("/savings", {
        user_id: userId,
        amount: formData.amount,
        payment_method: formData.payment_method,
        mpesa_code:
          formData.payment_method === "mpesa"
            ? formData.mpesa_code
            : null,
        bank_reference:
          formData.payment_method === "bank"
            ? formData.bank_reference
            : null,
      });

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Savings added successfully.",
      });

      setFormData({
        amount: "",
        payment_method: "cash",
        mpesa_code: "",
        bank_reference: "",
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          "Failed to add savings.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">

        {/* HEADER */}

        <div className="px-5 py-4 border-b">
          <h2 className="text-sm font-semibold text-gray-800">
            Add Savings
          </h2>

          <p className="text-[10px] text-gray-500 mt-1">
            Record a new savings transaction.
          </p>
        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {/* Amount */}

          <div>
            <label className="block text-[10px] font-medium text-gray-700 mb-1">
              Amount (KES)
            </label>

            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="5000"
              className="w-full border rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Payment Method */}

          <div>
            <label className="block text-[10px] font-medium text-gray-700 mb-1">
              Payment Method
            </label>

            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="cash">Cash</option>
              <option value="mpesa">Mpesa</option>
              <option value="bank">Bank</option>
            </select>
          </div>

          {/* Mpesa */}

          {formData.payment_method === "mpesa" && (
            <div>
              <label className="block text-[10px] font-medium text-gray-700 mb-1">
                Mpesa Code
              </label>

              <input
                type="text"
                name="mpesa_code"
                value={formData.mpesa_code}
                onChange={handleChange}
                placeholder="SHG7ABCD12"
                className="w-full border rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}

          {/* Bank */}

          {formData.payment_method === "bank" && (
            <div>
              <label className="block text-[10px] font-medium text-gray-700 mb-1">
                Bank Reference
              </label>

              <input
                type="text"
                name="bank_reference"
                value={formData.bank_reference}
                onChange={handleChange}
                placeholder="Bank Reference"
                className="w-full border rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}

          {/* Buttons */}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-[10px] border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-[10px] bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SavingsModal;