const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyContract", function () {
  let myContract;

  beforeEach(async function () {
    const MyContract = await ethers.getContractFactory("MyContract");
    myContract = await MyContract.deploy();
    await myContract.deployed(); // Wait for deployment to complete
    console.log("Contract Address:", myContract.address);
  });

  it("should be deployed correctly", async function () {
    expect(myContract.address).to.be.properAddress;
  });
});


