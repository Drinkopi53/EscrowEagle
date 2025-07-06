import json
from web3 import Web3

# TODO: Read dummy-events.json

# Define the Hardhat node URL
hardhat_node_url = "http://127.0.0.1:8545/"

# Create a Web3 instance
w3 = Web3(Web3.HTTPProvider(hardhat_node_url))

# Check if the connection is successful
if w3.is_connected():
    print("Successfully connected to Hardhat node.")

    # Read contract address from JSON file
    try:
        with open("./deployed_contract_address.json", "r") as f: # Adjusted path
            data = json.load(f)
            contract_address = data.get("contractAddress")

        if not contract_address:
            print("Error: contractAddress not found in deployed_contract_address.json")
        else:
            print(f"Contract address: {contract_address}")

            # Define simplified ABI for BonusEscrow (only owner function)
            simplified_abi = [
                {
                    "inputs": [],
                    "name": "owner",
                    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
                    "stateMutability": "view",
                    "type": "function",
                }
            ]

            # Create contract instance
            contract = w3.eth.contract(address=contract_address, abi=simplified_abi)

            # Call the owner() function
            try:
                retrieved_owner_address = contract.functions.owner().call()
                print(f"Retrieved owner address from contract: {retrieved_owner_address}")
            except Exception as e:
                print(f"Error calling owner() function: {e}")

    except FileNotFoundError:
        print("Error: deployed_contract_address.json not found. Please deploy the contract first.")
    except json.JSONDecodeError:
        print("Error: Could not decode JSON from deployed_contract_address.json.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

else:
    print("Failed to connect to Hardhat node.")
