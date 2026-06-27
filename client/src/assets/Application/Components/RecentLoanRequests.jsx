//Application/Components/RecentLoanRequests.jsx

import React from "react";

const RecentLoanRequests = ({ loans = [] }) => {
  return (
    <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">

      <div className="flex justify-between items-center mb-4">

        <h2 className="text-[11px] font-semibold text-gray-700">
          Recent Loan Requests
        </h2>

      </div>

      <div className="space-y-3">

        {loans.length === 0 ? (

          <div className="text-center text-gray-400 text-sm py-10">
            No recent loan requests
          </div>

        ) : (

          loans.map((loan) => (

            <div
              key={loan.id}
              className="flex justify-between items-center border-b pb-2 last:border-none"
            >

              <div>

                <h3 className="text-[10px] font-semibold">
                  {loan.memberName}
                </h3>

                <p className="text-[9px] text-gray-500">
                  {loan.loanType || "Loan Request"}
                </p>

              </div>

              <div className="text-right">

                <h3 className="text-[10px] font-semibold">
                  KES{" "}
                  {Number(
                    loan.amount
                  ).toLocaleString()}
                </h3>

                <span
                  className={`text-[9px] font-semibold ${
                    loan.status === "Approved"
                      ? "text-green-600"
                      : loan.status === "Rejected"
                      ? "text-red-500"
                      : "text-yellow-500"
                  }`}
                >
                  {loan.status}
                </span>

              </div>

            </div>

          ))

        )}

      </div>

    </div>
  );
};

export default RecentLoanRequests;