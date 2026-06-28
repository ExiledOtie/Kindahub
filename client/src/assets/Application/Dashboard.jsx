import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import { getAdminDashboard } from "../Pages/Services/dashboardService";

import DashboardLoader from "./Components/DashboardLoader";
import StatsCards from "./Components/StatsCards";
import SavingsChart from "./Components/SavingsChart";
import LoanStatusChart from "./Components/LoanStatusChart";
import RecentLoanRequests from "./Components/RecentLoanRequests";
import RecentContributions from "./Components/RecentContributions";
import OverdueLoans from "./Components/OverdueLoans";

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);

      const data = await getAdminDashboard();

      setDashboard(data);
    } catch (error) {
      console.error(error);

      Swal.fire(
        "Error",
        "Unable to load dashboard.",
        "error"
      );
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

  if (loading) {
    return <DashboardLoader />;
  }

  return (
    <div className="p-4 space-y-4">

      {/* Top Cards */}
      <StatsCards dashboard={dashboard} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        <div className="lg:col-span-2">
          <SavingsChart
            data={dashboard.groupContributionChart}
          />
        </div>

        <LoanStatusChart
          data={dashboard.loanStatusData}
        />

        <RecentLoanRequests
          loans={dashboard.recentLoanRequests}
        />

      </div>

      {/* Bottom Tables */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <RecentContributions
          contributions={dashboard.recentContributions}
        />

        <OverdueLoans
          loans={dashboard.overdueLoans}
        />

      </div>

    </div>
  );
};

export default Dashboard;