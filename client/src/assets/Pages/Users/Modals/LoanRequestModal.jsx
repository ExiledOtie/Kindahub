import { useState } from "react";
import axios from "../../../Utils/axios";
import Swal from "sweetalert2";

const LoanRequestModal = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] =
    useState({
      amount: "",
      purpose: "",
      interest_rate: "",
      duration_months: "",
    });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "/loans/my",
        formData
      );

      Swal.fire(
        "Success",
        "Loan request submitted",
        "success"
      );

      onSuccess();
      onClose();
    } catch (error) {
      console.log(error);

      Swal.fire(
        "Error",
        error.response?.data?.message ||
          "Failed to submit loan request",
        "error"
      );
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

      <div className="bg-white rounded-xl p-5 w-full max-w-md">

        <h2 className="text-sm font-semibold mb-4">
          Loan Request
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-3"
        >

          <input
            type="number"
            placeholder="Amount"
            required
            className="w-full border rounded-lg p-2 text-[11px]"
            onChange={(e) =>
              setFormData({
                ...formData,
                amount:
                  e.target.value,
              })
            }
          />

          <textarea
            placeholder="Purpose"
            required
            className="w-full border rounded-lg p-2 text-[11px]"
            onChange={(e) =>
              setFormData({
                ...formData,
                purpose:
                  e.target.value,
              })
            }
          />

          <input
            type="number"
            placeholder="Interest Rate"
            required
            className="w-full border rounded-lg p-2 text-[11px]"
            onChange={(e) =>
              setFormData({
                ...formData,
                interest_rate:
                  e.target.value,
              })
            }
          />

          <input
            type="number"
            placeholder="Duration (Months)"
            required
            className="w-full border rounded-lg p-2 text-[11px]"
            onChange={(e) =>
              setFormData({
                ...formData,
                duration_months:
                  e.target.value,
              })
            }
          />

          <div className="flex justify-end gap-2">

            <button
              type="button"
              onClick={onClose}
              className="border px-3 py-2 rounded-lg text-[11px]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-green-600 text-white px-3 py-2 rounded-lg text-[11px]"
            >
              Submit
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default LoanRequestModal;