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
        string description;
        string githubUrl;
        uint256 reward;
        Status status;
    }

    enum Status { Open, Paid }

    uint256 public nextBountyId;
    mapping(uint256 => Bounty) public bounties;
    mapping(uint256 => address[]) public claimants;
    uint256[] bountyIds;

    event BountyCreated(
        uint256 indexed id,
        address indexed creator,
        string title,
        string githubUrl,
        uint256 reward
    );
    event BountyClaimed(uint256 indexed id, address indexed claimant);
    event BountyApproved(uint256 indexed id, address indexed winner, uint256 reward);

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
            description: _description,
            githubUrl: _githubUrl,
            reward: msg.value,
            status: Status.Open
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

    function claimBounty(uint256 _bountyId) public {
        require(bounties[_bountyId].status == Status.Open, "Bounty is not open for claims.");

        // Prevent duplicate claims from the same address
        for (uint i = 0; i < claimants[_bountyId].length; i++) {
            require(claimants[_bountyId][i] != msg.sender, "You have already claimed this bounty.");
        }
        
        claimants[_bountyId].push(msg.sender);
        
        emit BountyClaimed(_bountyId, msg.sender);
    }

    function getClaimants(uint256 _bountyId) public view returns (address[] memory) {
        return claimants[_bountyId];
    }

    function cancelClaim(uint256 _bountyId) public {
        address[] storage bountyClaimants = claimants[_bountyId];
        bool found = false;
        for (uint i = 0; i < bountyClaimants.length; i++) {
            if (bountyClaimants[i] == msg.sender) {
                // Remove the claimant by shifting the last element to the current position
                bountyClaimants[i] = bountyClaimants[bountyClaimants.length - 1];
                bountyClaimants.pop();
                found = true;
                break;
            }
        }
        require(found, "You have not claimed this bounty.");
    }

    function cancelClaimByAdmin(uint256 _bountyId, address _claimantAddress) public onlyOwner {
        address[] storage bountyClaimants = claimants[_bountyId];
        bool found = false;
        for (uint i = 0; i < bountyClaimants.length; i++) {
            if (bountyClaimants[i] == _claimantAddress) {
                bountyClaimants[i] = bountyClaimants[bountyClaimants.length - 1];
                bountyClaimants.pop();
                found = true;
                break;
            }
        }
        require(found, "Claimant not found.");
    }

    function approveBounty(uint256 _bountyId, address _winner) public onlyOwner {
        require(bounties[_bountyId].status == Status.Open, "Bounty is not in a valid state to be approved.");
        
        Bounty storage bounty = bounties[_bountyId];
        uint256 reward = bounty.reward;

        // Verify the winner is in the claimants list
        bool winnerFound = false;
        for (uint i = 0; i < claimants[_bountyId].length; i++) {
            if (claimants[_bountyId][i] == _winner) {
                winnerFound = true;
                break;
            }
        }
        require(winnerFound, "Winner not found in claimants list.");
        
        bounty.status = Status.Paid;
        
        payable(_winner).transfer(reward);
        
        emit BountyApproved(_bountyId, _winner, reward);
    }
}
