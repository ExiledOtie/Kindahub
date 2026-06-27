//Application/Components/DashboardLoader.jsx

import React from "react";

const DashboardLoader = () => {
  return (
    <div className="flex justify-center items-center h-[70vh]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>

        <p className="mt-4 text-sm text-gray-500">
          Loading Dashboard...
        </p>
      </div>
    </div>
  );
};

export default DashboardLoader;