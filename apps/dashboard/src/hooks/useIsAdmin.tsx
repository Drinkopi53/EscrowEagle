"use client";

import { useAccount, useReadContract } from 'wagmi';
import BonusEscrowJson from '../../../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json';
import deployedContractAddress from '../contracts/deployed_contract_address.json';

const BonusEscrowABI = BonusEscrowJson.abi;

export const useIsAdmin = () => {
  const { address: userAddress } = useAccount();

  const { data: ownerAddress, isLoading: isAdminLoading } = useReadContract({
    address: deployedContractAddress.contractAddress as `0x${string}`,
    abi: BonusEscrowABI,
    functionName: 'owner',
  });

  const isAdmin = !!(userAddress && ownerAddress && userAddress.toLowerCase() === (ownerAddress as string).toLowerCase());

  return { isAdmin, isAdminLoading };
};