const { expect } = require("chai");

describe("MyContract", function () {
    it("should set and retrieve the correct value", async function (){
        const MyContract = await ethers.getContractFactory("MyContract");
        const myContract = await MyContract.deploy();
        await myContract.deployed();

        await myContract.setValue(42);
        expect(await myContract.value()).to.equal(42);
    });
});