// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Future unit tests would typically be created in a separate file
// in a Hardhat project (e.g., test/BonusEscrow.t.sol).
// For this task, actual test files will not be created.
//
// Test cases would include:
// - Deployment:
//   - Check if the owner is set correctly.
// - Deposit:
//   - Check if ETH can be deposited.
//   - Check if the contract balance increases after deposit.
//   - Check if events are emitted correctly (if any).
// - Access Control:
//   - Ensure only the owner can call owner-restricted functions (if any).

contract BonusEscrow {
    address public owner;

    constructor() {
        owner = msg.sender;
        nextBountyId = 0;
    }

    function deposit() public payable {
        // This function allows ETH to be sent to the contract.
        // Further logic for handling the deposited ETH will be added later.
    }

    struct Bounty {
        uint256 id;
        address creator;
        string title;
        string description;
        uint256 reward;
        Status status;
        address acceptor; // New field
    }

    enum Status { Open, Claimed, Accepted, Completed, Paid } // New status

    uint256 nextBountyId;
    mapping(uint256 => Bounty) bounties;
    uint256[] bountyIds;

    event BountyCreated(
        uint256 indexed id,
        address indexed creator,
        string title,
        uint256 reward
    );
    event BountyClaimed(uint256 indexed id, address indexed claimant); // New event
    event BountyAccepted(uint256 indexed id, address indexed acceptor);
    event BountyCompleted(uint256 indexed id);
    event BountyPaid(uint256 indexed id, address indexed winner);

    function createBounty(
        string memory _title,
        string memory _description
    ) public payable {
        require(msg.value > 0, "Bounty must have a reward");

        uint256 id = nextBountyId++;
        bounties[id] = Bounty({
            id: id,
            creator: msg.sender,
            title: _title,
            description: _description,
            reward: msg.value,
            status: Status.Open,
            acceptor: address(0) // Initialize acceptor to address(0)
        });
        bountyIds.push(id);

        emit BountyCreated(id, msg.sender, _title, msg.value);
    }

    function getBountyStatus(uint256 _bountyId) public view returns (Status) {
        require(_bountyId < nextBountyId, "Bounty does not exist");
        return bounties[_bountyId].status;
    }

    function getAllBounties() public view returns (Bounty[] memory) {
        Bounty[] memory allBounties = new Bounty[](bountyIds.length);
        for (uint256 i = 0; i < bountyIds.length; i++) {
            allBounties[i] = bounties[bountyIds[i]];
        }
        return allBounties;
    }

    function claimBounty(uint256 _bountyId) public {
        require(_bountyId < nextBountyId, "Bounty does not exist");
        require(bounties[_bountyId].status == Status.Open, "Bounty is not open for claiming");
        require(bounties[_bountyId].creator != msg.sender, "Creator cannot claim their own bounty");

        bounties[_bountyId].status = Status.Claimed;
        bounties[_bountyId].acceptor = msg.sender;
        emit BountyClaimed(_bountyId, msg.sender);
    }

    function acceptBounty(uint256 _bountyId) public {
        require(bounties[_bountyId].creator == msg.sender, "Only bounty creator can accept");
        require(bounties[_bountyId].status == Status.Claimed, "Bounty is not claimed yet"); // Changed from Status.Open
        bounties[_bountyId].status = Status.Accepted;
        emit BountyAccepted(_bountyId, bounties[_bountyId].acceptor); // Emit acceptor, not msg.sender
    }

    function completeBounty(uint256 _bountyId) public {
        require(bounties[_bountyId].status == Status.Accepted, "Bounty is not accepted");
        // In a real scenario, this would be called by the bounty hunter or an oracle
        bounties[_bountyId].status = Status.Completed;
        emit BountyCompleted(_bountyId);
    }

    function payBounty(uint256 _bountyId, address _winner) public {
        require(bounties[_bountyId].status == Status.Completed, "Bounty is not completed");
        require(bounties[_bountyId].reward > 0, "Bounty has no reward");

        // Transfer reward to the winner
        payable(_winner).transfer(bounties[_bountyId].reward);
        bounties[_bountyId].status = Status.Paid;
        emit BountyPaid(_bountyId, _winner);
    }
}
