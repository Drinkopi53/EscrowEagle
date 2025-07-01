import { http, createConfig } from 'wagmi';
import { hardhat } from 'wagmi/chains';
import { injected, metaMask } from 'wagmi/connectors';
import { abi as BonusEscrowABI } from '../../../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json';
import deployedAddress from '../../../../python_workspace/deployed_contract_address.json';

export const config = createConfig({
  chains: [hardhat],
  connectors: [
    injected(),
    metaMask(),
  ],
  transports: {
    [hardhat.id]: http(),
  },
});

export const bonusEscrowContract = {
  address: deployedAddress.contractAddress as `0x${string}`,
  abi: BonusEscrowABI,
};