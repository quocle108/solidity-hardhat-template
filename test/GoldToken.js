const { expect } = require("chai");
const { ethers, upgrades, waffle } = require("hardhat");

describe("GoldToken", function () {
  let owner, user, goldEscrow;
  beforeEach(async function () {
    [owner, user, goldEscrow] = await ethers.getSigners();
    const GoldToken = await ethers.getContractFactory("GoldToken");
    this.GoldToken = await GoldToken.deploy(
      goldEscrow.address,
      "GOLDToken",
      "GOLD"
    );
  }, 5000);

  describe("Test contructor", () => {
    it("Should initialize data", async function () {
      expect(await this.GoldToken.decimals()).to.equal(8);
      expect(
        (await this.GoldToken.balanceOf(goldEscrow.address)).toString()
      ).to.equal("100000000000000000");
    });
  });

  describe("Test mint", () => {
    it("Should mint token", async function () {
      const mintAmount = ethers.BigNumber.from("123456");
      await this.GoldToken.connect(owner).mintTo(user.address, mintAmount);

      const userBalance = await this.GoldToken.balanceOf(user.address);
      expect(userBalance.toString()).to.equal(mintAmount.toString());
    });

    it("Should throw if caller is not the owner", async function () {
      const mintAmount = ethers.BigNumber.from("123456");
      await expect(
        this.GoldToken.connect(user).mintTo(user.address, mintAmount)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
