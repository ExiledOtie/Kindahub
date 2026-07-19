import {
  FaTimes,
  FaCheck,
  FaBan,
  FaEdit,
  FaCreditCard,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaPercentage,
  FaClock,
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

  const formatMoney = (value) =>
    `KES ${Number(value || 0).toLocaleString()}`;

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  const monthlyInstallment =
    Number(loan.total_payable || 0) /
    Number(loan.duration_months || 1);

  return (
    <div
      className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl w-full max-w-4xl shadow-xl overflow-hidden"
      >
        {/* HEADER */}

        <div className="bg-green-600 text-white px-6 py-4 flex justify-between items-center">

          <div>

            <h2 className="text-lg font-semibold">
              Loan Details
            </h2>

            <p className="text-xs opacity-90">
              Loan #{loan.id}
            </p>

          </div>

          <button
            onClick={onClose}
            className="h-9 w-9 rounded-lg bg-white/20 hover:bg-white/30"
          >
            <FaTimes className="mx-auto" />
          </button>

        </div>

        <div className="p-6 space-y-6">

          {/* MEMBER */}

          <div className="grid md:grid-cols-2 gap-5">

            <div className="border rounded-xl p-4">

              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FaUser />
                Member
              </h3>

              <div className="space-y-2 text-sm">

                <div>
                  <span className="text-gray-500">
                    Name
                  </span>

                  <p className="font-medium">
                    {loan.fullname}
                  </p>

                </div>

                <div>
                  <span className="text-gray-500">
                    Group
                  </span>

                  <p className="font-medium">
                    {loan.group_name}
                  </p>

                </div>

                <div>
                  <span className="text-gray-500">
                    Status
                  </span>

                  <div className="mt-1">
                    <StatusBadge status={loan.status} />
                  </div>

                </div>

              </div>

            </div>

            {/* LOAN */}

            <div className="border rounded-xl p-4">

              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FaMoneyBillWave />
                Loan Information
              </h3>

              <div className="grid grid-cols-2 gap-4 text-sm">

                <div>
                  <span className="text-gray-500">
                    Amount
                  </span>

                  <p className="font-semibold text-green-600">
                    {formatMoney(loan.amount)}
                  </p>

                </div>

                <div>
                  <span className="text-gray-500">
                    Balance
                  </span>

                  <p className="font-semibold text-red-600">
                    {formatMoney(loan.balance)}
                  </p>

                </div>

                <div>
                  <span className="text-gray-500">
                    Interest
                  </span>

                  <p>
                    {loan.interest_rate}%
                  </p>

                </div>

                <div>
                  <span className="text-gray-500">
                    Duration
                  </span>

                  <p>
                    {loan.duration_months} Months
                  </p>

                </div>

                <div>
                  <span className="text-gray-500">
                    Total Payable
                  </span>

                  <p>
                    {formatMoney(
                      loan.total_payable
                    )}
                  </p>

                </div>

                <div>
                  <span className="text-gray-500">
                    Monthly Payment
                  </span>

                  <p>
                    {formatMoney(
                      monthlyInstallment
                    )}
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* PROGRESS */}

          <div className="border rounded-xl p-4">

            <div className="flex justify-between mb-3">

              <h3 className="font-semibold">
                Repayment Progress
              </h3>

              <span className="text-sm">
                {progress.toFixed(0)}%
              </span>

            </div>

            <ProgressBar progress={progress} />

          </div>

          {/* DATES */}

          <div className="border rounded-xl p-4">

            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FaCalendarAlt />
              Timeline
            </h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">

              <div>

                <p className="text-gray-500">
                  Requested
                </p>

                <p>
                  {formatDate(
                    loan.requested_at ||
                    loan.created_at
                  )}
                </p>

              </div>

              <div>

                <p className="text-gray-500">
                  Approved
                </p>

                <p>
                  {formatDate(
                    loan.approved_at
                  )}
                </p>

              </div>

              <div>

                <p className="text-gray-500">
                  Rejected
                </p>

                <p>
                  {formatDate(
                    loan.rejected_at
                  )}
                </p>

              </div>

              <div>

                <p className="text-gray-500">
                  Completed
                </p>

                <p>
                  {formatDate(
                    loan.completed_at
                  )}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* FOOTER */}

        <div className="border-t px-6 py-4 flex flex-wrap justify-end gap-3">

          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Close
          </button>

          {(loan.status === "pending" ||
            loan.status === "approved") && (
            <button
              onClick={() => onEditInterest(loan)}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg flex items-center gap-2"
            >
              <FaEdit />
              Change Interest
            </button>
          )}

          {loan.status === "approved" && (
            <button
              onClick={() => onRepayments(loan)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
            >
              <FaCreditCard />
              Repayments
            </button>
          )}

          {loan.status === "pending" && (
            <>
              <button
                onClick={() => onReject(loan.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2"
              >
                <FaBan />
                Reject
              </button>

              <button
                onClick={() => onApprove(loan.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
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