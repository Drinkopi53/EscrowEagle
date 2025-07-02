import json
from web3 import Web3

# Read dummy-events.json
dummy_events_path = "../../apps/dashboard/public/dummy-events.json"

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

        # Read the full ABI from the BonusEscrow.json file
        with open("../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json", "r") as f:
            bonus_escrow_json = json.load(f)
            bonus_escrow_abi = bonus_escrow_json.get("abi")

        if not bonus_escrow_abi:
            print("Error: ABI not found in BonusEscrow.json")
            exit()

        if not contract_address:
            print("Error: contractAddress not found in deployed_contract_address.json")
        else:
            print(f"Contract address: {contract_address}")

            # Create contract instance with the full ABI
            contract = w3.eth.contract(address=contract_address, abi=bonus_escrow_abi)

            # Call the owner() function
            try:
                retrieved_owner_address = contract.functions.owner().call()
                print(f"Retrieved owner address from contract: {retrieved_owner_address}")
            except Exception as e:
                print(f"Error calling owner() function: {e}")

            # Oracle logic to read dummy-events.json and call approveBounty
            try:
                with open(dummy_events_path, "r") as f:
                    events = json.load(f)

                for event in events:
                    if event.get("eventType") == "PR_MERGED":
                        bounty_id = event.get("bountyId")
                        winner_wallet = event.get("winnerWallet")
                        pr_link = event.get("prLink")

                        if bounty_id is not None and winner_wallet:
                            print(f"Processing PR_MERGED event for bounty ID: {bounty_id}")
                            print(f"Winner Wallet: {winner_wallet}, PR Link: {pr_link}")

                            # Call the approveBounty function on the smart contract
                            # This assumes the Python script's account is the owner
                            # and has enough ETH to pay for the transaction gas.
                            # In a real scenario, you'd manage private keys securely.
                            try:
                                # Get the owner's address from the contract to use as the sender
                                owner_address = contract.functions.owner().call()
                                w3.eth.default_account = owner_address # Set default account for transactions

                                # Ensure the owner account is unlocked or managed securely
                                # For Hardhat local node, accounts are usually unlocked by default
                                # or can be unlocked with `w3.geth.personal.unlockAccount(owner_address, "password")`

                                # Build and send the transaction
                                tx_hash = contract.functions.approveBounty(
                                    bounty_id
                                ).transact({'from': owner_address})

                                print(f"Transaction sent: {tx_hash.hex()}")
                                receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
                                print(f"Transaction confirmed in block {receipt.blockNumber}")
                                if receipt.status == 1:
                                    print(f"Bounty {bounty_id} approved and paid successfully!")
                                else:
                                    print(f"Transaction for bounty {bounty_id} failed.")
                            except Exception as e:
                                print(f"Error approving bounty {bounty_id}: {e}")
                        else:
                            print(f"Skipping malformed event: {event}")

            except FileNotFoundError:
                print(f"Error: {dummy_events_path} not found. Please ensure it exists.")
            except json.JSONDecodeError:
                print(f"Error: Could not decode JSON from {dummy_events_path}.")
            except Exception as e:
                print(f"An unexpected error occurred during oracle processing: {e}")

    except FileNotFoundError:
        print("Error: deployed_contract_address.json or BonusEscrow.json not found. Please deploy the contract first.")
    except json.JSONDecodeError:
        print("Error: Could not decode JSON from deployed_contract_address.json or BonusEscrow.json.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

else:
    print("Failed to connect to Hardhat node.")
