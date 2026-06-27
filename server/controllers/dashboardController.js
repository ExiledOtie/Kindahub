// controllers/dashboardController.js

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
    ] = await Promise.all([

      Dashboard.getAdminSummary(),

      Dashboard.getRecentActivities(),

      Dashboard.getAdminLoanChart(),

      Dashboard.getAdminSavingsChart(),

    ]);

    res.json({
      success:true,
      data:{
        ...summary,
        recentActivities,
        loanChart,
        savingsChart,
      },
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success:false,
      message:"Failed to load admin dashboard",
    });

  }
};

/**
 * ============================================
 * MEMBER DASHBOARD
 * ============================================
 */
const getMemberDashboard = async (req,res) => {

  try{

    const userId=req.user.id;

    const[
      summary,
      recentActivities,
      loanChart,
      savingsChart,
    ]=await Promise.all([

      Dashboard.getMemberSummary(userId),

      Dashboard.getMemberRecentActivities(userId),

      Dashboard.getMemberLoanChart(userId),

      Dashboard.getMemberSavingsChart(userId),

    ]);

    res.json({
      success:true,
      data:{
        ...summary,
        recentActivities,
        loanChart,
        savingsChart,
      },
    });

  }catch(error){

    console.error(error);

    res.status(500).json({
      success:false,
      message:"Failed to load member dashboard",
    });

  }

};

/**
 * ============================================
 * SUMMARY ONLY
 * (Used for realtime card refresh)
 * ============================================
 */
const getDashboardSummary = async (req, res) => {
  try {
    let summary;

    if (req.user.role === "admin" || req.user.is_super_admin) {
      summary = await Dashboard.getAdminSummary();
    } else {
      summary = await Dashboard.getMemberSummary(req.user.id);
    }

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Dashboard Summary Error:", error);

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
      await Dashboard.getRecentActivities();

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error("Recent Activities Error:", error);

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
const getLoanChart = async (req,res)=>{

  try{

    let chart;

    if(req.user.role==="admin" || req.user.is_super_admin){

      chart=await Dashboard.getAdminLoanChart();

    }else{

      chart=await Dashboard.getMemberLoanChart(req.user.id);

    }

    res.json({
      success:true,
      data:chart,
    });

  }catch(error){

    console.error(error);

    res.status(500).json({
      success:false,
      message:"Failed to load loan chart",
    });

  }

};

/**
 * ============================================
 * SAVINGS CHART
 * ============================================
 */
const getSavingsChart = async (req,res)=>{

  try{

    let chart;

    if(req.user.role==="admin" || req.user.is_super_admin){

      chart=await Dashboard.getAdminSavingsChart();

    }else{

      chart=await Dashboard.getMemberSavingsChart(req.user.id);

    }

    res.json({
      success:true,
      data:chart,
    });

  }catch(error){

    console.error(error);

    res.status(500).json({
      success:false,
      message:"Failed to load savings chart",
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