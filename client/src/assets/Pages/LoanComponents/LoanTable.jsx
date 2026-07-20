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
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[10px]">
          <thead className="bg-gray-50 border-b">
            <tr className="text-gray-600 font-semibold">
              <th className="px-3 py-2 text-left whitespace-nowrap">Member</th>
              <th className="px-3 py-2 text-left whitespace-nowrap">Group</th>
              <th className="px-3 py-2 text-right whitespace-nowrap">Amount</th>
              <th className="px-3 py-2 text-center whitespace-nowrap">Interest</th>
              <th className="px-3 py-2 text-right whitespace-nowrap">Balance</th>
              <th className="px-3 py-2 text-center whitespace-nowrap">Requested</th>
              <th className="px-3 py-2 text-center whitespace-nowrap">Approved</th>
              <th className="px-3 py-2 text-center whitespace-nowrap">Paid Off</th>
              <th className="px-3 py-2 text-center whitespace-nowrap">Status</th>
              <th className="px-3 py-2 text-center whitespace-nowrap">Progress</th>
              <th className="px-3 py-2 text-center whitespace-nowrap">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loans.length > 0 ? (
              loans.map((loan) => (
                <tr
                  key={loan.id}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  {/* Member */}
                  <td className="px-3 py-2">
                    <div className="font-medium text-[10px]">
                      {loan.fullname}
                    </div>

                    <div className="text-[9px] text-gray-500">
                      #{loan.id}
                    </div>
                  </td>

                  {/* Group */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    {loan.group_name}
                  </td>

                  {/* Amount */}
                  <td className="px-3 py-2 text-right font-semibold text-green-600 whitespace-nowrap">
                    KES {formatMoney(loan.amount)}
                  </td>

                  {/* Interest */}
                  <td className="px-3 py-2 text-center whitespace-nowrap">
                    {Number(loan.interest_rate || 0).toFixed(2)}%
                  </td>

                  {/* Balance */}
                  <td className="px-3 py-2 text-right font-semibold text-red-600 whitespace-nowrap">
                    KES {formatMoney(loan.balance)}
                  </td>

                  {/* Requested */}
                  <td className="px-3 py-2 text-center whitespace-nowrap">
                    {formatDate(loan.requested_at || loan.created_at)}
                  </td>

                  {/* Approved */}
                  <td className="px-3 py-2 text-center whitespace-nowrap">
                    {formatDate(loan.approved_at)}
                  </td>

                  {/* Paid Off */}
                  <td className="px-3 py-2 text-center whitespace-nowrap">
                    {formatDate(loan.paid_off_at)}
                  </td>

                  {/* Status */}
                  <td className="px-3 py-2 text-center">
                    <StatusBadge status={loan.status} />
                  </td>

                  {/* Progress */}
                  <td className="px-3 py-2 min-w-[140px]">
                    <ProgressBar
                      progress={Number(loanProgress?.[loan.id] || 0)}
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onView(loan)}
                        className="h-7 w-7 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                        title="View"
                      >
                        <FaEye className="mx-auto text-[10px]" />
                      </button>

                      {(loan.status === "pending" ||
                        loan.status === "approved") && (
                        <button
                          onClick={() => onEditInterest(loan)}
                          className="h-7 w-7 rounded-md bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition"
                          title="Change Interest"
                        >
                          <FaEdit className="mx-auto text-[10px]" />
                        </button>
                      )}

                      {loan.status === "approved" && (
                        <button
                          onClick={() => onRepayments(loan)}
                          className="h-7 w-7 rounded-md bg-green-100 text-green-600 hover:bg-green-200 transition"
                          title="View Repayments"
                        >
                          <FaCreditCard className="mx-auto text-[10px]" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={11}
                  className="py-8 text-center text-[10px] text-gray-400"
                >
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