const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    from: {
      type: String,
    },
    to: {
      type: String,
    },
    amount: {
      type: Number,
    },
    description: {
      type: String,
      default: "Transfer",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
