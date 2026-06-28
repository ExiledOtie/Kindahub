import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const SavingsChart = ({ data = [] }) => {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm h-[350px]">

      <div className="flex justify-between items-center mb-4">

        <h2 className="text-sm font-semibold text-gray-700">
          Group Contributions (Jan - Dec)
        </h2>

        <select className="border rounded px-2 py-1 text-xs">
          <option>2026</option>
          <option>2025</option>
          <option>2024</option>
        </select>

      </div>

      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="month" />

          <YAxis
            yAxisId="left"
            orientation="left"
          />

          <YAxis
            yAxisId="right"
            orientation="right"
          />

          <Tooltip
            formatter={(value) =>
              `KES ${Number(value).toLocaleString()}`
            }
          />

          <Legend />

          <Bar
            yAxisId="left"
            dataKey="kindaFamily"
            name="Kinda Family"
            fill="#4f46e5"
            radius={[4, 4, 0, 0]}
          />

          <Bar
            yAxisId="right"
            dataKey="amigos"
            name="13 Amigos"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

    </div>
  );
};

export default SavingsChart;