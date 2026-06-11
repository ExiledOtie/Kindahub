const {
  createContributionModel,
  getUserContributionsModel,
  getAllContributionsModel,
  getContributionStatsModel,
  deleteContributionModel,
} = require("../models/contributionModel");

const pool =
  require("../config/db");

/*
|--------------------------------------------------------------------------
| CREATE
|--------------------------------------------------------------------------
*/

const createContribution =
  async (req, res) => {
    try {
      const {
        user_id,
        amount,
        payment_method,
        mpesa_code,
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

      const contribution =
        await createContributionModel(
          user_id,
          groupId,
          amount,
          payment_method,
          mpesa_code || null,
          req.user.id
        );

      res.status(201).json({
        message:
          "Contribution added successfully",
        contribution,
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
| USER CONTRIBUTIONS
|--------------------------------------------------------------------------
*/

const getUserContributions =
  async (req, res) => {
    try {
      const contributions =
        await getUserContributionsModel(
          req.params.userId
        );

      res.status(200).json(
        contributions
      );

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

const getAllContributions =
  async (req, res) => {
    try {
      const contributions =
        await getAllContributionsModel();

      res.status(200).json(
        contributions
      );

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

const getContributionStats =
  async (req, res) => {
    try {
      const stats =
        await getContributionStatsModel();

      res.status(200).json(
        stats
      );

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

const deleteContribution =
  async (req, res) => {
    try {
      await deleteContributionModel(
        req.params.id
      );

      res.status(200).json({
        message:
          "Contribution deleted successfully",
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
  getUserContributions,
  getAllContributions,
  getContributionStats,
  deleteContribution,
};