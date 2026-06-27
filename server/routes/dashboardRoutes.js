const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getAdminDashboard,
  getMemberDashboard,
  getDashboardSummary,
  getRecentActivities,
  getLoanChart,
  getSavingsChart,
} = require("../controllers/dashboardController");

// ==========================================
// Authentication
// ==========================================
router.use(authMiddleware);

// ==========================================
// COMPLETE DASHBOARDS
// ==========================================

// Super Admin Dashboard
router.get("/admin", getAdminDashboard);

// Member Dashboard
router.get("/member", getMemberDashboard);

// ==========================================
// Individual Sections
// ==========================================

router.get("/summary", getDashboardSummary);

router.get("/activities", getRecentActivities);

router.get("/loan-chart", getLoanChart);

router.get("/savings-chart", getSavingsChart);

// ==========================================
// Realtime Refresh
// ==========================================

router.get("/refresh", (req, res) => {
  if (req.user.is_super_admin || req.user.role === "admin") {
    return getAdminDashboard(req, res);
  }

  return getMemberDashboard(req, res);
});

module.exports = router;
