"use client";

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import BonusEscrowJson from '../../../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json';
import deployedContractAddress from '../contracts/deployed_contract_address.json';
import { useAccount } from 'wagmi';

const BonusEscrowABI = BonusEscrowJson.abi;

interface UseClaimBountyResult {
  claimBounty: (bountyId: string) => void;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
}

export const useClaimBounty = (): UseClaimBountyResult => {
  const { address } = useAccount();
  const { data: hash, isPending, isError, error, writeContract } = useWriteContract();

  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claimBounty = (bountyId: string) => {
    if (!address) {
      console.error("Wallet not connected. Cannot claim bounty.");
      return;
    }
    writeContract({
      address: deployedContractAddress.contractAddress as `0x${string}`,
      abi: BonusEscrowABI,
      functionName: 'claimBounty',
      args: [bountyId],
    });
  };

  return {
    claimBounty,
    isLoading: isPending || isTxLoading,
    isSuccess: isTxSuccess,
    isError,
    error,
  };
};
