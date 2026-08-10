
const pool = require("../config/db");

const {
  getWalletDepositModel,
  updateRemainingBalanceModel,
} = require("../models/walletDepositModel");

const {
  createWalletAllocationModel,
  getAllocationsByDepositModel,
} = require("../models/walletAllocationModel");

/*
|--------------------------------------------------------------------------
| CREATE WALLET ALLOCATIONS
|--------------------------------------------------------------------------
*/

const createWalletAllocation = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      wallet_deposit_id,
      allocations,
      allocation_mode = "manual",
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | CURRENT USER
    |--------------------------------------------------------------------------
    */

    const allocatedBy = req.user?.id;

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
    | GET WALLET
    |--------------------------------------------------------------------------
    */

    const deposit = await getWalletDepositModel(wallet_deposit_id);

    if (!deposit) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Wallet deposit not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | ONLY VERIFIED WALLET CAN BE USED
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
    | VALID ALLOCATION TYPES
    |--------------------------------------------------------------------------
    */

    const allowedTypes = [
      "contribution",
      "saving",
      "loan_payment",
    ];

    let totalAllocation = 0;

    /*
    |--------------------------------------------------------------------------
    | VALIDATE EACH ALLOCATION
    |--------------------------------------------------------------------------
    */

    for (const item of allocations) {
      const type = item.type;
      const amount = Number(item.amount || 0);

      /*
      | Validate type
      */

      if (!allowedTypes.includes(type)) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          success: false,
          message: `Invalid allocation type: ${type}`,
        });
      }

      /*
      | Validate amount
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
      | Loan payment requires reference
      |
      | For now this should be the loan payment transaction ID
      | once the payment is actually created.
      */

      if (type === "loan_payment" && !item.reference_id) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          success: false,
          message:
            "Reference ID is required for loan payment allocation.",
        });
      }

      totalAllocation += amount;
    }

    /*
    |--------------------------------------------------------------------------
    | CHECK WALLET BALANCE
    |--------------------------------------------------------------------------
    */

    const remainingBalance = Number(
      deposit.remaining_balance || 0
    );

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
    | CREATE ALLOCATIONS
    |--------------------------------------------------------------------------
    */

    const savedAllocations = [];

    for (const item of allocations) {
      const allocation =
        await createWalletAllocationModel(
          wallet_deposit_id,
          item.type,
          Number(item.amount),
          allocatedBy,
          item.reference_id || null,
          allocation_mode
        );

      savedAllocations.push(allocation);
    }

    /*
    |--------------------------------------------------------------------------
    | CALCULATE NEW BALANCE
    |--------------------------------------------------------------------------
    */

    const newBalance =
      remainingBalance - totalAllocation;

    /*
    |--------------------------------------------------------------------------
    | UPDATE WALLET BALANCE
    |--------------------------------------------------------------------------
    */

    const updatedWallet =
      await updateRemainingBalanceModel(
        wallet_deposit_id,
        newBalance
      );

    /*
    |--------------------------------------------------------------------------
    | COMMIT
    |--------------------------------------------------------------------------
    */

    await client.query("COMMIT");

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

    const allocations =
      await getAllocationsByDepositModel(
        depositId
      );

    return res.status(200).json({
      success: true,
      allocations,
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

