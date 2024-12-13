const { ethers } = require("hardhat");

async function main() {
    console.log("Deploying TestToken...");

    // Get the contract factory
    const TestToken = await ethers.getContractFactory("TestToken");

    // Deploy the TestToken contract
    const testToken = await TestToken.deploy();

    // Wait for deployment to complete
    await testToken.deployed();

    console.log("TestToken deployed to:", testToken.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });