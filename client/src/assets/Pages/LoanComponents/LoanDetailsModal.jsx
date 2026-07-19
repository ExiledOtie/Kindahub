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
      className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-xl w-full max-w-5xl overflow-hidden"
      >
        {/* Header */}

        <div className="bg-green-600 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Loan Details</h2>

            <p className="text-xs opacity-90">Loan #{loan.id}</p>
          </div>

          <button
            onClick={onClose}
            className="h-9 w-9 rounded-lg bg-white/20 hover:bg-white/30"
          >
            <FaTimes className="mx-auto" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Top Cards */}

          <div className="grid md:grid-cols-2 gap-5">
            {/* Member */}

            <div className="border rounded-xl p-5">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <FaUser />
                Member Information
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Full Name</p>
                  <p className="font-medium">{loan.fullname}</p>
                </div>

                <div>
                  <p className="text-gray-500">Username</p>
                  <p>{loan.username}</p>
                </div>

                <div>
                  <p className="text-gray-500">Group</p>
                  <p>{loan.group_name}</p>
                </div>

                <div>
                  <p className="text-gray-500 mb-1">Status</p>
                  <StatusBadge status={loan.status} />
                </div>
              </div>
            </div>

            {/* Loan */}

            <div className="border rounded-xl p-5">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <FaMoneyBillWave />
                Loan Information
              </h3>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Loan Amount</p>
                  <p className="font-semibold text-green-600">
                    {money(loan.amount)}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Outstanding</p>
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
                  <p className="text-gray-500">Interest Rate</p>

                  <p className="font-semibold text-orange-600">
                    {Number(loan.interest_rate || 0).toFixed(2)}%
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Duration</p>
                  <p>{loan.duration_months} Months</p>
                </div>

                <div>
                  <p className="text-gray-500">Total Payable</p>
                  <p>
                    {money(
                      loan.total_payable ??
                        Number(loan.amount || 0) *
                          (1 + Number(loan.interest_rate || 0) / 100),
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Monthly Installment</p>
                  <p>{money(monthlyPayment)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress */}

          <div className="border rounded-xl p-5">
            <div className="flex justify-between mb-3">
              <h3 className="font-semibold">Repayment Progress</h3>

              <span>{progress.toFixed(1)}%</span>
            </div>

            <ProgressBar progress={progress} />
          </div>

          {/* Timeline */}

          <div className="border rounded-xl p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-5">
              <FaCalendarAlt />
              Loan Timeline
            </h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 text-sm">
              <div>
                <p className="text-gray-500">Requested On</p>

                <p className="font-medium">
                  {date(loan.requested_at || loan.created_at)}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Approved On</p>

                <p className="font-medium">{date(loan.approved_at)}</p>
              </div>

              <div>
                <p className="text-gray-500">Rejected On</p>

                <p className="font-medium">{date(loan.rejected_at)}</p>
              </div>

              <div>
                <p className="text-gray-500">Paid Off On</p>

                <p className="font-medium">
                  {date(loan.paid_off_at || loan.completed_at)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}

        <div className="border-t px-6 py-4 flex justify-end gap-3 flex-wrap">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            Close
          </button>

          {(loan.status === "pending" || loan.status === "approved") && (
            <button
              onClick={() => onEditInterest(loan)}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg flex items-center gap-2"
            >
              <FaEdit />
              Change Interest
            </button>
          )}

          {loan.status === "approved" && (
            <button
              onClick={() => onRepayments(loan)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
            >
              <FaCreditCard />
              View Repayments
            </button>
          )}

          {loan.status === "pending" && (
            <>
              <button
                onClick={() => onReject(loan.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
              >
                <FaBan />
                Reject
              </button>

              <button
                onClick={() => {
                  onClose();
                  onApprove(loan);
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
              >
                <FaCheck />
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
