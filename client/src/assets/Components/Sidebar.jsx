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
  FaBars,
  FaTimes,
  FaComments,
  FaEnvelope,
  FaChevronDown,
  FaChevronRight,
  FaCalendarAlt,
} from "react-icons/fa";

const Sidebar = ({ role = "admin" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [communicationOpen, setCommunicationOpen] = useState(true);

  const adminLinks = [
    { name: "Dashboard", icon: <FaTachometerAlt />, path: "/dashboard" },
    { name: "Members", icon: <FaUsers />, path: "/dashboard/members" },
    {
      name: "Contributions",
      icon: <FaCreditCard />,
      path: "/dashboard/contributions",
    },
    { name: "Loans", icon: <FaUniversity />, path: "/dashboard/loans" },
    {
      name: "Loan Repayments",
      icon: <FaMoneyBillWave />,
      path: "/dashboard/loan-repayments",
    },

    // Communication
    {
      name: "Communication",
      icon: <FaComments />,
      children: [
        {
          name: "Group Chats",
          icon: <FaComments />,
          path: "/dashboard/communication/groups",
          badge: 3,
        },
        {
          name: "Private Messages",
          icon: <FaEnvelope />,
          path: "/dashboard/communication/private",
          badge: 5,
        },
      ],
    },

    { name: "Reports", icon: <FaFileAlt />, path: "/dashboard/reports" },
    {
      name: "Announcements",
      icon: <FaCalendarAlt />,
      path: "/dashboard/announcements",
    },
    {
      name: "Notifications",
      icon: <FaBell />,
      path: "/dashboard/notifications",
      badge: 8,
    },
    { name: "Settings", icon: <FaCog />, path: "/dashboard/settings" },
  ];

  const userLinks = [
    { name: "Dashboard", icon: <FaTachometerAlt />, path: "/user-dashboard" },
    {
      name: "Contributions",
      icon: <FaCreditCard />,
      path: "/dashboard/user-contributions",
    },
    { name: "Loans", icon: <FaUniversity />, path: "/dashboard/user-loans" },
    {
      name: "Payments",
      icon: <FaMoneyBillWave />,
      path: "/dashboard/user-payments",
    },
    {
      name: "Statements",
      icon: <FaFileAlt />,
      path: "/dashboard/user-statements",
    },

    // Communication
    {
      name: "Communication",
      icon: <FaComments />,
      children: [
        {
          name: "Group Chats",
          icon: <FaComments />,
          path: "/dashboard/communication/groups",
          badge: 2,
        },
        {
          name: "Private Messages",
          icon: <FaEnvelope />,
          path: "/dashboard/communication/private",
          badge: 4,
        },
      ],
    },

    {
      name: "Notifications",
      icon: <FaBell />,
      path: "/dashboard/user-notifications",
      badge: 8,
    },
    { name: "Profile", icon: <FaUserCircle />, path: "/dashboard/profile" },
    { name: "Settings", icon: <FaCog />, path: "/dashboard/settings" },
  ];

  const links = role === "admin" ? adminLinks : userLinks;

  return (
    <>
      {/* Mobile Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-[#032c38] text-white p-2 rounded-md"
      >
        <FaBars size={14} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static top-0 left-0 z-50
          h-screen w-[220px]
          bg-gradient-to-b from-[#032c38] to-[#021d27]
          text-white
          flex flex-col justify-between
          transition-transform duration-300
          border-r border-white/10
          p-3

          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg font-bold">ChamaPro</h1>

            <button onClick={() => setIsOpen(false)} className="lg:hidden">
              <FaTimes />
            </button>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-1">
            {links.map((item, index) => {
              if (item.children) {
                return (
                  <div key={index}>
                    <button
                      onClick={() => setCommunicationOpen(!communicationOpen)}
                      className="
            w-full
            flex items-center justify-between
            px-3 py-2 rounded-lg
            text-[11px]
            hover:bg-white/10
            transition-all duration-200
          "
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[11px]">{item.icon}</span>

                        <span>{item.name}</span>
                      </div>

                      {communicationOpen ? (
                        <FaChevronDown size={10} />
                      ) : (
                        <FaChevronRight size={10} />
                      )}
                    </button>

                    {communicationOpen && (
                      <div className="ml-5 mt-1 flex flex-col gap-1">
                        {item.children.map((child, childIndex) => (
                          <NavLink
                            key={childIndex}
                            to={child.path}
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) =>
                              `
                  flex items-center justify-between
                  px-3 py-2 rounded-lg
                  text-[11px]
                  transition-all duration-200

                  ${isActive ? "bg-emerald-700" : "hover:bg-white/10"}
                `
                            }
                          >
                            <div className="flex items-center gap-3">
                              <span>{child.icon}</span>

                              <span>{child.name}</span>
                            </div>

                            {child.badge && (
                              <span className="w-[18px] h-[18px] rounded-full bg-orange-500 flex items-center justify-center text-[9px]">
                                {child.badge}
                              </span>
                            )}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <NavLink
                  key={index}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `
        flex items-center justify-between
        px-3 py-2 rounded-lg
        text-[11px]
        transition-all duration-200

        ${isActive ? "bg-emerald-700" : "hover:bg-white/10"}
      `
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[11px]">{item.icon}</span>

                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span className="w-[18px] h-[18px] rounded-full bg-orange-500 flex items-center justify-center text-[9px]">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Bottom Profile */}
        <div className="border-t border-white/10 pt-4 flex items-center gap-3">
          <img
            src="https://i.pravatar.cc/100"
            alt="profile"
            className="w-9 h-9 rounded-full"
          />

          <div>
            <h3 className="text-[11px] font-semibold">
              {role === "admin" ? "Super Admin" : "John Kamau"}
            </h3>

            <p className="text-[10px] text-gray-300">
              {role === "admin" ? "Online" : "Member"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
