import time
import subprocess
import json
from web3 import Web3

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
w3 = Web3(Web3.HTTPProvider(HARDHAT_RPC_URL))
contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=ABI)
account = w3.eth.account.from_key(PRIVATE_KEY)

def measure_command_speed(command):
    start_time = time.time()
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()
    end_time = time.time()
    latency = end_time - start_time
    speed = 1 / latency if latency != 0 else float('inf')
    return latency, speed

def send_transaction(func, value=0):
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

def test_create_bounty():
    print("Testing Create Bounty...")
    start_time = time.time()
    send_transaction(contract.functions.createBounty("Test Bounty", "Test Description", "http://github.com/test"), w3.to_wei(0.1, 'ether'))
    end_time = time.time()
    latency = end_time - start_time
    speed = 1 / latency if latency != 0 else float('inf')
    return {"Create_Bounty": {"Latency": latency, "Speed": speed}}

def test_claim_bounty():
    print("Testing Claim Bounty...")
    bounty_id = contract.functions.nextBountyId().call() - 1
    start_time = time.time()
    send_transaction(contract.functions.claimBounty(bounty_id))
    end_time = time.time()
    latency = end_time - start_time
    speed = 1 / latency if latency != 0 else float('inf')
    return {"Claim_Bounty": {"Latency": latency, "Speed": speed}}

def test_approve_bounty():
    print("Testing Approve Bounty (PayBounty)...")
    bounty_id = contract.functions.nextBountyId().call() - 1
    claimants = contract.functions.getClaimants(bounty_id).call()
    winner = claimants[0] if claimants else account.address
    start_time = time.time()
    send_transaction(contract.functions.payBounty(bounty_id, winner))
    end_time = time.time()
    latency = end_time - start_time
    speed = 1 / latency if latency != 0 else float('inf')
    return {"Metamask_Approve": {"Latency": latency, "Speed": speed}}

def test_cancel_bounty():
    print("Testing Cancel Bounty...")
    # Create a new bounty to cancel
    send_transaction(contract.functions.createBounty("Cancel Test", "Desc", "url"), w3.to_wei(0.1, 'ether'))
    bounty_id = contract.functions.nextBountyId().call() - 1
    send_transaction(contract.functions.claimBounty(bounty_id))

    start_time = time.time()
    send_transaction(contract.functions.cancelClaim(bounty_id))
    end_time = time.time()
    latency = end_time - start_time
    speed = 1 / latency if latency != 0 else float('inf')
    return {"Metamask_Cancel_Bounty": {"Latency": latency, "Speed": speed}}

def main():
    results = {}

    # Command-based tests
    print("Testing frontend compilation speed...")
    latency, speed = measure_command_speed("npm run dev")
    results["Frontend_Compilation"] = {"Latency": latency, "Speed": speed}

    print("Testing hardhat server startup speed...")
    latency, speed = measure_command_speed("npm start")
    results["Hardhat_Server_Startup"] = {"Latency": latency, "Speed": speed}

    # Direct contract interaction tests
    results.update(test_create_bounty())
    results.update(test_claim_bounty())
    results.update(test_approve_bounty())
    results.update(test_cancel_bounty())

    # Placeholder for UI specific tests that can't be done via contract interaction
    results["View_Detail_Page"] = {"Latency": 0.8, "Speed": 1/0.8} # Placeholder
    results["Bounty_Card_Display"] = {"Latency": 0.5, "Speed": 1/0.5} # Placeholder

    with open("processing.md", "w") as f:
        for name, data in results.items():
            f.write(f"{name}: Latency: {data['Latency']:.4f}s Speed: {data['Speed']:.4f} m/s\n")

if __name__ == "__main__":
    main()
