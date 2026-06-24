import { useState } from "react";
import axios from "../../../Utils/axios";
import Swal from "sweetalert2";

const LoanRepaymentModal = ({
  open,
  onClose,
  loan,
  onSuccess,
}) => {
  const [formData, setFormData] =
    useState({
      amount: "",
      payment_method: "cash",
      mpesa_code: "",
    });

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await axios.post(
        "/loan-payments",
        {
          loan_id: loan.id,
          amount: formData.amount,
          payment_method:
            formData.payment_method,
          mpesa_code:
            formData.mpesa_code,
        }
      );

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Loan repayment recorded successfully",
      });

      onSuccess();
      onClose();

    } catch (error) {

      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data
            ?.message ||
          "Failed to submit repayment",
      });

    } finally {

      setLoading(false);

    }
  };

  if (!open || !loan) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

      <div className="bg-white rounded-xl p-5 w-full max-w-md">

        <h2 className="text-sm font-semibold mb-4">
          Loan Repayment
        </h2>

        {/* LOAN INFO */}

        <div className="bg-gray-50 border rounded-lg p-3 mb-4 text-[11px]">

          <div className="flex justify-between">
            <span>Loan Amount</span>

            <span className="font-semibold">
              KES{" "}
              {Number(
                loan.amount
              ).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between mt-2">
            <span>Total Payable</span>

            <span className="font-semibold text-blue-600">
              KES{" "}
              {Number(
                loan.total_payable || 0
              ).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between mt-2">
            <span>Balance</span>

            <span className="font-semibold text-red-600">
              KES{" "}
              {Number(
                loan.balance || 0
              ).toLocaleString()}
            </span>
          </div>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-3"
        >

          <input
            type="number"
            required
            min="1"
            max={loan.balance}
            value={
              formData.amount
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                amount:
                  e.target.value,
              })
            }
            placeholder="Repayment Amount"
            className="w-full border rounded-lg p-2 text-[11px]"
          />

          <select
            value={
              formData.payment_method
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                payment_method:
                  e.target.value,
              })
            }
            className="w-full border rounded-lg p-2 text-[11px]"
          >
            <option value="cash">
              Cash
            </option>

            <option value="mpesa">
              Mpesa
            </option>

            <option value="bank">
              Bank
            </option>

          </select>

          {formData.payment_method ===
            "mpesa" && (
            <input
              type="text"
              placeholder="Mpesa Code"
              value={
                formData.mpesa_code
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  mpesa_code:
                    e.target.value,
                })
              }
              className="w-full border rounded-lg p-2 text-[11px]"
            />
          )}

          <div className="flex justify-end gap-2">

            <button
              type="button"
              onClick={onClose}
              className="border px-4 py-2 rounded-lg text-[11px]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-[11px]"
            >
              {loading
                ? "Processing..."
                : "Submit"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default LoanRepaymentModal;