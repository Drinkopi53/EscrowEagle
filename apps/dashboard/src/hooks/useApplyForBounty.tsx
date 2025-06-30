"use client";

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import BonusEscrowJson from '../../../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json';
import deployedContractAddress from '../contracts/deployed_contract_address.json';
import { useAccount } from 'wagmi';

const BonusEscrowABI = BonusEscrowJson.abi;

interface UseApplyForBountyResult {
  applyForBounty: (bountyId: string) => void;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
}

export const useApplyForBounty = (): UseApplyForBountyResult => {
  const { address } = useAccount();
  const { data: hash, isPending, isError, error, writeContract } = useWriteContract();

  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const applyForBounty = (bountyId: string) => {
    if (!address) {
      console.error("Wallet not connected. Cannot apply for bounty.");
      return;
    }
    writeContract({
      address: deployedContractAddress.contractAddress as `0x${string}`,
      abi: BonusEscrowABI,
      functionName: 'acceptBounty',
      args: [bountyId],
    });
  };

  return {
    applyForBounty,
    isLoading: isPending || isTxLoading,
    isSuccess: isTxSuccess,
    isError,
    error,
  };
};
