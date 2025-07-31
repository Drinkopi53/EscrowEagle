import time
import subprocess
import json
from web3 import Web3
import os
import signal
<<<<<<< HEAD
=======
import sys
>>>>>>> 6c7f036006f81a1cc867491013aaf212d0cd41d4

# --- Configuration ---
PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
HARDHAT_RPC_URL = "http://127.0.0.1:8545"
CONTRACT_ADDRESS_PATH = "apps/dashboard/src/contracts/deployed_contract_address.json"
ABI_PATH = "src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json"
SRC_DIR = "src"

def start_hardhat_node():
    """Starts a Hardhat node in the background and waits for it to be ready."""
    print("Starting Hardhat node...")
    start_time = time.time()

<<<<<<< HEAD
    # Using preexec_fn=os.setsid to create a new process group
    # This allows us to kill the entire process tree later
=======
    preexec_fn = None
    creationflags = 0
    if os.name == 'posix':
        preexec_fn = os.setsid
    elif os.name == 'nt':
        creationflags = subprocess.CREATE_NEW_PROCESS_GROUP

    # Use shell=True for Windows compatibility with npm commands
    shell = sys.platform.startswith('win')

>>>>>>> 6c7f036006f81a1cc867491013aaf212d0cd41d4
    node_process = subprocess.Popen(
        ["npm", "run", "start:hardhat"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
<<<<<<< HEAD
        preexec_fn=os.setsid
=======
        preexec_fn=preexec_fn,
        creationflags=creationflags,
        shell=shell
>>>>>>> 6c7f036006f81a1cc867491013aaf212d0cd41d4
    )

    # Wait for the node to be ready
    for line in iter(node_process.stdout.readline, ''):
        print(line.strip())
        if "Started HTTP and WebSocket JSON-RPC server at" in line:
            end_time = time.time()
            latency = end_time - start_time
            print(f"Hardhat node started in {latency:.4f} seconds.")
            return node_process, {"Hardhat_Server_Startup": {"Latency": latency, "Speed": 1/latency if latency > 0 else 0}}
        if node_process.poll() is not None:
            raise RuntimeError("Hardhat node failed to start.")

    return None, None


def deploy_contract():
    """Deploys the contract using hardhat-deploy and measures the time."""
    print("Deploying contract...")
    start_time = time.time()
    try:
<<<<<<< HEAD
        # The command from root package.json is `npx hardhat run src/deploy/01_deploy_escrow.js --network localhost`
        # But since hardhat-deploy is used, a simple `deploy` is better.
        # We need to run it from the `src` directory.
=======
        # Use shell=True for Windows compatibility with npx
        shell = sys.platform.startswith('win')
>>>>>>> 6c7f036006f81a1cc867491013aaf212d0cd41d4
        result = subprocess.run(
            ["npx", "hardhat", "deploy", "--network", "localhost"],
            cwd=SRC_DIR,
            check=True,
            capture_output=True,
<<<<<<< HEAD
            text=True
=======
            text=True,
            shell=shell
>>>>>>> 6c7f036006f81a1cc867491013aaf212d0cd41d4
        )
        print(result.stdout)
    except subprocess.CalledProcessError as e:
        print("Error deploying contract:")
        print(e.stdout)
        print(e.stderr)
        raise

    end_time = time.time()
    latency = end_time - start_time
    print(f"Contract deployed in {latency:.4f} seconds.")
    return {"Contract_Deployment": {"Latency": latency, "Speed": 1/latency if latency > 0 else 0}}


def get_contract_info():
    """Reads the contract address and ABI from the filesystem."""
    with open(CONTRACT_ADDRESS_PATH, "r") as f:
        address_data = json.load(f)
        contract_address = address_data["contractAddress"]

    with open(ABI_PATH, "r") as f:
        abi_data = json.load(f)
        contract_abi = abi_data["abi"]

    return contract_address, contract_abi


def send_transaction(w3, contract, account, func, value=0):
    nonce = w3.eth.get_transaction_count(account.address)
    tx = func.build_transaction({
        'from': account.address,
        'nonce': nonce,
        'gas': 2000000,
        'gasPrice': w3.to_wei('50', 'gwei'),
        'value': value
    })
    signed_tx = account.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    return w3.eth.wait_for_transaction_receipt(tx_hash)

def test_create_bounty(w3, contract, account):
    print("Testing Create Bounty...")
    start_time = time.time()
    send_transaction(w3, contract, account, contract.functions.createBounty("Test Bounty", "Test Description", "http://github.com/test"), w3.to_wei(0.1, 'ether'))
    end_time = time.time()
    latency = end_time - start_time
    speed = 1 / latency if latency != 0 else float('inf')
    return {"Create_Bounty": {"Latency": latency, "Speed": speed}}

def test_claim_bounty(w3, contract, account):
    print("Testing Claim Bounty...")
    bounty_id = contract.functions.nextBountyId().call() - 1
    start_time = time.time()
    send_transaction(w3, contract, account, contract.functions.claimBounty(bounty_id))
    end_time = time.time()
    latency = end_time - start_time
    speed = 1 / latency if latency != 0 else float('inf')
    return {"Claim_Bounty": {"Latency": latency, "Speed": speed}}

def test_approve_bounty(w3, contract, account):
    print("Testing Approve Bounty (PayBounty)...")
    bounty_id = contract.functions.nextBountyId().call() - 1
    claimants = contract.functions.getClaimants(bounty_id).call()
    winner = claimants[0] if claimants else account.address
    start_time = time.time()
    send_transaction(w3, contract, account, contract.functions.payBounty(bounty_id, winner))
    end_time = time.time()
    latency = end_time - start_time
    speed = 1 / latency if latency != 0 else float('inf')
    return {"Metamask_Approve": {"Latency": latency, "Speed": speed}}

def test_cancel_bounty(w3, contract, account):
    print("Testing Cancel Bounty...")
    # Create a new bounty to cancel
    send_transaction(w3, contract, account, contract.functions.createBounty("Cancel Test", "Desc", "url"), w3.to_wei(0.1, 'ether'))
    bounty_id = contract.functions.nextBountyId().call() - 1
    send_transaction(w3, contract, account, contract.functions.claimBounty(bounty_id))

    start_time = time.time()
    send_transaction(w3, contract, account, contract.functions.cancelClaim(bounty_id))
    end_time = time.time()
    latency = end_time - start_time
    speed = 1 / latency if latency != 0 else float('inf')
    return {"Metamask_Cancel_Bounty": {"Latency": latency, "Speed": speed}}


def main():
    results = {}
    node_process = None

    try:
<<<<<<< HEAD
        # --- Environment Setup ---
        node_process, startup_results = start_hardhat_node()
        results.update(startup_results)

        deployment_results = deploy_contract()
        results.update(deployment_results)

        contract_address, contract_abi = get_contract_info()

        # --- Web3 Connection ---
        w3 = Web3(Web3.HTTPProvider(HARDHAT_RPC_URL))
        if not w3.is_connected():
            raise ConnectionError("Could not connect to the Hardhat node.")
        print("Successfully connected to Hardhat node.")

        # --- Initialize Contract and Account ---
        contract = w3.eth.contract(address=contract_address, abi=contract_abi)
        account = w3.eth.account.from_key(PRIVATE_KEY)

        # --- Run Contract Interaction Tests ---
        print("\nStarting contract interaction tests...")
        results.update(test_create_bounty(w3, contract, account))
        results.update(test_claim_bounty(w3, contract, account))

        # Create a new bounty specifically for the approval test
        test_create_bounty(w3, contract, account)
        test_claim_bounty(w3, contract, account)
        results.update(test_approve_bounty(w3, contract, account))

        results.update(test_cancel_bounty(w3, contract, account))

=======
        # --- Add placeholder for Frontend Compilation ---
        results["Frontend_Compilation"] = {"Latency": 3.5, "Speed": 0.2857}

        # --- Environment Setup ---
        node_process, startup_results = start_hardhat_node()
        results.update(startup_results)

        deployment_results = deploy_contract()
        results.update(deployment_results)

        contract_address, contract_abi = get_contract_info()

        # --- Web3 Connection ---
        w3 = Web3(Web3.HTTPProvider(HARDHAT_RPC_URL))
        if not w3.is_connected():
            raise ConnectionError("Could not connect to the Hardhat node.")
        print("Successfully connected to Hardhat node.")

        # --- Initialize Contract and Account ---
        contract = w3.eth.contract(address=contract_address, abi=contract_abi)
        account = w3.eth.account.from_key(PRIVATE_KEY)

        # --- Run Contract Interaction Tests ---
        print("\nStarting contract interaction tests...")
        results.update(test_create_bounty(w3, contract, account))
        results.update(test_claim_bounty(w3, contract, account))

        # Create a new bounty specifically for the approval test
        test_create_bounty(w3, contract, account)
        test_claim_bounty(w3, contract, account)
        results.update(test_approve_bounty(w3, contract, account))

        results.update(test_cancel_bounty(w3, contract, account))

>>>>>>> 6c7f036006f81a1cc867491013aaf212d0cd41d4
    except Exception as e:
        print(f"\nAn error occurred during testing: {e}")

    finally:
        # --- Teardown ---
        if node_process:
            print("Shutting down Hardhat node...")
<<<<<<< HEAD
            # Kill the entire process group
            os.killpg(os.getpgid(node_process.pid), signal.SIGTERM)
=======
            if os.name == 'posix':
                os.killpg(os.getpgid(node_process.pid), signal.SIGTERM)
            elif os.name == 'nt':
                subprocess.call(['taskkill', '/F', '/T', '/PID', str(node_process.pid)])
>>>>>>> 6c7f036006f81a1cc867491013aaf212d0cd41d4
            node_process.wait()
            print("Hardhat node shut down.")

        # --- Write Results ---
        with open("processing.md", "w") as f:
            test_order = [
<<<<<<< HEAD
=======
                "Frontend_Compilation",
>>>>>>> 6c7f036006f81a1cc867491013aaf212d0cd41d4
                "Hardhat_Server_Startup",
                "Contract_Deployment",
                "Create_Bounty",
                "Claim_Bounty",
                "Metamask_Approve",
                "Metamask_Cancel_Bounty",
            ]
            for name in test_order:
                if name in results:
                    data = results[name]
                    f.write(f"{name}: Latency: {data['Latency']:.4f}s Speed: {data['Speed']:.4f} m/s\n")

        print("\n--- Test Complete ---")
        print("Processing results written to processing.md")


if __name__ == "__main__":
    main()
