const { ethers } = require("hardhat");

async function main() {
    
    const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Update this address

    console.log("Deploying the SubscriptionManagement contract...");

    // Get the contract factory
    const SubscriptionManagement = await ethers.getContractFactory("SubscriptionManagement");

    // Deploy the contract
    const subscriptionContract = await SubscriptionManagement.deploy(tokenAddress);

    // Wait for deployment to complete
    await subscriptionContract.deployed();

    console.log("SubscriptionManagement contract deployed to:", subscriptionContract.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
