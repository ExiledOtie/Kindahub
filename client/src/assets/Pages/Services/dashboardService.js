import axios from "../../Utils/axios";

// ============================================
// ADMIN DASHBOARD
// ============================================

export const getAdminDashboard = async () => {
  const response = await axios.get("/dashboard/admin");
  return response.data.data;
};

// ============================================
// MEMBER DASHBOARD
// ============================================

export const getMemberDashboard = async () => {
  const response = await axios.get("/dashboard/member");
  return response.data.data;
};

// ============================================
// SUMMARY
// ============================================

export const getDashboardSummary = async () => {
  const response = await axios.get("/dashboard/summary");
  return response.data.data;
};

// ============================================
// RECENT ACTIVITIES
// ============================================

export const getRecentActivities = async () => {
  const response = await axios.get("/dashboard/activities");
  return response.data.data;
};

// ============================================
// LOAN CHART
// ============================================

export const getLoanChart = async () => {
  const response = await axios.get("/dashboard/loan-chart");
  return response.data.data;
};

// ============================================
// SAVINGS CHART
// ============================================

export const getSavingsChart = async () => {
  const response = await axios.get("/dashboard/savings-chart");
  return response.data.data;
};
