//Application/Components/RecentLoanRequests.jsx


import React from "react";

const OverdueLoans = ({ loans = [] }) => {
  return (
    <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm overflow-x-auto">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[11px] font-semibold text-gray-700">
          Overdue Loans
        </h2>
      </div>

      <table className="w-full text-[10px]">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="pb-2">Member</th>
            <th>Loan Amount</th>
            <th>Overdue Since</th>
            <th>Balance</th>
          </tr>
        </thead>

        <tbody>
          {loans.length === 0 ? (
            <tr>
              <td
                colSpan="4"
                className="text-center py-6 text-gray-400"
              >
                No overdue loans
              </td>
            </tr>
          ) : (
            loans.map((loan) => (
              <tr
                key={loan.id}
                className="border-b last:border-none"
              >
                <td className="py-2">
                  {loan.memberName}
                </td>

                <td>
                  KES{" "}
                  {Number(
                    loan.loanAmount
                  ).toLocaleString()}
                </td>

                <td>
                  {new Date(
                    loan.overdueSince
                  ).toLocaleDateString()}
                </td>

                <td className="text-red-500 font-semibold">
                  KES{" "}
                  {Number(
                    loan.balance
                  ).toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OverdueLoans;