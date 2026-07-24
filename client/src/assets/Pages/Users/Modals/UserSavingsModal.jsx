import { useState } from "react";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";

import axios from "../../../Utils/axios";

const UserSavingsModal = ({ open, onClose, onSuccess }) => {
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

    if (paymentMethod === "mpesa" && !mpesaCode) {
      return Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "Mpesa code is required",
      });
    }

    try {
      setLoading(true);

      await axios.post("/savings/my", {
        amount,
        payment_method: paymentMethod,
        mpesa_code: paymentMethod === "mpesa" ? mpesaCode : null,
      });

      Swal.fire({
        icon: "success",
        title: "Submitted",
        text: "Saving submitted successfully and is awaiting verification.",
      });

      setAmount("");
      setMpesaCode("");
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
        text: error?.response?.data?.message || "Failed to submit saving",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="border-b px-5 py-4">
          <h2 className="text-sm font-semibold">Submit Saving</h2>

          <p className="text-xs text-gray-500 mt-1">
            Enter your saving details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <input
            type="number"
            min="1"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-xs"
          />

          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-xs"
          >
            <option value="mpesa">Mpesa</option>

            <option value="cash">Cash</option>

            <option value="bank">Bank</option>
          </select>

          {paymentMethod === "mpesa" && (
            <input
              type="text"
              placeholder="Mpesa Code"
              value={mpesaCode}
              onChange={(e) => setMpesaCode(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-xs"
            />
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-[11px] text-yellow-800">
              Your saving will remain pending until verified by the
              administrator.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-xs"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs flex items-center gap-2"
            >
              {loading && <ClipLoader size={14} color="#fff" />}
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserSavingsModal;
