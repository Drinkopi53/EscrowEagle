const { network } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const fs = require("fs");
const path = require("path");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("----------------------------------------------------");
  log("Deploying BonusEscrow and waiting for confirmations...");
  const bonusEscrow = await deploy("BonusEscrow", {
    from: deployer,
    args: [],
    log: true,
  });
  log(`BonusEscrow deployed at ${bonusEscrow.address}`);

  // Save the deployed contract's address to a JSON file
  const deployedAddressPath = path.join(__dirname, "../../apps/dashboard/src/contracts/deployed_contract_address.json");

  // Ensure the directory exists
  const dirname = path.dirname(deployedAddressPath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }

  fs.writeFileSync(
    deployedAddressPath,
    JSON.stringify({ contractAddress: bonusEscrow.address }, null, 2)
  );
  log(`Contract address saved to ${deployedAddressPath}`);
};

module.exports.tags = ["all", "bonus-escrow"];
