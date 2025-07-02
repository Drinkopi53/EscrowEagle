const { ethers } = require('ethers');
const BonusEscrowJson = require('../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json');
const deployedContractAddress = require('./src/contracts/deployed_contract_address.json');

async function debugContract() {
  try {
    // Connect to local Hardhat node
    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    
    // Get the first account (should be the owner)
    const accounts = await provider.listAccounts();
    console.log('Available accounts:', accounts.map(acc => acc.address));
    
    const signer = await provider.getSigner(0);
    console.log('Using signer:', await signer.getAddress());
    
    // Create contract instance
    const contract = new ethers.Contract(
      deployedContractAddress.contractAddress,
      BonusEscrowJson.abi,
      signer
    );
    
    console.log('Contract address:', deployedContractAddress.contractAddress);
    
    // Check owner
    const owner = await contract.owner();
    console.log('Contract owner:', owner);
    
    // Check nextBountyId
    const nextBountyId = await contract.nextBountyId();
    console.log('Next bounty ID:', nextBountyId.toString());
    
    // Get all bounties
    const bounties = await contract.getAllBounties();
    console.log('Number of bounties:', bounties.length);
    console.log('Bounties:', bounties);
    
    // If no bounties, create one for testing
    if (bounties.length === 0) {
      console.log('No bounties found. Creating a test bounty...');
      
      const tx = await contract.createBounty(
        "Test Bounty",
        "This is a test bounty description",
        "https://github.com/test/repo",
        { value: ethers.parseEther("0.1") }
      );
      
      console.log('Transaction hash:', tx.hash);
      await tx.wait();
      console.log('Bounty created successfully!');
      
      // Get bounties again
      const newBounties = await contract.getAllBounties();
      console.log('Bounties after creation:', newBounties);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugContract();