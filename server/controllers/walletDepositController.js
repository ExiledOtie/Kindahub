
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
| MEMBER CREATE WALLET DEPOSIT
|--------------------------------------------------------------------------
|
| Member submits money into the wallet.
| Deposit starts as PENDING and must be verified by Super Admin.
|
|--------------------------------------------------------------------------
*/

const createMyWalletDeposit = async (req, res) => {
  try {
    const {
      amount,
      payment_method,
      mpesa_code,
      bank_reference,
    } = req.body;

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
    | CHECK DUPLICATE REFERENCE
    |--------------------------------------------------------------------------
    */

    const duplicate =
      await checkDuplicateWalletReferenceModel(
        payment_method,
        mpesa_code,
        bank_reference
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
    */

    const deposit = await createWalletDepositModel(
      userId,
      Number(amount),
      payment_method,
      mpesa_code || null,
      bank_reference || null,
      "member"
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
      [userId]
    );

    const memberName =
      memberResult.rows[0]?.fullname || "Member";

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
      `
    );

    for (const admin of admins.rows) {
      await Notification.createNotification({
        user_id: admin.id,
        title: "Wallet Deposit Submitted",
        message: `${memberName} submitted a wallet deposit of KES ${Number(
          amount
        ).toLocaleString()} awaiting verification.`,
        type: "wallet",
        reference_id: deposit.id,
      });
    }

    return res.status(201).json({
      success: true,
      message:
        "Wallet deposit submitted successfully. Awaiting verification.",
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
| Admin-created deposits are automatically verified.
|
|--------------------------------------------------------------------------
*/

const adminWalletDeposit = async (req, res) => {
  try {
    const {
      user_id,
      amount,
      payment_method,
      mpesa_code,
      bank_reference,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User is required.",
      });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount.",
      });
    }

    if (!["mpesa", "bank", "cash"].includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method.",
      });
    }

    if (payment_method === "mpesa" && !mpesa_code) {
      return res.status(400).json({
        success: false,
        message: "Mpesa code is required.",
      });
    }

    if (payment_method === "bank" && !bank_reference) {
      return res.status(400).json({
        success: false,
        message: "Bank reference is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CHECK DUPLICATE REFERENCE
    |--------------------------------------------------------------------------
    */

    const duplicate =
      await checkDuplicateWalletReferenceModel(
        payment_method,
        mpesa_code,
        bank_reference
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
    */

    const deposit = await createWalletDepositModel(
      user_id,
      Number(amount),
      payment_method,
      mpesa_code || null,
      bank_reference || null,
      "admin"
    );

    /*
    |--------------------------------------------------------------------------
    | AUTO VERIFY ADMIN DEPOSIT
    |--------------------------------------------------------------------------
    */

    const verifiedDeposit =
      await verifyWalletDepositModel(
        deposit.id,
        req.user.id
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
        amount
      ).toLocaleString()} by the administrator.`,
      type: "wallet",
      reference_id: deposit.id,
    });

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
    const deposits =
      await getMyWalletDepositsModel(req.user.id);

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
    const deposit =
      await getWalletDepositModel(req.params.id);

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
    const deposit =
      await getWalletDepositModel(req.params.id);

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
        message:
          "A rejected wallet deposit cannot be verified.",
      });
    }

    const verifiedDeposit =
      await verifyWalletDepositModel(
        deposit.id,
        req.user.id
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
        verifiedDeposit.amount
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
    const deposit =
      await getWalletDepositModel(req.params.id);

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: "Wallet deposit not found.",
      });
    }

    if (deposit.status === "verified") {
      return res.status(400).json({
        success: false,
        message:
          "A verified wallet deposit cannot be rejected.",
      });
    }

    if (deposit.status === "rejected") {
      return res.status(400).json({
        success: false,
        message: "Wallet deposit is already rejected.",
      });
    }

    const rejectedDeposit =
      await rejectWalletDepositModel(
        deposit.id,
        req.body.notes || null
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
        rejectedDeposit.amount
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

