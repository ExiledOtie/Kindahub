// Application/Components/LoanStatusChart.jsx

import { useState } from "react";
import {
  PieChart,
  Pie,
  Sector,
  Cell,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#4F46E5",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#8B5CF6",
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
    value,
  } = props;

  return (
    <g>
      <text
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        fill="#374151"
        fontSize={12}
        fontWeight="600"
      >
        {payload.name}
      </text>

      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        fill={fill}
        fontSize={18}
        fontWeight="700"
      >
        {value}
      </text>

      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />

      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 4}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  );
};

const LoanStatusChart = ({ data = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">

      <h2 className="text-[11px] font-semibold text-gray-700 mb-4">
        Loan Status Distribution
      </h2>

      <div className="h-[230px]">

        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-400">
            No loan statistics available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>

              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                onMouseEnter={(_, index) =>
                  setActiveIndex(index)
                }
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

      {data.length > 0 && (
        <div className="mt-4 space-y-2">

          {data.map((item, index) => (

            <div
              key={index}
              className="flex items-center justify-between text-[11px]"
            >
              <div className="flex items-center gap-2">

                <span
                  className="w-3 h-3 rounded-full"
                  style={{
                    background:
                      item.color ||
                      COLORS[index % COLORS.length],
                  }}
                />

                <span className="text-gray-600">
                  {item.name}
                </span>

              </div>

              <span className="font-semibold text-gray-800">
                {item.value}
              </span>

            </div>

          ))}

        </div>
      )}

    </div>
  );
};

export default LoanStatusChart;