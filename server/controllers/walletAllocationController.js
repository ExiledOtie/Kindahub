const pool = require("../config/db");

const Notification = require("../models/notificationModel");
const calculateLoanPayment = require("../utils/calculateLoanPayment");

/*
|--------------------------------------------------------------------------
| CREATE WALLET ALLOCATIONS
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| The wallet belongs to a USER.
|
| The wallet deposit already contains:
|
|     wallet_deposits.user_id
|
| Therefore:
|
|     wallet_deposit_id
|             ↓
|         user_id
|             ↓
|     member account
|
| The frontend/admin does NOT provide user_id or group_id.
|
| Supported allocations:
|
|     contribution
|     saving
|     loan_payment
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
    | AUTHENTICATED USER
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
    | VALIDATE WALLET DEPOSIT ID
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
    |
    | FOR UPDATE locks this wallet deposit while allocation is happening.
    |
    | Most importantly:
    |
    | deposit.user_id = OWNER OF THE MONEY
    |
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
      [wallet_deposit_id],
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
    | WALLET OWNER
    |--------------------------------------------------------------------------
    |
    | THIS IS THE IMPORTANT PART.
    |
    | The wallet deposit tells us exactly which member owns the money.
    |
    |--------------------------------------------------------------------------
    */

    const walletOwnerId = deposit.user_id;

    /*
    |--------------------------------------------------------------------------
    | ONLY VERIFIED DEPOSITS CAN BE ALLOCATED
    |--------------------------------------------------------------------------
    */

    if (deposit.status !== "verified") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "Wallet deposit must be verified before it can be allocated.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | GET WALLET BALANCE
    |--------------------------------------------------------------------------
    */

    const remainingBalance = Number(deposit.remaining_balance || 0);

    if (remainingBalance <= 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "This wallet deposit has no remaining balance.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | ALLOWED ALLOCATION TYPES
    |--------------------------------------------------------------------------
    */

    const allowedTypes = ["contribution", "saving", "loan_payment"];

    let totalAllocation = 0;

    /*
    |--------------------------------------------------------------------------
    | VALIDATE ALL ALLOCATIONS BEFORE PROCESSING
    |--------------------------------------------------------------------------
    |
    | Nothing is inserted until every allocation has passed validation.
    |
    |--------------------------------------------------------------------------
    */

    for (const item of allocations) {
      const type = item.type;
      const amount = Number(item.amount || 0);

      /*
      |--------------------------------------------------------------------------
      | VALIDATE TYPE
      |--------------------------------------------------------------------------
      */

      if (!allowedTypes.includes(type)) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          success: false,
          message: `Invalid allocation type: ${type}`,
        });
      }

      /*
      |--------------------------------------------------------------------------
      | VALIDATE AMOUNT
      |--------------------------------------------------------------------------
      */

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
      | CONTRIBUTION
      |--------------------------------------------------------------------------
      |
      | NO GROUP ID.
      |
      | The contribution belongs to:
      |
      |     walletOwnerId
      |
      |--------------------------------------------------------------------------
      */

      if (type === "contribution") {
        /*
        | No group selection.
        |
        | The wallet owner is the member making the contribution.
        */
      }

      /*
      |--------------------------------------------------------------------------
      | SAVING
      |--------------------------------------------------------------------------
      |
      | NO GROUP ID.
      |
      | The saving belongs to:
      |
      |     walletOwnerId
      |
      |--------------------------------------------------------------------------
      */

      if (type === "saving") {
        /*
        | No group selection.
        */
      }

      /*
      |--------------------------------------------------------------------------
      | LOAN PAYMENT
      |--------------------------------------------------------------------------
      */

      if (type === "loan_payment") {
        /*
        |--------------------------------------------------------------------------
        | LOAN ID REQUIRED
        |--------------------------------------------------------------------------
        */

        if (!item.loan_id) {
          await client.query("ROLLBACK");

          return res.status(400).json({
            success: false,
            message: "Loan ID is required for loan payment allocation.",
          });
        }

        /*
        |--------------------------------------------------------------------------
        | VERIFY LOAN BELONGS TO WALLET OWNER
        |--------------------------------------------------------------------------
        |
        | This prevents KD0001 from using KD0001's wallet to pay
        | KD0002's loan.
        |
        |--------------------------------------------------------------------------
        */

        const loanOwnerResult = await client.query(
          `
          SELECT
            id,
            user_id,
            group_id,
            status,
            amount,
            balance,
            total_payable

          FROM loans

          WHERE id = $1
            AND user_id = $2

          LIMIT 1
          `,
          [item.loan_id, walletOwnerId],
        );

        if (loanOwnerResult.rows.length === 0) {
          await client.query("ROLLBACK");

          return res.status(400).json({
            success: false,
            message: "The selected loan does not belong to the wallet owner.",
          });
        }
      }

      /*
      |--------------------------------------------------------------------------
      | ADD TO TOTAL
      |--------------------------------------------------------------------------
      */

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
    | PROCESS ALLOCATIONS
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
      |
      | IMPORTANT:
      |
      | user_id comes from the wallet.
      |
      | We do NOT trust user_id from the frontend.
      |
      |--------------------------------------------------------------------------
      */

      if (type === "contribution") {
        const contributionResult = await client.query(
          `
          INSERT INTO contributions
          (
            user_id,
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
            'wallet',
            NULL,
            NULL,
            $3,
            'completed'
          )

          RETURNING *
          `,
          [walletOwnerId, amount, allocatedBy],
        );

        const contribution = contributionResult.rows[0];

        referenceId = contribution.id;
      }

      /*
      |--------------------------------------------------------------------------
      | SAVING
      |--------------------------------------------------------------------------
      |
      | user_id comes directly from the wallet owner.
      |
      |--------------------------------------------------------------------------
      */

      if (type === "saving") {
        const savingResult = await client.query(
          `
          INSERT INTO savings
          (
            user_id,
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
            'wallet',
            NULL,
            NULL,
            $3,
            'completed'
          )

          RETURNING *
          `,
          [walletOwnerId, amount, allocatedBy],
        );

        const saving = savingResult.rows[0];

        referenceId = saving.id;
      }

      /*
      |--------------------------------------------------------------------------
      | LOAN PAYMENT
      |--------------------------------------------------------------------------
      */

      if (type === "loan_payment") {
        /*
        |--------------------------------------------------------------------------
        | CALCULATE LOAN PAYMENT
        |--------------------------------------------------------------------------
        */

        const calculation = await calculateLoanPayment(
          client,
          item.loan_id,
          amount,
        );

        const loan = calculation.loan;

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
          await client.query("ROLLBACK");

          return res.status(400).json({
            success: false,
            message: `Loan cannot receive a payment because its status is ${loan.status}.`,
          });
        }

        /*
        |--------------------------------------------------------------------------
        | CHECK LOAN BALANCE
        |--------------------------------------------------------------------------
        */

        if (Number(calculation.currentBalance) <= 0) {
          await client.query("ROLLBACK");

          return res.status(400).json({
            success: false,
            message: "This loan has already been fully paid.",
          });
        }

        /*
        |--------------------------------------------------------------------------
        | PREVENT OVERPAYMENT
        |--------------------------------------------------------------------------
        */

        if (Number(calculation.overpayment) > 0) {
          await client.query("ROLLBACK");

          return res.status(400).json({
            success: false,
            message:
              "Loan payment cannot be greater than the outstanding loan balance.",
            loan_balance: calculation.currentBalance,
            payment_amount: amount,
          });
        }

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
            calculation.amountApplied,
            calculation.principalPaid,
            calculation.interestPaid,
            calculation.balanceAfter,
          ],
        );

        const loanPayment = loanPaymentResult.rows[0];

        referenceId = loanPayment.id;

        /*
        |--------------------------------------------------------------------------
        | RECALCULATE LOAN
        |--------------------------------------------------------------------------
        */

        const updatedCalculation = await calculateLoanPayment(
          client,
          item.loan_id,
          0,
        );

        /*
        |--------------------------------------------------------------------------
        | UPDATE LOAN
        |--------------------------------------------------------------------------
        */

        let updatedLoanResult = await client.query(
          `
            UPDATE loans

            SET
              total_payable = $2,
              balance = $3

            WHERE id = $1

            RETURNING *
            `,
          [
            item.loan_id,
            updatedCalculation.totalPayable,
            updatedCalculation.currentBalance,
          ],
        );

        let updatedLoan = updatedLoanResult.rows[0];

        /*
        |--------------------------------------------------------------------------
        | MARK LOAN AS REPAID
        |--------------------------------------------------------------------------
        */

        if (Number(updatedLoan.balance) <= 0) {
          updatedLoanResult = await client.query(
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
            [item.loan_id],
          );

          updatedLoan = updatedLoanResult.rows[0];
        }
      }

      /*
      |--------------------------------------------------------------------------
      | SAFETY CHECK
      |--------------------------------------------------------------------------
      */

      if (!referenceId) {
        await client.query("ROLLBACK");

        return res.status(500).json({
          success: false,
          message: "Failed to create allocation reference.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | CREATE WALLET ALLOCATION
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
        ],
      );

      savedAllocations.push(allocationResult.rows[0]);
    }

    /*
    |--------------------------------------------------------------------------
    | CALCULATE NEW WALLET BALANCE
    |--------------------------------------------------------------------------
    */

    const newBalance = remainingBalance - totalAllocation;

    /*
    |--------------------------------------------------------------------------
    | UPDATE WALLET
    |--------------------------------------------------------------------------
    */

    const walletResult = await client.query(
      `
      UPDATE wallet_deposits

      SET
        remaining_balance = $2

      WHERE id = $1

      RETURNING *
      `,
      [wallet_deposit_id, newBalance],
    );

    const updatedWallet = walletResult.rows[0];

    /*
    |--------------------------------------------------------------------------
    | COMMIT
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
        user_id: walletOwnerId,

        title: "Wallet Allocation Completed",

        message:
          `KES ${totalAllocation.toLocaleString()} ` +
          `from your wallet has been allocated successfully.`,

        type: "wallet",

        reference_id: wallet_deposit_id,
      });
    } catch (notificationError) {
      console.error("WALLET ALLOCATION NOTIFICATION ERROR:", notificationError);
    }

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.status(201).json({
      success: true,

      message: "Wallet allocation completed successfully.",

      wallet: updatedWallet,

      allocations: savedAllocations,

      member: {
        user_id: walletOwnerId,
        fullname: deposit.fullname,
        username: deposit.username,
      },

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

    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("WALLET ALLOCATION ROLLBACK ERROR:", rollbackError);
    }

    console.error("CREATE WALLET ALLOCATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to allocate wallet deposit.",
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
      [depositId],
    );

    return res.status(200).json({
      success: true,
      allocations: result.rows,
    });
  } catch (error) {
    console.error("GET WALLET ALLOCATIONS ERROR:", error);

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
