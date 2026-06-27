//Application/Components/SavingsChart.jsx

import React from "react";

const SavingsChart = ({ data = [] }) => {

  const maxAmount =
    data.length > 0
      ? Math.max(...data.map((item) => Number(item.amount)))
      : 0;

  return (
    <div className="lg:col-span-2 bg-white rounded-lg p-3 border border-gray-100 shadow-sm">

      <div className="flex items-center justify-between mb-4">

        <h2 className="text-[11px] font-semibold text-gray-700">
          Contributions Overview
        </h2>

        <select className="text-[10px] border rounded px-2 py-1 outline-none">

          <option>Monthly</option>

        </select>

      </div>

      <div className="h-[180px] flex items-end gap-2">

        {data.length === 0 ? (

          <div className="flex items-center justify-center w-full text-gray-400 text-sm">

            No contribution data available

          </div>

        ) : (

          data.map((item, index) => {

            const height =
              maxAmount === 0
                ? 10
                : (Number(item.amount) / maxAmount) * 160;

            return (

              <div
                key={index}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 rounded-t transition-all"
                style={{
                  height: `${height}px`,
                }}
                title={`KES ${Number(item.amount).toLocaleString()}`}
              />

            );

          })

        )}

      </div>

      <div className="flex justify-between mt-3 text-[10px] text-gray-500">

        {data.map((item, index) => (

          <span key={index}>
            {item.month}
          </span>

        ))}

      </div>

    </div>
  );
};

export default SavingsChart;