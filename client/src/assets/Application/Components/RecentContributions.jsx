// Application/Components/RecentContributions.jsx

import React from "react";
import { FaCheckCircle, FaClock } from "react-icons/fa";

const RecentContributions = ({ contributions = [] }) => {
  const recent = contributions.slice(0, 5);

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
            <th className="text-center">Status</th>
          </tr>
        </thead>

        <tbody>
          {recent.length === 0 ? (
            <tr>
              <td
                colSpan="5"
                className="text-center py-6 text-gray-400"
              >
                No contributions found
              </td>
            </tr>
          ) : (
            recent.map((item) => (
              <tr
                key={item.id}
                className="border-b last:border-none hover:bg-gray-50"
              >
                <td className="py-2 font-medium text-gray-700">
                  {item.memberName}
                </td>

                <td>{item.type}</td>

                <td>
                  KES {Number(item.amount).toLocaleString()}
                </td>

                <td>
                  {new Date(item.date).toLocaleDateString()}
                </td>

                <td className="text-center">
                  {item.status?.toLowerCase() === "completed" ? (
                    <FaCheckCircle
                      className="inline text-green-600 text-sm"
                      title="Completed"
                    />
                  ) : (
                    <FaClock
                      className="inline text-yellow-500 text-sm"
                      title="Pending"
                    />
                  )}
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