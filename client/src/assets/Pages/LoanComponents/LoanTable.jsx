import { FaEye, FaEdit, FaCreditCard } from "react-icons/fa";

import StatusBadge from "./StatusBadge";
import ProgressBar from "./ProgressBar";

const LoanTable = ({
  loans = [],
  loanProgress = {},
  onView,
  onEditInterest,
  onRepayments,
}) => {
  const formatMoney = (value) => Number(value || 0).toLocaleString();

  const formatDate = (date) => {
    if (!date) return "-";

    try {
      return new Date(date).toLocaleDateString("en-GB");
    } catch {
      return "-";
    }
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead className="bg-gray-50">
            <tr className="text-gray-600">
              <th className="px-4 py-3 text-left">Member</th>

              <th className="px-4 py-3 text-left">Group</th>

              <th className="px-4 py-3 text-right">Amount</th>

              <th className="px-4 py-3 text-center">Interest</th>

              <th className="px-4 py-3 text-right">Balance</th>

              <th className="px-4 py-3 text-center">Requested</th>

              <th className="px-4 py-3 text-center">Approved</th>

              <th className="px-4 py-3 text-center">Paid Off</th>

              <th className="px-4 py-3 text-center">Status</th>

              <th className="px-4 py-3">Progress</th>

              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loans.length > 0 ? (
              loans.map((loan) => (
                <tr
                  key={loan.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{loan.fullname}</div>

                    <div className="text-[10px] text-gray-500">#{loan.id}</div>
                  </td>

                  <td className="px-4 py-3">{loan.group_name}</td>

                  <td className="px-4 py-3 text-right font-semibold text-green-600">
                    KES {formatMoney(loan.amount)}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {loan.interest_rate}%
                  </td>

                  <td className="px-4 py-3 text-right text-red-600">
                    KES {formatMoney(loan.balance)}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {formatDate(loan.requested_at || loan.created_at)}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {formatDate(loan.approved_at)}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {formatDate(loan.paid_off_at)}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={loan.status} />
                  </td>

                  <td className="px-4 py-3 min-w-[180px]">
                    <ProgressBar
                      progress={Number(loanProgress?.[loan.id] || 0)}
                    />
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      {/* VIEW */}
                      <button
                        onClick={() => onView(loan)}
                        className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
                      >
                        <FaEye className="mx-auto" />
                      </button>

                      {/* EDIT INTEREST */}
                      {(loan.status === "pending" ||
                        loan.status === "approved") && (
                        <button
                          onClick={() => onEditInterest(loan)}
                          className="h-8 w-8 rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                          title="Change Interest"
                        >
                          <FaEdit className="mx-auto" />
                        </button>
                      )}

                      {/* REPAYMENTS */}
                      {loan.status === "approved" && (
                        <button
                          onClick={() => onRepayments(loan)}
                          className="h-8 w-8 rounded-lg bg-green-100 text-green-600 hover:bg-green-200"
                          title="View Repayments"
                        >
                          <FaCreditCard className="mx-auto" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="py-12 text-center text-gray-400">
                  No loans found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoanTable;
