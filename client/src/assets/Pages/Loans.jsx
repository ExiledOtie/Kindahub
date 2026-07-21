import { useEffect, useMemo, useState } from "react";
import axios from "../Utils/axios";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";

import LoanStats from "./LoanComponents/LoanStats";
import LoanFilters from "./LoanComponents/LoanFilters";
import LoanTable from "./LoanComponents/LoanTable";
import LoanPagination from "./LoanComponents/LoanPagination";
import LoanDetailsModal from "./LoanComponents/LoanDetailsModal";

const ITEMS_PER_PAGE = 8;

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [interestEarned, setInterestEarned] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [loanProgress, setLoanProgress] = useState({});
  const [selectedLoan, setSelectedLoan] = useState(null);

  const [actionLoading, setActionLoading] = useState(null);

  const [interestModal, setInterestModal] = useState(false);
  const [interestRate, setInterestRate] = useState("");
  const [loanToApprove, setLoanToApprove] = useState(null);
  const [interestAction, setInterestAction] = useState("approve");

  const navigate = useNavigate();

  const fetchLoans = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get("/loans");

      setLoans(data.loans);
      setInterestEarned(Number(data.interestEarned || 0));

      const balances = await Promise.all(
        data.loans.map(async (loan) => {
          try {
            const res = await axios.get(`/loan-payments/${loan.id}/balance`);

            return {
              id: loan.id,
              progress:
                res.data.totalPayable > 0
                  ? (res.data.totalPaid / res.data.totalPayable) * 100
                  : 0,
            };
          } catch {
            return {
              id: loan.id,
              progress: 0,
            };
          }
        }),
      );

      const progressMap = {};

      balances.forEach((b) => {
        progressMap[b.id] = b.progress;
      });

      setLoanProgress(progressMap);
    } catch (err) {
      console.log(err);
      Swal.fire("Error", "Failed to load loans", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const groups = useMemo(() => {
    return [
      ...new Set(loans.map((loan) => loan.group_name).filter(Boolean)),
    ].sort();
  }, [loans]);

  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      const searchMatch =
        loan.fullname?.toLowerCase().includes(search.toLowerCase()) ||
        loan.username?.toLowerCase().includes(search.toLowerCase()) ||
        loan.id.toString().includes(search);

      const statusMatch =
        statusFilter === "all" || loan.status === statusFilter;

      const groupMatch =
        groupFilter === "all" || loan.group_name === groupFilter;

      return searchMatch && statusMatch && groupMatch;
    });
  }, [loans, search, statusFilter, groupFilter]);

  const totalPages = Math.ceil(filteredLoans.length / ITEMS_PER_PAGE);

  const paginatedLoans = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredLoans.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLoans, page]);

  const approveLoan = async () => {
    try {
      setActionLoading({
        type: "approve",
        id: loanToApprove.id,
      });

      await axios.patch(`/loans/${loanToApprove.id}/approve`, {
        interest_rate: Number(interestRate),
      });

      Swal.fire("Approved", "Loan approved successfully", "success");

      setInterestModal(false);
      setLoanToApprove(null);
      setInterestRate("");

      fetchLoans();
      setSelectedLoan(null);
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to approve loan",
        "error",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const updateInterest = async () => {
    try {
      setActionLoading({
        type: "interest",
        id: loanToApprove.id,
      });

      await axios.patch(`/loans/${loanToApprove.id}/interest`, {
        interest_rate: Number(interestRate),
      });

      Swal.fire("Success", "Interest rate updated successfully", "success");

      setInterestModal(false);
      setLoanToApprove(null);
      setInterestRate("");
      setInterestAction("approve");

      fetchLoans();

      if (selectedLoan) {
        setSelectedLoan({
          ...selectedLoan,
          interest_rate: Number(interestRate),
        });
      }
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to update interest rate",
        "error",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const rejectLoan = async (loanId) => {
    try {
      setActionLoading({
        type: "reject",
        id: loanId,
      });

      await axios.patch(`/loans/${loanId}/reject`);

      Swal.fire("Rejected", "Loan rejected successfully", "success");

      fetchLoans();
      setSelectedLoan(null);
    } catch {
      Swal.fire("Error", "Failed to reject loan", "error");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[65vh]">
        <ClipLoader size={28} color="#16a34a" />
      </div>
    );
  }

  return (
    <div className="space-y-2 text-[9px]">
      <LoanStats loans={loans} interestEarned={interestEarned} />

      <LoanFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        groupFilter={groupFilter}
        setGroupFilter={setGroupFilter}
        groups={groups}
        setPage={setPage}
      />

      <LoanTable
        loans={paginatedLoans}
        loanProgress={loanProgress}
        onView={(loan) => setSelectedLoan(loan)}
        onEditInterest={(loan) => {
          setLoanToApprove(loan);
          setInterestRate(loan.interest_rate || "");
          setInterestAction("update");
          setInterestModal(true);
        }}
        onRepayments={(loan) => {
          console.log(
            "Navigating to:",
            `/dashboard/loan-repayments/${loan.id}`,
          );
          navigate(`/dashboard/loan-repayments/${loan.id}`);
        }}
      />

      <LoanPagination page={page} totalPages={totalPages} setPage={setPage} />

      {selectedLoan && (
        <LoanDetailsModal
          open={!!selectedLoan}
          loan={selectedLoan}
          progress={loanProgress[selectedLoan.id] || 0}
          onClose={() => setSelectedLoan(null)}
          onApprove={(loan) => {
            setLoanToApprove(loan);
            setInterestRate(loan.interest_rate);
            setInterestModal(true);
          }}
          onEditInterest={(loan) => {
            setLoanToApprove(loan);
            setInterestRate(loan.interest_rate);
            setInterestModal(true);
          }}
          onReject={rejectLoan}
          onRepayments={(loan) => {
            console.log(
              "Navigating to:",
              `/dashboard/loan-repayments/${loan.id}`,
            );
            navigate(`/dashboard/loan-repayments/${loan.id}`);
          }}
        />
      )}

      {interestModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xs p-4 space-y-3">
            <div>
              <h2 className="text-[11px] font-semibold text-gray-800">
                {interestAction === "approve"
                  ? "Approve Loan"
                  : "Update Interest Rate"}
              </h2>

              <p className="text-[9px] text-gray-500 mt-0.5">
                {interestAction === "approve"
                  ? "Adjust the interest before approving."
                  : "Change the interest rate for this loan."}
              </p>
            </div>

            <div>
              <label className="block text-[9px] font-medium mb-1 text-gray-600">
                Interest Rate (%)
              </label>

              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full h-8 border rounded-md px-2 text-[9px] focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {loanToApprove && (
              <div className="bg-gray-50 border rounded-md p-2 space-y-1 text-[9px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Member</span>

                  <span className="font-medium">{loanToApprove.fullname}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Loan Amount</span>

                  <span className="font-medium">
                    KES {Number(loanToApprove.amount).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Current Interest</span>

                  <span className="font-medium text-green-600">
                    {loanToApprove.interest_rate}%
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => {
                  setInterestModal(false);
                  setLoanToApprove(null);
                  setInterestRate("");
                  setInterestAction("approve");
                }}
                className="h-8 px-3 border rounded-md text-[9px] hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                disabled={actionLoading || interestRate === ""}
                onClick={() => {
                  if (interestAction === "approve") {
                    approveLoan();
                  } else {
                    updateInterest();
                  }
                }}
                className="h-8 px-3 rounded-md bg-green-600 hover:bg-green-700 text-white text-[9px] transition disabled:opacity-50"
              >
                {actionLoading
                  ? "Saving..."
                  : interestAction === "approve"
                    ? "Approve Loan"
                    : "Update Interest"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loans;
