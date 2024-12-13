// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import OpenZeppelin's ERC20 contract
import "./IERC20.sol";

/**
 * @title Subscription Management Contract
 * @dev Manages subscriptions using ERC20 tokens.
 */
contract SubscriptionManagement {
    
    // Type Declarations
    struct Subscription {
        uint256 subscriptionID;
        uint256 serviceID;
        address user;
        uint256 expiryDate;
        string state; // "active", "canceled", or "expired"
    }

    // State Variables
    IERC20 public token;
    uint256 public nextSubscriptionID = 0;
    uint256 public nextServiceID = 0;

    mapping(uint256 => Subscription) public subscriptions;
    mapping(address => bool) public verifiedUsers;
    mapping(address => bool) public verifiedProviders;
    mapping(uint256 => address) public serviceOwners;

    // Events
    event Subscribed(address indexed user, uint256 serviceID, uint256 subscriptionID);
    event SubscriptionCanceled(address indexed user, uint256 subscriptionID);
    event ServiceListed(address indexed provider, uint256 serviceID);

    // Modifiers
    modifier onlyVerifiedUser() {
        require(verifiedUsers[msg.sender], "User not verified.");
        _;
    }

    modifier onlyVerifiedProvider() {
        require(verifiedProviders[msg.sender], "Provider not verified.");
        _;
    }

    // Constructor
    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);
    }

    // Methods
    /**
     * @dev Allows users to subscribe to a service by paying with ERC20 tokens.
     * @param _serviceID The ID of the service to subscribe to.
     * @param _duration Subscription duration in days.
     */
    function subscribe(uint256 _serviceID, uint256 _duration) external onlyVerifiedUser {
        require(serviceOwners[_serviceID] != address(0), "Service does not exist.");
        uint256 cost = _duration * 1 ether; // Example: 1 token per day
        require(token.balanceOf(msg.sender) >= cost, "Insufficient token balance.");

        // Deduct tokens and create subscription
        token.transferFrom(msg.sender, serviceOwners[_serviceID], cost);
        uint256 expiryDate = block.timestamp + (_duration * 1 days);
        subscriptions[nextSubscriptionID] = Subscription(nextSubscriptionID, _serviceID, msg.sender, expiryDate, "active");

        emit Subscribed(msg.sender, _serviceID, nextSubscriptionID);
        nextSubscriptionID++;
    }

    /**
     * @dev Cancels an active subscription.
     * @param _subscriptionID The ID of the subscription to cancel.
     */
    function cancelSubscription(uint256 _subscriptionID) external {
        Subscription storage sub = subscriptions[_subscriptionID];
        require(sub.user == msg.sender, "Not the subscription owner.");
        require(keccak256(bytes(sub.state)) == keccak256(bytes("active")), "Subscription not active.");

        sub.state = "canceled";
        emit SubscriptionCanceled(msg.sender, _subscriptionID);
    }

    /**
     * @dev Allows verified providers to list new services.
     */
    function listService() external onlyVerifiedProvider {
        serviceOwners[nextServiceID] = msg.sender;
        emit ServiceListed(msg.sender, nextServiceID);
        nextServiceID++;
    }
}