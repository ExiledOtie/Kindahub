import { useEffect, useMemo, useState } from "react";
import axios from "../Utils/axios";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";

import LoanStats from "./LoanComponents/LoanStats";
import LoanFilters from "./LoanComponents/LoanFilters";
import LoanTable from "./LoanComponents/LoanTable";
import LoanPagination from "./LoanComponents/LoanPagination";
import LoanDetailsModal from "./LoanComponents/LoanDetailsModal";

const ITEMS_PER_PAGE = 8;

const Loans = () => {
  const [loans, setLoans] = useState([]);
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

  const fetchLoans = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get("/loans");

      setLoans(data);

      const balances = await Promise.all(
        data.map(async (loan) => {
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
      <div className="flex justify-center items-center h-[70vh]">
        <ClipLoader size={35} color="#16a34a" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <LoanStats loans={loans} />

      <LoanFilters
        loans={loans}
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        groupFilter={groupFilter}
        setGroupFilter={setGroupFilter}
        setPage={setPage}
      />

      <LoanTable
        loans={paginatedLoans}
        progress={loanProgress}
        onView={(loan) => setSelectedLoan(loan)}
      />

      <LoanPagination page={page} totalPages={totalPages} setPage={setPage} />

      {selectedLoan && (
        <LoanDetailsModal
          loan={selectedLoan}
          onClose={() => setSelectedLoan(null)}
          onApprove={(loan) => {
            setLoanToApprove(loan);
            setInterestRate(loan.interest_rate || "");
            setInterestModal(true);
          }}
          onReject={rejectLoan}
          actionLoading={actionLoading}
        />
      )}

      {interestModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold">Approve Loan</h2>

            <p className="text-sm text-gray-500">
              You may adjust the interest rate before approving.
            </p>

            <div>
              <label className="block text-sm mb-1">Interest Rate (%)</label>

              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            {loanToApprove && (
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p>
                  <strong>Member:</strong> {loanToApprove.fullname}
                </p>

                <p>
                  <strong>Loan:</strong> KES{" "}
                  {Number(loanToApprove.amount).toLocaleString()}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setInterestModal(false);
                  setLoanToApprove(null);
                  setInterestRate("");
                }}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={approveLoan}
                disabled={
                  actionLoading?.type === "approve" || interestRate === ""
                }
                className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
              >
                {actionLoading?.type === "approve"
                  ? "Approving..."
                  : "Approve Loan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loans;
