const pool = require("../config/db");

const {
  createWalletDepositModel,
  paymentReferenceExistsModel,
} = require("../models/walletDepositModel");

const Notification = require("../models/notificationModel");
const WalletDeposit = require("../models/walletDepositModel");
const Notification = require("../models/notificationModel");

/*
|--------------------------------------------------------------------------
| MEMBER DEPOSIT TO WALLET
|--------------------------------------------------------------------------
*/

const createMyWalletDeposit = async (req, res) => {
  try {
    const { amount, payment_method, mpesa_code, bank_reference, notes } =
      req.body;

    const userId = req.user.id;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        message: "Invalid amount",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | DUPLICATE MPESA / BANK CODE
    |--------------------------------------------------------------------------
    */

    if (payment_method === "mpesa") {
      if (!mpesa_code) {
        return res.status(400).json({
          message: "Mpesa code is required",
        });
      }

      const exists = await paymentReferenceExistsModel("mpesa", mpesa_code);

      if (exists) {
        return res.status(400).json({
          message: "Mpesa code already used",
        });
      }
    }

    if (payment_method === "bank") {
      if (!bank_reference) {
        return res.status(400).json({
          message: "Bank reference is required",
        });
      }

      const exists = await paymentReferenceExistsModel("bank", bank_reference);

      if (exists) {
        return res.status(400).json({
          message: "Bank reference already used",
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | SAVE DEPOSIT
    |--------------------------------------------------------------------------
    */

    const deposit = await createWalletDepositModel({
      userId,
      amount,
      paymentMethod: payment_method,
      mpesaCode: mpesa_code,
      bankReference: bank_reference,
      notes,
      status: "pending",
      source: "member",
    });

    /*
    |--------------------------------------------------------------------------
    | GET MEMBER NAME
    |--------------------------------------------------------------------------
    */

    const member = await pool.query(
      `
      SELECT fullname
      FROM users
      WHERE id=$1
      `,
      [userId],
    );

    /*
    |--------------------------------------------------------------------------
    | NOTIFY ADMINS
    |--------------------------------------------------------------------------
    */

    const admins = await pool.query(
      `
      SELECT id
      FROM users
      WHERE is_super_admin=true
      `,
    );

    for (const admin of admins.rows) {
      await Notification.createNotification({
        user_id: admin.id,
        title: "Wallet Deposit Submitted",
        message: `${member.rows[0].fullname} deposited KES ${Number(
          amount,
        ).toLocaleString()} awaiting verification.`,
        type: "wallet",
        reference_id: deposit.id,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Wallet deposit submitted successfully. Awaiting verification.",
      deposit,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const createWalletDeposit = async (req, res) => {
  try {
    const { amount, payment_method, mpesa_code, bank_reference, notes } =
      req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        message: "Invalid amount",
      });
    }

    if (payment_method === "mpesa" && !mpesa_code) {
      return res.status(400).json({
        message: "Mpesa code required",
      });
    }

    if (payment_method === "bank" && !bank_reference) {
      return res.status(400).json({
        message: "Bank reference required",
      });
    }

    /*
    ----------------------------------------------------
    Prevent duplicate Mpesa / Bank reference
    ----------------------------------------------------
    */

    const duplicate = await WalletDeposit.checkDuplicateReference(
      payment_method,
      mpesa_code,
      bank_reference,
    );

    if (duplicate) {
      return res.status(400).json({
        message: "This payment reference has already been used.",
      });
    }

    const deposit = await WalletDeposit.createWalletDeposit(
      req.user.id,
      amount,
      payment_method,
      mpesa_code,
      bank_reference,
      notes,
      "member",
    );

    /*
    ----------------------------------------------------
    Notify Super Admins
    ----------------------------------------------------
    */

    const admins = await pool.query(`
        SELECT id
        FROM users
        WHERE is_super_admin=true
    `);

    for (const admin of admins.rows) {
      await Notification.createNotification({
        user_id: admin.id,
        title: "Wallet Deposit",
        message: `${req.user.fullname} submitted a wallet deposit of KES ${Number(amount).toLocaleString()}`,
        type: "wallet",
        reference_id: deposit.id,
      });
    }

    res.status(201).json({
      success: true,
      message: "Deposit submitted successfully. Awaiting verification.",
      deposit,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const adminWalletDeposit = async (req, res) => {
  try {
    const {
      user_id,
      amount,
      payment_method,
      mpesa_code,
      bank_reference,
      notes,
    } = req.body;

    const duplicate = await WalletDeposit.checkDuplicateReference(
      payment_method,
      mpesa_code,
      bank_reference,
    );

    if (duplicate) {
      return res.status(400).json({
        message: "Payment reference already exists.",
      });
    }

    const deposit = await WalletDeposit.createWalletDeposit(
      user_id,
      amount,
      payment_method,
      mpesa_code,
      bank_reference,
      notes,
      "admin",
    );

    await WalletDeposit.verifyWalletDeposit(deposit.id, req.user.id);

    res.status(201).json({
      success: true,
      message: "Wallet funded successfully.",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
const verifyWalletDeposit = async (req, res) => {
  try {
    const deposit = await WalletDeposit.verifyWalletDeposit(
      req.params.id,
      req.user.id,
    );

    if (!deposit) {
      return res.status(404).json({
        message: "Deposit not found",
      });
    }

    await Notification.createNotification({
      user_id: deposit.user_id,
      title: "Wallet Deposit Verified",
      message: `Your wallet deposit of KES ${Number(
        deposit.amount,
      ).toLocaleString()} has been verified.`,
      type: "wallet",
      reference_id: deposit.id,
    });

    res.json({
      success: true,
      message: "Deposit verified successfully.",
      deposit,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
const rejectWalletDeposit = async (req, res) => {
  try {
    const deposit = await WalletDeposit.rejectWalletDeposit(
      req.params.id,
      req.user.id,
    );

    if (!deposit) {
      return res.status(404).json({
        message: "Deposit not found",
      });
    }

    await Notification.createNotification({
      user_id: deposit.user_id,
      title: "Wallet Deposit Rejected",
      message: `Your wallet deposit of KES ${Number(
        deposit.amount,
      ).toLocaleString()} was rejected.`,
      type: "wallet",
      reference_id: deposit.id,
    });

    res.json({
      success: true,
      message: "Deposit rejected.",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createMyWalletDeposit,
  createWalletDeposit,
  adminWalletDeposit,
  verifyWalletDeposit,
  rejectWalletDeposit,
};
