//Components/Sidebar.jsx
import React from "react";
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

const Sidebar = ({ role = "admin" }) => {
  const adminLinks = [
    {
      name: "Dashboard",
      icon: <FaTachometerAlt />,
      active: true,
    },
    {
      name: "Members",
      icon: <FaUsers />,
    },
    {
      name: "Contributions",
      icon: <FaCreditCard />,
    },
    {
      name: "Loans",
      icon: <FaUniversity />,
    },
    {
      name: "Loan Payments",
      icon: <FaMoneyBillWave />,
    },
    {
      name: "Reports",
      icon: <FaFileAlt />,
    },
    {
      name: "Announcements",
      icon: <FaBell />,
      badge: 6,
    },
    {
      name: "Notifications",
      icon: <FaBell />,
      badge: 8,
    },
    {
      name: "Settings",
      icon: <FaCog />,
    },
  ];

  const userLinks = [
    {
      name: "Dashboard",
      icon: <FaTachometerAlt />,
      active: true,
    },
    {
      name: "Contributions",
      icon: <FaCreditCard />,
    },
    {
      name: "Loans",
      icon: <FaUniversity />,
    },
    {
      name: "Payments",
      icon: <FaMoneyBillWave />,
    },
    {
      name: "Statements",
      icon: <FaFileAlt />,
    },
    {
      name: "Notifications",
      icon: <FaBell />,
      badge: 8,
    },
    {
      name: "Profile",
      icon: <FaUserCircle />,
    },
    {
      name: "Settings",
      icon: <FaCog />,
    },
  ];

  const links = role === "admin" ? adminLinks : userLinks;

  return (
    <div className="w-[240px] min-h-screen bg-gradient-to-b from-[#032c38] to-[#021d27] text-white flex flex-col justify-between px-3 py-4 border-r border-white/10">
      <div>
        <h1 className="text-lg font-bold mb-7 tracking-wide">
          ChamaPro
        </h1>

        <div className="flex flex-col gap-2">
          {links.map((item, index) => (
            <div
              key={index}
              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-300 text-[11px]
                ${
                  item.active
                    ? "bg-emerald-700"
                    : "hover:bg-white/10"
                }
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
  );
};

export default Sidebar;
