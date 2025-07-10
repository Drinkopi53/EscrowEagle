// Test script to check if wagmi configuration works correctly
const { createPublicClient, http } = require('viem');
const { hardhat } = require('viem/chains');

async function testWagmiConnection() {
  console.log('=== TESTING WAGMI CONNECTION ===\n');
  
  try {
    // Create public client similar to wagmi
    const client = createPublicClient({
      chain: hardhat,
      transport: http('http://localhost:8545')
    });
    
    console.log('1. CLIENT CREATION:');
    console.log('   ✅ Public client created');
    console.log('   Chain ID:', hardhat.id);
    console.log('   Chain name:', hardhat.name);
    console.log('   RPC URL: http://localhost:8545');
    
    // Test basic connection
    console.log('\n2. BASIC CONNECTION TEST:');
    const blockNumber = await client.getBlockNumber();
    console.log('   ✅ Block number:', blockNumber.toString());
    
    const chainId = await client.getChainId();
    console.log('   ✅ Chain ID:', chainId);
    
    // Test contract reading
    console.log('\n3. CONTRACT READING TEST:');
    const deployedContractAddress = require('./src/contracts/deployed_contract_address.json');
    const BonusEscrowJson = require('../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json');
    
    console.log('   Contract address:', deployedContractAddress.contractAddress);
    
    // Test contract call
    const ownerResult = await client.readContract({
      address: deployedContractAddress.contractAddress,
      abi: BonusEscrowJson.abi,
      functionName: 'owner',
    });
    console.log('   ✅ Contract owner:', ownerResult);
    
    const bountiesResult = await client.readContract({
      address: deployedContractAddress.contractAddress,
      abi: BonusEscrowJson.abi,
      functionName: 'getAllBounties',
    });
    console.log('   ✅ Bounties count:', bountiesResult.length);
    console.log('   ✅ First bounty:', bountiesResult[0] ? 'Exists' : 'None');
    
    if (bountiesResult.length > 0) {
      console.log('\n4. BOUNTY DATA ANALYSIS:');
      const firstBounty = bountiesResult[0];
      console.log('   Raw bounty data:', firstBounty);
      console.log('   Bounty type:', typeof firstBounty);
      console.log('   Bounty length:', firstBounty?.length);
      console.log('   Is array:', Array.isArray(firstBounty));
      
      if (firstBounty) {
        console.log('   Bounty structure:');
        console.log('   - [0] ID:', firstBounty[0]?.toString());
        console.log('   - [1] Creator:', firstBounty[1]);
        console.log('   - [2] Title:', firstBounty[2]);
        console.log('   - [3] Description:', firstBounty[3]);
        console.log('   - [4] GitHub URL:', firstBounty[4]);
        console.log('   - [5] Reward:', firstBounty[5]?.toString());
        console.log('   - [6] Status:', firstBounty[6]?.toString());
        console.log('   - [7] Claimant:', firstBounty[7]);
        console.log('   - [8] Solution URL:', firstBounty[8]);
        
        // Try different access methods
        console.log('\n   Alternative access methods:');
        console.log('   - firstBounty.id:', firstBounty.id);
        console.log('   - firstBounty.creator:', firstBounty.creator);
        console.log('   - firstBounty.title:', firstBounty.title);
        
        // Check all properties
        console.log('\n   All properties:');
        for (let key in firstBounty) {
          console.log(`   - ${key}:`, firstBounty[key]);
        }
      }
    }
    
    console.log('\n✅ ALL TESTS PASSED - Wagmi should work correctly');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Full error:', error);
  }
}

testWagmiConnection();