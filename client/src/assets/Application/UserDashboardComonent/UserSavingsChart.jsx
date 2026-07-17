import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

const COLORS = [
  "#10B981",
  "#059669",
  "#34D399",
  "#6EE7B7",
  "#047857",
  "#22C55E",
];

const UserSavingsChart = ({ data = [] }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 h-[300px]">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-800">
          Savings Overview
        </h2>

        <p className="text-[10px] text-gray-500">
          Monthly savings contribution
        </p>
      </div>

      {data.length === 0 ? (
        <div className="h-[270px] flex items-center justify-center text-gray-400 text-sm">
          No savings data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 5,
              left: -20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis dataKey="month" tick={{ fontSize: 9 }} />

            <YAxis
              tick={{ fontSize: 9 }}
              tickFormatter={(value) => `${value / 1000}K`}
            />

            <Tooltip
              formatter={(value) => [
                `KES ${Number(value).toLocaleString()}`,
                "Savings",
              ]}
            />

            <Bar
              dataKey="amount"
              barSize={18}
              radius={[5, 5, 0, 0]}
              animationDuration={1200}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default UserSavingsChart;
