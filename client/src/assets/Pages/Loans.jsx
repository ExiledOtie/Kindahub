import { useEffect, useState } from "react";
import axios from "../Utils/axios";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";

import {
  FaCheck,
  FaTimes,
  FaTrash,
  FaMoneyBillWave,
  FaEye,
} from "react-icons/fa";

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchLoans = async () => {
    try {
      const res = await axios.get("/loans");
      setLoans(res.data);
    } catch (error) {
      console.log(error);
      Swal.fire("Error", "Failed to fetch loans", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const approveLoan = async (id) => {
    try {
      await axios.patch(`/loans/${id}/approve`);
      Swal.fire("Success", "Loan approved", "success");
      fetchLoans();
      setShowModal(false);
    } catch (error) {
      Swal.fire("Error", "Failed to approve loan", "error");
    }
  };

  const rejectLoan = async (id) => {
    try {
      await axios.patch(`/loans/${id}/reject`);
      Swal.fire("Success", "Loan rejected", "success");
      fetchLoans();
      setShowModal(false);
    } catch (error) {
      Swal.fire("Error", "Failed to reject loan", "error");
    }
  };

  const deleteLoan = async (id) => {
    const result = await Swal.fire({
      title: "Delete Loan?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`/loans/${id}`);
      Swal.fire("Deleted", "Loan deleted", "success");
      fetchLoans();
    } catch (error) {
      Swal.fire("Error", "Failed to delete loan", "error");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-600";
      case "rejected":
        return "bg-red-100 text-red-600";
      default:
        return "bg-yellow-100 text-yellow-600";
    }
  };

  const calculateLoan = (loan) => {
    const principal = Number(loan.amount);
    const rate = Number(loan.interest_rate);
    const months = Number(loan.duration_months);

    const totalInterest = (principal * rate) / 100;
    const totalPayable = principal + totalInterest;

    const monthlyInterest = totalInterest / months;
    const monthlyInstallment = totalPayable / months;

    return {
      totalInterest,
      totalPayable,
      monthlyInterest,
      monthlyInstallment,
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <ClipLoader size={35} color="#16a34a" />
      </div>
    );
  }

  return (
    <div className="space-y-4 text-[11px]">

      {/* HEADER */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <FaMoneyBillWave />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-800">
              Loans
            </h2>
            <p className="text-[10px] text-gray-400">
              Manage loan applications
            </p>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left">Member</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Interest</th>
                <th className="px-4 py-3 text-left">Duration</th>

                <th className="px-4 py-3 text-left">Total Payable</th>
                <th className="px-4 py-3 text-left">Monthly Interest</th>
                <th className="px-4 py-3 text-left">Monthly Installment</th>

                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loans.length > 0 ? (
                loans.map((loan) => {
                  const calc = calculateLoan(loan);

                  return (
                    <tr key={loan.id} className="border-b hover:bg-gray-50">

                      <td className="px-4 py-3">
                        {loan.fullname}
                      </td>

                      <td className="px-4 py-3">
                        KES {Number(loan.amount).toLocaleString()}
                      </td>

                      <td className="px-4 py-3">
                        {loan.interest_rate}%
                      </td>

                      <td className="px-4 py-3">
                        {loan.duration_months} m
                      </td>

                      <td className="px-4 py-3 text-green-600 font-medium">
                        KES {calc.totalPayable.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>

                      <td className="px-4 py-3">
                        KES {calc.monthlyInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>

                      <td className="px-4 py-3">
                        KES {calc.monthlyInstallment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>

                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] ${getStatusClass(loan.status)}`}>
                          {loan.status}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">

                          {/* VIEW */}
                          <button
                            onClick={() => {
                              setSelectedLoan(loan);
                              setShowModal(true);
                            }}
                            className="h-7 w-7 rounded bg-blue-100 text-blue-600 flex items-center justify-center"
                          >
                            <FaEye />
                          </button>

                          {loan.status === "pending" && (
                            <>
                              <button
                                onClick={() => approveLoan(loan.id)}
                                className="h-7 w-7 rounded bg-green-100 text-green-600 flex items-center justify-center"
                              >
                                <FaCheck />
                              </button>

                              <button
                                onClick={() => rejectLoan(loan.id)}
                                className="h-7 w-7 rounded bg-red-100 text-red-600 flex items-center justify-center"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => deleteLoan(loan.id)}
                            className="h-7 w-7 rounded bg-gray-100 text-gray-600 flex items-center justify-center"
                          >
                            <FaTrash />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-400">
                    No loans found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && selectedLoan && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-5 w-full max-w-md text-[12px]">

            <h2 className="font-semibold mb-3">
              Loan Details
            </h2>

            <div className="space-y-2">
              <p><b>Member:</b> {selectedLoan.fullname}</p>
              <p><b>Amount:</b> KES {selectedLoan.amount}</p>
              <p><b>Interest:</b> {selectedLoan.interest_rate}%</p>
              <p><b>Duration:</b> {selectedLoan.duration_months} months</p>
              <p><b>Status:</b> {selectedLoan.status}</p>
            </div>

            <div className="flex justify-end gap-2 mt-5">

              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 border rounded"
              >
                Close
              </button>

              <button
                onClick={() => rejectLoan(selectedLoan.id)}
                className="px-3 py-1 bg-red-500 text-white rounded"
              >
                Reject
              </button>

              <button
                onClick={() => approveLoan(selectedLoan.id)}
                className="px-3 py-1 bg-green-600 text-white rounded"
              >
                Approve
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Loans;