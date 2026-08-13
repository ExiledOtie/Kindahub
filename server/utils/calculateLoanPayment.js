const PENALTY_RATE = 5;

/*
|--------------------------------------------------------------------------
| CALCULATE LOAN PAYMENT
|--------------------------------------------------------------------------
|
| Used by:
|
| 1. Normal loan repayment
| 2. Wallet loan repayment
|
| Payment priority:
|
| Interest → Principal
|
| Also calculates:
| - overdue
| - penalty
| - total payable
| - balance
| - overpayment
|
|--------------------------------------------------------------------------
*/

const calculateLoanPayment = async (db, loanId, paymentAmount) => {
  /*
  |--------------------------------------------------------------------------
  | GET LOAN
  |--------------------------------------------------------------------------
  */

  const loanResult = await db.query(
    `
    SELECT *
    FROM loans
    WHERE id = $1
    FOR UPDATE
    `,
    [loanId],
  );

  if (!loanResult.rows.length) {
    throw new Error("Loan not found");
  }

  const loan = loanResult.rows[0];

  /*
  |--------------------------------------------------------------------------
  | GET TOTAL COMPLETED PAYMENTS
  |--------------------------------------------------------------------------
  */

  const totalPaidResult = await db.query(
    `
    SELECT
      COALESCE(SUM(amount), 0) AS total_paid
    FROM loan_payments
    WHERE loan_id = $1
      AND status = 'completed'
    `,
    [loanId],
  );

  const totalPaid = Number(totalPaidResult.rows[0].total_paid);

  /*
  |--------------------------------------------------------------------------
  | GET PAYMENT BREAKDOWN
  |--------------------------------------------------------------------------
  */

  const breakdownResult = await db.query(
    `
    SELECT
      COALESCE(SUM(principal_paid), 0) AS principal_paid,
      COALESCE(SUM(interest_paid), 0) AS interest_paid
    FROM loan_payments
    WHERE loan_id = $1
      AND status = 'completed'
    `,
    [loanId],
  );

  const principalAlreadyPaid = Number(breakdownResult.rows[0].principal_paid);

  const interestAlreadyPaid = Number(breakdownResult.rows[0].interest_paid);

  /*
  |--------------------------------------------------------------------------
  | LOAN CALCULATION
  |--------------------------------------------------------------------------
  */

  const principal = Number(loan.amount);

  const rate = Number(loan.interest_rate);

  const duration = Number(loan.duration_months);

  const totalInterest = (principal * rate) / 100;

  let totalPayable = principal + totalInterest;

  /*
  |--------------------------------------------------------------------------
  | PENALTY CALCULATION
  |--------------------------------------------------------------------------
  */

  const startDate = new Date(loan.created_at);

  const now = new Date();

  const monthsPassed =
    (now.getFullYear() - startDate.getFullYear()) * 12 +
    (now.getMonth() - startDate.getMonth());

  const expectedMonthlyPayment =
    duration > 0 ? totalPayable / duration : totalPayable;

  const expectedPaidTillNow = expectedMonthlyPayment * monthsPassed;

  let overdue = expectedPaidTillNow - totalPaid;

  let penalty = 0;

  if (overdue > 0) {
    penalty = (overdue * PENALTY_RATE) / 100;
  }

  totalPayable += penalty;

  /*
  |--------------------------------------------------------------------------
  | CURRENT BALANCE
  |--------------------------------------------------------------------------
  */

  const currentBalance = Math.max(totalPayable - totalPaid, 0);

  /*
  |--------------------------------------------------------------------------
  | PAYMENT AMOUNT
  |--------------------------------------------------------------------------
  */

  const amountApplied = Math.min(Number(paymentAmount), currentBalance);

  const overpayment = Math.max(Number(paymentAmount) - currentBalance, 0);

  /*
  |--------------------------------------------------------------------------
  | REMAINING INTEREST
  |--------------------------------------------------------------------------
  */

  const remainingInterest = Math.max(totalInterest - interestAlreadyPaid, 0);

  /*
  |--------------------------------------------------------------------------
  | REMAINING PRINCIPAL
  |--------------------------------------------------------------------------
  */

  const remainingPrincipal = Math.max(principal - principalAlreadyPaid, 0);

  /*
  |--------------------------------------------------------------------------
  | APPLY PAYMENT
  |--------------------------------------------------------------------------
  |
  | Interest first.
  | Principal second.
  |
  |--------------------------------------------------------------------------
  */

  let remaining = amountApplied;

  const interestPaid = Math.min(remaining, remainingInterest);

  remaining -= interestPaid;

  const principalPaid = Math.min(remaining, remainingPrincipal);

  remaining -= principalPaid;

  /*
  |--------------------------------------------------------------------------
  | BALANCE AFTER PAYMENT
  |--------------------------------------------------------------------------
  */

  const balanceAfter = Math.max(currentBalance - amountApplied, 0);

  return {
    loan,

    principal,

    totalInterest,

    totalPayable,

    totalPaid,

    principalAlreadyPaid,

    interestAlreadyPaid,

    remainingPrincipal,

    remainingInterest,

    expectedMonthlyPayment,

    expectedPaidTillNow,

    overdue,

    penalty,

    currentBalance,

    amountApplied,

    overpayment,

    principalPaid,

    interestPaid,

    balanceAfter,
  };
};

module.exports = calculateLoanPayment;
