const {
  createContributionModel,
  getMemberContributionsModel,
  deleteContributionModel,
} = require("../models/contributionModel");

/*
|--------------------------------------------------------------------------
| CREATE
|--------------------------------------------------------------------------
*/

const createContribution = async (
  req,
  res
) => {
  try {
    const {
      member_id,
      amount,
      method,
      mpesa_code,
    } = req.body;

    const contribution =
      await createContributionModel(
        member_id,
        amount,
        method,
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
      message: "Server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET MEMBER CONTRIBUTIONS
|--------------------------------------------------------------------------
*/

const getMemberContributions =
  async (req, res) => {
    try {
      const contributions =
        await getMemberContributionsModel(
          req.params.memberId
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
  getMemberContributions,
  deleteContribution,
};