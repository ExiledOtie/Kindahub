import { useParams } from "react-router-dom";
import { useState } from "react";

import SummaryTab from "./MemberTabs/SummaryTab";
import ProfileTab from "./MemberTabs/ProfileTab";
import ContributionsTab from "./MemberTabs/ContributionsTab";
import SavingsTab from "./MemberTabs/SavingsTab";
import LoanTab from "./MemberTabs/LoanTab";
import LogsTab from "./MemberTabs/LogsTab";

const MemberProfile = () => {
  const { id } = useParams();

  const [activeTab, setActiveTab] =
    useState("summary");

  const member = {
    id,
    name: "John Doe",
    memberNo: "MBR001",
  };

  const tabs = [
    {
      id: "summary",
      label: "Summary",
    },

    {
      id: "profile",
      label: "Profile",
    },

    {
      id: "contributions",
      label: "Contributions",
    },

    {
      id: "savings",
      label: "Savings",
    },

    {
      id: "loans",
      label: "Loans",
    },

    {
      id: "logs",
      label: "Logs",
    },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "summary":
        return <SummaryTab />;

      case "profile":
        return <ProfileTab />;

      case "contributions":
        return <ContributionsTab />;

      case "savings":
        return <SavingsTab />;

      case "loans":
        return <LoanTab />;

      case "logs":
        return <LogsTab />;

      default:
        return <SummaryTab />;
    }
  };

  return (
    <div className="p-4">
      <div className="bg-white border rounded-xl shadow-sm">
        {/* Header */}

        <div className="px-4 py-4 border-b">
          <h1 className="text-sm font-semibold text-gray-800">
            {member.name}
          </h1>

          <p className="text-xs text-gray-500 mt-1">
            {member.memberNo}
          </p>
        </div>

        {/* Tabs */}

        <div className="flex gap-5 px-4 border-b overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(tab.id)
              }
              className={`py-3 text-xs border-b-2 whitespace-nowrap transition ${
                activeTab === tab.id
                  ? "border-green-600 text-green-600 font-medium"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}

        <div className="p-4">
          {renderTab()}
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;