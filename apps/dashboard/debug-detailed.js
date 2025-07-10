const { ethers } = require('ethers');
const BonusEscrowJson = require('../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json');
const deployedContractAddress = require('./src/contracts/deployed_contract_address.json');

async function detailedDebug() {
  console.log('=== DETAILED DEBUG ANALYSIS ===\n');
  
  try {
    // 1. Check provider connection
    console.log('1. PROVIDER CONNECTION:');
    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    const network = await provider.getNetwork();
    console.log('   Network Name:', network.name);
    console.log('   Chain ID:', network.chainId.toString());
    console.log('   Provider connected:', !!provider);
    
    // 2. Check accounts
    console.log('\n2. ACCOUNTS:');
    const accounts = await provider.listAccounts();
    console.log('   Total accounts:', accounts.length);
    accounts.slice(0, 3).forEach((acc, i) => {
      console.log(`   Account ${i}:`, acc.address);
    });
    
    // 3. Check contract deployment
    console.log('\n3. CONTRACT DEPLOYMENT:');
    console.log('   Contract Address:', deployedContractAddress.contractAddress);
    const code = await provider.getCode(deployedContractAddress.contractAddress);
    console.log('   Contract deployed:', code !== '0x');
    console.log('   Bytecode length:', code.length);
    
    // 4. Check contract instance
    console.log('\n4. CONTRACT INSTANCE:');
    const signer = await provider.getSigner(0);
    const contract = new ethers.Contract(
      deployedContractAddress.contractAddress,
      BonusEscrowJson.abi,
      signer
    );
    console.log('   Contract instance created:', !!contract);
    console.log('   ABI functions count:', BonusEscrowJson.abi.filter(item => item.type === 'function').length);
    
    // 5. Test basic contract calls
    console.log('\n5. BASIC CONTRACT CALLS:');
    try {
      const owner = await contract.owner();
      console.log('   ✅ owner():', owner);
    } catch (e) {
      console.log('   ❌ owner() failed:', e.message);
    }
    
    try {
      const nextBountyId = await contract.nextBountyId();
      console.log('   ✅ nextBountyId():', nextBountyId.toString());
    } catch (e) {
      console.log('   ❌ nextBountyId() failed:', e.message);
    }
    
    // 6. Test getAllBounties with detailed analysis
    console.log('\n6. GET ALL BOUNTIES ANALYSIS:');
    try {
      const bounties = await contract.getAllBounties();
      console.log('   ✅ getAllBounties() success');
      console.log('   Bounties count:', bounties.length);
      
      if (bounties.length > 0) {
        console.log('\n   BOUNTY STRUCTURE ANALYSIS:');
        const firstBounty = bounties[0];
        console.log('   First bounty raw data:', firstBounty);
        console.log('   First bounty length:', firstBounty.length);
        
        // Analyze each field
        console.log('\n   FIELD MAPPING:');
        console.log('   [0] id:', firstBounty[0]?.toString());
        console.log('   [1] creator:', firstBounty[1]);
        console.log('   [2] title:', firstBounty[2]);
        console.log('   [3] description:', firstBounty[3]);
        console.log('   [4] githubUrl:', firstBounty[4]);
        console.log('   [5] reward:', firstBounty[5]?.toString());
        console.log('   [6] status:', firstBounty[6]?.toString());
        console.log('   [7] claimant:', firstBounty[7]);
        console.log('   [8] solutionGithubUrl:', firstBounty[8]);
        
        // Test frontend mapping logic
        console.log('\n   FRONTEND MAPPING TEST:');
        const formattedBounty = {
          id: firstBounty[0].toString(),
          creator: firstBounty[1],
          title: firstBounty[2],
          description: firstBounty[3],
          githubUrl: firstBounty[4],
          reward: firstBounty[5],
          status: Number(firstBounty[6]),
          claimant: firstBounty[7],
          solutionGithubUrl: firstBounty[8] || '',
        };
        console.log('   Formatted bounty:', JSON.stringify(formattedBounty, (k, v) => 
          typeof v === 'bigint' ? v.toString() : v, 2));
      }
    } catch (e) {
      console.log('   ❌ getAllBounties() failed:', e.message);
      console.log('   Error details:', e);
    }
    
    // 7. Test individual bounty access
    console.log('\n7. INDIVIDUAL BOUNTY ACCESS:');
    try {
      const bounty0 = await contract.bounties(0);
      console.log('   ✅ bounties(0) success');
      console.log('   Direct bounty access:', bounty0);
    } catch (e) {
      console.log('   ❌ bounties(0) failed:', e.message);
    }
    
    // 8. Test contract events
    console.log('\n8. CONTRACT EVENTS:');
    try {
      const filter = contract.filters.BountyCreated();
      const events = await contract.queryFilter(filter, 0, 'latest');
      console.log('   BountyCreated events:', events.length);
      events.forEach((event, i) => {
        console.log(`   Event ${i}:`, {
          id: event.args[0]?.toString(),
          creator: event.args[1],
          title: event.args[2],
          githubUrl: event.args[3],
          reward: event.args[4]?.toString()
        });
      });
    } catch (e) {
      console.log('   ❌ Events query failed:', e.message);
    }
    
    // 9. Test admin check logic
    console.log('\n9. ADMIN CHECK LOGIC:');
    const signerAddress = await signer.getAddress();
    const owner = await contract.owner();
    console.log('   Signer address:', signerAddress);
    console.log('   Contract owner:', owner);
    console.log('   Is admin (exact):', signerAddress === owner);
    console.log('   Is admin (lowercase):', signerAddress.toLowerCase() === owner.toLowerCase());
    
    // 10. Create test bounty if none exist
    console.log('\n10. TEST BOUNTY CREATION:');
    const currentBounties = await contract.getAllBounties();
    if (currentBounties.length === 0) {
      console.log('   No bounties found, creating test bounty...');
      try {
        const tx = await contract.createBounty(
          "Debug Test Bounty",
          "This is a test bounty created during debugging",
          "https://github.com/test/debug",
          { value: ethers.parseEther("0.01") }
        );
        console.log('   Transaction sent:', tx.hash);
        const receipt = await tx.wait();
        console.log('   Transaction confirmed in block:', receipt.blockNumber);
        
        // Check bounties again
        const newBounties = await contract.getAllBounties();
        console.log('   Bounties after creation:', newBounties.length);
      } catch (e) {
        console.log('   ❌ Bounty creation failed:', e.message);
      }
    } else {
      console.log('   Bounties already exist, skipping creation');
    }
    
  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error);
  }
}

detailedDebug();