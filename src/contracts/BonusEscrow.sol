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

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    struct Bounty {
        uint256 id;
        address creator;
        string title;
        string githubUrl;
        uint256 reward;
        Status status;
        address acceptor; // New field to store the address of the client who accepted the bounty
    }

    enum Status { Open, Accepted, Completed, Paid }

    uint256 nextBountyId;
    mapping(uint256 => Bounty) bounties;
    uint256[] bountyIds;

    event BountyCreated(
        uint256 indexed id,
        address indexed creator,
        string title,
        string githubUrl,
        uint256 reward
    );
    event BountyAccepted(uint256 indexed id, address indexed acceptor);
    event BountyCompleted(uint256 indexed id);
    event BountyPaid(uint256 indexed id, address indexed winner);

    function createBounty(
        string memory _title,
        string memory _githubUrl
    ) public payable {
        require(msg.value > 0, "Bounty must have a reward");

        uint256 id = nextBountyId++;
        bounties[id] = Bounty({
            id: id,
            creator: msg.sender,
            title: _title,
            githubUrl: _githubUrl,
            reward: msg.value,
            status: Status.Open,
            acceptor: address(0)
        });
        bountyIds.push(id);

        emit BountyCreated(id, msg.sender, _title, _githubUrl, msg.value);
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

    function acceptBounty(uint256 _bountyId) public {
        require(bounties[_bountyId].status == Status.Open, "Bounty is not open");
        // Removed: require(msg.sender == bounties[_bountyId].creator, "Only bounty creator can accept bounty");
        // Now any client can accept an open bounty.
        bounties[_bountyId].status = Status.Accepted;
        bounties[_bountyId].acceptor = msg.sender; // Store the acceptor's address (msg.sender is the client)
        emit BountyAccepted(_bountyId, msg.sender);
    }

    function completeBounty(uint256 _bountyId) public {
        require(bounties[_bountyId].status == Status.Accepted, "Bounty is not accepted");
        require(msg.sender == bounties[_bountyId].acceptor, "Only bounty acceptor can complete bounty");
        bounties[_bountyId].status = Status.Completed;
        emit BountyCompleted(_bountyId);
    }

    function payBounty(uint256 _bountyId, address _winner) public onlyOwner {
        require(bounties[_bountyId].status == Status.Completed, "Bounty is not completed");
        require(bounties[_bountyId].reward > 0, "Bounty has no reward");

        // Transfer reward to the winner
        payable(_winner).transfer(bounties[_bountyId].reward);
        bounties[_bountyId].status = Status.Paid;
        emit BountyPaid(_bountyId, _winner);
    }

    function rejectBounty(uint256 _bountyId) public onlyOwner {
        require(bounties[_bountyId].status == Status.Completed, "Bounty is not completed");
        bounties[_bountyId].status = Status.Accepted;
        // Optionally emit an event for rejection
    }
}
