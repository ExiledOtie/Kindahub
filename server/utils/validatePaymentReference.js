const pool = require("../config/db");

const validatePaymentReference = async (
  paymentMethod,
  mpesaCode,
  bankReference,
) => {
  // Cash payments don't have references
  if (paymentMethod === "cash") {
    return;
  }

  const paymentReference =
    paymentMethod === "mpesa"
      ? mpesaCode?.trim().toUpperCase()
      : paymentMethod === "bank"
        ? bankReference?.trim().toUpperCase()
        : null;

  if (!paymentReference) {
    return;
  }

  const existing = await pool.query(
    `
    SELECT id
FROM savings
WHERE
  UPPER(COALESCE(mpesa_code,'')) = $1
  OR UPPER(COALESCE(bank_reference,'')) = $1

UNION

SELECT id
FROM contributions
WHERE
  UPPER(COALESCE(mpesa_code,'')) = $1
  OR UPPER(COALESCE(bank_reference,'')) = $1

UNION

SELECT id
FROM loan_payments
WHERE
  UPPER(COALESCE(mpesa_code,'')) = $1
  OR UPPER(COALESCE(bank_reference,'')) = $1

LIMIT 1
    `,
    [paymentReference],
  );

  if (existing.rows.length > 0) {
    throw new Error("This payment reference has already been used.");
  }
};

module.exports = validatePaymentReference;
