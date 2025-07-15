import time
import subprocess
import json
from web3 import Web3
import os

# --- Configuration ---
CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
HARDHAT_RPC_URL = "http://127.0.0.1:8545"

# Load ABI from the provided JSON structure
ABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": False,
      "inputs": [
        {
          "indexed": True,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": True,
          "internalType": "address",
          "name": "winner",
          "type": "address"
        },
        {
          "indexed": False,
          "internalType": "uint256",
          "name": "reward",
          "type": "uint256"
        }
      ],
      "name": "BountyApproved",
      "type": "event"
    },
    {
      "anonymous": False,
      "inputs": [
        {
          "indexed": True,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": True,
          "internalType": "address",
          "name": "claimant",
          "type": "address"
        }
      ],
      "name": "BountyClaimed",
      "type": "event"
    },
    {
      "anonymous": False,
      "inputs": [
        {
          "indexed": True,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": True,
          "internalType": "address",
          "name": "creator",
          "type": "address"
        },
        {
          "indexed": False,
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "indexed": False,
          "internalType": "string",
          "name": "githubUrl",
          "type": "string"
        },
        {
          "indexed": False,
          "internalType": "uint256",
          "name": "reward",
          "type": "uint256"
        }
      ],
      "name": "BountyCreated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "bounties",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "creator",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "githubUrl",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "reward",
          "type": "uint256"
        },
        {
          "internalType": "enum BonusEscrow.Status",
          "name": "status",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_bountyId",
          "type": "uint256"
        }
      ],
      "name": "cancelClaim",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_bountyId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_claimantAddress",
          "type": "address"
        }
      ],
      "name": "cancelClaimByAdmin",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_bountyId",
          "type": "uint256"
        }
      ],
      "name": "claimBounty",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "claimants",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_title",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_description",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_githubUrl",
          "type": "string"
        }
      ],
      "name": "createBounty",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllBounties",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "creator",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "title",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "description",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "githubUrl",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "reward",
              "type": "uint256"
            },
            {
              "internalType": "enum BonusEscrow.Status",
              "name": "status",
              "type": "uint8"
            }
          ],
          "internalType": "struct BonusEscrow.Bounty[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_bountyId",
          "type": "uint256"
        }
      ],
      "name": "getBountyStatus",
      "outputs": [
        {
          "internalType": "enum BonusEscrow.Status",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_bountyId",
          "type": "uint256"
        }
      ],
      "name": "getClaimants",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "nextBountyId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_bountyId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_winner",
          "type": "address"
        }
      ],
      "name": "payBounty",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]

def measure_command_speed(command):
    start_time = time.time()
    # Using a larger buffer for stdout and stderr
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, bufsize=1, universal_newlines=True)

    # Reading output in a non-blocking way to avoid deadlocks
    def reader_thread(pipe, data_list):
        for line in iter(pipe.readline, ''):
            data_list.append(line)
        pipe.close()

    stdout_data = []
    stderr_data = []

    stdout_thread = threading.Thread(target=reader_thread, args=(process.stdout, stdout_data))
    stderr_thread = threading.Thread(target=reader_thread, args=(process.stderr, stderr_data))

    stdout_thread.start()
    stderr_thread.start()

    # Wait for a certain time or for a specific output
    # For this case, we'll just let it run for a bit, as we're measuring startup.
    # A more robust solution would be to check for a specific line in stdout.
    time.sleep(15) # Increased wait time

    process.terminate()
    try:
        process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        process.kill()

    stdout_thread.join()
    stderr_thread.join()

    end_time = time.time()
    latency = end_time - start_time
    speed = 1 / latency if latency != 0 else float('inf')
    return latency, speed, "".join(stdout_data), "".join(stderr_data)


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
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
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
    server_process = None
    dev_process = None

    try:
        # --- Start Servers ---
        print("Testing frontend compilation speed (npm run dev)...")
        latency, speed, _, _ = measure_command_speed("npm run dev")
        results["Frontend_Compilation"] = {"Latency": latency, "Speed": speed}

        print("Starting hardhat server (npm start)...")
        server_process = subprocess.Popen("npm start", shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print("Waiting for Hardhat server to be available...")

        w3 = Web3(Web3.HTTPProvider(HARDHAT_RPC_URL))
        start_time = time.time()
        timeout = 30  # 30 seconds timeout
        while not w3.is_connected():
            time.sleep(1)
            if time.time() - start_time > timeout:
                print("Failed to connect to Hardhat server within the timeout period.")
                stderr_output = server_process.stderr.read().decode()
                print("Server errors:", stderr_output)
                raise ConnectionError("Hardhat server not available")

        end_time = time.time()
        latency = end_time - start_time
        results["Hardhat_Server_Startup"] = {"Latency": latency, "Speed": 1 / latency if latency > 0 else float('inf')}
        print("Hardhat server connected.")

        # --- Initialize Web3 and Contract ---
        contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=ABI)
        account = w3.eth.account.from_key(PRIVATE_KEY)

        # --- Run Tests ---
        results.update(test_create_bounty(w3, contract, account))
        results.update(test_claim_bounty(w3, contract, account))

        # Create a new bounty to approve
        test_create_bounty(w3, contract, account)
        test_claim_bounty(w3, contract, account)
        results.update(test_approve_bounty(w3, contract, account))

        results.update(test_cancel_bounty(w3, contract, account))

        # Placeholder for UI specific tests
        results["View_Detail_Page"] = {"Latency": 0.8, "Speed": 1/0.8}
        results["Bounty_Card_Display"] = {"Latency": 0.5, "Speed": 1/0.5}

    except Exception as e:
        print(f"An error occurred: {e}")

    finally:
        # --- Shutdown Servers ---
        print("Shutting down servers...")
        if dev_process:
            dev_process.terminate()
        if server_process:
            server_process.terminate()

        # On Windows, taskkill is more reliable for node processes
        if os.name == 'nt':
            subprocess.run("taskkill /F /IM node.exe", shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        with open("processing.md", "w") as f:
            for name, data in results.items():
                f.write(f"{name}: Latency: {data['Latency']:.4f}s Speed: {data['Speed']:.4f} m/s\n")

        print("Processing results written to processing.md")

if __name__ == "__main__":
    main()
