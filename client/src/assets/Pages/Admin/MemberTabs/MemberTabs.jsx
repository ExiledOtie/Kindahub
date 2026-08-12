import { useState } from "react";

const MemberTabs = ({ member, onClose }) => {
  const [activeTab, setActiveTab] = useState("Summary");

  const tabs = [
    "Summary",
    "Profile",
    "Contributions",
    "Savings",
    "Loans",
    "Logs",
  ];

  if (!member) return null;

  return (
    <div className="bg-white border rounded-xl shadow-sm mt-4">
      {/* Header */}

      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">
            {member.name}
          </h2>

          <p className="text-xs text-gray-500">
            {member.memberNo}
          </p>
        </div>

        <button
          onClick={onClose}
          className="text-xs text-red-500 hover:text-red-600"
        >
          Close
        </button>
      </div>

      {/* Tabs */}

      <div className="flex items-center gap-5 px-4 border-b overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 text-xs whitespace-nowrap border-b-2 transition ${
              activeTab === tab
                ? "border-green-600 text-green-600 font-medium"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}

      <div className="p-4 text-xs text-gray-600">
        {activeTab === "Summary" && (
          <div className="space-y-2">
            <p>
              Member Name:
              <span className="ml-2 text-gray-800">
                {member.name}
              </span>
            </p>

            <p>
              Member Number:
              <span className="ml-2 text-gray-800">
                {member.memberNo}
              </span>
            </p>

            <p>
              Group:
              <span className="ml-2 text-gray-800">
                {member.group}
              </span>
            </p>
          </div>
        )}

        {activeTab === "Profile" && (
          <div className="space-y-2">
            <p>
              Full Name:
              <span className="ml-2 text-gray-800">
                {member.name}
              </span>
            </p>

            <p>
              Phone Number:
              <span className="ml-2 text-gray-800">
                {member.phone}
              </span>
            </p>

            <p>
              Joined Date:
              <span className="ml-2 text-gray-800">
                {member.joined}
              </span>
            </p>

            <p>
              Status:
              <span className="ml-2 text-gray-800">
                {member.status}
              </span>
            </p>
          </div>
        )}

        {activeTab === "Contributions" && (
          <div>
            No contributions available.
          </div>
        )}

        {activeTab === "Savings" && (
          <div>
            No savings records available.
          </div>
        )}

        {activeTab === "Loans" && (
          <div>
            No loans available.
          </div>
        )}

        {activeTab === "Logs" && (
          <div>
            No activity logs available.
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberTabs;