const Balance = require("../models/Balance");
const Transaction = require("../models/Transactions");

require("dotenv").config({ path: "../.env" });

const { ethers, JsonRpcProvider } = require("ethers");

const RewardRouterABI = require("../contracts/RewardRouter.json");

const bankAddress = process.env.BANK_ADDRESS;
const rewardRouter = process.env.REWARD_ROUTER;

// const provider = new ethers.providers.JsonRpcProvider(
//   `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`
// );
const provider = new ethers.providers.JsonRpcProvider(
  `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`
);

const fee = 50;
const bps = 10000;
const postFee = bps - fee;

async function updateBalanceOnDeposit(wallet, value) {
  const newTransaction = {
    from: wallet,
    to: wallet,
    amount: value,
    description: "Deposit",
  };
  await Transaction.create(newTransaction);

  const accountBalance = await Balance.findOne({ wallet: wallet });
  if (!accountBalance) {
    const newAccountBalance = {
      wallet: wallet,
      balance: parseInt(value),
    };
    await Balance.create(newAccountBalance);
    return;
  }
  if (accountBalance) {
    accountBalance.balance = accountBalance.balance + parseInt(value);
    await accountBalance.save();
    return;
  }
}
async function updateBalanceOnWithdrawal(wallet, value) {
  const newTransaction = {
    from: wallet,
    to: wallet,
    amount: value,
    description: "Withdrawal",
  };
  await Transaction.create(newTransaction);

  const accountBalance = await Balance.findOne({ wallet: wallet });

  accountBalance.balance = accountBalance.balance - parseInt(value);

  await accountBalance.save();
  return;
}

const transactionTracker = async () => {
  const contract = new ethers.Contract(rewardRouter, RewardRouterABI, provider);
  contract.on("DepositUsdc", (address, value) => {
    console.log("dep received");
    const postFeeValue = (value * postFee) / bps;
    let info = {
      address: address,
      value: JSON.parse(postFeeValue, null, 2),
    };

    updateBalanceOnDeposit(info.address, info.value);
  });

  contract.on("WithdrawUsdc", (address, value) => {
    let info = {
      address: address,
      value: JSON.parse(value, null, 2),
    };

    updateBalanceOnWithdrawal(info.address, info.value);
  });
};

module.exports = transactionTracker;
