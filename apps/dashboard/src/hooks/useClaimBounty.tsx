"use client";

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import BonusEscrowJson from '../../../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json';
import deployedContractAddress from '../contracts/deployed_contract_address.json';
import { useAccount } from 'wagmi';

const BonusEscrowABI = BonusEscrowJson.abi;

import { useEffect } from 'react';

interface UseClaimBountyResult {
  claimBounty: (bountyId: string) => void;
  cancelClaim: (bountyId: string) => void;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
}

export const useClaimBounty = (onClaimSuccess?: () => void): UseClaimBountyResult => {
  const { address, chainId } = useAccount();
  const queryClient = useQueryClient();
  const { data: hash, isPending, isError, error, writeContract } = useWriteContract();

  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isTxSuccess) {
      queryClient.invalidateQueries({ 
        queryKey: [
          'readContract',
          {
            address: deployedContractAddress.contractAddress,
            functionName: 'getAllBounties',
            chainId,
          },
        ]
      });
      if (onClaimSuccess) {
        onClaimSuccess();
      }
    }
  }, [isTxSuccess, onClaimSuccess, queryClient, chainId]);

  const claimBounty = (bountyId: string) => {
    if (!address) {
      // No console.error here, as the UI will show an error message
      return;
    }
    writeContract({
      address: deployedContractAddress.contractAddress as `0x${string}`,
      abi: BonusEscrowABI,
      functionName: 'claimBounty',
      args: [BigInt(bountyId)],
    });
  };

  const cancelClaim = (bountyId: string) => {
    if (!address) {
      // No console.error here, as the UI will show an error message
      return;
    }
    writeContract({
      address: deployedContractAddress.contractAddress as `0x${string}`,
      abi: BonusEscrowABI,
      functionName: 'cancelClaim',
      args: [BigInt(bountyId)],
    });
  };

  return {
    claimBounty,
    cancelClaim,
    isLoading: isPending || isTxLoading,
    isSuccess: isTxSuccess,
    isError,
    error: error ? new Error("Transaction failed. Please check your wallet and try again.") : null,
  };
};
