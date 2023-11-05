const mongoose = require("mongoose");

const BalanceSchema = new mongoose.Schema({
  wallet: {
    type: String,
    default: "",
  },
  balance: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Balance", BalanceSchema);
