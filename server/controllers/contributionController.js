const {
  createContributionModel,
  getUserContributionsModel,
  getAllContributionsModel,
  getContributionStatsModel,
  deleteContributionModel,
  approveContributionModel,
  rejectContributionModel,
} = require("../models/contributionModel");
const Notification = require("../models/notificationModel");

const pool = require("../config/db");

/*
|--------------------------------------------------------------------------
| CREATE (SUPER ADMIN / ADMIN)
|--------------------------------------------------------------------------
*/

const createContribution = async (req, res) => {
  try {
    const { user_id, amount, payment_method, mpesa_code } = req.body;

    const group = await pool.query(
      `
      SELECT group_id
      FROM user_groups
      WHERE user_id = $1
      LIMIT 1
      `,
      [user_id]
    );

    const groupId = group.rows[0]?.group_id;

    if (!groupId) {
      return res.status(400).json({
        message: "Member is not assigned to any group",
      });
    }

    // Super Admin/Admin contributions are automatically approved
    const contribution = await createContributionModel(
      user_id,
      groupId,
      amount,
      payment_method,
      mpesa_code || null,
      req.user.id,
      "completed"
    );

    await Notification.createNotification({
      user_id,
      title: "Contribution Received",
      message: `A contribution of KES ${Number(amount).toLocaleString()} has been recorded by the administrator.`,
      type: "contribution",
      reference_id: contribution.id,
    });

    res.status(201).json({
      message: "Contribution recorded successfully",
      contribution,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};


/*
|--------------------------------------------------------------------------
| MEMBER CREATE CONTRIBUTION
|--------------------------------------------------------------------------
*/

const createMyContribution = async (req, res) => {
  try {
    const { amount, payment_method, mpesa_code } = req.body;

    const userId = req.user.id;

    const member = await pool.query(
      `
      SELECT id, fullname
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    const group = await pool.query(
      `
      SELECT group_id
      FROM user_groups
      WHERE user_id = $1
      LIMIT 1
      `,
      [userId]
    );

    const groupId = group.rows[0]?.group_id;

    if (!groupId) {
      return res.status(400).json({
        message: "You are not assigned to any group",
      });
    }

    // Member submissions require approval
    const contribution = await createContributionModel(
      userId,
      groupId,
      amount,
      payment_method,
      mpesa_code || null,
      userId,
      "pending"
    );

    /*
    |--------------------------------------------------------------------------
    | NOTIFY SUPER ADMINS
    |--------------------------------------------------------------------------
    */

    const admins = await pool.query(`
      SELECT id
      FROM users
      WHERE is_super_admin = true
    `);

    for (const admin of admins.rows) {
      await Notification.createNotification({
        user_id: admin.id,
        title: "New Contribution Submitted",
        message: `${member.rows[0].fullname} submitted KES ${Number(
          amount
        ).toLocaleString()} via ${payment_method}. Mpesa Code: ${
          mpesa_code || "N/A"
        }`,
        type: "contribution",
        reference_id: contribution.id,
      });
    }

    res.status(201).json({
      message: "Contribution submitted successfully. Awaiting approval.",
      contribution,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to submit contribution",
    });
  }
};


const getMyContributions = async (req, res) => {
  try {
    const contributions = await getUserContributionsModel(req.user.id);

    res.status(200).json(contributions);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| USER CONTRIBUTIONS
|--------------------------------------------------------------------------
*/

const getUserContributions = async (req, res) => {
  try {
    const contributions = await getUserContributionsModel(req.params.userId);

    res.status(200).json(contributions);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| ALL CONTRIBUTIONS
|--------------------------------------------------------------------------
*/

const getAllContributions = async (req, res) => {
  try {
    const contributions = await getAllContributionsModel();

    res.status(200).json(contributions);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DASHBOARD STATS
|--------------------------------------------------------------------------
*/

const getContributionStats = async (req, res) => {
  try {
    const stats = await getContributionStatsModel();

    res.status(200).json(stats);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

const deleteContribution = async (req, res) => {
  try {
    await deleteContributionModel(req.params.id);

    res.status(200).json({
      message: "Contribution deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const approveContribution = async (req, res) => {
  try {
    const contribution = await approveContributionModel(req.params.id);

    if (!contribution) {
      return res.status(404).json({
        message: "Contribution not found",
      });
    }

    await Notification.createNotification({
      user_id: contribution.user_id,
      title: "Contribution Approved",
      message: `Your contribution of KES ${contribution.amount} has been approved.`,
      type: "contribution",
      reference_id: contribution.id,
    });

    res.status(200).json({
      message: "Contribution approved successfully",
      contribution,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
const rejectContribution = async (req, res) => {
  try {
    const contribution = await rejectContributionModel(req.params.id);

    if (!contribution) {
      return res.status(404).json({
        message: "Contribution not found",
      });
    }

    await Notification.createNotification({
      user_id: contribution.user_id,
      title: "Contribution Rejected",
      message: `Your contribution of KES ${contribution.amount} was rejected. Please verify your Mpesa code.`,
      type: "contribution",
      reference_id: contribution.id,
    });

    res.status(200).json({
      message: "Contribution rejected successfully",
      contribution,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createContribution,
  createMyContribution,
  getMyContributions,
  getUserContributions,
  getAllContributions,
  getContributionStats,
  deleteContribution,
  approveContribution,
  rejectContribution,
};
