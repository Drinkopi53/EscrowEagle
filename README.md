# Trust-Chain Bonus: Local Simulation Environment

## Project Overview

This project establishes a local simulation environment for a transparent and automated bonus system, leveraging Ethereum smart contracts on a local blockchain. It is designed to validate the end-to-end workflow and business logic using dummy data, without requiring external services or public blockchain interaction. The simulation utilizes Hardhat for the local Ethereum node and smart contract management, and a Python script with `web3.py` for interacting with the deployed contracts based on simulated events.

## Key Features

### Implemented Features

*   **Local Smart Contract (`BonusEscrow.sol`):** Core logic for locking and paying bonuses, deployed on a local Hardhat Network. Basic functionalities like `constructor` and `deposit` are implemented.
*   **Hardhat Deployment Script:** Automates the deployment of `BonusEscrow.sol` to the local Hardhat Network and records the deployed contract address.
*   **Python Mock Oracle Script (`python_workspace/src/main.py`):** Connects to the local Hardhat node, reads the deployed contract address, and demonstrates basic interaction by reading public contract data (e.g., `owner`). This script is designed to simulate external event triggers.
*   **`dummy-events.json`:** A JSON file serving as the source for simulated external events, allowing manual input of performance triggers.

### Planned Features

*   **Web Dashboard (Frontend):** A simple Next.js (React) interface using Ethers.js to monitor smart contract state (e.g., escrow balance) and facilitate user interaction with the local blockchain.
*   **Comprehensive Mock Oracle Logic:** Further development of the Python script to read specific events from `dummy-events.json` and trigger `releaseBonus()` functions on the smart contract based on these events.

## Project Status & Recent Milestones

The `spesifikasi-produk.md` (Local Simulation Version) has been successfully validated, providing a clear product vision and requirements. The foundational elements of the local simulation project are fully initialized, including the monorepo structure, Next.js application setup, Hardhat project, Python oracle script framework, and initial dummy data files. Significant progress has been made in establishing basic communication between the Solidity smart contract on Hardhat Network and the Python script using `web3.py`, with core contract functions implemented and deployment/interaction scripts in place.

## Prerequisites

*   **Node.js:** A recent LTS version (e.g., 18.x or 20.x). Download from [nodejs.org](https://nodejs.org/).
*   **Python:** A recent version (e.g., 3.9 or newer). Download from [python.org](https://www.python.org/).
*   **pip:** Python package installer (usually comes with Python).

## Setup & Installation

### Hardhat Environment (Node.js)

This project uses Hardhat to manage the Ethereum development environment. The necessary dependencies are listed in `package.json`.

1.  **Install Node.js dependencies:**
    Open a terminal in the **project root directory** and run:
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

Follow these steps in order to run the full simulation workflow:

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
    -   Connect to the `localhost` network (the Hardhat node you just started).
    -   Deploy `BonusEscrow.sol`.
    -   Print the deployed contract's address to the console.
    -   Create/update the `python_workspace/deployed_contract_address.json` file with the address.

### 3. Run Python Script (Mock Oracle)

This script acts as the mock oracle, interacting with the deployed smart contract based on `dummy-events.json`.

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
    -   Connect to the Hardhat node.
    -   Read the contract address from `deployed_contract_address.json`.
    -   Instantiate the contract using `web3.py`.
    -   Call the `owner()` function of the smart contract and print the owner's address (this will be extended to process `dummy-events.json` and trigger `releaseBonus()` in future iterations).

## Project Structure

```
.
├── memory-bank/
│   ├── architecture.md             # Project architectural overview
│   ├── papan-proyek.md             # Project board and task tracking
│   ├── progress.md                 # Summary of project progress and milestones
│   └── spesifikasi-produk.md       # Product requirements document (local simulation)
├── src/
│   ├── contracts/
│   │   └── BonusEscrow.sol           # The Solidity smart contract
│   └── deploy/
│       └── 01_deploy_escrow.js       # Hardhat script for deploying the contract
├── python_workspace/
│   ├── venv/                         # Python virtual environment (created by user)
│   ├── src/
│   │   └── main.py                   # Python script for contract interaction (mock oracle)
│   ├── requirements.txt              # Python dependencies (e.g., web3)
│   └── deployed_contract_address.json # Stores the deployed contract's address
├── package.json                      # Node.js project metadata, dependencies, and scripts
├── hardhat.config.js                 # Hardhat configuration
├── dummy-events.json                 # Simulated external event data
└── README.md                         # This file
```

*   `memory-bank/`: Contains project documentation, specifications, and progress tracking.
*   `src/contracts/BonusEscrow.sol`: The smart contract source code.
*   `src/deploy/01_deploy_escrow.js`: The Hardhat script used to deploy the `BonusEscrow` contract.
*   `python_workspace/`: Contains all Python-related code and dependencies.
    *   `python_workspace/requirements.txt`: Lists the Python packages required for the project (e.g., `web3`).
    *   `python_workspace/src/main.py`: The main Python script that uses `web3.py` to connect to the Hardhat node and interact with the deployed smart contract.
    *   `python_workspace/deployed_contract_address.json`: This file is automatically generated by the deployment script and stores the address of the deployed `BonusEscrow` contract. The Python script reads this file to know where the contract is located on the blockchain.
*   `package.json`: Node.js project metadata, dependencies, and scripts.
*   `hardhat.config.js`: Standard Hardhat project configuration file.
*   `dummy-events.json`: The JSON file used to simulate external events for the mock oracle.

## Development Workflow

Developers can follow these steps for common development tasks:

1.  **Smart Contract Development:** Modify [`src/contracts/BonusEscrow.sol`](src/contracts/BonusEscrow.sol).
2.  **Deployment Script Updates:** Adjust [`src/deploy/01_deploy_escrow.js`](src/deploy/01_deploy_escrow.js) as needed for contract changes.
3.  **Python Mock Oracle Logic:** Enhance [`python_workspace/src/main.py`](python_workspace/src/main.py) to implement more sophisticated event processing and contract interactions.
4.  **Simulated Data:** Update [`dummy-events.json`](dummy-events.json) to test different event scenarios.
5.  **Testing:** Run Hardhat tests for smart contracts (currently not explicitly defined in `package.json` but can be added).

## Additional Documentation

*   **Product Specification:** [`memory-bank/spesifikasi-produk.md`](memory-bank/spesifikasi-produk.md)
*   **Architectural Overview:** [`memory-bank/architecture.md`](memory-bank/architecture.md)
*   **Project Progress:** [`memory-bank/progress.md`](memory-bank/progress.md)
*   **Project Board:** [`memory-bank/papan-proyek.md`](memory-bank/papan-proyek.md)
*   **Vibe Coding Guides:** Refer to the `vibe-guide/` and `petunjuk-vibe-coding-main/` directories for general development guidelines and best practices.
