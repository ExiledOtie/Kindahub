const router = require("express").Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createWalletAllocation,
  getWalletAllocations,
} = require("../controllers/walletAllocationController");

/*
|--------------------------------------------------------------------------
| CREATE WALLET ALLOCATION
|--------------------------------------------------------------------------
|
| POST /api/wallet-allocations
|
*/

router.post("/", authMiddleware, createWalletAllocation);

/*
|--------------------------------------------------------------------------
| GET ALLOCATIONS FOR A WALLET DEPOSIT
|--------------------------------------------------------------------------
|
| GET /api/wallet-allocations/deposit/:depositId
|
*/

router.get("/deposit/:depositId", authMiddleware, getWalletAllocations);

module.exports = router;
