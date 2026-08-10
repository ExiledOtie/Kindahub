const pool = require("../config/db");

const Notification = require("../models/notificationModel");

/*
|--------------------------------------------------------------------------
| CREATE WALLET ALLOCATIONS
|--------------------------------------------------------------------------
|
| This controller:
|
| 1. Validates the wallet deposit
| 2. Confirms it is verified
| 3. Checks available balance
| 4. Creates the actual:
|      - contribution
|      - saving
|      - loan payment
| 5. Gets the ID of the newly created transaction
| 6. Creates wallet_allocations using that ID as reference_id
| 7. Updates wallet remaining balance
| 8. Commits everything as ONE transaction
|
|--------------------------------------------------------------------------
*/

const createWalletAllocation = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      wallet_deposit_id,
      allocation_mode = "manual",
      allocations,
    } = req.body;

    const allocatedBy = req.user?.id;

    /*
    |--------------------------------------------------------------------------
    | CURRENT USER
    |--------------------------------------------------------------------------
    */

    if (!allocatedBy) {
      await client.query("ROLLBACK");

      return res.status(401).json({
        success: false,
        message: "Authenticated user not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE WALLET DEPOSIT
    |--------------------------------------------------------------------------
    */

    if (!wallet_deposit_id) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "Wallet deposit is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE ALLOCATION MODE
    |--------------------------------------------------------------------------
    */

    if (!["manual", "automatic"].includes(allocation_mode)) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "Invalid allocation mode.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE ALLOCATIONS
    |--------------------------------------------------------------------------
    */

    if (!Array.isArray(allocations) || allocations.length === 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "At least one allocation is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | GET WALLET DEPOSIT
    |--------------------------------------------------------------------------
    */

    const depositResult = await client.query(
      `
      SELECT
        wd.*,
        u.fullname,
        u.username
      FROM wallet_deposits wd
      INNER JOIN users u
        ON u.id = wd.user_id
      WHERE wd.id = $1
      FOR UPDATE
      `,
      [wallet_deposit_id]
    );

    if (depositResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Wallet deposit not found.",
      });
    }

    const deposit = depositResult.rows[0];

    /*
    |--------------------------------------------------------------------------
    | ONLY VERIFIED DEPOSITS CAN BE ALLOCATED
    |--------------------------------------------------------------------------
    */

    if (deposit.status !== "verified") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message:
          "Wallet deposit must be verified before it can be allocated.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | GET WALLET BALANCE
    |--------------------------------------------------------------------------
    */

    const remainingBalance = Number(
      deposit.remaining_balance || 0
    );

    /*
    |--------------------------------------------------------------------------
    | VALIDATE ALLOCATION TYPES
    |--------------------------------------------------------------------------
    */

    const allowedTypes = [
      "contribution",
      "saving",
      "loan_payment",
    ];

    let totalAllocation = 0;

    for (const item of allocations) {
      const type = item.type;
      const amount = Number(item.amount || 0);

      if (!allowedTypes.includes(type)) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          success: false,
          message: `Invalid allocation type: ${type}`,
        });
      }

      if (!Number.isFinite(amount) || amount <= 0) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          success: false,
          message:
            "Every allocation must have a valid amount greater than zero.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | CONTRIBUTION REQUIRES GROUP
      |--------------------------------------------------------------------------
      */

      if (type === "contribution" && !item.group_id) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          success: false,
          message:
            "Group ID is required for contribution allocation.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | SAVING REQUIRES GROUP
      |--------------------------------------------------------------------------
      */

      if (type === "saving" && !item.group_id) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          success: false,
          message:
            "Group ID is required for saving allocation.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | LOAN PAYMENT REQUIRES LOAN ID
      |--------------------------------------------------------------------------
      */

      if (type === "loan_payment" && !item.loan_id) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          success: false,
          message:
            "Loan ID is required for loan payment allocation.",
        });
      }

      totalAllocation += amount;
    }

    /*
    |--------------------------------------------------------------------------
    | CHECK WALLET BALANCE
    |--------------------------------------------------------------------------
    */

    if (totalAllocation > remainingBalance) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance.",
        wallet_balance: remainingBalance,
        requested: totalAllocation,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | PROCESS EACH ALLOCATION
    |--------------------------------------------------------------------------
    */

    const savedAllocations = [];

    for (const item of allocations) {
      const amount = Number(item.amount);
      const type = item.type;

      let referenceId = null;

      /*
      |--------------------------------------------------------------------------
      | CONTRIBUTION
      |--------------------------------------------------------------------------
      */

      if (type === "contribution") {
        const contributionResult = await client.query(
          `
          INSERT INTO contributions
          (
            user_id,
            group_id,
            amount,
            payment_method,
            mpesa_code,
            bank_reference,
            created_by,
            status
          )
          VALUES
          (
            $1,
            $2,
            $3,
            'wallet',
            NULL,
            NULL,
            $4,
            'completed'
          )
          RETURNING *
          `,
          [
            deposit.user_id,
            item.group_id,
            amount,
            allocatedBy,
          ]
        );

        const contribution = contributionResult.rows[0];

        referenceId = contribution.id;
      }

      /*
      |--------------------------------------------------------------------------
      | SAVING
      |--------------------------------------------------------------------------
      */

      if (type === "saving") {
        const savingResult = await client.query(
          `
          INSERT INTO savings
          (
            user_id,
            group_id,
            amount,
            payment_method,
            mpesa_code,
            bank_reference,
            created_by,
            status
          )
          VALUES
          (
            $1,
            $2,
            $3,
            'wallet',
            NULL,
            NULL,
            $4,
            'completed'
          )
          RETURNING *
          `,
          [
            deposit.user_id,
            item.group_id,
            amount,
            allocatedBy,
          ]
        );

        const saving = savingResult.rows[0];

        referenceId = saving.id;
      }

      /*
      |--------------------------------------------------------------------------
      | LOAN PAYMENT
      |--------------------------------------------------------------------------
      |
      | For loan payment:
      |
      | loan_id comes from the request.
      |
      | The controller creates the actual loan payment.
      |
      | The resulting loan_payment.id becomes reference_id.
      |
      |--------------------------------------------------------------------------
      */

      if (type === "loan_payment") {
        /*
        |--------------------------------------------------------------------------
        | GET LOAN
        |--------------------------------------------------------------------------
        */

        const loanResult = await client.query(
          `
          SELECT
            *
          FROM loans
          WHERE id = $1
            AND user_id = $2
          FOR UPDATE
          `,
          [
            item.loan_id,
            deposit.user_id,
          ]
        );

        if (loanResult.rows.length === 0) {
          await client.query("ROLLBACK");

          return res.status(404).json({
            success: false,
            message:
              "Loan not found or does not belong to the wallet owner.",
          });
        }

        const loan = loanResult.rows[0];

        /*
        |--------------------------------------------------------------------------
        | CHECK LOAN STATUS
        |--------------------------------------------------------------------------
        */

        if (
          ["paid", "rejected", "cancelled"].includes(
            String(loan.status).toLowerCase()
          )
        ) {
          await client.query("ROLLBACK");

          return res.status(400).json({
            success: false,
            message:
              `Loan cannot receive a payment because its status is ${loan.status}.`,
          });
        }

        /*
        |--------------------------------------------------------------------------
        | CURRENT LOAN BALANCE
        |--------------------------------------------------------------------------
        */

        const currentBalance = Number(
          loan.balance || 0
        );

        if (currentBalance <= 0) {
          await client.query("ROLLBACK");

          return res.status(400).json({
            success: false,
            message: "This loan has already been fully paid.",
          });
        }

        if (amount > currentBalance) {
          await client.query("ROLLBACK");

          return res.status(400).json({
            success: false,
            message:
              "Loan payment cannot be greater than the outstanding loan balance.",
            loan_balance: currentBalance,
            payment_amount: amount,
          });
        }

        /*
        |--------------------------------------------------------------------------
        | PAYMENT ALLOCATION
        |--------------------------------------------------------------------------
        |
        | IMPORTANT:
        |
        | For now the wallet allocation records the payment against
        | the existing loan balance.
        |
        | Your existing loan-payment engine can be plugged here if
        | you want interest-first / principal-first calculations.
        |
        |--------------------------------------------------------------------------
        */

        const principalPaid = amount;
        const interestPaid = 0;

        const newLoanBalance =
          currentBalance - amount;

        /*
        |--------------------------------------------------------------------------
        | CREATE LOAN PAYMENT
        |--------------------------------------------------------------------------
        */

        const loanPaymentResult = await client.query(
          `
          INSERT INTO loan_payments
          (
            loan_id,
            amount,
            principal_paid,
            interest_paid,
            balance_after,
            payment_method,
            mpesa_code,
            bank_reference,
            status
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            $5,
            'wallet',
            NULL,
            NULL,
            'completed'
          )
          RETURNING *
          `,
          [
            item.loan_id,
            amount,
            principalPaid,
            interestPaid,
            newLoanBalance,
          ]
        );

        const loanPayment =
          loanPaymentResult.rows[0];

        referenceId = loanPayment.id;

        /*
        |--------------------------------------------------------------------------
        | UPDATE LOAN BALANCE
        |--------------------------------------------------------------------------
        */

        await client.query(
          `
          UPDATE loans
          SET balance = $2
          WHERE id = $1
          `,
          [
            item.loan_id,
            newLoanBalance,
          ]
        );

        /*
        |--------------------------------------------------------------------------
        | MARK LOAN PAID IF BALANCE IS ZERO
        |--------------------------------------------------------------------------
        */

        if (newLoanBalance === 0) {
          await client.query(
            `
            UPDATE loans
            SET status = 'paid'
            WHERE id = $1
            `,
            [item.loan_id]
          );
        }
      }

      /*
      |--------------------------------------------------------------------------
      | CREATE WALLET ALLOCATION
      |--------------------------------------------------------------------------
      |
      | reference_id is now the ID of:
      |
      | contribution
      | saving
      | loan_payment
      |
      |--------------------------------------------------------------------------
      */

      const allocationResult = await client.query(
        `
        INSERT INTO wallet_allocations
        (
          wallet_deposit_id,
          allocation_type,
          reference_id,
          amount,
          allocated_by,
          allocation_mode,
          status,
          allocated_at
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          'completed',
          NOW()
        )
        RETURNING *
        `,
        [
          wallet_deposit_id,
          type,
          referenceId,
          amount,
          allocatedBy,
          allocation_mode,
        ]
      );

      savedAllocations.push(
        allocationResult.rows[0]
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CALCULATE NEW WALLET BALANCE
    |--------------------------------------------------------------------------
    */

    const newBalance =
      remainingBalance - totalAllocation;

    /*
    |--------------------------------------------------------------------------
    | UPDATE WALLET REMAINING BALANCE
    |--------------------------------------------------------------------------
    */

    const walletResult = await client.query(
      `
      UPDATE wallet_deposits
      SET remaining_balance = $2
      WHERE id = $1
      RETURNING *
      `,
      [
        wallet_deposit_id,
        newBalance,
      ]
    );

    const updatedWallet =
      walletResult.rows[0];

    /*
    |--------------------------------------------------------------------------
    | COMMIT EVERYTHING
    |--------------------------------------------------------------------------
    */

    await client.query("COMMIT");

    /*
    |--------------------------------------------------------------------------
    | NOTIFY MEMBER
    |--------------------------------------------------------------------------
    */

    try {
      await Notification.createNotification({
        user_id: deposit.user_id,
        title: "Wallet Allocation Completed",
        message:
          `KES ${totalAllocation.toLocaleString()} ` +
          `from your wallet has been allocated successfully.`,
        type: "wallet",
        reference_id: wallet_deposit_id,
      });
    } catch (notificationError) {
      /*
      | Notification failure should NOT undo
      | a successful financial transaction.
      */
      console.error(
        "WALLET ALLOCATION NOTIFICATION ERROR:",
        notificationError
      );
    }

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.status(201).json({
      success: true,

      message:
        "Wallet allocation completed successfully.",

      wallet: updatedWallet,

      allocations: savedAllocations,

      summary: {
        original_balance: remainingBalance,
        allocated_amount: totalAllocation,
        remaining_balance: newBalance,
        allocation_mode,
      },
    });
  } catch (error) {
    /*
    |--------------------------------------------------------------------------
    | ROLLBACK
    |--------------------------------------------------------------------------
    */

    await client.query("ROLLBACK");

    console.error(
      "CREATE WALLET ALLOCATION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to allocate wallet deposit.",
    });
  } finally {
    client.release();
  }
};

/*
|--------------------------------------------------------------------------
| GET ALLOCATIONS FOR A DEPOSIT
|--------------------------------------------------------------------------
*/

const getWalletAllocations = async (req, res) => {
  try {
    const { depositId } = req.params;

    if (!depositId) {
      return res.status(400).json({
        success: false,
        message: "Deposit ID is required.",
      });
    }

    const result = await pool.query(
      `
      SELECT
        wa.*,

        wd.user_id,
        wd.amount AS deposit_amount,
        wd.remaining_balance,
        wd.payment_method,
        wd.mpesa_code,
        wd.bank_reference,
        wd.status AS deposit_status,

        u.fullname AS allocated_by_name,
        u.username AS allocated_by_username

      FROM wallet_allocations wa

      INNER JOIN wallet_deposits wd
        ON wd.id = wa.wallet_deposit_id

      LEFT JOIN users u
        ON u.id = wa.allocated_by

      WHERE wa.wallet_deposit_id = $1

      ORDER BY wa.allocated_at ASC
      `,
      [depositId]
    );

    return res.status(200).json({
      success: true,
      allocations: result.rows,
    });
  } catch (error) {
    console.error(
      "GET WALLET ALLOCATIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

module.exports = {
  createWalletAllocation,
  getWalletAllocations,
};