const pool = require("../config/db");

const {
  createWalletDepositModel,
  getAllWalletDepositsModel,
  getMyWalletDepositsModel,
  getWalletDepositModel,
  verifyWalletDepositModel,
  rejectWalletDepositModel,
  checkDuplicateWalletReferenceModel,
} = require("../models/walletDepositModel");

const Notification = require("../models/notificationModel");

/*
|--------------------------------------------------------------------------
| GET USER GROUP
|--------------------------------------------------------------------------
|
| Automatically determines the group belonging to the user.
|
| IMPORTANT:
|
| We do NOT ask the frontend/admin to select a group.
|
| If the user belongs to exactly one group, that group is automatically
| assigned to the wallet deposit.
|
|--------------------------------------------------------------------------
*/

const getUserGroupId = async (userId) => {
  const result = await pool.query(
    `
    SELECT group_id
    FROM user_groups
    WHERE user_id = $1
    ORDER BY group_id
    `,
    [userId],
  );

  /*
  |--------------------------------------------------------------------------
  | USER HAS NO GROUP
  |--------------------------------------------------------------------------
  */

  if (result.rows.length === 0) {
    return {
      groupId: null,
      error: "This user is not assigned to any group.",
    };
  }

  /*
  |--------------------------------------------------------------------------
  | USER BELONGS TO MORE THAN ONE GROUP
  |--------------------------------------------------------------------------
  |
  | We deliberately do not randomly choose a group.
  |
  | A wallet transaction must belong to the correct group.
  |
  */

  if (result.rows.length > 1) {
    return {
      groupId: null,
      error:
        "This user belongs to more than one group. The wallet deposit cannot determine the correct group automatically.",
    };
  }

  /*
  |--------------------------------------------------------------------------
  | USER HAS ONE GROUP
  |--------------------------------------------------------------------------
  */

  return {
    groupId: result.rows[0].group_id,
    error: null,
  };
};

/*
|--------------------------------------------------------------------------
| MEMBER CREATE WALLET DEPOSIT
|--------------------------------------------------------------------------
|
| Member submits money into the wallet.
|
| The member does NOT select a group.
|
| The backend automatically gets the member's group from user_groups.
|
| Deposit starts as PENDING and must be verified by Super Admin.
|
|--------------------------------------------------------------------------
*/

const createMyWalletDeposit = async (req, res) => {
  try {
    const { amount, payment_method, mpesa_code, bank_reference } = req.body;

    const userId = req.user.id;

    /*
    |--------------------------------------------------------------------------
    | VALIDATE AMOUNT
    |--------------------------------------------------------------------------
    */

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE PAYMENT METHOD
    |--------------------------------------------------------------------------
    */

    if (!["mpesa", "bank", "cash"].includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | MPESA VALIDATION
    |--------------------------------------------------------------------------
    */

    if (payment_method === "mpesa" && !mpesa_code) {
      return res.status(400).json({
        success: false,
        message: "Mpesa code is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | BANK VALIDATION
    |--------------------------------------------------------------------------
    */

    if (payment_method === "bank" && !bank_reference) {
      return res.status(400).json({
        success: false,
        message: "Bank reference is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | GET MEMBER GROUP AUTOMATICALLY
    |--------------------------------------------------------------------------
    */

    const { groupId, error: groupError } = await getUserGroupId(userId);

    if (groupError) {
      return res.status(400).json({
        success: false,
        message: groupError,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CHECK DUPLICATE REFERENCE
    |--------------------------------------------------------------------------
    */

    const duplicate = await checkDuplicateWalletReferenceModel(
      payment_method,
      mpesa_code,
      bank_reference,
    );

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "This payment reference has already been used.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE DEPOSIT
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    |
    | groupId is now automatically supplied to the model.
    |
    */

    const deposit = await createWalletDepositModel(
      userId,
      groupId,
      Number(amount),
      payment_method,
      mpesa_code || null,
      bank_reference || null,
      "member",
    );

    /*
    |--------------------------------------------------------------------------
    | GET MEMBER
    |--------------------------------------------------------------------------
    */

    const memberResult = await pool.query(
      `
      SELECT fullname
      FROM users
      WHERE id = $1
      `,
      [userId],
    );

    const memberName = memberResult.rows[0]?.fullname || "Member";

    /*
    |--------------------------------------------------------------------------
    | NOTIFY SUPER ADMINS
    |--------------------------------------------------------------------------
    */

    const admins = await pool.query(
      `
      SELECT id
      FROM users
      WHERE is_super_admin = true
      `,
    );

    for (const admin of admins.rows) {
      await Notification.createNotification({
        user_id: admin.id,
        title: "Wallet Deposit Submitted",
        message: `${memberName} submitted a wallet deposit of KES ${Number(
          amount,
        ).toLocaleString()} awaiting verification.`,
        type: "wallet",
        reference_id: deposit.id,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.status(201).json({
      success: true,
      message: "Wallet deposit submitted successfully. Awaiting verification.",
      deposit,
    });
  } catch (error) {
    console.error("CREATE MY WALLET DEPOSIT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create wallet deposit.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN CREATE WALLET DEPOSIT
|--------------------------------------------------------------------------
|
| Super Admin funds a member's wallet.
|
| IMPORTANT:
|
| Admin does NOT select a group.
|
| The backend automatically finds the selected user's group.
|
| Admin-created deposits are automatically verified.
|
|--------------------------------------------------------------------------
*/

const adminWalletDeposit = async (req, res) => {
  try {
    const { user_id, amount, payment_method, mpesa_code, bank_reference } =
      req.body;

    /*
    |--------------------------------------------------------------------------
    | VALIDATE USER
    |--------------------------------------------------------------------------
    */

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE AMOUNT
    |--------------------------------------------------------------------------
    */

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE PAYMENT METHOD
    |--------------------------------------------------------------------------
    */

    if (!["mpesa", "bank", "cash"].includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | MPESA VALIDATION
    |--------------------------------------------------------------------------
    */

    if (payment_method === "mpesa" && !mpesa_code) {
      return res.status(400).json({
        success: false,
        message: "Mpesa code is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | BANK VALIDATION
    |--------------------------------------------------------------------------
    */

    if (payment_method === "bank" && !bank_reference) {
      return res.status(400).json({
        success: false,
        message: "Bank reference is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CHECK USER GROUP AUTOMATICALLY
    |--------------------------------------------------------------------------
    |
    | The admin only chooses the member.
    |
    | We determine the group from that member.
    |
    */

    const { groupId, error: groupError } = await getUserGroupId(user_id);

    if (groupError) {
      return res.status(400).json({
        success: false,
        message: groupError,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CHECK DUPLICATE REFERENCE
    |--------------------------------------------------------------------------
    */

    const duplicate = await checkDuplicateWalletReferenceModel(
      payment_method,
      mpesa_code,
      bank_reference,
    );

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "This payment reference has already been used.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE DEPOSIT
    |--------------------------------------------------------------------------
    |
    | groupId is automatically assigned.
    |
    */

    const deposit = await createWalletDepositModel(
      user_id,
      groupId,
      Number(amount),
      payment_method,
      mpesa_code || null,
      bank_reference || null,
      "admin",
    );

    /*
    |--------------------------------------------------------------------------
    | AUTO VERIFY ADMIN DEPOSIT
    |--------------------------------------------------------------------------
    */

    const verifiedDeposit = await verifyWalletDepositModel(
      deposit.id,
      req.user.id,
    );

    /*
    |--------------------------------------------------------------------------
    | NOTIFY MEMBER
    |--------------------------------------------------------------------------
    */

    await Notification.createNotification({
      user_id: user_id,
      title: "Wallet Funded",
      message: `Your wallet has been funded with KES ${Number(
        amount,
      ).toLocaleString()} by the administrator.`,
      type: "wallet",
      reference_id: deposit.id,
    });

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.status(201).json({
      success: true,
      message: "Wallet funded successfully.",
      deposit: verifiedDeposit,
    });
  } catch (error) {
    console.error("ADMIN WALLET DEPOSIT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fund wallet.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL WALLET DEPOSITS
|--------------------------------------------------------------------------
*/

const getAllWalletDeposits = async (req, res) => {
  try {
    const deposits = await getAllWalletDepositsModel();

    return res.status(200).json({
      success: true,
      deposits,
    });
  } catch (error) {
    console.error("GET ALL WALLET DEPOSITS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch wallet deposits.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET MY WALLET DEPOSITS
|--------------------------------------------------------------------------
*/

const getMyWalletDeposits = async (req, res) => {
  try {
    const deposits = await getMyWalletDepositsModel(req.user.id);

    return res.status(200).json({
      success: true,
      deposits,
    });
  } catch (error) {
    console.error("GET MY WALLET DEPOSITS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch wallet deposits.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE WALLET DEPOSIT
|--------------------------------------------------------------------------
*/

const getWalletDeposit = async (req, res) => {
  try {
    const deposit = await getWalletDepositModel(req.params.id);

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: "Wallet deposit not found.",
      });
    }

    return res.status(200).json({
      success: true,
      deposit,
    });
  } catch (error) {
    console.error("GET WALLET DEPOSIT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch wallet deposit.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| VERIFY WALLET DEPOSIT
|--------------------------------------------------------------------------
|
| Only a verified deposit can later be allocated.
|
|--------------------------------------------------------------------------
*/

const verifyWalletDeposit = async (req, res) => {
  try {
    const deposit = await getWalletDepositModel(req.params.id);

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: "Wallet deposit not found.",
      });
    }

    if (deposit.status === "verified") {
      return res.status(400).json({
        success: false,
        message: "Wallet deposit is already verified.",
      });
    }

    if (deposit.status === "rejected") {
      return res.status(400).json({
        success: false,
        message: "A rejected wallet deposit cannot be verified.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | SAFETY CHECK
    |--------------------------------------------------------------------------
    |
    | Older deposits may have been created before group_id was implemented.
    |
    | Do not allow a deposit with no group to be verified.
    |
    */

    if (!deposit.group_id) {
      const { groupId, error: groupError } = await getUserGroupId(
        deposit.user_id,
      );

      if (groupError) {
        return res.status(400).json({
          success: false,
          message: groupError,
        });
      }

      await pool.query(
        `
        UPDATE wallet_deposits
        SET group_id = $1
        WHERE id = $2
        `,
        [groupId, deposit.id],
      );
    }

    const verifiedDeposit = await verifyWalletDepositModel(
      deposit.id,
      req.user.id,
    );

    /*
    |--------------------------------------------------------------------------
    | NOTIFY MEMBER
    |--------------------------------------------------------------------------
    */

    await Notification.createNotification({
      user_id: verifiedDeposit.user_id,
      title: "Wallet Deposit Verified",
      message: `Your wallet deposit of KES ${Number(
        verifiedDeposit.amount,
      ).toLocaleString()} has been verified.`,
      type: "wallet",
      reference_id: verifiedDeposit.id,
    });

    return res.status(200).json({
      success: true,
      message: "Wallet deposit verified successfully.",
      deposit: verifiedDeposit,
    });
  } catch (error) {
    console.error("VERIFY WALLET DEPOSIT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify wallet deposit.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| REJECT WALLET DEPOSIT
|--------------------------------------------------------------------------
*/

const rejectWalletDeposit = async (req, res) => {
  try {
    const deposit = await getWalletDepositModel(req.params.id);

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: "Wallet deposit not found.",
      });
    }

    if (deposit.status === "verified") {
      return res.status(400).json({
        success: false,
        message: "A verified wallet deposit cannot be rejected.",
      });
    }

    if (deposit.status === "rejected") {
      return res.status(400).json({
        success: false,
        message: "Wallet deposit is already rejected.",
      });
    }

    const rejectedDeposit = await rejectWalletDepositModel(
      deposit.id,
      req.body.notes || null,
    );

    /*
    |--------------------------------------------------------------------------
    | NOTIFY MEMBER
    |--------------------------------------------------------------------------
    */

    await Notification.createNotification({
      user_id: rejectedDeposit.user_id,
      title: "Wallet Deposit Rejected",
      message: `Your wallet deposit of KES ${Number(
        rejectedDeposit.amount,
      ).toLocaleString()} was rejected.`,
      type: "wallet",
      reference_id: rejectedDeposit.id,
    });

    return res.status(200).json({
      success: true,
      message: "Wallet deposit rejected.",
      deposit: rejectedDeposit,
    });
  } catch (error) {
    console.error("REJECT WALLET DEPOSIT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject wallet deposit.",
    });
  }
};

module.exports = {
  createMyWalletDeposit,
  adminWalletDeposit,
  getAllWalletDeposits,
  getMyWalletDeposits,
  getWalletDeposit,
  verifyWalletDeposit,
  rejectWalletDeposit,
};
