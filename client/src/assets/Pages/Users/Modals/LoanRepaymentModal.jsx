import { useState, useEffect } from "react";
import axios from "../../../Utils/axios";
import Swal from "sweetalert2";

const LoanRepaymentModal = ({ open, onClose, loan, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const [metricsLoading, setMetricsLoading] = useState(false);

  const [loanMetrics, setLoanMetrics] = useState(null);

  const [formData, setFormData] = useState({
    amount: "",
    payment_method: "cash",
    mpesa_code: "",
  });

  useEffect(() => {
    if (open && loan) {
      fetchLoanMetrics();
    }
  }, [open, loan]);

  const fetchLoanMetrics = async () => {
    try {
      setMetricsLoading(true);

      const res = await axios.get(`/loan-payments/${loan.id}/balance`);

      setLoanMetrics(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setMetricsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await axios.post("/loan-payments/my", {
        loan_id: loan.id,
        amount: formData.amount,
        payment_method: formData.payment_method,
        mpesa_code: formData.mpesa_code,
      });

      Swal.fire({
        icon: "success",
        title: "Submitted",
        text: "Your repayment has been submitted and is awaiting approval.",
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to submit repayment",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open || !loan) return null;

  const progress = loanMetrics
    ? Math.min(
        ((loanMetrics.totalPaid / loanMetrics.totalPayable) * 100).toFixed(1),
        100,
      )
    : 0;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-3">
      <div className="bg-white rounded-xl w-full max-w-lg p-5 max-h-[90vh] overflow-y-auto">
        <h2 className="text-sm font-semibold mb-4">Loan Repayment</h2>

        {metricsLoading ? (
          <div className="text-center py-6 text-[11px]">
            Loading loan details...
          </div>
        ) : (
          <>
            {/* SUMMARY */}

            <div className="bg-gray-50 border rounded-lg p-3 mb-4 text-[11px] space-y-2">
              <div className="flex justify-between">
                <span>Loan Amount</span>

                <span className="font-semibold">
                  KES {Number(loan.amount).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Total Payable</span>

                <span className="font-semibold text-blue-600">
                  KES {Number(loanMetrics?.totalPayable || 0).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Total Paid</span>

                <span className="font-semibold text-green-600">
                  KES {Number(loanMetrics?.totalPaid || 0).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Balance</span>

                <span className="font-semibold text-red-600">
                  KES {Number(loanMetrics?.balance || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* PROGRESS */}

            <div className="mb-4">
              <div className="flex justify-between text-[10px] mb-1">
                <span>Repayment Progress</span>

                <span>{progress}%</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>

            {/* OVERDUE */}

            {Number(loanMetrics?.overdue) > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-[10px]">
                <p className="font-semibold text-red-600 mb-1">Loan Overdue</p>

                <p>
                  Overdue Amount:
                  <span className="font-semibold">
                    {" "}
                    KES {Number(loanMetrics?.overdue).toLocaleString()}
                  </span>
                </p>

                <p>
                  Penalty:
                  <span className="font-semibold">
                    {" "}
                    KES {Number(loanMetrics?.penalty).toLocaleString()}
                  </span>
                </p>
              </div>
            )}

            {/* METRICS */}

            <div className="grid grid-cols-3 gap-2 mb-4 text-[10px]">
              <div className="border rounded-lg p-2">
                <p className="text-gray-400">Monthly</p>

                <p className="font-semibold">
                  KES{" "}
                  {Number(
                    loanMetrics?.expectedMonthlyPayment || 0,
                  ).toLocaleString()}
                </p>
              </div>

              <div className="border rounded-lg p-2">
                <p className="text-gray-400">Months Passed</p>

                <p className="font-semibold">
                  {loanMetrics?.monthsPassed || 0}
                </p>
              </div>

              <div className="border rounded-lg p-2">
                <p className="text-gray-400">Penalty</p>

                <p className="font-semibold text-red-600">
                  KES {Number(loanMetrics?.penalty || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="number"
                  required
                  min="1"
                  max={loanMetrics?.balance || 0}
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: e.target.value,
                    })
                  }
                  placeholder="Repayment Amount"
                  className="w-full border rounded-lg p-2 text-[11px]"
                />

                <p className="text-[10px] text-gray-500 mt-1">
                  Remaining Balance: KES{" "}
                  {Number(loanMetrics?.balance || 0).toLocaleString()}
                </p>
              </div>

              <select
                value={formData.payment_method}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    payment_method: e.target.value,
                  })
                }
                className="w-full border rounded-lg p-2 text-[11px]"
              >
                <option value="cash">Cash</option>

                <option value="mpesa">Mpesa</option>

                <option value="bank">Bank</option>
              </select>

              {formData.payment_method === "mpesa" && (
                <input
                  type="text"
                  placeholder="Mpesa Code"
                  value={formData.mpesa_code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mpesa_code: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-2 text-[11px]"
                />
              )}

              <div className="flex justify-end gap-2 pt-2">
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
                  {loading ? "Submitting..." : "Submit for Approval"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default LoanRepaymentModal;
