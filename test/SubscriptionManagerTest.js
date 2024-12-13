import { expect } from "chai";
import ethers from "hardhat";

describe("SubscriptionManager", function () {
    let testToken, subscriptionManagement, owner, user, serviceProvider;

    // Deploy contracts and set up initial state before each test
    beforeEach(async function () {
        [owner, user, serviceProvider] = await ethers.getSigners();

        // Deploy TestToken
        const TestToken = await ethers.getContractFactory("TestToken");
        testToken = await TestToken.deploy();
        await testToken.deployed();

        // Deploy SubscriptionManagement
        const SubscriptionManagement = await ethers.getContractFactory("SubscriptionManagement");
        subscriptionManagement = await SubscriptionManagement.deploy(testToken.address);
        await subscriptionManagement.deployed();

        // Allocate tokens to the user
        await testToken.transfer(user.address, ethers.utils.parseEther("1000"));
    });

    // Test service listing
    it("should allow service providers to list services", async function () {
        await subscriptionManagement.connect(serviceProvider).listService("Streaming Service");
        const ownerAddress = await subscriptionManagement.serviceOwners(0); // Service ID 0
        expect(ownerAddress).to.equal(serviceProvider.address);
    });

    // Test user subscriptions
    it("should allow users to subscribe to a service", async function () {
        // Approve tokens for the contract
        await testToken.connect(user).approve(subscriptionManagement.address, ethers.utils.parseEther("50"));

        // Subscribe to the service
        await subscriptionManagement.connect(user).subscribe(0, 30); // Service ID: 0, Duration: 30 days

        const subscription = await subscriptionManagement.subscriptions(0);
        expect(subscription.state).to.equal("active"); // Verify the subscription state
        expect(subscription.user).to.equal(user.address); // Verify the user address
    });

    // Test subscription cancellation
    it("should allow users to cancel subscriptions", async function () {
        // Approve tokens and subscribe
        await testToken.connect(user).approve(subscriptionManagement.address, ethers.utils.parseEther("50"));
        await subscriptionManagement.connect(user).subscribe(0, 30);

        // Cancel the subscription
        await subscriptionManagement.connect(user).cancelSubscription(0); // Subscription ID: 0

        const subscription = await subscriptionManagement.subscriptions(0);
        expect(subscription.state).to.equal("canceled"); // Verify state is "canceled"
    });

    // Test access verification
    it("should verify active subscription access", async function () {
        // Approve tokens and subscribe
        await testToken.connect(user).approve(subscriptionManagement.address, ethers.utils.parseEther("50"));
        await subscriptionManagement.connect(user).subscribe(0, 30);

        // Verify access
        const hasAccess = await subscriptionManagement.verifyAccess(0);
        expect(hasAccess).to.equal(true); // Access should be allowed
    });

    // Test insufficient token balance for subscription
    it("should fail subscription if the user does not have enough tokens", async function () {
        // Attempt subscription without approving enough tokens
        await testToken.connect(user).approve(subscriptionManagement.address, ethers.utils.parseEther("10")); // Approve insufficient tokens

        await expect(subscriptionManagement.connect(user).subscribe(0, 30)).to.be.revertedWith("Insufficient token balance");
    });
});