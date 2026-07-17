import { useState } from "react";
import { PieChart, Pie, Cell, Sector, ResponsiveContainer } from "recharts";

const COLORS = [
  "#10b981", // Paid
  "#f59e0b", // Balance
];

const renderActiveShape = (props) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;

  return (
    <g>
      <text
        x={cx}
        y={cy - 12}
        textAnchor="middle"
        className="fill-gray-700 text-xs font-semibold"
      >
        {payload.name}
      </text>

      <text
        x={cx}
        y={cy + 8}
        textAnchor="middle"
        className="fill-emerald-600 text-[10px] font-bold"
      >
        KES {Number(value).toLocaleString()}
      </text>

      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 4}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />

      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 15}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />

      <text
        x={cx}
        y={cy + 28}
        textAnchor="middle"
        className="fill-gray-500 text-[10px]"
      >
        {(percent * 100).toFixed(1)}%
      </text>
    </g>
  );
};

const UserLoanRepaymentProgress = ({
  totalPayable = 0,
  totalPaid = 0,
  balance = 0,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const hasLoan = Number(totalPayable) > 0;

  const data = hasLoan
    ? [
        {
          name: "Paid",
          value: Number(totalPaid),
        },
        {
          name: "Balance",
          value: Number(balance),
        },
      ]
    : [
        {
          name: "No Active Loan",
          value: 1,
        },
      ];

  return (
    <div className="bg-white rounded-xl border shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-[12px] font-semibold">Loan Repayment</h2>

          <p className="text-[11px] text-gray-500">
            Progress towards completing your loan
          </p>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-gray-500">Total Loan</p>

          <h3 className="text-[10px] font-bold text-emerald-600">
            KES {Number(totalPayable).toLocaleString()}
          </h3>
        </div>
      </div>

      {!hasLoan ? (
        <div className="h-[280px] flex items-center justify-center text-gray-500 text-[10px]">
          No active loan found
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={230}>
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={data}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={53}
              outerRadius={70}
              paddingAngle={3}
              onMouseEnter={(_, index) => setActiveIndex(index)}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      )}

      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-[10px] text-gray-500">Total Loan</p>

          <h4 className="text-[10px] font-bold text-blue-600">
            KES {Number(totalPayable).toLocaleString()}
          </h4>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-[10px] text-gray-500">Paid</p>

          <h4 className="text-[10px] font-bold text-emerald-600">
            KES {Number(totalPaid).toLocaleString()}
          </h4>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-[10px] text-gray-500">Balance</p>

          <h4 className="text-[10px] font-bold text-orange-600">
            KES {Number(balance).toLocaleString()}
          </h4>
        </div>
      </div>
    </div>
  );
};

export default UserLoanRepaymentProgress;
