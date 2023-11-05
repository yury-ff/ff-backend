const CustomError = require("../errors");
const ethers = require("ethers");
const Balance = require("../models/Balance");

const authenticateUser = async (req, res, next) => {
  const { account, signedMessage } = req.body;

  try {
    const existingBalance = await Balance.findOne({
      wallet: account,
    });

    if (!existingBalance) {
      throw new CustomError.UnauthenticatedError("Make a deposit first");
    }
    const unsignedMessage = process.env.SECRET_SIGN_STRING;

    const payload = ethers.utils.defaultAbiCoder.encode(
      ["string"],
      [unsignedMessage]
    );
    const payloadHash = ethers.utils.keccak256(payload);

    const fullyExpandedSig = ethers.utils.splitSignature(signedMessage);

    const signingAddress = ethers.utils.verifyMessage(
      ethers.utils.arrayify(payloadHash),
      fullyExpandedSig
    );

    if (account != signingAddress) {
      throw new CustomError.UnauthenticatedError("Authentication Invalid");
    }

    req.user = signingAddress;
    next();
  } catch (error) {
    console.log(error);
    throw new CustomError.UnauthenticatedError(error);
  }
};

module.exports = {
  authenticateUser,
};
