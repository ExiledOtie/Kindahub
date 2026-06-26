const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const {
  getAdminDashboard,
  getMemberDashboard,
  getDashboardSummary,
  getRecentActivities,
  getLoanChart,
  getSavingsChart,
} = require("../controllers/dashboardController");

// ========================================
// Authentication
// ========================================
router.use(authenticateToken);

// ========================================
// COMPLETE DASHBOARDS
// ========================================

// Super Admin Dashboard
router.get("/admin", getAdminDashboard);

// Member Dashboard
router.get("/member", getMemberDashboard);

// ========================================
// Dashboard Sections
// ========================================

// Summary Cards
router.get("/summary", getDashboardSummary);

// Recent Activities
router.get("/activities", getRecentActivities);

// Loan Statistics
router.get("/loan-chart", getLoanChart);

// Savings Statistics
router.get("/savings-chart", getSavingsChart);

// ========================================
// Real-time Dashboard Refresh
// ========================================
// Frontend polls this endpoint every 10-15 seconds
// to refresh cards, charts and activities.
router.get("/refresh", (req, res) => {
  if (req.user.is_super_admin) {
    return getAdminDashboard(req, res);
  }

  return getMemberDashboard(req, res);
});

module.exports = router;
