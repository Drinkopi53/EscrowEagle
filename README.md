# Local Smart Contract Interaction Environment

## Project Description

This project provides a local simulation environment for interacting with an Ethereum smart contract using a Python script. It utilizes Hardhat for setting up and running a local Ethereum node and `web3.py` for the Python-based interaction with the deployed smart contract.

The primary components are:
- A simple `BonusEscrow.sol` smart contract.
- A Hardhat environment for compiling, deploying, and testing the contract.
- A Python script (`python_workspace/src/main.py`) that connects to the local Hardhat node, reads the deployed contract's address, and interacts with its functions.

## Prerequisites

- **Node.js:** A recent LTS version (e.g., 18.x or 20.x). You can download it from [nodejs.org](https://nodejs.org/).
- **Python:** A recent version (e.g., 3.9 or newer). You can download it from [python.org](https://www.python.org/).
- **pip:** Python package installer (usually comes with Python).

## Setup & Installation

### Hardhat Environment (Node.js)

This project uses Hardhat to manage the Ethereum development environment. The necessary dependencies are listed in `package.json`.

1.  **Install Node.js dependencies:**
    Open a terminal in the root directory of this project and run:
    ```bash
    npm install
    ```
    (If you prefer Yarn: `yarn install`)
    This will install Hardhat, Ethers.js, and other required packages.

### Python Environment

The Python script and its dependencies are managed within the `python_workspace` directory.

1.  **Navigate to the Python workspace:**
    ```bash
    cd python_workspace
    ```

2.  **Create a Python virtual environment:**
    It's highly recommended to use a virtual environment to manage Python dependencies for this project.
    ```bash
    python -m venv venv
    ```
    (On some systems, you might need to use `python3` explicitly: `python3 -m venv venv`)

3.  **Activate the virtual environment:**
    -   **Windows:**
        ```bash
        .\venv\Scripts\activate
        ```
    -   **macOS/Linux:**
        ```bash
        source venv/bin/activate
        ```
    Your terminal prompt should change to indicate that the virtual environment is active (e.g., `(venv)`).

4.  **Install Python dependencies:**
    While the virtual environment is active, install the required packages:
    ```bash
    pip install -r requirements.txt
    ```

5.  **Deactivating the virtual environment:**
    When you are finished working on the project, you can deactivate the virtual environment by simply typing:
    ```bash
    deactivate
    ```

## Running the Simulation

Follow these steps in order to run the full simulation:

### 1. Start Hardhat Node

This command starts a local Ethereum blockchain instance, which you can use for development and testing.

1.  Open a terminal in the **project root directory**.
2.  Run the following command:
    ```bash
    npm run start:hardhat
    ```
    This will start a local Ethereum node, typically listening on `http://127.0.0.1:8545/`. You will see a list of available accounts and their private keys. Keep this terminal window open.

### 2. Deploy Smart Contract

This step compiles (if necessary) and deploys the `BonusEscrow.sol` contract to the local Hardhat node started in the previous step.

1.  Open a **new terminal** in the **project root directory**.
2.  Run the deployment script:
    ```bash
    npm run deploy:contract
    ```
    This script will:
    - Connect to the `localhost` network (the Hardhat node you just started).
    - Deploy `BonusEscrow.sol`.
    - Print the deployed contract's address to the console.
    - Create/update the `python_workspace/deployed_contract_address.json` file with the address.

### 3. Run Python Script

This script interacts with the deployed smart contract.

1.  Open a **new terminal** (or reuse one where the virtual environment can be activated).
2.  Navigate to the `python_workspace` directory:
    ```bash
    cd python_workspace
    ```
3.  **Activate the Python virtual environment** (if it's not already active from the setup steps):
    -   Windows: `.\venv\Scripts\activate`
    -   macOS/Linux: `source venv/bin/activate`
4.  Run the Python script:
    ```bash
    python src/main.py
    ```
    (Or `python3 src/main.py` if needed)
    The script will:
    - Connect to the Hardhat node.
    - Read the contract address from `deployed_contract_address.json`.
    - Instantiate the contract using `web3.py`.
    - Call the `owner()` function of the smart contract and print the owner's address.

## Project Structure

```
.
├── src/
│   ├── contracts/
│   │   └── BonusEscrow.sol       # The Solidity smart contract
│   └── deploy/
│       └── 01_deploy_escrow.js   # Hardhat script for deploying the contract
├── python_workspace/
│   ├── venv/                     # Python virtual environment (created by user)
│   ├── src/
│   │   └── main.py               # Python script for contract interaction
│   ├── requirements.txt          # Python dependencies (e.g., web3)
│   └── deployed_contract_address.json # Stores the deployed contract's address
├── package.json                  # Node.js project metadata, dependencies, and scripts
├── hardhat.config.js             # Hardhat configuration (typical Hardhat file)
└── README.md                     # This file
```

-   `src/contracts/BonusEscrow.sol`: The smart contract source code.
-   `src/deploy/01_deploy_escrow.js`: The Hardhat script used to deploy the `BonusEscrow` contract.
-   `python_workspace/`: Contains all Python-related code and dependencies.
    -   `python_workspace/requirements.txt`: Lists the Python packages required for the project (e.g., `web3`).
    -   `python_workspace/src/main.py`: The main Python script that uses `web3.py` to connect to the Hardhat node and interact with the deployed smart contract.
    -   `python_workspace/deployed_contract_address.json`: This file is automatically generated by the deployment script and stores the address of the deployed `BonusEscrow` contract. The Python script reads this file to know where the contract is located on the blockchain.
-   `package.json`: Node.js project metadata, dependencies, and scripts.
-   `hardhat.config.js`: Standard Hardhat project configuration file (assumed to be present for a Hardhat project).
