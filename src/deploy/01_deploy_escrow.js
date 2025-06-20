// This script deploys the BonusEscrow.sol contract using Hardhat.

const { ethers } = require("hardhat");
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  try {
    // Get the contract factory for BonusEscrow
    const BonusEscrow = await ethers.getContractFactory("BonusEscrow");

    // Deploy the contract
    console.log("Deploying BonusEscrow contract...");
    const bonusEscrow = await BonusEscrow.deploy();

    // Wait for the contract to be deployed
    await bonusEscrow.waitForDeployment();

    // Print the deployed contract's address
    console.log("BonusEscrow deployed to:", bonusEscrow.target);

    // Save the deployed contract's address to a JSON file
    const deployedAddressPath = path.join(__dirname, "../../python_workspace/deployed_contract_address.json");

    // Ensure the directory exists
    const dirname = path.dirname(deployedAddressPath);
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }

    fs.writeFileSync(
      deployedAddressPath,
      JSON.stringify({ contractAddress: bonusEscrow.target }, null, 2)
    );
    console.log(`Contract address saved to ${deployedAddressPath}`);

  } catch (error) {
    console.error("Error deploying contract:", error);
    process.exitCode = 1; // Indicate an error exit
  }
}

// Call the main function and handle its promise
main()
  .then(() => process.exit(process.exitCode || 0)) // Exit with 0 if no error, or the error code
  .catch((error) => {
    console.error("Unhandled error in main:", error);
    process.exit(1);
  });
