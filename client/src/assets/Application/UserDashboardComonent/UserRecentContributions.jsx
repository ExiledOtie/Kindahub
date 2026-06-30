import React from "react";

const UserRecentContributions = ({ contributions = [] }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">
          Recent Contributions
        </h2>

        <span className="text-[10px] text-gray-400">
          Last {contributions.length} records
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Date
              </th>

              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Type
              </th>

              <th className="px-4 py-3 text-right font-semibold text-gray-600">
                Amount
              </th>

              <th className="px-4 py-3 text-center font-semibold text-gray-600">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {contributions.length > 0 ? (
              contributions.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(item.date).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                        item.type === "savings"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {item.type === "savings"
                        ? "Savings"
                        : "Monthly"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right font-semibold text-gray-700">
                    KES {Number(item.amount).toLocaleString()}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                        item.status === "completed" ||
                        item.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : item.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : item.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="py-10 text-center text-gray-400 text-xs"
                >
                  No contributions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserRecentContributions;