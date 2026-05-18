// Components/Sidebar.jsx

import React, { useState } from "react";
import { NavLink } from "react-router-dom";

import {
  FaTachometerAlt,
  FaUsers,
  FaMoneyBillWave,
  FaBell,
  FaUserCircle,
  FaCog,
  FaCreditCard,
  FaFileAlt,
  FaUniversity,
} from "react-icons/fa";
import { IoClose, IoReorderThree } from "react-icons/io5";

const Sidebar = ({ role = "admin" }) => {
  const [isOpen, setIsOpen] = useState(false);

  const adminLinks = [
    {
      name: "Dashboard",
      icon: <FaTachometerAlt />,
      path: "/dashboard",
      active: true,
    },
    {
      name: "Members",
      icon: <FaUsers />,
      path: "/members/members",
    },
    {
      name: "Contributions",
      icon: <FaCreditCard />,
      path: "/dashboard",
    },
    {
      name: "Loans",
      icon: <FaUniversity />,
      path: "/dashboard",
    },
    {
      name: "Loan Payments",
      icon: <FaMoneyBillWave />,
      path: "/dashboard",
    },
    {
      name: "Reports",
      icon: <FaFileAlt />,
      path: "/dashboard",
    },
    {
      name: "Announcements",
      icon: <FaBell />,
      badge: 6,
      path: "/dashboard",
    },
    {
      name: "Notifications",
      icon: <FaBell />,
      badge: 8,
      path: "/dashboard",
    },
    {
      name: "Settings",
      icon: <FaCog />,
      path: "/dashboard",
    },
  ];

  const userLinks = [
    {
      name: "Dashboard",
      icon: <FaTachometerAlt />,
      path: "/user-dashboard",
      active: true,
    },
    {
      name: "Contributions",
      icon: <FaCreditCard />,
      path: "/user-dashboard",
    },
    {
      name: "Loans",
      icon: <FaUniversity />,
      path: "/user-dashboard",
    },
    {
      name: "Payments",
      icon: <FaMoneyBillWave />,
      path: "/user-dashboard",
    },
    {
      name: "Statements",
      icon: <FaFileAlt />,
      path: "/user-dashboard",
    },
    {
      name: "Notifications",
      icon: <FaBell />,
      badge: 8,
      path: "/user-dashboard",
    },
    {
      name: "Profile",
      icon: <FaUserCircle />,
      path: "/user-dashboard",
    },
    {
      name: "Settings",
      icon: <FaCog />,
      path: "/user-dashboard",
    },
  ];

  const links = role === "admin" ? adminLinks : userLinks;

  return (
    <>
      {/* Mobile open button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-md bg-slate-900 text-white shadow-lg"
          type="button"
          aria-label="Open sidebar"
        >
          <IoReorderThree size={22} />
        </button>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static top-0 left-0 z-50
          w-[240px] min-h-screen
          bg-gradient-to-b from-[#032c38] to-[#021d27]
          text-white flex flex-col justify-between
          px-3 py-4 border-r border-white/10
          transition-transform duration-300

          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div>
          {/* Logo + Close Button */}
          <div className="flex items-center justify-between mb-7">
            <h1 className="text-lg font-bold tracking-wide">ChamaPro</h1>

            {/* Mobile Close */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-white text-sm"
              type="button"
              aria-label="Close sidebar"
            >
              <IoClose size={20} />
            </button>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2">
            {links.map((item, index) => (
              <div
                key={index}
                className={`
                  flex items-center justify-between
                  px-3 py-2 rounded-lg cursor-pointer
                  transition-all duration-300 text-[11px]

                  ${item.active ? "bg-emerald-700" : "hover:bg-white/10"}
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[11px]">{item.icon}</span>

                  <span className="font-medium">{item.name}</span>
                </div>

                {item.badge && (
                  <span className="w-[18px] h-[18px] rounded-full bg-orange-500 flex items-center justify-center text-[9px] font-semibold">
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Profile */}
        <div className="border-t border-white/10 pt-4 flex items-center gap-3">
          <img
            src="https://i.pravatar.cc/100"
            alt="profile"
            className="w-10 h-10 rounded-full object-cover"
          />

          <div>
            <h3 className="text-[11px] font-semibold leading-none">
              {role === "admin" ? "Super Admin" : "John Kamau"}
            </h3>

            <p className="text-[10px] text-gray-300 mt-1">
              {role === "admin" ? "Online" : "Member"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
