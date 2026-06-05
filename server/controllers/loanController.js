const {
  createLoanModel,
  getAllLoansModel,
  getUserLoansModel,
  getSingleLoanModel,
  approveLoanModel,
  rejectLoanModel,
  getLoanStatsModel,
  deleteLoanModel,
} = require("../models/loanModel");

const pool =
  require("../config/db");

/*
|--------------------------------------------------------------------------
| CREATE LOAN
|--------------------------------------------------------------------------
*/

const createLoan =
  async (req, res) => {
    try {

      const {
        user_id,
        amount,
        purpose,
        interest_rate,
        duration_months,
      } = req.body;

      const group =
        await pool.query(
          `
          SELECT group_id
          FROM user_groups
          WHERE user_id = $1
          LIMIT 1
          `,
          [user_id]
        );

      const groupId =
        group.rows[0]?.group_id;

      if (!groupId) {
        return res.status(400).json({
          message:
            "Member is not assigned to any group",
        });
      }

      const loan =
        await createLoanModel(
          user_id,
          groupId,
          amount,
          purpose,
          interest_rate,
          duration_months
        );

      res.status(201).json({
        message:
          "Loan application submitted successfully",
        loan,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          error.message,
      });

    }
  };

/*
|--------------------------------------------------------------------------
| GET ALL LOANS
|--------------------------------------------------------------------------
*/

const getAllLoans =
  async (req, res) => {
    try {

      const loans =
        await getAllLoansModel();

      res.status(200).json(
        loans
      );

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          "Server error",
      });

    }
  };

/*
|--------------------------------------------------------------------------
| GET USER LOANS
|--------------------------------------------------------------------------
*/

const getUserLoans =
  async (req, res) => {
    try {

      const loans =
        await getUserLoansModel(
          req.params.userId
        );

      res.status(200).json(
        loans
      );

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          "Server error",
      });

    }
  };

/*
|--------------------------------------------------------------------------
| GET SINGLE LOAN
|--------------------------------------------------------------------------
*/

const getSingleLoan =
  async (req, res) => {
    try {

      const loan =
        await getSingleLoanModel(
          req.params.id
        );

      if (!loan) {
        return res.status(404).json({
          message:
            "Loan not found",
        });
      }

      res.status(200).json(
        loan
      );

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          "Server error",
      });

    }
  };

/*
|--------------------------------------------------------------------------
| APPROVE LOAN
|--------------------------------------------------------------------------
*/

const approveLoan =
  async (req, res) => {
    try {

      const loan =
        await getSingleLoanModel(
          req.params.id
        );

      if (!loan) {
        return res.status(404).json({
          message:
            "Loan not found",
        });
      }

      const updatedLoan =
        await approveLoanModel(
          req.params.id,
          req.user.id
        );

      res.status(200).json({
        message:
          "Loan approved successfully",
        loan: updatedLoan,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          "Server error",
      });

    }
  };

/*
|--------------------------------------------------------------------------
| REJECT LOAN
|--------------------------------------------------------------------------
*/

const rejectLoan =
  async (req, res) => {
    try {

      const loan =
        await getSingleLoanModel(
          req.params.id
        );

      if (!loan) {
        return res.status(404).json({
          message:
            "Loan not found",
        });
      }

      const updatedLoan =
        await rejectLoanModel(
          req.params.id
        );

      res.status(200).json({
        message:
          "Loan rejected successfully",
        loan: updatedLoan,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          "Server error",
      });

    }
  };

/*
|--------------------------------------------------------------------------
| LOAN STATS
|--------------------------------------------------------------------------
*/

const getLoanStats =
  async (req, res) => {
    try {

      const stats =
        await getLoanStatsModel();

      res.status(200).json(
        stats
      );

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          "Server error",
      });

    }
  };

/*
|--------------------------------------------------------------------------
| DELETE LOAN
|--------------------------------------------------------------------------
*/

const deleteLoan =
  async (req, res) => {
    try {

      const loan =
        await getSingleLoanModel(
          req.params.id
        );

      if (!loan) {
        return res.status(404).json({
          message:
            "Loan not found",
        });
      }

      await deleteLoanModel(
        req.params.id
      );

      res.status(200).json({
        message:
          "Loan deleted successfully",
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          "Server error",
      });

    }
  };

module.exports = {
  createLoan,
  getAllLoans,
  getUserLoans,
  getSingleLoan,
  approveLoan,
  rejectLoan,
  getLoanStats,
  deleteLoan,
};