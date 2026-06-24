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

/*
|--------------------------------------------------------------------------
| CREATE SAVING
|--------------------------------------------------------------------------
*/

const createSaving = async (
  req,
  res
) => {
  try {
    const {
      user_id,
      group_id,
      amount,
      payment_method,
      mpesa_code,
    } = req.body;

    if (
      !user_id ||
      !group_id ||
      !amount
    ) {
      return res.status(400).json({
        message:
          "User, Group and Amount are required",
      });
    }

    const saving =
      await createSavingModel(
        user_id,
        group_id,
        amount,
        payment_method,
        mpesa_code || null,
        req.user.id
      );

    res.status(201).json({
      message:
        "Saving added successfully",
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
| GET ALL SAVINGS
|--------------------------------------------------------------------------
*/

const getAllSavings =
  async (req, res) => {
    try {

      const savings =
        await getAllSavingsModel();

      res.status(200).json(
        savings
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
| GET USER SAVINGS
|--------------------------------------------------------------------------
*/

const getUserSavings =
  async (req, res) => {
    try {

      const savings =
        await getUserSavingsModel(
          req.params.userId
        );

      res.status(200).json(
        savings
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
| GET SINGLE SAVING
|--------------------------------------------------------------------------
*/

const getSingleSaving =
  async (req, res) => {
    try {

      const saving =
        await getSingleSavingModel(
          req.params.id
        );

      if (!saving) {
        return res.status(404).json({
          message:
            "Saving not found",
        });
      }

      res.status(200).json(
        saving
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
| SAVINGS STATS
|--------------------------------------------------------------------------
*/

const getSavingsStats =
  async (req, res) => {
    try {

      const stats =
        await getSavingsStatsModel();

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
| DELETE SAVING
|--------------------------------------------------------------------------
*/

const deleteSaving =
  async (req, res) => {
    try {

      const saving =
        await getSingleSavingModel(
          req.params.id
        );

      if (!saving) {
        return res.status(404).json({
          message:
            "Saving not found",
        });
      }

      await deleteSavingModel(
        req.params.id
      );

      res.status(200).json({
        message:
          "Saving deleted successfully",
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
  getAllSavings,
  getUserSavings,
  getSingleSaving,
  getSavingsStats,
  deleteSaving,
};