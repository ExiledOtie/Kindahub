const {
  createSavingModel,
  getAllSavingsModel,
  getUserSavingsModel,
  getSingleSavingModel,
  getSavingsStatsModel,
  deleteSavingModel,
  approveSavingModel,
  rejectSavingModel,
} = require("../models/savingsModel");

const Notification = require("../models/notificationModel");
const pool = require("../config/db");

/*
|--------------------------------------------------------------------------
| CREATE SAVING (SUPER ADMIN /ADMIN)
|--------------------------------------------------------------------------
*/

const createSaving = async (req, res) => {
  try {
    const {
      user_id,
      group_id,
      amount,
      payment_method,
      mpesa_code,
      bank_reference,
    } = req.body;

    if (!user_id || !group_id || !amount) {
      return res.status(400).json({
        message: "User, Group and Amount are required",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (payment_method === "mpesa" && !mpesa_code) {
      return res.status(400).json({
        message: "Mpesa code is required",
      });
    }

    if (payment_method === "bank" && !bank_reference) {
      return res.status(400).json({
        message: "Bank reference is required",
      });
    }

    if (payment_method === "mpesa") {
      const existing = await pool.query(
        `
        SELECT id
        FROM savings
        WHERE UPPER(mpesa_code)=UPPER($1)
        LIMIT 1
        `,
        [mpesa_code]
      );

      if (existing.rows.length) {
        return res.status(400).json({
          message: "This Mpesa code has already been used.",
        });
      }
    }

    if (payment_method === "bank") {
      const existing = await pool.query(
        `
        SELECT id
        FROM savings
        WHERE UPPER(bank_reference)=UPPER($1)
        LIMIT 1
        `,
        [bank_reference]
      );

      if (existing.rows.length) {
        return res.status(400).json({
          message: "This Bank reference has already been used.",
        });
      }
    }

    const saving = await createSavingModel(
      user_id,
      group_id,
      amount,
      payment_method,
      mpesa_code || null,
      bank_reference || null,
      req.user.id,
      "completed"
    );

    await Notification.createNotification({
      user_id,
      title: "Saving Received",
      message: `A saving of KES ${Number(amount).toLocaleString()} has been recorded by the administrator.`,
      type: "saving",
      reference_id: saving.id,
    });

    res.status(201).json({
      message: "Saving recorded successfully",
      saving,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| MEMBER CREATE SAVING
|--------------------------------------------------------------------------
*/

const createMySaving = async (req, res) => {
  try {
    const {
      amount,
      payment_method,
      mpesa_code,
      bank_reference,
    } = req.body;

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

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (payment_method === "mpesa" && !mpesa_code) {
      return res.status(400).json({
        message: "Mpesa code is required",
      });
    }

    if (payment_method === "bank" && !bank_reference) {
      return res.status(400).json({
        message: "Bank reference is required",
      });
    }

    if (payment_method === "mpesa") {
      const existing = await pool.query(
        `
        SELECT id
        FROM savings
        WHERE UPPER(mpesa_code)=UPPER($1)
        LIMIT 1
        `,
        [mpesa_code]
      );

      if (existing.rows.length) {
        return res.status(400).json({
          message: "This Mpesa code has already been used.",
        });
      }
    }

    if (payment_method === "bank") {
      const existing = await pool.query(
        `
        SELECT id
        FROM savings
        WHERE UPPER(bank_reference)=UPPER($1)
        LIMIT 1
        `,
        [bank_reference]
      );

      if (existing.rows.length) {
        return res.status(400).json({
          message: "This Bank reference has already been used.",
        });
      }
    }

    const saving = await createSavingModel(
      userId,
      groupId,
      amount,
      payment_method,
      mpesa_code || null,
      bank_reference || null,
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

    const reference =
      payment_method === "mpesa"
        ? mpesa_code
        : payment_method === "bank"
        ? bank_reference
        : "Cash Payment";

    for (const admin of admins.rows) {
      await Notification.createNotification({
        user_id: admin.id,
        title: "New Saving Submitted",
        message: `${member.rows[0].fullname} submitted a saving of KES ${Number(
          amount
        ).toLocaleString()} via ${payment_method}. Reference: ${reference}`,
        type: "saving",
        reference_id: saving.id,
      });
    }

    res.status(201).json({
      message: "Saving submitted successfully. Awaiting approval.",
      saving,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to submit saving",
    });
  }
};

const getMySavings = async (req, res) => {
  try {
    const savings = await getUserSavingsModel(req.user.id);

    res.status(200).json(savings);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL SAVINGS
|--------------------------------------------------------------------------
*/

const getAllSavings = async (req, res) => {
  try {
    const savings = await getAllSavingsModel();

    res.status(200).json(savings);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET USER SAVINGS
|--------------------------------------------------------------------------
*/

const getUserSavings = async (req, res) => {
  try {
    const savings = await getUserSavingsModel(req.params.userId);

    res.status(200).json(savings);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE SAVING
|--------------------------------------------------------------------------
*/

const getSingleSaving = async (req, res) => {
  try {
    const saving = await getSingleSavingModel(req.params.id);

    if (!saving) {
      return res.status(404).json({
        message: "Saving not found",
      });
    }

    res.status(200).json(saving);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| SAVINGS STATS
|--------------------------------------------------------------------------
*/

const getSavingsStats = async (req, res) => {
  try {
    const stats = await getSavingsStatsModel();

    res.status(200).json(stats);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const approveSaving = async (req, res) => {
  try {
    const saving = await approveSavingModel(req.params.id);

    if (!saving) {
      return res.status(404).json({
        message: "Saving not found",
      });
    }

    await Notification.createNotification({
      user_id: saving.user_id,
      title: "Saving Approved",
      message: `Your saving of KES ${saving.amount} has been approved.`,
      type: "saving",
      reference_id: saving.id,
    });

    res.status(200).json({
      message: "Saving approved successfully",
      saving,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const rejectSaving = async (req, res) => {
  try {
    const saving = await rejectSavingModel(req.params.id);

    if (!saving) {
      return res.status(404).json({
        message: "Saving not found",
      });
    }

    await Notification.createNotification({
      user_id: saving.user_id,
      title: "Saving Rejected",
      message: `Your saving of KES ${saving.amount} was rejected.`,
      type: "saving",
      reference_id: saving.id,
    });

    res.status(200).json({
      message: "Saving rejected successfully",
      saving,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE SAVING
|--------------------------------------------------------------------------
*/

const deleteSaving = async (req, res) => {
  try {
    const saving = await getSingleSavingModel(req.params.id);

    if (!saving) {
      return res.status(404).json({
        message: "Saving not found",
      });
    }

    await deleteSavingModel(req.params.id);

    res.status(200).json({
      message: "Saving deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createSaving,
  createMySaving,
  getMySavings,
  getAllSavings,
  getUserSavings,
  getSingleSaving,
  getSavingsStats,
  deleteSaving,
  approveSaving,
  rejectSaving,
};
