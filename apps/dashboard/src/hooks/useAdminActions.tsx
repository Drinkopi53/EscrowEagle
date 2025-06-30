"use client";

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import BonusEscrowJson from '../../../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json';
import deployedContractAddress from '../contracts/deployed_contract_address.json';
import { useState } from 'react';

const BonusEscrowABI = BonusEscrowJson.abi;

interface UseAdminActionsResult {
  completeBounty: (bountyId: string) => void;
  payBounty: (bountyId: string, winnerAddress: string) => void;
  rejectBounty: (bountyId: string) => void;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  hash: `0x${string}` | undefined;
  actionType: 'complete' | 'pay' | 'reject' | null;
}

export const useAdminActions = (): UseAdminActionsResult => {
  const [actionType, setActionType] = useState<'complete' | 'pay' | 'reject' | null>(null);
  const { data: hash, isPending, isError, error, writeContract } = useWriteContract();

  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const completeBounty = (bountyId: string) => {
    setActionType('complete');
    writeContract({
      address: deployedContractAddress.contractAddress as `0x${string}`,
      abi: BonusEscrowABI,
      functionName: 'completeBounty',
      args: [bountyId],
    });
  };

  const payBounty = (bountyId: string, winnerAddress: string) => {
    setActionType('pay');
    writeContract({
      address: deployedContractAddress.contractAddress as `0x${string}`,
      abi: BonusEscrowABI,
      functionName: 'payBounty',
      args: [bountyId, winnerAddress],
    });
  };

  const rejectBounty = (bountyId: string) => {
    setActionType('reject');
    writeContract({
      address: deployedContractAddress.contractAddress as `0x${string}`,
      abi: BonusEscrowABI,
      functionName: 'rejectBounty',
      args: [bountyId],
    });
  };

  return {
    completeBounty,
    payBounty,
    rejectBounty,
    isLoading: isPending || isTxLoading,
    isSuccess: isTxSuccess,
    isError,
    error,
    hash,
    actionType,
  };
};
