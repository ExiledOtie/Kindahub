import { useEffect, useState } from "react";
import axios from "../Utils/axios";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";

import {
  FaMoneyBillWave,
  FaMobileAlt,
  FaHistory,
} from "react-icons/fa";

const LoanRepayments = ({ loanId }) => {
  const [loan, setLoan] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mpesa");

  const [balance, setBalance] = useState({
    totalPayable: 0,
    totalPaid: 0,
    balance: 0,
  });

  /*
  |--------------------------------------------------------------------------
  | FETCH LOAN DETAILS
  |--------------------------------------------------------------------------
  */

  const fetchLoan = async () => {
    try {
      const res = await axios.get(`/loans/${loanId}`);
      setLoan(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FETCH PAYMENTS
  |--------------------------------------------------------------------------
  */

  const fetchPayments = async () => {
    try {
      const res = await axios.get(`/loan-payments/${loanId}`);
      setPayments(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FETCH BALANCE
  |--------------------------------------------------------------------------
  */

  const fetchBalance = async () => {
    try {
      const res = await axios.get(`/loan-payments/${loanId}/balance`);
      setBalance(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | INIT LOAD
  |--------------------------------------------------------------------------
  */

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      fetchLoan(),
      fetchPayments(),
      fetchBalance(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    if (loanId) {
      loadData();
    }
  }, [loanId]);

  /*
  |--------------------------------------------------------------------------
  | MAKE PAYMENT
  |--------------------------------------------------------------------------
  */

  const makePayment = async () => {
    if (!amount) {
      Swal.fire("Error", "Enter amount", "error");
      return;
    }

    try {
      await axios.post("/loan-payments", {
        loan_id: loanId,
        amount,
        payment_method: paymentMethod,
      });

      Swal.fire("Success", "Payment recorded", "success");

      setShowModal(false);
      setAmount("");

      loadData();

    } catch (error) {
      console.log(error);
      Swal.fire("Error", "Payment failed", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <ClipLoader size={35} color="#16a34a" />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | CALCULATION HELPERS
  |--------------------------------------------------------------------------
  */

  const format = (num) =>
    Number(num || 0).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });

  return (
    <div className="space-y-4 text-[11px]">

      {/* HEADER */}
      <div className="bg-white border rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <FaMoneyBillWave />
          </div>

          <div>
            <h2 className="text-sm font-semibold">
              Loan Repayments
            </h2>
            <p className="text-[10px] text-gray-400">
              Track payments & balances
            </p>
          </div>
        </div>
      </div>

      {/* LOAN SUMMARY */}
      <div className="grid grid-cols-3 gap-3">

        <div className="bg-white border rounded-lg p-3">
          <p className="text-gray-400">Total Payable</p>
          <p className="font-semibold text-green-600">
            KES {format(balance.totalPayable)}
          </p>
        </div>

        <div className="bg-white border rounded-lg p-3">
          <p className="text-gray-400">Total Paid</p>
          <p className="font-semibold text-blue-600">
            KES {format(balance.totalPaid)}
          </p>
        </div>

        <div className="bg-white border rounded-lg p-3">
          <p className="text-gray-400">Balance</p>
          <p className="font-semibold text-red-600">
            KES {format(balance.balance)}
          </p>
        </div>

      </div>

      {/* PAY BUTTON */}
      <button
        onClick={() => setShowModal(true)}
        className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <FaMobileAlt />
        Make Payment (M-Pesa)
      </button>

      {/* PAYMENT HISTORY */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="p-3 border-b flex items-center gap-2">
          <FaHistory />
          <span className="font-semibold text-sm">
            Payment History
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Amount</th>
                <th className="px-3 py-2 text-left">Principal</th>
                <th className="px-3 py-2 text-left">Interest</th>
                <th className="px-3 py-2 text-left">Method</th>
                <th className="px-3 py-2 text-left">Date</th>
              </tr>
            </thead>

            <tbody>
              {payments.length > 0 ? (
                payments.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="px-3 py-2">
                      KES {format(p.amount)}
                    </td>
                    <td className="px-3 py-2">
                      {format(p.principal_paid)}
                    </td>
                    <td className="px-3 py-2">
                      {format(p.interest_paid)}
                    </td>
                    <td className="px-3 py-2 uppercase">
                      {p.payment_method}
                    </td>
                    <td className="px-3 py-2">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-4 text-center text-gray-400" colSpan="5">
                    No payments yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl p-5 w-full max-w-md space-y-4 text-[12px]">

            <h2 className="font-semibold text-sm">
              M-Pesa Loan Payment
            </h2>

            <div>
              <label className="text-gray-500">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border px-3 py-2 rounded-lg mt-1"
                placeholder="Enter amount"
              />
            </div>

            <div>
              <label className="text-gray-500">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full border px-3 py-2 rounded-lg mt-1"
              >
                <option value="mpesa">M-Pesa</option>
                <option value="cash">Cash</option>
              </select>
            </div>

            <div className="bg-green-50 p-3 rounded-lg text-green-700 text-[11px]">
              💡 Tip: Payments will first clear interest then principal automatically.
            </div>

            <div className="flex justify-end gap-2">

              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={makePayment}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Pay
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default LoanRepayments;