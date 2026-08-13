const pool = require("../config/db");

/*
|--------------------------------------------------------------------------
| VALIDATE PAYMENT REFERENCE
|--------------------------------------------------------------------------
|
| Ensures:
|
| 1. M-Pesa payments must have an M-Pesa code
| 2. Bank payments must have a bank reference
| 3. Cash payments do not require a reference
| 4. A reference cannot already exist anywhere in:
|      - savings
|      - contributions
|      - loan_payments
|
| This means an M-Pesa code cannot be reused as a bank reference,
| and a bank reference cannot be reused as an M-Pesa code.
|
|--------------------------------------------------------------------------
*/

const validatePaymentReference = async (
  paymentMethod,
  mpesaCode,
  bankReference,
) => {
  /*
  |--------------------------------------------------------------------------
  | CASH
  |--------------------------------------------------------------------------
  */

  if (paymentMethod === "cash") {
    return;
  }

  /*
  |--------------------------------------------------------------------------
  | GET REFERENCE
  |--------------------------------------------------------------------------
  */

  let paymentReference = null;

  if (paymentMethod === "mpesa") {
    paymentReference = mpesaCode?.trim().toUpperCase();
  }

  if (paymentMethod === "bank") {
    paymentReference = bankReference?.trim().toUpperCase();
  }

  /*
  |--------------------------------------------------------------------------
  | REQUIRE REFERENCE
  |--------------------------------------------------------------------------
  */

  if (!paymentReference) {
    throw new Error(
      paymentMethod === "mpesa"
        ? "M-Pesa transaction code is required."
        : "Bank reference is required.",
    );
  }

  /*
  |--------------------------------------------------------------------------
  | CHECK ALL FINANCIAL TABLES
  |--------------------------------------------------------------------------
  */

  const existing = await pool.query(
    `
    SELECT id
    FROM savings
    WHERE
      UPPER(TRIM(COALESCE(mpesa_code, ''))) = $1
      OR UPPER(TRIM(COALESCE(bank_reference, ''))) = $1

    UNION

    SELECT id
    FROM contributions
    WHERE
      UPPER(TRIM(COALESCE(mpesa_code, ''))) = $1
      OR UPPER(TRIM(COALESCE(bank_reference, ''))) = $1

    UNION

    SELECT id
    FROM loan_payments
    WHERE
      UPPER(TRIM(COALESCE(mpesa_code, ''))) = $1
      OR UPPER(TRIM(COALESCE(bank_reference, ''))) = $1

    LIMIT 1
    `,
    [paymentReference],
  );

  /*
  |--------------------------------------------------------------------------
  | DUPLICATE FOUND
  |--------------------------------------------------------------------------
  */

  if (existing.rows.length > 0) {
    throw new Error("This payment reference has already been used.");
  }
};

module.exports = validatePaymentReference;
