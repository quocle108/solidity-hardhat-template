const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers, upgrades, waffle } = require("hardhat");

describe("GoldSale", function () {
  let owner, user, goldEscrow, saleEscrow;
  const etherPrice = ethers.BigNumber.from("123");
  const maxTokenPerPurchase = ethers.BigNumber.from("100");
  const maxTokenPerAddress = ethers.BigNumber.from("250");
  beforeEach(async function () {
    [owner, user, goldEscrow, saleEscrow] = await ethers.getSigners();
    const GoldToken = await ethers.getContractFactory("GoldToken");
    this.GoldToken = await GoldToken.deploy(
      goldEscrow.address,
      "GOLDToken",
      "GOLD"
    );
    const GoldSaleV1 = await ethers.getContractFactory("GoldSaleV1");
    this.GoldSaleV1 = await upgrades.deployProxy(
      GoldSaleV1,
      [
        this.GoldToken.address,
        goldEscrow.address,
        etherPrice,
        maxTokenPerPurchase,
        maxTokenPerAddress,
      ],
      {
        from: owner,
      }
    );
    const GoldSale = await ethers.getContractFactory("GoldSale");
    this.GoldSale = await upgrades.upgradeProxy(
      this.GoldSaleV1.address,
      GoldSale,
      {
        from: owner,
      }
    );
  }, 5000);

  describe("Test initialize", () => {
    it("Should initialize data", async function () {
      const goldSaleInit = await ethers.getContractFactory("GoldSale");
      const GoldSaleTest = await goldSaleInit.deploy();
      await GoldSaleTest.initialize(
        this.GoldToken.address,
        goldEscrow.address,
        etherPrice,
        maxTokenPerPurchase,
        maxTokenPerAddress
      );

      expect(await GoldSaleTest.goldToken()).to.equal(this.GoldToken.address);
      expect(await GoldSaleTest.goldEscrow()).to.equal(goldEscrow.address);
      expect((await GoldSaleTest.etherPricePerToken()).toString()).to.equal(
        etherPrice.toString()
      );
      expect((await GoldSaleTest.maxTokenPerPurchase()).toString()).to.equal(
        maxTokenPerPurchase.toString()
      );
      expect((await GoldSaleTest.maxTokenPerAddress()).toString()).to.equal(
        maxTokenPerAddress.toString()
      );
    });

    it("Should throw if invalid address", async function () {
      const goldSaleInit = await ethers.getContractFactory("GoldSale");
      const GoldSaleTest = await goldSaleInit.deploy();
      await expect(
        GoldSaleTest.initialize(
          ethers.constants.AddressZero,
          goldEscrow.address,
          etherPrice,
          maxTokenPerPurchase,
          maxTokenPerAddress
        )
      ).to.be.revertedWith("Not valid address");
    });
  });

  describe("Test purchase", () => {
    it("Should purchase with ETH", async function () {
      const purchasesAmount = ethers.BigNumber.from("100");
      const balanceOfEcrow = await this.GoldToken.balanceOf(goldEscrow.address);
      await this.GoldToken.connect(goldEscrow).approve(
        this.GoldSale.address,
        purchasesAmount
      );
      const price = purchasesAmount.mul(etherPrice);
      await this.GoldSale.connect(user).purchase(purchasesAmount, {
        value: price,
      });

      let contracBalance = await web3.eth.getBalance(this.GoldSale.address);
      const balanceOfUser = await this.GoldToken.balanceOf(user.address);
      const reducedAmountEscrow = balanceOfEcrow.sub(
        await this.GoldToken.balanceOf(goldEscrow.address)
      );

      expect(ethers.BigNumber.from(contracBalance).toString()).to.equal(
        price.toString()
      );
      expect(reducedAmountEscrow.toString()).to.equal(
        purchasesAmount.toString()
      );
      expect(balanceOfUser.toString()).to.equal(purchasesAmount.toString());
    });

    it("Should purchase multiple times", async function () {
      let purchasesAmount = ethers.BigNumber.from("100");
      const balanceOfEcrow = await this.GoldToken.balanceOf(goldEscrow.address);

      await this.GoldToken.connect(goldEscrow).approve(
        this.GoldSale.address,
        purchasesAmount
      );
      let price = purchasesAmount.mul(etherPrice);
      await this.GoldSale.connect(user).purchase(purchasesAmount, {
        value: price,
      });

      newPurchasesAmount = ethers.BigNumber.from("50");
      await this.GoldToken.connect(goldEscrow).approve(
        this.GoldSale.address,
        newPurchasesAmount
      );
      let newPrice = newPurchasesAmount.mul(etherPrice);
      await this.GoldSale.connect(user).purchase(newPurchasesAmount, {
        value: newPrice,
      });

      let contracBalance = await web3.eth.getBalance(this.GoldSale.address);
      const balanceOfUser = await this.GoldToken.balanceOf(user.address);

      expect(contracBalance.toString()).to.equal(
        price.add(newPrice).toString()
      );
      expect(balanceOfUser.toString()).to.equal(
        purchasesAmount.add(newPurchasesAmount).toString()
      );
    });

    it("Should not purchase with ethers amount is smaller than price", async function () {
      const purchasesAmount = ethers.BigNumber.from("100");
      const balanceOfEcrow = await this.GoldToken.balanceOf(goldEscrow.address);
      await this.GoldToken.connect(goldEscrow).approve(
        this.GoldSale.address,
        purchasesAmount
      );
      let price = purchasesAmount.mul(etherPrice);
      price = price.div(ethers.BigNumber.from(2));
      await expect(
        this.GoldSale.connect(user).purchase(purchasesAmount, {
          value: price,
        })
      ).to.be.revertedWith("invalid ethers value");
    });

    it("Should not purchase with amount exceed limit per purchase", async function () {
      const purchasesAmount = ethers.BigNumber.from("123456");
      await this.GoldToken.connect(goldEscrow).approve(
        this.GoldSale.address,
        purchasesAmount
      );
      let price = purchasesAmount.mul(etherPrice);
      await expect(
        this.GoldSale.connect(user).purchase(purchasesAmount, {
          value: price,
        })
      ).to.be.revertedWith("exceeded maximum per purchase");
    });

    it("Should not purchase with amount exceed limit per user", async function () {
      const purchasesAmount = ethers.BigNumber.from("100");
      await this.GoldToken.connect(goldEscrow).approve(
        this.GoldSale.address,
        purchasesAmount.mul(ethers.BigNumber.from(3))
      );

      let price = purchasesAmount.mul(etherPrice);
      await this.GoldSale.connect(user).purchase(purchasesAmount, {
        value: price,
      });
      await this.GoldSale.connect(user).purchase(purchasesAmount, {
        value: price,
      });

      await expect(
        this.GoldSale.connect(user).purchase(purchasesAmount, {
          value: price,
        })
      ).to.be.revertedWith("Exceeded maximum per address");
    });

    it("Should revert if escrow does not approve yet", async function () {
      const purchasesAmount = ethers.BigNumber.from("100");

      const price = purchasesAmount.mul(etherPrice);
      await expect(
        this.GoldSale.connect(user).purchase(purchasesAmount, {
          value: price,
        })
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });
  });

  describe("Test withdraw", () => {
    it("Should withdraw from sale contract", async function () {
      const purchasesAmount = ethers.BigNumber.from("100");
      let balanceOfEcrow = await ethers.provider.getBalance(saleEscrow.address);
      await this.GoldToken.connect(goldEscrow).approve(
        this.GoldSale.address,
        purchasesAmount
      );
      const price = purchasesAmount.mul(etherPrice);
      await this.GoldSale.connect(user).purchase(purchasesAmount, {
        value: price,
      });

      await expect(this.GoldSale.connect(owner).withdraw(saleEscrow.address))
        .to.emit(this.GoldSale, "Withdrawal")
        .withArgs(saleEscrow.address, price);

      const increasedAmountEscrow = (
        await ethers.provider.getBalance(saleEscrow.address)
      ).sub(balanceOfEcrow);
      expect(increasedAmountEscrow.toString()).to.equal(price.toString());
    });

    it("Should not allow other account can withdraw", async function () {
      await expect(
        this.GoldSale.connect(saleEscrow).withdraw(saleEscrow.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
