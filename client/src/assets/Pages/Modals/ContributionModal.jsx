import { useState } from "react";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";

import axios from "../../Utils/axios";

const ContributionModal = ({ open, onClose, memberId, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const [amount, setAmount] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("mpesa");

  const [mpesaCode, setMpesaCode] = useState("");
  const [bankReference, setBankReference] = useState("");

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount) {
      return Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "Amount is required",
      });
    }

    if (paymentMethod === "mpesa" && !mpesaCode.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "Mpesa code is required",
      });
    }

    if (paymentMethod === "bank" && !bankReference.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "Bank reference is required",
      });
    }

    try {
      setLoading(true);

      await axios.post("/contributions", {
        user_id: memberId,
        amount,
        payment_method: paymentMethod,
        mpesa_code:
          paymentMethod === "mpesa" ? mpesaCode.trim().toUpperCase() : null,
        bank_reference:
          paymentMethod === "bank" ? bankReference.trim().toUpperCase() : null,
      });

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Contribution added successfully",
      });

      setAmount("");
      setMpesaCode("");
      setBankReference("");
      setPaymentMethod("mpesa");

      onClose();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "Failed to save contribution",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        {/* HEADER */}

        <div className="border-b px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-800">
            Add Contribution
          </h2>

          <p className="text-xs text-gray-500 mt-1">
            Record a member contribution
          </p>
        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* AMOUNT */}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Amount
            </label>

            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* METHOD */}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Payment Method
            </label>

            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setMpesaCode("");
                setBankReference("");
              }}
              className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="mpesa">Mpesa</option>
              <option value="bank">Bank</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          {/* MPESA CODE */}

          {paymentMethod === "mpesa" && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Mpesa Code
              </label>

              <input
                type="text"
                value={mpesaCode}
                onChange={(e) => setMpesaCode(e.target.value)}
                placeholder="e.g. SGH8YTR56"
                className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}
          {paymentMethod === "bank" && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Bank Reference
              </label>

              <input
                type="text"
                value={bankReference}
                onChange={(e) => setBankReference(e.target.value)}
                placeholder="Enter bank reference"
                className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}

          {/* BUTTONS */}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-xs hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs flex items-center gap-2"
            >
              {loading && <ClipLoader size={14} color="#fff" />}
              Save Contribution
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContributionModal;
