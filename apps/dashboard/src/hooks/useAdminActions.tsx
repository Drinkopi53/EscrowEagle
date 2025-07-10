"use client";

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import BonusEscrowJson from '../../../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json';
import deployedContractAddress from '../contracts/deployed_contract_address.json';
import { useEffect } from 'react';

const BonusEscrowABI = BonusEscrowJson.abi;

interface UseAdminActionsResult {
  approveBounty: (bountyId: string, winnerAddress: string) => void;
  cancelClaimByAdmin: (bountyId: string, claimantAddress: string) => void;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  hash: `0x${string}` | undefined;
}

import { useAccount } from 'wagmi';

export const useAdminActions = (onSuccess?: () => void): UseAdminActionsResult => {
  const { chainId } = useAccount();
  const queryClient = useQueryClient();
  const { data: hash, isPending, isError, error, writeContract } = useWriteContract();

  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isTxSuccess) {
      console.log("Admin action successful, invalidating queries.");
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
      if (onSuccess) {
        onSuccess();
      }
    }
  }, [isTxSuccess, onSuccess, queryClient, chainId]);

  const approveBounty = (bountyId: string, winnerAddress: string) => {
    writeContract({
      address: deployedContractAddress.contractAddress as `0x${string}`,
      abi: BonusEscrowABI,
      functionName: 'approveBounty',
      args: [BigInt(bountyId), winnerAddress],
    });
  };

  const cancelClaimByAdmin = (bountyId: string, claimantAddress: string) => {
    writeContract({
      address: deployedContractAddress.contractAddress as `0x${string}`,
      abi: BonusEscrowABI,
      functionName: 'cancelClaimByAdmin',
      args: [BigInt(bountyId), claimantAddress],
    });
  };
 
   return {
     approveBounty,
     cancelClaimByAdmin,
     isLoading: isPending || isTxLoading,
     isSuccess: isTxSuccess,
     isError,
     error,
     hash,
   };
};
