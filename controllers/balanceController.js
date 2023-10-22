const Balance = require("../models/Balance");
const Transaction = require("../models/Transactions");

const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const getAllBalances = async (req, res) => {
  const balances = await Balance.find({})
    .select("-__v")
    .select("-_id")
    .select("-userId");

  res.status(StatusCodes.OK).json(balances);
};

const getBalance = async (req, res) => {
  const {
    params: { wallet: wallet },
  } = req;
  const balance = await Balance.findOne({ wallet: wallet })
    .select("-__v")
    .select("-_id")
    .select("-userId");

  res.status(StatusCodes.OK).json(balance.balance);
};

const validateBalanceTo = async (req, res) => {
  const { walletTo } = req.body;

  const balanceTo = await Balance.findOne({ wallet: walletTo });

  if (!balanceTo) {
    res.status(StatusCodes.BAD_REQUEST).json({ msg: "No User found" });
  } else {
    res.status(StatusCodes.OK).json({ msg: "Success! User found." });
  }
};

const transferBalance = async (req, res) => {
  const { walletTo, amount } = req.body;

  if (!amount || amount == 0) {
    throw new CustomError.BadRequestError("Try again...");
  }
  const convertedAmount = parseInt(amount) * 1000000;

  const balanceFrom = await Balance.findOne({ wallet: req.user });
  const balanceTo = await Balance.findOne({ wallet: walletTo });

  if (req.user == walletTo) {
    throw new CustomError.BadRequestError("Cannot send to yourself...");
  }

  if (!balanceTo) {
    throw new CustomError.BadRequestError("Invalid details...");
  }

  if (balanceFrom.balance >= convertedAmount) {
    balanceFrom.balance = balanceFrom.balance - convertedAmount;
    balanceTo.balance = balanceTo.balance + convertedAmount;
    await balanceFrom.save();
    await balanceTo.save();
    const newTransaction = {
      from: req.user,
      to: walletTo,
      amount: convertedAmount,
    };
    await Transaction.create(newTransaction);
    res.status(StatusCodes.OK).json({ msg: "Success! Transfer confirmed." });
  } else {
    res.status(StatusCodes.BAD_REQUEST).json({ msg: "Not enough balance" });
  }
};

module.exports = {
  getAllBalances,
  getBalance,
  transferBalance,
  validateBalanceTo,
};
