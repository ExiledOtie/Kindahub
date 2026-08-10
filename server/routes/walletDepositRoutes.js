
const router = require("express").Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createMyWalletDeposit,
  adminWalletDeposit,
  getAllWalletDeposits,
  getMyWalletDeposits,
  getWalletDeposit,
  verifyWalletDeposit,
  rejectWalletDeposit,
} = require("../controllers/walletDepositController");

/*
|--------------------------------------------------------------------------
| MEMBER WALLET DEPOSITS
|--------------------------------------------------------------------------
*/

/*
| Submit wallet deposit
| POST /api/wallet-deposits/my
*/
router.post(
  "/my",
  authMiddleware,
  createMyWalletDeposit
);

/*
| Get logged-in member's wallet deposits
| GET /api/wallet-deposits/my
*/
router.get(
  "/my",
  authMiddleware,
  getMyWalletDeposits
);

/*
|--------------------------------------------------------------------------
| ADMIN WALLET DEPOSITS
|--------------------------------------------------------------------------
*/

/*
| Get all wallet deposits
| GET /api/wallet-deposits
*/
router.get(
  "/",
  authMiddleware,
  getAllWalletDeposits
);

/*
| Admin adds money directly to a member wallet
| POST /api/wallet-deposits/admin
*/
router.post(
  "/admin",
  authMiddleware,
  adminWalletDeposit
);

/*
| Get single wallet deposit
| GET /api/wallet-deposits/:id
*/
router.get(
  "/:id",
  authMiddleware,
  getWalletDeposit
);

/*
| Verify wallet deposit
| PATCH /api/wallet-deposits/:id/verify
*/
router.patch(
  "/:id/verify",
  authMiddleware,
  verifyWalletDeposit
);

/*
| Reject wallet deposit
| PATCH /api/wallet-deposits/:id/reject
*/
router.patch(
  "/:id/reject",
  authMiddleware,
  rejectWalletDeposit
);

module.exports = router;

