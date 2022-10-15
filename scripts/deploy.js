// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const { ethers, upgrades, waffle } = require("hardhat");

const etherPrice = ethers.BigNumber.from("1230000000000000");
const maxTokenPerPurchase = ethers.BigNumber.from("100");
const maxTokenPerAddress = ethers.BigNumber.from("250");
const goldEscrow = "0xb0a3425Aa5978124bBe8F5391ABEF488495B9f6E";

async function main() {
  const GoldToken = await ethers.getContractFactory("GoldToken");
  const goldToken = await GoldToken.deploy(goldEscrow, "GOLDToken", "GOLD");
  console.log(`deployed GoldToken to ${goldToken.address}`);

  // Deploy GoldSaleV1
  const GoldSaleV1 = await ethers.getContractFactory("GoldSaleV1");
  const goldSaleV1 = await upgrades.deployProxy(GoldSaleV1, [
    goldToken.address,
    goldEscrow,
    etherPrice,
    maxTokenPerPurchase,
    maxTokenPerAddress,
  ]);
  await goldSaleV1.deployed();
  console.log(`GoldSaleV1 deployed to ${goldSaleV1.address}`);

  // Upgrade GoldSaleV1 to GoldSale
  const GoldSale = await ethers.getContractFactory("GoldSale");
  const goldSale = await upgrades.upgradeProxy(goldSaleV1.address, GoldSale);
  console.log(`Upgraded GoldSale to ${goldSale.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
