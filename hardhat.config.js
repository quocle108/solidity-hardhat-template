require("dotenv").config()
require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-solhint");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");

const privKeys = (process.env.PRIVATE_KEYS) ? process.env.PRIVATE_KEYS.split(' ') : undefined;

module.exports = {
  solidity: "0.8.17",
  networks: {
    local: {
      url: process.env.ETH_ENDPOINT || 'http://localhost:8545',
      accounts: privKeys,
      // accounts: {
      //   mnemonic: process.env.MNEMONIC,
      // }
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: privKeys,
      // accounts: {
      //   mnemonic: process.env.MNEMONIC,
      // }
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: privKeys,
      // accounts: {
      //   mnemonic: process.env.MNEMONIC,
      // }
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS=== "true" ? true : false,
    currency: 'USD',
    gasPrice: process.env.GAS_PRICE? process.env.GAS_PRICE: 30,
    coinmarketcap: process.env.COINMARKETCAP_KEY
  },
  etherscan: {
    apiKey: process.env.ETHEREUMSCAN_KEY,
  },
  contractSizer: {
    only: ['GoldSale', 'GoldToken'],
  }
};
