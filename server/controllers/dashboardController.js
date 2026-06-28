const Dashboard = require("../models/dashboardModel");

/**
 * ============================================
 * SUPER ADMIN DASHBOARD
 * ============================================
 */
const getAdminDashboard = async (req, res) => {
  try {
const [
  summary,
  recentActivities,
  loanChart,
  savingsChart,
  recentLoanRequests,
  recentContributions,
  overdueLoans,
  loanStatusData,
  groupContributionChart,
] = await Promise.all([
  Dashboard.getAdminSummary(),
  Dashboard.getRecentActivities(),
  Dashboard.getLoanChart(),
  Dashboard.getSavingsChart(),
  Dashboard.getRecentLoanRequests(),
  Dashboard.getRecentContributions(),
  Dashboard.getOverdueLoans(),
  Dashboard.getLoanStatusDistribution(),
  Dashboard.getGroupContributionChart(),
]);

    res.status(200).json({
  success: true,
  data: {
    ...summary,
    recentActivities,
    loanChart,
    savingsChart,
    recentLoanRequests,
    recentContributions,
    overdueLoans,
    loanStatusData,
    groupContributionChart,
  },
});
  } catch (error) {
    console.error("Admin Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard",
    });
  }
};

/**
 * ============================================
 * MEMBER DASHBOARD
 * ============================================
 */
const getMemberDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      summary,
      recentActivities,
      loanChart,
      savingsChart,
      recentLoanRequests,
      recentContributions,
      loanStatusData,
    ] = await Promise.all([
      Dashboard.getMemberSummary(userId),
      Dashboard.getMemberRecentActivities(userId),
      Dashboard.getMemberLoanChart(userId),
      Dashboard.getMemberSavingsChart(userId),
      Dashboard.getMemberRecentLoanRequests(userId),
      Dashboard.getMemberRecentContributions(userId),
      Dashboard.getMemberLoanStatusDistribution(userId),
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...summary,
        recentActivities,
        loanChart,
        savingsChart,
        recentLoanRequests,
        recentContributions,
        loanStatusData,
      },
    });
  } catch (error) {
    console.error("Member Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load member dashboard",
    });
  }
};

/**
 * ============================================
 * SUMMARY
 * ============================================
 */
const getDashboardSummary = async (req, res) => {
  try {
    const summary =
      req.user.is_super_admin || req.user.role === "admin"
        ? await Dashboard.getAdminSummary()
        : await Dashboard.getMemberSummary(req.user.id);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard summary",
    });
  }
};

/**
 * ============================================
 * RECENT ACTIVITIES
 * ============================================
 */
const getRecentActivities = async (req, res) => {
  try {
    const activities =
      req.user.is_super_admin || req.user.role === "admin"
        ? await Dashboard.getRecentActivities()
        : await Dashboard.getMemberRecentActivities(req.user.id);

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to load activities",
    });
  }
};

/**
 * ============================================
 * LOAN CHART
 * ============================================
 */
const getLoanChart = async (req, res) => {
  try {
    const chart =
      req.user.is_super_admin || req.user.role === "admin"
        ? await Dashboard.getAdminLoanChart()
        : await Dashboard.getMemberLoanChart(req.user.id);

    res.status(200).json({
      success: true,
      data: chart,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to load loan chart",
    });
  }
};

/**
 * ============================================
 * SAVINGS CHART
 * ============================================
 */
const getSavingsChart = async (req, res) => {
  try {
    const chart =
      req.user.is_super_admin || req.user.role === "admin"
        ? await Dashboard.getAdminSavingsChart()
        : await Dashboard.getMemberSavingsChart(req.user.id);

    res.status(200).json({
      success: true,
      data: chart,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to load savings chart",
    });
  }
};

module.exports = {
  getAdminDashboard,
  getMemberDashboard,
  getDashboardSummary,
  getRecentActivities,
  getLoanChart,
  getSavingsChart,
};