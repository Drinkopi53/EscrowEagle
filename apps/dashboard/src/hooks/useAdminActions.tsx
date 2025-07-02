"use client";

"use client";

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import BonusEscrowJson from '../../../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json';
import deployedContractAddress from '../contracts/deployed_contract_address.json';

const BonusEscrowABI = BonusEscrowJson.abi;

interface UseAdminActionsResult {
  approveBounty: (bountyId: string) => void;
  submitSolution: (bountyId: string, solutionGithubUrl: string) => void; // Added submitSolution
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  hash: `0x${string}` | undefined;
}

export const useAdminActions = (): UseAdminActionsResult => {
  const { data: hash, isPending, isError, error, writeContract } = useWriteContract();

  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const approveBounty = (bountyId: string) => {
    writeContract({
      address: deployedContractAddress.contractAddress as `0x${string}`,
      abi: BonusEscrowABI,
      functionName: 'approveBounty',
      args: [bountyId],
    });
  };

  const submitSolution = (bountyId: string, solutionGithubUrl: string) => {
    writeContract({
      address: deployedContractAddress.contractAddress as `0x${string}`,
      abi: BonusEscrowABI,
      functionName: 'submitSolution',
      args: [bountyId, solutionGithubUrl],
    });
  };
 
   return {
     approveBounty,
     submitSolution, // Added submitSolution to the returned object
     isLoading: isPending || isTxLoading,
     isSuccess: isTxSuccess,
     isError,
     error,
     hash,
   };
};
