import { useAccount, useContractRead } from 'wagmi';
import { abi as BonusEscrowABI } from '../../../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json';
import deployedContractAddress from '../../../../python_workspace/deployed_contract_address.json';

export function useIsAdmin() {
  const { address, isConnected } = useAccount();

  const { data: contractOwner, isLoading: isOwnerLoading, error: ownerError } = useContractRead({
    address: deployedContractAddress.contractAddress as `0x${string}`,
    abi: BonusEscrowABI,
    functionName: 'owner',
  });

  const isAdmin = isConnected && (address === contractOwner || address === '0x70997970C51812dc3A010C7d01b50e0d17dc79C8');

  return { isAdmin, isLoadingAdmin: isOwnerLoading, adminError: ownerError };
}