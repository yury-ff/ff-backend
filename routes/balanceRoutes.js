const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/authentication");
const {
  getAllBalances,
  getBalance,
  transferBalance,
  validateBalanceTo,
} = require("../controllers/balanceController");

router.route("/").get(getAllBalances);
router.route("/:wallet").get(getBalance);
router.route("/validateBalanceTo").post(validateBalanceTo);
router.route("/transferBalance").patch(authenticateUser, transferBalance);

module.exports = router;
