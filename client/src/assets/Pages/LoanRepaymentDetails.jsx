import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../Utils/axios";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";

import {
  FaMoneyBillWave,
  FaMobileAlt,
  FaHistory,
} from "react-icons/fa";

const LoanRepaymentDetails = () => {
  const { loanId } = useParams();

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

  const fetchLoan = async () => {
    try {
      const res = await axios.get(`/loans/${loanId}`);
      setLoan(res.data);
    } catch (error) {
      console.log(error);
      Swal.fire("Error", "Failed to fetch loan details", "error");
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await axios.get(`/loan-payments/${loanId}`);
      setPayments(res.data);
    } catch (error) {
      console.log(error);
      Swal.fire("Error", "Failed to fetch payments", "error");
    }
  };

  const fetchBalance = async () => {
    try {
      const res = await axios.get(`/loan-payments/${loanId}/balance`);
      setBalance(res.data);
    } catch (error) {
      console.log(error);
      Swal.fire("Error", "Failed to fetch balance", "error");
    }
  };

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

  const makePayment = async () => {
    if (!amount || Number(amount) <= 0) {
      Swal.fire("Error", "Enter a valid amount", "error");
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
      Swal.fire(
        "Error",
        error.response?.data?.message || "Payment failed",
        "error"
      );
    }
  };

  const format = (num) =>
    Number(num || 0).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <ClipLoader size={35} color="#16a34a" />
      </div>
    );
  }

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
              Loan Repayment Details
            </h2>

            <p className="text-[10px] text-gray-400">
              {loan?.fullname || "Member"}
            </p>
          </div>
        </div>
      </div>

      {/* LOAN INFO */}
      {loan && (
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold mb-3">
            Loan Information
          </h3>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <p className="text-gray-500">Member</p>
              <p>{loan.fullname}</p>
            </div>

            <div>
              <p className="text-gray-500">Loan Amount</p>
              <p>KES {format(loan.amount)}</p>
            </div>

            <div>
              <p className="text-gray-500">Interest Rate</p>
              <p>{loan.interest_rate}%</p>
            </div>

            <div>
              <p className="text-gray-500">Duration</p>
              <p>{loan.duration_months} Months</p>
            </div>

            <div>
              <p className="text-gray-500">Status</p>
              <p className="capitalize">{loan.status}</p>
            </div>
          </div>
        </div>
      )}

      {/* BALANCE CARDS */}
      <div className="grid md:grid-cols-3 gap-3">
        <div className="bg-white border rounded-lg p-3">
          <p className="text-gray-400">
            Total Payable
          </p>

          <p className="font-semibold text-green-600">
            KES {format(balance.totalPayable)}
          </p>
        </div>

        <div className="bg-white border rounded-lg p-3">
          <p className="text-gray-400">
            Total Paid
          </p>

          <p className="font-semibold text-blue-600">
            KES {format(balance.totalPaid)}
          </p>
        </div>

        <div className="bg-white border rounded-lg p-3">
          <p className="text-gray-400">
            Outstanding Balance
          </p>

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

        <span>
          Record Payment
        </span>
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
                <th className="px-3 py-2 text-left">
                  Amount
                </th>

                <th className="px-3 py-2 text-left">
                  Principal
                </th>

                <th className="px-3 py-2 text-left">
                  Interest
                </th>

                <th className="px-3 py-2 text-left">
                  Method
                </th>

                <th className="px-3 py-2 text-left">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b"
                  >
                    <td className="px-3 py-2">
                      KES {format(payment.amount)}
                    </td>

                    <td className="px-3 py-2">
                      KES {format(payment.principal_paid)}
                    </td>

                    <td className="px-3 py-2">
                      KES {format(payment.interest_paid)}
                    </td>

                    <td className="px-3 py-2 uppercase">
                      {payment.payment_method}
                    </td>

                    <td className="px-3 py-2">
                      {new Date(
                        payment.created_at
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-5 text-gray-400"
                  >
                    No repayments found
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
          <div className="bg-white rounded-xl p-5 w-full max-w-md space-y-4">
            <h2 className="font-semibold">
              Record Loan Payment
            </h2>

            <div>
              <label className="block mb-1">
                Amount
              </label>

              <input
                type="number"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Enter amount"
              />
            </div>

            <div>
              <label className="block mb-1">
                Payment Method
              </label>

              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(
                    e.target.value
                  )
                }
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="mpesa">
                  M-Pesa
                </option>

                <option value="cash">
                  Cash
                </option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={makePayment}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Save Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanRepaymentDetails;