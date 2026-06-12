import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../Utils/axios";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";

import {
  FaCheck,
  FaTimes,
  FaTrash,
  FaMoneyBillWave,
  FaEye,
  FaCreditCard,
} from "react-icons/fa";

const ITEMS_PER_PAGE = 8;

const Loans = () => {
  const navigate = useNavigate();

  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [page, setPage] = useState(1);

  // modal
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // actions
  const [actionLoading, setActionLoading] = useState(null);

  // repayment
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [mpesaCode, setMpesaCode] = useState("");

  // ---------------- FETCH ----------------
  const fetchLoans = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/loans");
      setLoans(res.data);
    } catch {
      Swal.fire("Error", "Failed to fetch loans", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  // ---------------- CALC ----------------
  const calculateLoan = (loan) => {
    const principal = Number(loan.amount || 0);
    const rate = Number(loan.interest_rate || 0);
    const months = Number(loan.duration_months || 1);

    const totalInterest = (principal * rate) / 100;
    const totalPayable = principal + totalInterest;

    return {
      totalPayable,
      totalInterest,
      monthlyInstallment: totalPayable / months,
    };
  };

  const getProgress = (loan) => {
    const calc = calculateLoan(loan);
    const paid = Number(loan.paid_amount || 0);
    if (!calc.totalPayable) return 0;
    return Math.min((paid / calc.totalPayable) * 100, 100);
  };

  // ---------------- FILTERS ----------------
  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      const matchesSearch =
        loan.fullname?.toLowerCase().includes(search.toLowerCase()) ||
        loan.id?.toString().includes(search);

      const matchesStatus =
        statusFilter === "all" || loan.status === statusFilter;

      const matchesGroup =
        groupFilter === "all" || loan.group_name === groupFilter;

      return matchesSearch && matchesStatus && matchesGroup;
    });
  }, [loans, search, statusFilter, groupFilter]);

  const totalPages = Math.ceil(filteredLoans.length / ITEMS_PER_PAGE);

  const paginatedLoans = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredLoans.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLoans, page]);

  const uniqueGroups = [
    ...new Set(loans.map((l) => l.group_name).filter(Boolean)),
  ];

  const isActionLoading = (type, id) =>
    actionLoading?.type === type && actionLoading?.id === id;

  // ---------------- ACTIONS ----------------
  const approveLoan = async (id) => {
    try {
      setActionLoading({ type: "approve", id });
      await axios.patch(`/loans/${id}/approve`);
      Swal.fire("Success", "Loan approved", "success");
      fetchLoans();
      setShowModal(false);
    } catch {
      Swal.fire("Error", "Failed to approve loan", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const rejectLoan = async (id) => {
    try {
      setActionLoading({ type: "reject", id });
      await axios.patch(`/loans/${id}/reject`);
      Swal.fire("Success", "Loan rejected", "success");
      fetchLoans();
      setShowModal(false);
    } catch {
      Swal.fire("Error", "Failed to reject loan", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteLoan = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Loan?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      setActionLoading({ type: "delete", id });
      await axios.delete(`/loans/${id}`);
      Swal.fire("Deleted", "Loan deleted", "success");
      fetchLoans();
      setShowModal(false);
    } catch {
      Swal.fire("Error", "Failed to delete loan", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // ---------------- REPAYMENT ----------------
  const recordPayment = async () => {
    try {
      if (!amount) return Swal.fire("Error", "Enter amount", "error");
      if (paymentMethod === "mpesa" && !mpesaCode) {
        return Swal.fire("Error", "Enter MPesa code", "error");
      }

      await axios.post("/loan-payments", {
        loan_id: selectedLoan.id,
        amount,
        payment_method: paymentMethod,
        mpesa_code: paymentMethod === "mpesa" ? mpesaCode : null,
      });

      Swal.fire("Success", "Payment recorded", "success");

      setAmount("");
      setMpesaCode("");
      setPaymentMethod("cash");

      fetchLoans();
      setShowModal(false);
    } catch {
      Swal.fire("Error", "Failed to record payment", "error");
    }
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
      <div className="bg-white p-4 rounded-xl border flex items-center gap-2">
        <FaMoneyBillWave className="text-green-600" />
        <h2 className="font-semibold">Loans Management</h2>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-3 rounded-xl border flex flex-wrap gap-2">
        <input
          className="border px-2 py-1 rounded w-60"
          placeholder="Search member / ID..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <select
          className="border px-2 py-1 rounded"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          className="border px-2 py-1 rounded"
          value={groupFilter}
          onChange={(e) => {
            setGroupFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All Groups</option>
          {uniqueGroups.map((g, i) => (
            <option key={i} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-left">Member</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Progress</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedLoans.map((loan) => {
                const progress = getProgress(loan);

                return (
                  <tr key={loan.id} className="border-b">
                    <td className="p-3">{loan.fullname}</td>
                    <td className="p-3">
                      KES {Number(loan.amount).toLocaleString()}
                    </td>
                    <td className="p-3 capitalize">{loan.status}</td>

                    <td className="p-3 w-52">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-green-500 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-500">
                        {progress.toFixed(1)}%
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedLoan(loan);
                          setShowModal(true);
                        }}
                        className="h-7 w-7 bg-blue-100 text-blue-600 rounded"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-between p-3 border-t">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Prev
          </button>

          <span>
            Page {page} of {totalPages || 1}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showModal && selectedLoan && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white p-5 rounded-xl w-full max-w-md text-[12px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-semibold mb-4">Loan Details</h2>

            <div className="space-y-2">
              <p>
                <b>Member:</b> {selectedLoan.fullname}
              </p>

              <p>
                <b>Amount:</b> KES{" "}
                {Number(selectedLoan.amount).toLocaleString()}
              </p>

              <p>
                <b>Interest:</b> {selectedLoan.interest_rate}%
              </p>

              <p>
                <b>Duration:</b> {selectedLoan.duration_months} Months
              </p>

              <p>
                <b>Group:</b> {selectedLoan.group_name || "-"}
              </p>

              <p>
                <b>Status:</b>{" "}
                <span className="capitalize">{selectedLoan.status}</span>
              </p>

              <p>
                <b>Total Payable:</b> KES{" "}
                {calculateLoan(selectedLoan).totalPayable.toLocaleString()}
              </p>

              <p>
                <b>Monthly Installment:</b> KES{" "}
                {calculateLoan(selectedLoan).monthlyInstallment.toLocaleString(
                  undefined,
                  {
                    maximumFractionDigits: 2,
                  },
                )}
              </p>
            </div>

            <div className="flex flex-wrap justify-end gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 border rounded"
              >
                Close
              </button>

              {selectedLoan.status === "approved" && (
                <button
                  onClick={() => {
                    setShowModal(false);

                    navigate(`/dashboard/loan-repayments/${selectedLoan.id}`);
                  }}
                  className="px-3 py-1 bg-purple-600 text-white rounded flex items-center gap-1"
                >
                  <FaCreditCard />
                  Repayments
                </button>
              )}

              {selectedLoan.status === "pending" && (
                <>
                  <button
                    disabled={isActionLoading("reject", selectedLoan.id)}
                    onClick={() => rejectLoan(selectedLoan.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded flex items-center gap-1"
                  >
                    <FaTimes />
                    {isActionLoading("reject", selectedLoan.id)
                      ? "Rejecting..."
                      : "Reject"}
                  </button>

                  <button
                    disabled={isActionLoading("approve", selectedLoan.id)}
                    onClick={() => approveLoan(selectedLoan.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded flex items-center gap-1"
                  >
                    <FaCheck />
                    {isActionLoading("approve", selectedLoan.id)
                      ? "Approving..."
                      : "Approve"}
                  </button>
                </>
              )}

              <button
                disabled={isActionLoading("delete", selectedLoan.id)}
                onClick={() => deleteLoan(selectedLoan.id)}
                className="px-3 py-1 bg-gray-700 text-white rounded flex items-center gap-1"
              >
                <FaTrash />
                {isActionLoading("delete", selectedLoan.id)
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loans;
