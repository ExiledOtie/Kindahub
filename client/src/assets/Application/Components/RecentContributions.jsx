//Application/Components/RecentLoanRequests.jsx

import React from "react";

const RecentContributions = ({
  contributions = [],
}) => {
  return (
    <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm overflow-x-auto">

      <div className="flex justify-between items-center mb-3">

        <h2 className="text-[11px] font-semibold text-gray-700">
          Recent Contributions
        </h2>

      </div>

      <table className="w-full text-[10px]">

        <thead>

          <tr className="border-b text-left text-gray-500">

            <th className="pb-2">Member</th>

            <th>Type</th>

            <th>Amount</th>

            <th>Date</th>

            <th>Status</th>

          </tr>

        </thead>

        <tbody>

          {contributions.length === 0 ? (

            <tr>

              <td
                colSpan="5"
                className="text-center py-6 text-gray-400"
              >
                No contributions found
              </td>

            </tr>

          ) : (

            contributions.map((item) => (

              <tr
                key={item.id}
                className="border-b last:border-none"
              >

                <td className="py-2">
                  {item.memberName}
                </td>

                <td>
                  {item.type}
                </td>

                <td>
                  KES{" "}
                  {Number(
                    item.amount
                  ).toLocaleString()}
                </td>

                <td>
                  {new Date(
                    item.date
                  ).toLocaleDateString()}
                </td>

                <td>

                  <span
                    className={`font-semibold ${
                      item.status === "Paid"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {item.status}
                  </span>

                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </div>
  );
};

export default RecentContributions;