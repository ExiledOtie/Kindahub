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
    <div className="p-4 space-y-4">
      {/* Top Cards */}
      <UserStatsCards dashboard={dashboard} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
          <UserSavingsChart data={dashboard.savingsChart} />
        </div>

        <UserLoanRepaymentProgress
          totalPayable={dashboard.loanProgress?.totalPayable}
          totalPaid={dashboard.loanProgress?.totalPaid}
          balance={dashboard.loanProgress?.balance}
        />

        <Announcement announcements={dashboard.announcements} />
      </div>

      {/* Recent Contributions */}
      <UserRecentContributions contributions={dashboard.recentContributions} />
    </div>
  );
};

export default UserDashboard;
