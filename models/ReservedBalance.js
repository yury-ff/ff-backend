const mongoose = require("mongoose");

const ReservedBalanceSchema = new mongoose.Schema(
  {
    wallet: {
      type: String,
      default: "",
    },
    balance: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReservedBalance", ReservedBalanceSchema);
