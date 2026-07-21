import {
  FaTimes,
  FaCheck,
  FaBan,
  FaEdit,
  FaCreditCard,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaUser,
} from "react-icons/fa";

import StatusBadge from "./StatusBadge";
import ProgressBar from "./ProgressBar";

const LoanDetailsModal = ({
  open,
  loan,
  progress = 0,
  onClose,
  onApprove,
  onReject,
  onEditInterest,
  onRepayments,
}) => {
  if (!open || !loan) return null;

  const money = (value) => `KES ${Number(value || 0).toLocaleString()}`;

  const date = (value) => {
    if (!value) return "-";

    try {
      return new Date(value).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  const totalPayable = Number(
    loan.total_payable ??
      Number(loan.amount || 0) * (1 + Number(loan.interest_rate || 0) / 100),
  );

  const monthlyPayment =
    totalPayable / Math.max(Number(loan.duration_months || 1), 1);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-3"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[94vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-green-600 text-white px-5 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Loan Details</h2>
            <p className="text-[10px] opacity-90">Loan #{loan.id}</p>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-white/20 hover:bg-white/30 transition"
          >
            <FaTimes className="mx-auto text-xs" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 text-[11px]">
          {/* Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Member */}
            <div className="border rounded-md p-3">
              <h3 className="flex items-center gap-2 text-xs font-semibold mb-3">
                <FaUser className="text-green-600 text-[10px]" />
                Member Information
              </h3>

              <div className="space-y-2">
                <div>
                  <p className="text-[10px] text-gray-500">Full Name</p>
                  <p className="font-medium">{loan.fullname}</p>
                </div>

                <div>
                  <p className="text-[10px] text-gray-500">Username</p>
                  <p>{loan.username}</p>
                </div>

                <div>
                  <p className="text-[10px] text-gray-500">Group</p>
                  <p>{loan.group_name}</p>
                </div>

                <div>
                  <p className="text-[10px] text-gray-500 mb-1">Status</p>
                  <StatusBadge status={loan.status} />
                </div>
              </div>
            </div>

            {/* Loan */}
            <div className="border rounded-md p-3">
              <h3 className="flex items-center gap-2 text-xs font-semibold mb-3">
                <FaMoneyBillWave className="text-green-600 text-[10px]" />
                Loan Information
              </h3>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <p className="text-[10px] text-gray-500">Loan Amount</p>
                  <p className="font-semibold text-green-600">
                    {money(loan.amount)}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-gray-500">Outstanding</p>
                  <div>
                    <p className="text-[10px] text-gray-500">
                      Current Principal
                    </p>

                    <p className="font-semibold text-blue-600">
                      {money(loan.current_principal)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-500">Interest Earned</p>

                    <p className="font-semibold text-orange-600">
                      {money(loan.interest_accrued)}
                    </p>
                  </div>
                  <p className="font-semibold text-red-600">
                    {money(
                      loan.balance ??
                        loan.remaining_balance ??
                        loan.balance_after ??
                        0,
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-gray-500">Interest Rate</p>
                  <p className="font-semibold text-orange-600">
                    {Number(loan.interest_rate || 0).toFixed(2)}%
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-gray-500">Duration</p>
                  <p>{loan.duration_months} Months</p>
                </div>

                <div>
                  <p className="text-[10px] text-gray-500">Total Payable</p>
                  <p className="font-medium">{money(totalPayable)}</p>
                </div>

                <div>
                  <p className="text-[10px] text-gray-500">
                    Monthly Installment
                  </p>
                  <p className="font-medium">{money(monthlyPayment)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="border rounded-md p-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-semibold">Repayment Progress</h3>

              <span className="text-[10px] font-medium">
                {progress.toFixed(1)}%
              </span>
            </div>

            <ProgressBar progress={progress} />
          </div>

          {/* Timeline */}
          <div className="border rounded-md p-3">
            <h3 className="flex items-center gap-2 text-xs font-semibold mb-3">
              <FaCalendarAlt className="text-[10px]" />
              Loan Timeline
            </h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-3">
              <div>
                <p className="text-[10px] text-gray-500">Requested On</p>
                <p>{date(loan.requested_at || loan.created_at)}</p>
              </div>

              <div>
                <p className="text-[10px] text-gray-500">Approved On</p>
                <div>
                  <p className="text-[10px] text-gray-500">Last Interest</p>

                  <p>{date(loan.last_interest_date)}</p>
                </div>

                <div>
                  <p className="text-[10px] text-gray-500">Next Interest</p>

                  <p>{date(loan.next_interest_date)}</p>
                </div>
                <p>{date(loan.approved_at)}</p>
              </div>

              <div>
                <p className="text-[10px] text-gray-500">Rejected On</p>
                <p>{date(loan.rejected_at)}</p>
              </div>

              <div>
                <p className="text-[10px] text-gray-500">Paid Off On</p>
                <p>{date(loan.paid_off_at || loan.completed_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-3 flex flex-wrap justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-[11px] border rounded-md hover:bg-gray-50 transition"
          >
            Close
          </button>

          {(loan.status === "pending" || loan.status === "approved") && (
            <button
              onClick={() => onEditInterest(loan)}
              className="px-3 py-1.5 text-[11px] bg-yellow-500 hover:bg-yellow-600 text-white rounded-md flex items-center gap-1.5 transition"
            >
              <FaEdit className="text-[10px]" />
              Change Interest
            </button>
          )}

          {loan.status === "approved" && (
            <button
              onClick={() => onRepayments(loan)}
              className="px-3 py-1.5 text-[11px] bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-1.5 transition"
            >
              <FaCreditCard className="text-[10px]" />
              View Repayments
            </button>
          )}

          {loan.status === "pending" && (
            <>
              <button
                onClick={() => onReject(loan.id)}
                className="px-3 py-1.5 text-[11px] bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center gap-1.5 transition"
              >
                <FaBan className="text-[10px]" />
                Reject
              </button>

              <button
                onClick={() => {
                  onClose();
                  onApprove(loan);
                }}
                className="px-3 py-1.5 text-[11px] bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center gap-1.5 transition"
              >
                <FaCheck className="text-[10px]" />
                Approve
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanDetailsModal;
