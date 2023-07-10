require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    fuji: {
      url: process.env.REACT_APP_PREF_NETWORK_RPC_URL,
      chainId: parseInt(process.env.REACT_APP_PREF_NETWORK_CHAIN_ID),
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  solidity: {
    version: "0.8.18",
  },
};
