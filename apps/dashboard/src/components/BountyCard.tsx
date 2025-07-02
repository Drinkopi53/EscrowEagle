import React from 'react';

interface BountyCardProps {
  id: string;
  title: string;
  description: string;
  reward: string;
  status: string;
  creator: `0x${string}`;
  currentAccount: `0x${string}` | undefined;
  isAdmin: boolean; // Add isAdmin prop
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Open':
      return 'bg-blue-100 text-blue-800';
    case 'Claimed':
      return 'bg-orange-100 text-orange-800'; // New status color
    case 'Accepted':
      return 'bg-green-100 text-green-800';
    case 'Completed':
      return 'bg-purple-100 text-purple-800';
    case 'Paid':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

import { useContractWrite, useWaitForTransactionReceipt, useSendTransaction } from 'wagmi';
import { encodeFunctionData } from 'viem';
import { abi as BonusEscrowABI } from '../../../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json';
import deployedContractAddress from '../../../../python_workspace/deployed_contract_address.json';
import { useQueryClient } from '@tanstack/react-query';

const BountyCard: React.FC<BountyCardProps> = ({ id, title, description, reward, status, creator, currentAccount, isAdmin }) => {
  const statusColorClass = getStatusColor(status);
  const queryClient = useQueryClient();

  // Log props for debugging
  console.log(`Bounty ID: ${id}, Status: ${status}, Creator: ${creator}, Current Account: ${currentAccount}, Is Admin: ${isAdmin}`);

  const { data: acceptHash, writeContract: acceptBountyWrite, isPending: isAccepting } = useContractWrite();
  const { isLoading: isAcceptingConfirming, isSuccess: isAcceptingConfirmed } = useWaitForTransactionReceipt({
    hash: acceptHash,
  });

  const { data: claimHash, sendTransaction: claimBountySendTransaction, isPending: isClaiming } = useSendTransaction();
  const { isLoading: isClaimingConfirming, isSuccess: isClaimingConfirmed } = useWaitForTransactionReceipt({
    hash: claimHash,
  });

  const { data: completeHash, writeContract: completeBountyWrite, isPending: isCompleting } = useContractWrite();
  const { isLoading: isCompletingConfirming, isSuccess: isCompletingConfirmed } = useWaitForTransactionReceipt({
    hash: completeHash,
  });

  const handleClaimBounty = () => {
    if (!currentAccount) {
      alert('Please connect your wallet to claim bounties.');
      return;
    }

    const calldata = encodeFunctionData({
      abi: BonusEscrowABI,
      functionName: 'claimBounty',
      args: [BigInt(id)],
    });

    claimBountySendTransaction({
      to: deployedContractAddress.contractAddress as `0x${string}`,
      data: calldata,
      value: BigInt(0), // Explicitly set value to 0
    });
  };

  const handleAcceptBounty = () => {
    if (!currentAccount) {
      alert('Please connect your wallet to accept bounties.');
      return;
    }
    acceptBountyWrite({
      address: deployedContractAddress.contractAddress as `0x${string}`,
      abi: BonusEscrowABI,
      functionName: 'acceptBounty',
      args: [BigInt(id)],
      account: currentAccount,
    });
  };

  const handleCompleteBounty = () => {
    if (!currentAccount) {
      alert('Please connect your wallet to complete bounties.');
      return;
    }
    completeBountyWrite({
      address: deployedContractAddress.contractAddress as `0x${string}`,
      abi: BonusEscrowABI,
      functionName: 'completeBounty',
      args: [BigInt(id)],
      account: currentAccount,
    });
  };

  React.useEffect(() => {
    if (isAcceptingConfirmed || isCompletingConfirmed || isClaimingConfirmed) {
      queryClient.invalidateQueries({ queryKey: ['BonusEscrow', deployedContractAddress.contractAddress, 'getAllBounties'] });
      queryClient.invalidateQueries({ queryKey: ['BonusEscrow', deployedContractAddress.contractAddress, 'bounties', BigInt(id)] });
    }
  }, [isAcceptingConfirmed, isCompletingConfirmed, isClaimingConfirmed, queryClient, id]);

  const renderActionButton = () => {
    // Case 1: Bounty is Open
    if (status === 'Open') {
      // If the current user is the creator or an admin, they can't claim, so show no button
      if (creator === currentAccount || isAdmin) {
        return null;
      }
      // Otherwise, show the "Claim Bounty" button
      return (
        <button
          onClick={handleClaimBounty}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm"
          disabled={isClaiming || isClaimingConfirming}
        >
          {isClaiming || isClaimingConfirming ? 'Claiming...' : 'Claim Bounty'}
        </button>
      );
    }

    // Case 2: Bounty is Claimed
    if (status === 'Claimed') {
      // If the current user is the creator, show the "Accept Claim" button
      if (creator === currentAccount) {
        return (
          <button
            onClick={handleAcceptBounty}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
            disabled={isAccepting || isAcceptingConfirming}
          >
            {isAccepting || isAcceptingConfirming ? 'Accepting...' : 'Accept Claim'}
          </button>
        );
      }
      // If the current user is not the creator, show the disabled "Claimed" button
      return (
        <button
          className="bg-gray-400 text-white font-bold py-2 px-4 rounded text-sm cursor-not-allowed"
          disabled
        >
          Claimed
        </button>
      );
    }

    // Case 3: Bounty is Accepted
    if (status === 'Accepted') {
      // If the current user is the creator or an admin, they can't submit a solution
      if (creator === currentAccount || isAdmin) {
        return null;
      }
      // Otherwise, show the "Submit Solution" button
      return (
        <button
          onClick={handleCompleteBounty}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded text-sm"
          disabled={isCompleting || isCompletingConfirming}
        >
          {isCompleting || isCompletingConfirming ? 'Submitting...' : 'Submit Solution'}
        </button>
      );
    }

    // Default: No button
    return null;
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-4">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-700 mb-4">{description}</p>
      <div className="flex justify-between items-center">
        <span className="text-lg font-bold text-indigo-600">{reward}</span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColorClass}`}>
          {status}
        </span>
      </div>
      <a href={`/bounty/${id}`} className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium">
        View Details
      </a>
      <div className="mt-4 flex space-x-2">
        {renderActionButton()}
      </div>
    </div>
  );
};

export default BountyCard;