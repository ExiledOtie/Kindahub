import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../Utils/axios";
import { ClipLoader } from "react-spinners";

import SummaryTab from "./MemberTabs/SummaryTab";
import ProfileTab from "./MemberTabs/ProfileTab";
import ContributionsTab from "./MemberTabs/ContributionsTab";
import SavingsTab from "./MemberTabs/SavingsTab";
import LoanTab from "./MemberTabs/LoanTab";
import LogsTab from "./MemberTabs/LogsTab";

const MemberProfile = () => {
  const { id } = useParams();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] =
    useState("summary");

  useEffect(() => {
    fetchMember();
  }, [id]);

  const fetchMember = async () => {
    try {
      const res =
        await axios.get(`/users/${id}`);

      setMember(res.data);

    } catch (error) {
      console.log(error);

    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <ClipLoader
          size={35}
          color="#16a34a"
        />
      </div>
    );
  }

  const tabs = [
    { id: "summary", label: "Summary" },
    { id: "profile", label: "Profile" },
    { id: "contributions", label: "Contributions" },
    { id: "savings", label: "Savings" },
    { id: "loans", label: "Loans" },
    { id: "logs", label: "Logs" },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "summary":
        return (
          <SummaryTab
            member={member}
          />
        );

      case "profile":
        return (
          <ProfileTab
            member={member}
          />
        );

      case "contributions":
        return (
          <ContributionsTab
            memberId={id}
          />
        );

      case "savings":
        return (
          <SavingsTab
            memberId={id}
          />
        );

      case "loans":
        return (
          <LoanTab
            memberId={id}
          />
        );

      case "logs":
        return (
          <LogsTab
            memberId={id}
          />
        );

      default:
        return (
          <SummaryTab
            member={member}
          />
        );
    }
  };

  return (
    <div className="p-4">
      <div className="bg-white border rounded-xl shadow-sm">

        <div className="px-4 py-4 border-b">
          <h1 className="text-sm font-semibold text-gray-800">
            {member?.fullname}
          </h1>

          <p className="text-xs text-gray-500 mt-1">
            {member?.username}
          </p>
        </div>

        <div className="flex gap-5 px-4 border-b overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(tab.id)
              }
              className={`py-3 text-xs border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {renderTab()}
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;