const {
  getSummaryReportModel,
  getContributionsReportModel,
  getLoansReportModel,
  getRepaymentsReportModel,
  getSavingsReportModel,
} = require("../models/reportModel");

/*
|--------------------------------------------------------------------------
| SUMMARY
|--------------------------------------------------------------------------
*/

const getSummaryReport = async (req, res) => {
  try {
    const summary = await getSummaryReportModel();

    res.status(200).json(summary);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| REPORTS
|--------------------------------------------------------------------------
*/

const getReports = async (req, res) => {
  try {
    const { type } = req.query;

    let data = [];

    switch (type) {
      case "contributions":
        data =
          await getContributionsReportModel();
        break;

      case "loans":
        data =
          await getLoansReportModel();
        break;

      case "repayments":
        data =
          await getRepaymentsReportModel();
        break;

      case "savings":
        data =
          await getSavingsReportModel();
        break;

      default:
        return res.status(400).json({
          message:
            "Invalid report type",
        });
    }

    res.status(200).json(data);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error",
    });

  }
};

module.exports = {
  getSummaryReport,
  getReports,
};