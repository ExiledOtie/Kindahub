//Application/Components/LoanStatusChart.jsx

import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#4f46e5",
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#06b6d4",
  "#8b5cf6",
];

const LoanStatusChart = ({ data = [] }) => {
  return (
    <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">

      <div className="flex items-center justify-between mb-4">

        <h2 className="text-[11px] font-semibold text-gray-700">
          Loan Status Distribution
        </h2>

      </div>

      <div className="h-[180px]">

        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm">
            No loan statistics available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      entry.color ||
                      COLORS[index % COLORS.length]
                    }
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}

      </div>

      <div className="space-y-2 mt-2">

        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center text-[10px]"
          >
            <div className="flex items-center gap-2">

              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor:
                    item.color ||
                    COLORS[index % COLORS.length],
                }}
              />

              <span>{item.name}</span>

            </div>

            <span>{item.value}</span>

          </div>
        ))}

      </div>

    </div>
  );
};

export default LoanStatusChart;