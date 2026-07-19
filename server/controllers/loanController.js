const {
  createLoanModel,
  getAllLoansModel,
  getUserLoansModel,
  getSingleLoanModel,
  approveLoanModel,
  rejectLoanModel,
  getLoanStatsModel,
  deleteLoanModel,
  getActiveLoanModel,
  updateLoanInterestModel,
} = require("../models/loanModel");
const Notification = require("../models/notificationModel");

const pool = require("../config/db");

/*
|--------------------------------------------------------------------------
| CREATE LOAN
|--------------------------------------------------------------------------
*/

const createLoan = async (req, res) => {
  try {
    const { user_id, amount, purpose, interest_rate, duration_months } =
      req.body;

    const group = await pool.query(
      `
          SELECT group_id
          FROM user_groups
          WHERE user_id = $1
          LIMIT 1
          `,
      [user_id],
    );

    const groupId = group.rows[0]?.group_id;

    if (!groupId) {
      return res.status(400).json({
        message: "Member is not assigned to any group",
      });
    }

    const loan = await createLoanModel(
      user_id,
      groupId,
      amount,
      purpose,
      interest_rate,
      duration_months,
    );
    const member = await pool.query(
      `
  SELECT fullname
  FROM users
  WHERE id = $1
  `,
      [user_id],
    );

    const admins = await pool.query(
      `
  SELECT id
  FROM users
  WHERE is_super_admin = true
  `,
    );

    for (const admin of admins.rows) {
      await Notification.createNotification({
        user_id: admin.id,
        title: "New Loan Request",
        message: `${member.rows[0].fullname}
      requested a loan of
      KES ${Number(amount).toLocaleString()}`,
        type: "loan",
        reference_id: loan.id,
      });
    }
    res.status(201).json({
      message: "Loan application submitted successfully",
      loan,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
const createMyLoan = async (req, res) => {
  try {
    const { amount, purpose, interest_rate, duration_months } = req.body;

    const userId = req.user.id;

    const member = await pool.query(
      `
      SELECT id, fullname
      FROM users
      WHERE id = $1
      `,
      [userId],
    );

    const group = await pool.query(
      `
      SELECT group_id
      FROM user_groups
      WHERE user_id = $1
      LIMIT 1
      `,
      [userId],
    );

    const groupId = group.rows[0]?.group_id;

    if (!groupId) {
      return res.status(400).json({
        message: "You are not assigned to any group",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CHECK ACTIVE LOAN
    |--------------------------------------------------------------------------
    */

    const existingLoan = await pool.query(
      `
        SELECT id
        FROM loans
        WHERE user_id = $1
        AND status = 'approved'
        LIMIT 1
        `,
      [userId],
    );

    if (existingLoan.rows.length > 0) {
      return res.status(400).json({
        message: "You already have an active loan",
      });
    }

    const loan = await createLoanModel(
      userId,
      groupId,
      amount,
      purpose,
      interest_rate,
      duration_months,
    );

    /*
    |--------------------------------------------------------------------------
    | NOTIFY ADMINS
    |--------------------------------------------------------------------------
    */

    const admins = await pool.query(
      `
        SELECT id
        FROM users
        WHERE is_super_admin = true
        `,
    );

    for (const admin of admins.rows) {
      await Notification.createNotification({
        user_id: admin.id,
        title: "New Loan Request",
        message: `${member.rows[0].fullname} requested a loan of KES ${Number(
          amount,
        ).toLocaleString()}`,
        type: "loan",
        reference_id: loan.id,
      });
    }

    res.status(201).json({
      message: "Loan request submitted successfully",
      loan,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to submit loan request",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE INTEREST RATE
|--------------------------------------------------------------------------
*/

const updateLoanInterest = async (req, res) => {
  try {
    const { interest_rate } = req.body;

    if (interest_rate == null || Number(interest_rate) < 0) {
      return res.status(400).json({
        message: "Invalid interest rate",
      });
    }

    const loan = await updateLoanInterestModel(req.params.id, interest_rate);

    if (!loan) {
      return res.status(404).json({
        message: "Loan not found",
      });
    }

    /*
    --------------------------------------------------------
    If already approved,
    recalculate balance immediately
    --------------------------------------------------------
    */

    if (loan.status === "approved") {
      const totalInterest =
        (Number(loan.amount) * Number(loan.interest_rate)) / 100;

      const totalPayable = Number(loan.amount) + totalInterest;

      await pool.query(
        `
        UPDATE loans

        SET
          total_payable=$2,
          balance=$2

        WHERE id=$1
        `,
        [loan.id, totalPayable],
      );
    }

    res.json({
      message: "Interest rate updated successfully",
      loan,
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
| GET ALL LOANS
|--------------------------------------------------------------------------
*/

const getAllLoans = async (req, res) => {
  try {
    const loans = await getAllLoansModel();

    res.status(200).json(loans);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET USER LOANS
|--------------------------------------------------------------------------
*/

const getUserLoans = async (req, res) => {
  try {
    const loans = await getUserLoansModel(req.params.userId);

    res.status(200).json(loans);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE LOAN
|--------------------------------------------------------------------------
*/

const getSingleLoan = async (req, res) => {
  try {
    const loan = await getSingleLoanModel(req.params.id);

    if (!loan) {
      return res.status(404).json({
        message: "Loan not found",
      });
    }

    res.status(200).json(loan);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| APPROVE LOAN
|--------------------------------------------------------------------------
*/

const approveLoan = async (req, res) => {
  try {
    console.log("========== APPROVE LOAN ==========");
    console.log("Loan ID:", req.params.id);
    console.log("User:", req.user);
    console.log("Body:", req.body);

    const loan = await getSingleLoanModel(req.params.id);

    console.log("Loan found:", loan);

    if (!loan) {
      return res.status(404).json({
        message: "Loan not found",
      });
    }

    const updatedLoan = await approveLoanModel(
      req.params.id,
      req.user.id,
      req.body.interest_rate
    );

    console.log("Updated Loan:", updatedLoan);

    await Notification.createNotification({
      user_id: updatedLoan.user_id,
      title: "Loan Approved",
      message: `Your loan request of KES ${Number(
        updatedLoan.amount
      ).toLocaleString()} has been approved.`,
      type: "loan",
      reference_id: updatedLoan.id,
    });

    return res.status(200).json({
      message: "Loan approved successfully",
      loan: updatedLoan,
    });
  } catch (error) {
    console.error("APPROVE ERROR");
    console.error(error);

    return res.status(500).json({
      message: error.message,
      stack: error.stack,
    });
  }
};

/*
|--------------------------------------------------------------------------
| REJECT LOAN
|--------------------------------------------------------------------------
*/

const rejectLoan = async (req, res) => {
  try {
    const loan = await getSingleLoanModel(req.params.id);

    if (!loan) {
      return res.status(404).json({
        message: "Loan not found",
      });
    }

    const updatedLoan = await rejectLoanModel(req.params.id);

    await Notification.createNotification({
      user_id: updatedLoan.user_id,
      title: "Loan Rejected",
      message: `Your loan request of KES ${Number(
        updatedLoan.amount,
      ).toLocaleString()} was rejected.`,
      type: "loan",
      reference_id: updatedLoan.id,
    });

    res.status(200).json({
      message: "Loan rejected successfully",
      loan: updatedLoan,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getMyLoans = async (req, res) => {
  try {
    const loans = await getUserLoansModel(req.user.id);

    res.status(200).json(loans);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
/*
|--------------------------------------------------------------------------
| ACTIVE LOAN
|--------------------------------------------------------------------------
*/

const getMyActiveLoan = async (req, res) => {
  try {
    const loan = await getActiveLoanModel(req.user.id);

    res.status(200).json(loan || null);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
/*
|--------------------------------------------------------------------------
| LOAN STATS
|--------------------------------------------------------------------------
*/

const getLoanStats = async (req, res) => {
  try {
    const stats = await getLoanStatsModel();

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
| DELETE LOAN
|--------------------------------------------------------------------------
*/

const deleteLoan = async (req, res) => {
  try {
    const loan = await getSingleLoanModel(req.params.id);

    if (!loan) {
      return res.status(404).json({
        message: "Loan not found",
      });
    }

    await deleteLoanModel(req.params.id);

    res.status(200).json({
      message: "Loan deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createLoan,
  createMyLoan,
  getMyLoans,
  getAllLoans,
  getUserLoans,
  getSingleLoan,
  approveLoan,
  rejectLoan,
  getLoanStats,
  deleteLoan,
  getMyActiveLoan,
  updateLoanInterest,
};
