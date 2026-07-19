import { useEffect, useMemo, useState } from "react";
import axios from "../Utils/axios";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";

import LoanStats from "./LoanComponents/LoanStats";
import LoanFilters from "./LoanComponents/LoanFilters";
import LoanTable from "./LoanComponents/LoanTable";
import LoanPagination from "./LoanComponents/LoanPagination";
import LoanDetailsModal from "./LoanComponents/LoanDetailsModal";
import ApproveLoanModal from "./LoanComponents/ApproveLoanModal";
import EditInterestModal from "./LoanComponents/EditInterestModal";

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

  // Approval Modal
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [loanToApprove, setLoanToApprove] = useState(null);

  // Edit Interest Modal
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [loanToEdit, setLoanToEdit] = useState(null);

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

      balances.forEach((item) => {
        progressMap[item.id] = item.progress;
      });

      setLoanProgress(progressMap);
    } catch (err) {
      console.error(err);

      Swal.fire("Error", "Failed to load loans", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const groups = useMemo(() => {
    return [...new Set(loans.map((loan) => loan.group_name).filter(Boolean))];
  }, [loans]);

  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      const matchesSearch =
        loan.fullname?.toLowerCase().includes(search.toLowerCase()) ||
        loan.username?.toLowerCase().includes(search.toLowerCase()) ||
        loan.id.toString().includes(search);

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
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to reject loan",
        "error",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const openApproveModal = (loan) => {
    setLoanToApprove(loan);
    setShowApproveModal(true);
  };

  const openInterestModal = (loan) => {
    setLoanToEdit(loan);
    setShowInterestModal(true);
  };

  const handleSuccess = () => {
    fetchLoans();

    setSelectedLoan(null);

    setShowApproveModal(false);

    setShowInterestModal(false);

    setLoanToApprove(null);

    setLoanToEdit(null);
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
        onEditInterest={openInterestModal}
        onRepayments={(loan) => {
          window.location.href = `/loan-repayments/${loan.id}`;
        }}
      />

      <LoanPagination page={page} totalPages={totalPages} setPage={setPage} />

      <LoanDetailsModal
        open={!!selectedLoan}
        loan={selectedLoan}
        progress={selectedLoan ? loanProgress[selectedLoan.id] || 0 : 0}
        onClose={() => setSelectedLoan(null)}
        onApprove={openApproveModal}
        onReject={rejectLoan}
        onEditInterest={openInterestModal}
        onRepayments={(loan) => {
          window.location.href = `/loan-repayments/${loan.id}`;
        }}
      />

      <ApproveLoanModal
        open={showApproveModal}
        loan={loanToApprove}
        onClose={() => {
          setShowApproveModal(false);
          setLoanToApprove(null);
        }}
        onSuccess={handleSuccess}
      />

      <EditInterestModal
        open={showInterestModal}
        loan={loanToEdit}
        onClose={() => {
          setShowInterestModal(false);
          setLoanToEdit(null);
        }}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default Loans;