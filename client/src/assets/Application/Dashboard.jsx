import React from "react";
import Sidebar from "../Components/Sidebar";

const Dashboard = () => {
  return (
    <div className="flex">
      <Sidebar role="admin" />

      <div className="flex-1 bg-gray-100 p-5 min-h-screen">
        <h1 className="text-2xl font-bold">
          Dashboard Content
        </h1>
      </div>
    </div>
  );
};

export default Dashboard;