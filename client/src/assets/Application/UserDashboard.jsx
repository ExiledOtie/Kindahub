// Pages/UserDashboard.jsx

import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import { getMemberDashboard } from "../Pages/Services/dashboardService";

import DashboardLoader from "../Application/Components/DashboardLoader";

import UserStatsCards from "./UserDashboardComonent/UserStatsCards";
import UserSavingsChart from "./UserDashboardComonent/UserSavingsChart";
import UserLoanRepaymentProgress from "./UserDashboardComonent/UserLoanRepaymentProgress";
import Announcement from "./UserDashboardComonent/Announcement";
import UserRecentContributions from "./UserDashboardComonent/UserRecentContributions";

const UserDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);

      const data = await getMemberDashboard();

      setDashboard(data);
    } catch (error) {
      console.error(error);

      Swal.fire("Error", "Unable to load dashboard.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(true);

    const interval = setInterval(() => {
      fetchDashboard(false);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading || !dashboard) {
    return <DashboardLoader />;
  }

  return (
  <div className="p-5 space-y-5">

    {/* Stats */}
    <UserStatsCards dashboard={dashboard} />

    {/* Charts */}
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

      <div className="xl:col-span-8">
        <UserSavingsChart
          data={dashboard.savingsChart}
        />
      </div>

      <div className="xl:col-span-4">
        <UserLoanRepaymentProgress
          totalPayable={dashboard.loanProgress?.totalPayable}
          totalPaid={dashboard.loanProgress?.totalPaid}
          balance={dashboard.loanProgress?.balance}
        />
      </div>

    </div>

    {/* Bottom Section */}
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

      <div className="xl:col-span-8">
        <UserRecentContributions
          contributions={dashboard.recentContributions}
        />
      </div>

      <div className="xl:col-span-4">
        <Announcement
          announcements={dashboard.upcomingAnnouncement}
        />
      </div>

    </div>

  </div>
);
};

export default UserDashboard;
