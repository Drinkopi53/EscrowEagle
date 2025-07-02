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
        string description; // New field for bounty description
        string githubUrl;
        uint256 reward;
        Status status;
        address claimant;
        string solutionGithubUrl; // New field for client-submitted solution URL
    }

    enum Status { Open, Claimed, Paid }

    uint256 public nextBountyId;
    mapping(uint256 => Bounty) public bounties;
    uint256[] bountyIds;

    event BountyCreated(
        uint256 indexed id,
        address indexed creator,
        string title,
        string githubUrl,
        uint256 reward
    );
    event BountyClaimed(uint256 indexed id, address indexed claimant);
    event BountyApproved(uint256 indexed id, address indexed claimant, uint256 reward);

    function createBounty(
        string memory _title,
        string memory _description, // Added description parameter
        string memory _githubUrl
    ) public payable onlyOwner {
        require(msg.value > 0, "Bounty must have a reward");

        uint256 id = nextBountyId++;
        bounties[id] = Bounty({
            id: id,
            creator: msg.sender,
            title: _title,
            description: _description, // Store the description
            githubUrl: _githubUrl,
            reward: msg.value,
            status: Status.Open,
            claimant: address(0),
            solutionGithubUrl: "" // Initialize with empty string
        });
        bountyIds.push(id);

        emit BountyCreated(id, msg.sender, _title, _githubUrl, msg.value);
    }

    function submitSolution(uint256 _bountyId, string memory _solutionGithubUrl) public {
        require(bounties[_bountyId].status == Status.Claimed, "Bounty has not been claimed or is already paid.");
        require(bounties[_bountyId].claimant == msg.sender, "Only the claimant can submit a solution.");
        
        bounties[_bountyId].solutionGithubUrl = _solutionGithubUrl;
        // Optionally emit an event for solution submission
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
        require(bounties[_bountyId].status == Status.Open, "Bounty is not open for claims.");
        
        bounties[_bountyId].status = Status.Claimed;
        bounties[_bountyId].claimant = msg.sender;
        
        emit BountyClaimed(_bountyId, msg.sender);
    }

    function approveBounty(uint256 _bountyId) public onlyOwner {
        require(bounties[_bountyId].status == Status.Claimed, "Bounty has not been claimed.");
        
        Bounty storage bounty = bounties[_bountyId];
        address claimant = bounty.claimant;
        uint256 reward = bounty.reward;

        require(claimant != address(0), "No one has claimed this bounty.");
        
        bounty.status = Status.Paid;
        
        payable(claimant).transfer(reward);
        
        emit BountyApproved(_bountyId, claimant, reward);
    }
}
