# solidity-hardhat-template

**A solidity hardhat template with necessary libraries that support to develop, compile, test, deploy, upgrade, verify solidity smart contract**

 * A template project to develop, compile, test, deploy and upgrade solidity project with hardhat
 * Included OpenZeppelin smart contract and Upgradable smart contract Library 
 * All needed hardhat plugins: solidity hint, coverage, code verify, gas price.
 * Supported libraries to format, verify and clean the code
 * [Usage docs](./docs/usage.md)

# Quick start

1. Click the "Use this template" button and clone it to your local
2. Enter `npm install`
3. Test the contract with `npm test`
4. Modify the contract/test cases
5. Copy and update  `.env.example` into `.env`
- PRIVATE_KEYS: It be used to deploy your code. Generate new one from [here](https://allprivatekeys.com/mnemonic-code-converter#english)
- INFURA_PROJECT_ID: It be used to connect with the infura service node. You can get free Key from [here](https://infura.io/)
- ETHEREUMSCAN_KEY: Verify your code on ethereumscan. You can get free Key from [here](https://etherscan.io/apis)
- COINMARKETCAP_KEY: Get the gas price in Fiat. You can get free Key from [here](https://coinmarketcap.com/api)
- GAS_PRICE: You can get last gas price at [here](https://ycharts.com/indicators/ethereum_average_gas_price).

6. Read [Usage docs](./docs/usage.md) to see the detail.

## Licence
This code is provided as is, under MIT Licence.