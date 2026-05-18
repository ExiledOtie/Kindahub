import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../Components/Sidebar";

const DashboardLayout = ({ role }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex bg-[#f5f7fb] min-h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        role={role}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:ml-0">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;