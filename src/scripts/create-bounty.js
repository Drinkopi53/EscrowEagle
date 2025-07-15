const { ethers } = require("hardhat");
const deployedContractAddress = require("../apps/dashboard/src/contracts/deployed_contract_address.json");
const BonusEscrowJson = require("../artifacts/contracts/BonusEscrow.sol/BonusEscrow.json");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Creating bounty with the account:", deployer.address);

  const contract = new ethers.Contract(
    deployedContractAddress.contractAddress,
    BonusEscrowJson.abi,
    deployer
  );

  const reward = ethers.parseEther("0.1");
  const tx = await contract.createBounty(
    "Test Bounty from Script",
    "This is a test bounty created from a hardhat script.",
    "https://github.com/example/repo",
    { value: reward }
  );

  await tx.wait();

  console.log("Bounty created successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
