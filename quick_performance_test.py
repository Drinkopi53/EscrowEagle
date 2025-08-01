import json
import time
from web3 import Web3, HTTPProvider
import statistics

# --- Configuration ---
TEST_ITERATIONS = 2
CONTRACT_ADDRESS_PATH = "apps/dashboard/src/contracts/deployed_contract_address.json"
ABI_PATH = "src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json"

def setup_test_environment():
    """Setup lightweight test environment using local provider"""
    print("Setting up test environment...")
    # Initialize Web3 with local test provider
    w3 = Web3(HTTPProvider('http://localhost:8545'))
    
    # Use the default test account address
    account_address = w3.eth.accounts[0]
    w3.eth.default_account = account_address
    
    return w3, account_address

def get_contract_abi():
    """Read contract ABI from file"""
    with open(ABI_PATH, "r") as f:
        abi_data = json.load(f)
        return abi_data["abi"]

def deploy_contract(w3, account_address, contract_abi):
    """Deploy contract to local network"""
    # Get contract bytecode from the artifact
    with open(ABI_PATH, "r") as f:
        contract_data = json.load(f)
        bytecode = contract_data["bytecode"]
    
    Contract = w3.eth.contract(abi=contract_abi, bytecode=bytecode)
    tx_hash = Contract.constructor().transact({"from": account_address})
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    return w3.eth.contract(address=tx_receipt.contractAddress, abi=contract_abi)

def calculate_metrics(measurements):
    """Calculate performance metrics"""
    if not measurements:
        return {"Latency": 0, "Speed": 0}
    
    avg_latency = statistics.mean(measurements)
    if len(measurements) > 2:
        measurements = [x for x in measurements if abs(x - avg_latency) < 2 * statistics.stdev(measurements)]
        if measurements:
            avg_latency = statistics.mean(measurements)
    
    return {
        "Latency": avg_latency,
        "Speed": 1/avg_latency if avg_latency > 0 else 0
    }

def test_create_bounty(w3, contract, account_address):
    print("\nTesting Create Bounty...")
    latencies = []
    
    for i in range(TEST_ITERATIONS):
        print(f"Create Bounty iteration {i+1}/{TEST_ITERATIONS}")
        start_time = time.time()
        try:
            tx_hash = contract.functions.createBounty(
                f"Test Bounty {i}",
                "Test Description",
                "http://github.com/test"
            ).transact({
                'from': account_address,
                'value': w3.to_wei(0.1, 'ether')
            })
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
            end_time = time.time()
            latency = end_time - start_time
            print(f"Create Bounty {i+1} completed in {latency:.4f} seconds")
            latencies.append(latency)
        except Exception as e:
            print(f"Error in Create Bounty iteration {i+1}: {e}")
            continue
    
    return calculate_metrics(latencies)

def test_claim_bounty(w3, contract, account_address):
    print("\nTesting Claim Bounty...")
    latencies = []
    
    for i in range(TEST_ITERATIONS):
        print(f"Claim Bounty iteration {i+1}/{TEST_ITERATIONS}")
        try:
            # Create a new bounty first for each claim test
            tx_hash = contract.functions.createBounty(
                f"Claim Test Bounty {i}",
                "Test Description",
                "http://github.com/test"
            ).transact({
                'from': account_address,
                'value': w3.to_wei(0.1, 'ether')
            })
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
            
            # Now claim the newly created bounty
            bounty_id = contract.functions.nextBountyId().call() - 1
            start_time = time.time()
            tx_hash = contract.functions.claimBounty(bounty_id).transact({'from': account_address})
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
            end_time = time.time()
            latency = end_time - start_time
            print(f"Claim Bounty {i+1} completed in {latency:.4f} seconds")
            latencies.append(latency)
        except Exception as e:
            print(f"Error in Claim Bounty iteration {i+1}: {e}")
            continue
    
    return calculate_metrics(latencies)

def test_approve_bounty(w3, contract, account_address):
    print("\nTesting Approve Bounty...")
    latencies = []
    
    for i in range(TEST_ITERATIONS):
        print(f"Approve Bounty iteration {i+1}/{TEST_ITERATIONS}")
        try:
            # Create a new bounty first
            tx_hash = contract.functions.createBounty(
                f"Approve Test Bounty {i}",
                "Test Description",
                "http://github.com/test"
            ).transact({
                'from': account_address,
                'value': w3.to_wei(0.1, 'ether')
            })
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
            
            # Get the bounty ID
            bounty_id = contract.functions.nextBountyId().call() - 1
            
            # Claim the bounty
            tx_hash = contract.functions.claimBounty(bounty_id).transact({'from': account_address})
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
            
            # Now approve the bounty
            start_time = time.time()
            tx_hash = contract.functions.payBounty(bounty_id, account_address).transact({'from': account_address})
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
            end_time = time.time()
            latency = end_time - start_time
            print(f"Approve Bounty {i+1} completed in {latency:.4f} seconds")
            latencies.append(latency)
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
            end_time = time.time()
            latency = end_time - start_time
            print(f"Approve Bounty {i+1} completed in {latency:.4f} seconds")
            latencies.append(latency)
        except Exception as e:
            print(f"Error in Approve Bounty iteration {i+1}: {e}")
            continue
    
    return calculate_metrics(latencies)

def main():
    results = {}
    try:
        # Setup test environment
        w3, account = setup_test_environment()
        contract_abi = get_contract_abi()
        contract = deploy_contract(w3, account, contract_abi)
        
        # Run tests
        results["Create_Bounty"] = test_create_bounty(w3, contract, account)
        results["Claim_Bounty"] = test_claim_bounty(w3, contract, account)
        results["Approve_Bounty"] = test_approve_bounty(w3, contract, account)
        
        # Write results
        with open("quick_test_results.md", "w") as f:
            for name, metrics in results.items():
                f.write(f"{name}: Latency: {metrics['Latency']:.4f}s Speed: {metrics['Speed']:.4f} m/s\n")
        
        print("\nTest results written to quick_test_results.md")
        
    except Exception as e:
        print(f"\nAn error occurred during testing: {e}")

if __name__ == "__main__":
    main()
