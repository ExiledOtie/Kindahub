const pool = require("../config/db");

const {
  createLoanPaymentModel,
  getLoanPaymentsModel,
  getTotalPaidModel,
  getAllLoanPaymentsModel,
  getMyLoanPaymentsModel,
  updateLoanBalanceModel,
} = require("../models/loanPaymentModel");

const Notification = require("../models/notificationModel");
const { creditWalletModel } = require("../models/memberCreditModel");
const validatePaymentReference = require("../utils/validatePaymentReference");
const calculateLoanPayment = require("../utils/calculateLoanPayment");

/*
|--------------------------------------------------------------------------
| CONFIG
|--------------------------------------------------------------------------
*/

const PENALTY_RATE = 5; // 5% monthly penalty for overdue

/*
|--------------------------------------------------------------------------
| LOAN BALANCE CALCULATOR
|--------------------------------------------------------------------------
*/

const calculateLoanBalance = async (loanId) => {
  const loanRes = await pool.query(`SELECT * FROM loans WHERE id = $1`, [
    loanId,
  ]);

  if (!loanRes.rows[0]) {
    throw new Error("Loan not found");
  }

  const loan = loanRes.rows[0];

  const totalPaidRes = await getTotalPaidModel(loanId);

  const principal = Number(loan.amount);
  const rate = Number(loan.interest_rate);
  const duration = Number(loan.duration_months);

  const totalInterest = (principal * rate) / 100;

  let totalPayable = principal + totalInterest;

  const totalPaid = Number(totalPaidRes.total_paid);

  /*
  |--------------------------------------------------------------------------
  | OVERDUE PENALTY ENGINE
  |--------------------------------------------------------------------------
  */

  const startDate = new Date(loan.created_at);
  const now = new Date();

  const monthsPassed =
    (now.getFullYear() - startDate.getFullYear()) * 12 +
    (now.getMonth() - startDate.getMonth());

  const expectedMonthlyPayment = totalPayable / duration;

  const expectedPaidTillNow = expectedMonthlyPayment * monthsPassed;

  const overdue = expectedPaidTillNow - totalPaid;

  let penalty = 0;

  if (overdue > 0) {
    penalty = (overdue * PENALTY_RATE) / 100;
  }

  totalPayable += penalty;

  const balance = totalPayable - totalPaid;

  return {
    totalPayable,
    totalPaid,
    balance,
    expectedMonthlyPayment,
    overdue,
    penalty,
    monthsPassed,
  };
};

/*
|--------------------------------------------------------------------------
| GET ALL LOAN PAYMENTS
|--------------------------------------------------------------------------
*/

const getAllLoanPayments = async (req, res) => {
  try {
    const payments = await getAllLoanPaymentsModel();

    res.status(200).json(payments);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN CREATE LOAN PAYMENT
|--------------------------------------------------------------------------
|
| Admin payments are approved immediately.
|
| IMPORTANT:
| The payment calculation is now handled by calculateLoanPayment.js
| so that normal repayments and wallet repayments use the same engine.
|
|--------------------------------------------------------------------------
*/

const createLoanPayment = async (req, res) => {
  try {
    const { loan_id, amount, payment_method, mpesa_code, bank_reference } =
      req.body;

    const paymentAmount = Number(amount || 0);

    if (!loan_id || paymentAmount <= 0) {
      return res.status(400).json({
        message: "Loan and valid payment amount are required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE PAYMENT REFERENCE
    |--------------------------------------------------------------------------
    */

    await validatePaymentReference(payment_method, mpesa_code, bank_reference);

    /*
    |--------------------------------------------------------------------------
    | FETCH LOAN
    |--------------------------------------------------------------------------
    */

    const loanRes = await pool.query(
      `
      SELECT *
      FROM loans
      WHERE id = $1
      `,
      [loan_id],
    );

    if (!loanRes.rows.length) {
      return res.status(404).json({
        message: "Loan not found",
      });
    }

    const loan = loanRes.rows[0];

    /*
    |--------------------------------------------------------------------------
    | CHECK LOAN STATUS
    |--------------------------------------------------------------------------
    */

    if (
      ["paid", "repaid", "rejected", "cancelled"].includes(
        String(loan.status).toLowerCase(),
      )
    ) {
      return res.status(400).json({
        message: `Loan cannot receive a payment because its status is ${loan.status}.`,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CALCULATE PAYMENT
    |--------------------------------------------------------------------------
    |
    | This is now the SINGLE calculation engine.
    |
    | It determines:
    |
    | - current balance
    | - amount applied
    | - overpayment
    | - interest paid
    | - principal paid
    | - balance after payment
    |
    |--------------------------------------------------------------------------
    */

    const calculation = await calculateLoanPayment(
      pool,
      loan_id,
      paymentAmount,
    );

    /*
    |--------------------------------------------------------------------------
    | CHECK CURRENT BALANCE
    |--------------------------------------------------------------------------
    */

    if (calculation.currentBalance <= 0) {
      return res.status(400).json({
        message: "This loan has already been fully paid.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | SAVE PAYMENT
    |--------------------------------------------------------------------------
    */

    const payment = await createLoanPaymentModel(
      loan_id,
      calculation.amountApplied,
      calculation.principalPaid,
      calculation.interestPaid,
      calculation.balanceAfter,
      payment_method,
      mpesa_code || null,
      bank_reference || null,
      "completed",
    );

    /*
    |--------------------------------------------------------------------------
    | CREDIT OVERPAYMENT TO MEMBER WALLET
    |--------------------------------------------------------------------------
    |
    | Example:
    |
    | Loan balance = 10,000
    | Payment = 12,000
    |
    | 10,000 → loan
    | 2,000  → credit wallet
    |
    |--------------------------------------------------------------------------
    */

    if (calculation.overpayment > 0) {
      await creditWalletModel(
        loan.user_id,
        calculation.overpayment,
        loan.id,
        "Loan overpayment",
      );
    }

    /*
    |--------------------------------------------------------------------------
    | RECALCULATE AFTER PAYMENT
    |--------------------------------------------------------------------------
    |
    | The new loan payment is now completed and therefore included
    | in the calculation.
    |
    |--------------------------------------------------------------------------
    */

    const updatedCalculation = await calculateLoanPayment(pool, loan_id, 0);

    /*
    |--------------------------------------------------------------------------
    | UPDATE LOAN
    |--------------------------------------------------------------------------
    */

    let updatedLoan = await updateLoanBalanceModel(
      loan_id,
      updatedCalculation.totalPayable,
      updatedCalculation.currentBalance,
    );

    /*
    |--------------------------------------------------------------------------
    | MARK AS REPAID
    |--------------------------------------------------------------------------
    */

    if (Number(updatedLoan.balance) <= 0) {
      const result = await pool.query(
        `
        UPDATE loans
        SET
          status = 'repaid',
          balance = 0,
          paid_off_at = NOW(),
          completed_at = NOW()
        WHERE id = $1
        RETURNING *
        `,
        [loan_id],
      );

      updatedLoan = result.rows[0];
    }

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.status(201).json({
      success: true,

      message:
        calculation.overpayment > 0
          ? `Payment recorded successfully. KES ${calculation.overpayment.toLocaleString()} has been credited to the member's credit wallet.`
          : "Payment recorded successfully.",

      payment,

      loan: updatedLoan,

      balance: updatedLoan.balance,

      overpayment: calculation.overpayment,
    });
  } catch (error) {
    console.error("CREATE LOAN PAYMENT ERROR:", error);

    return res
      .status(
        error.message === "This payment reference has already been used."
          ? 400
          : 500,
      )
      .json({
        success: false,
        message: error.message || "Server error",
      });
  }
};

/*
|--------------------------------------------------------------------------
| MEMBER CREATE LOAN PAYMENT
|--------------------------------------------------------------------------
|
| Member repayments remain PENDING.
|
| The actual calculation will happen when the admin approves the
| repayment, using the same calculateLoanPayment.js engine.
|
|--------------------------------------------------------------------------
*/

const createMyLoanPayment = async (req, res) => {
  try {
    const { loan_id, amount, payment_method, mpesa_code, bank_reference } =
      req.body;

    const paymentAmount = Number(amount || 0);

    if (!loan_id || paymentAmount <= 0) {
      return res.status(400).json({
        message: "Loan and valid payment amount are required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE PAYMENT REFERENCE
    |--------------------------------------------------------------------------
    */

    await validatePaymentReference(payment_method, mpesa_code, bank_reference);

    /*
    |--------------------------------------------------------------------------
    | CHECK LOAN
    |--------------------------------------------------------------------------
    */

    const loanRes = await pool.query(
      `
      SELECT
        l.*,
        u.fullname
      FROM loans l

      INNER JOIN users u
        ON u.id = l.user_id

      WHERE l.id = $1
      `,
      [loan_id],
    );

    if (!loanRes.rows.length) {
      return res.status(404).json({
        message: "Loan not found",
      });
    }

    const loan = loanRes.rows[0];

    /*
    |--------------------------------------------------------------------------
    | ENSURE MEMBER OWNS LOAN
    |--------------------------------------------------------------------------
    */

    if (loan.user_id !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | SAVE PAYMENT AS PENDING
    |--------------------------------------------------------------------------
    */

    const payment = await createLoanPaymentModel(
      loan_id,
      paymentAmount,
      0,
      0,
      loan.balance,
      payment_method,
      mpesa_code || null,
      bank_reference || null,
      "pending",
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
          : "Cash";

    for (const admin of admins.rows) {
      await Notification.createNotification({
        user_id: admin.id,
        title: "Loan Repayment Submitted",
        message:
          `${loan.fullname} submitted a loan repayment of KES ` +
          `${paymentAmount.toLocaleString()} via ${payment_method}. ` +
          `Reference: ${reference}. Awaiting approval.`,
        type: "loan_payment",
        reference_id: payment.id,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.status(201).json({
      success: true,
      message: "Loan repayment submitted successfully. Awaiting approval.",
      payment,
    });
  } catch (error) {
    console.error("CREATE MEMBER LOAN PAYMENT ERROR:", error);

    return res
      .status(
        error.message === "This payment reference has already been used."
          ? 400
          : 500,
      )
      .json({
        success: false,
        message: error.message || "Failed to submit loan repayment.",
      });
  }
};

/*
|--------------------------------------------------------------------------
| GET LOAN PAYMENTS
|--------------------------------------------------------------------------
*/

const getLoanPayments = async (req, res) => {
  try {
    const payments = await getLoanPaymentsModel(req.params.loanId);

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET MY LOAN PAYMENTS
|--------------------------------------------------------------------------
*/

const getMyLoanPayments = async (req, res) => {
  try {
    const payments = await getMyLoanPaymentsModel(req.user.id);

    res.status(200).json(payments);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET LOAN BALANCE + METRICS
|--------------------------------------------------------------------------
*/

const getLoanBalance = async (req, res) => {
  try {
    const balance = await calculateLoanBalance(req.params.loanId);

    res.json(balance);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

module.exports = {
  createLoanPayment,
  createMyLoanPayment,
  getLoanPayments,
  getLoanBalance,
  getAllLoanPayments,
  getMyLoanPayments,
};
