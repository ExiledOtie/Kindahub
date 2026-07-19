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

  const approveLoan = async (loanId) => {
    try {
      setActionLoading({
        type: "approve",
        id: loanId,
      });

      await axios.patch(`/loans/${loanId}/approve`);

      Swal.fire("Approved", "Loan approved successfully", "success");

      fetchLoans();
      setSelectedLoan(null);
    } catch {
      Swal.fire("Error", "Failed to approve loan", "error");
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
          onApprove={approveLoan}
          onReject={rejectLoan}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
};

export default Loans;
