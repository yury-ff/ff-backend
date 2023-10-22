const Balance = require("../models/Balance");
const Transaction = require("../models/Transactions");
const ReservedBalance = require("../models/ReservedBalance");

require("dotenv").config({ path: "../.env" });

const { ethers, JsonRpcProvider } = require("ethers");

const vesterABI = require("../contracts/VesterABI.json");

const vesterAddress = process.env.VESTER_ADDRESS;
// const provider = new ethers.providers.JsonRpcProvider(
//   `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`
// );
const provider = new ethers.providers.JsonRpcProvider(
  `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`
);

async function updateBalanceOnVesting(wallet, value) {
  const newTransaction = {
    from: wallet,
    to: wallet,
    amount: value,
    description: "Reserved",
  };
  await Transaction.create(newTransaction);

  const reserved = await ReservedBalance.findOne({ wallet: wallet });
  const accountBalance = await Balance.findOne({ wallet: wallet });

  if (!reserved) {
    const newReservedBalance = {
      wallet: wallet,
      balance: parseInt(value),
    };
    await ReservedBalance.create(newReservedBalance);
    accountBalance.balance = accountBalance.balance - parseInt(value);
    await accountBalance.save();
    return;
  }

  reserved.balance = reserved.balance + parseInt(value);
  accountBalance.balance = accountBalance.balance - parseInt(value);
  await reserved.save();
  await accountBalance.save();

  //   reserved.lastTransation =
}
async function updateBalanceOnUnvesting(wallet, value) {
  const newTransaction = {
    from: wallet,
    to: wallet,
    amount: value,
    description: "Released",
  };
  await Transaction.create(newTransaction);

  const reserved = await ReservedBalance.findOne({ wallet: wallet });
  const accountBalance = await Balance.findOne({ wallet: wallet });

  reserved.balance = reserved.balance - parseInt(value);
  accountBalance.balance = accountBalance.balance + parseInt(value);
  await reserved.save();
  await accountBalance.save();
}

const vestingTracker = async () => {
  const contract = new ethers.Contract(vesterAddress, vesterABI, provider);

  contract.on("PairTransfer", (addressFrom, addressTo, value) => {
    console.log("pair minted");

    if (addressFrom == "0x0000000000000000000000000000000000000000") {
      let info = {
        address: addressTo,
        value: ethers.utils.formatUnits(value, 12),
      };

      updateBalanceOnVesting(info.address, parseInt(info.value));
      return;
    }

    if (addressTo == "0x0000000000000000000000000000000000000000") {
      let info = {
        address: addressFrom,
        value: ethers.utils.formatUnits(value, 12),
      };
      updateBalanceOnUnvesting(info.address, parseInt(info.value));

      return;
    }
    // updateBalanceOnVesting(info.address, info.value);
  });
};

module.exports = vestingTracker;
