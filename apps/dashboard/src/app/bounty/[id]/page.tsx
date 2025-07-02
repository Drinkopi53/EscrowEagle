"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useContractRead, useContractWrite, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { abi as BonusEscrowABI } from '../../../../../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json';
import deployedContractAddress from '../../../../../../python_workspace/deployed_contract_address.json';
import { useIsAdmin } from '../../../hooks/useIsAdmin';

interface BountyEvent {
  bountyId: string;
  eventName: string;
  userName: string;
  prLink: string;
}

const statusMap: { [key: number]: string } = {
  0: 'Open',
  1: 'Claimed', // New status
  2: 'Accepted',
  3: 'Completed',
  4: 'Paid',
};

const BountyDetailPage: React.FC = () => {
  const params = useParams();
  const bountyId = params.id as string;
  const [winnerInfo, setWinnerInfo] = useState<{ userName: string; prLink: string } | null>(null);
  const { address, isConnected } = useAccount();
  const { isAdmin, isLoadingAdmin, adminError } = useIsAdmin();

  const { data: bountyData, isLoading: isBountyLoading } = useContractRead({
    address: deployedContractAddress.contractAddress as `0x${string}`,
    abi: BonusEscrowABI,
    functionName: 'bounties',
    args: [BigInt(bountyId)],
  });

  const { data: acceptHash, writeContract: acceptBountyWrite, isPending: isAccepting } = useContractWrite();
  const { isLoading: isAcceptingConfirming, isSuccess: isAcceptingConfirmed } = useWaitForTransactionReceipt({
    hash: acceptHash,
  });

  const { data: completeHash, writeContract: completeBountyWrite, isPending: isCompleting } = useContractWrite();
  const { isLoading: isCompletingConfirming, isSuccess: isCompletingConfirmed } = useWaitForTransactionReceipt({
    hash: completeHash,
  });

  const { data: claimHash, writeContract: claimBountyWrite, isPending: isClaiming } = useContractWrite();
  const { isLoading: isClaimingConfirming, isSuccess: isClaimingConfirmed } = useWaitForTransactionReceipt({
    hash: claimHash,
  });

  const { data: payHash, writeContract: payBountyWrite, isPending: isPaying } = useContractWrite();
  const { isLoading: isPayingConfirming, isSuccess: isPayingConfirmed } = useWaitForTransactionReceipt({
    hash: payHash,
  });

  const handleAcceptBounty = () => {
    acceptBountyWrite({
      address: deployedContractAddress.contractAddress as `0x${string}`,
      abi: BonusEscrowABI,
      functionName: 'acceptBounty',
      args: [BigInt(bountyId)],
    });
  };

  const handleCompleteBounty = () => {
    completeBountyWrite({
      address: deployedContractAddress.contractAddress as `0x${string}`,
      abi: BonusEscrowABI,
      functionName: 'completeBounty',
      args: [BigInt(bountyId)],
    });
  };

  const handleClaimBounty = () => {
    if (!isConnected) {
      alert('Please connect your wallet to claim bounties.');
      return;
    }
    claimBountyWrite({
      address: deployedContractAddress.contractAddress as `0x${string}`,
      abi: BonusEscrowABI,
      functionName: 'claimBounty',
      args: [BigInt(bountyId)],
      account: address,
    });
  };

  const handlePayBounty = () => {
    // In a real app, _winner would be determined by the oracle or user input
    // For this demo, we'll use a dummy winner address or the connected account
    payBountyWrite({
      address: deployedContractAddress.contractAddress as `0x${string}`,
      abi: BonusEscrowABI,
      functionName: 'payBounty',
      args: [BigInt(bountyId), address],
    });
  };

  useEffect(() => {
    if (isAcceptingConfirmed || isCompletingConfirmed || isPayingConfirmed || isClaimingConfirmed) {
      // Invalidate queries to refetch bounty data after a transaction
      // This will trigger a re-render with the updated bounty status
      // For simplicity, we're not using queryClient.invalidateQueries here,
      // but a full re-fetch of bountyData will happen due to the dependency array.
    }

    const fetchWinnerInfo = async () => {
      // @ts-ignore
      if (bountyData && statusMap[bountyData[6]] === 'Accepted') {
        try {
          const response = await fetch('/dummy-events.json');
          const events: BountyEvent[] = await response.json();
          const prMergedEvent = events.find(
            (event) => event.eventName === 'PR_MERGED' && event.bountyId === bountyId
          );
          if (prMergedEvent) {
            setWinnerInfo({
              userName: prMergedEvent.userName,
              prLink: prMergedEvent.prLink,
            });
          }
        } catch (error) {
          console.error('Error fetching dummy events:', error);
        }
      }
    };

    fetchWinnerInfo();
  }, [bountyData, bountyId, isAcceptingConfirmed, isCompletingConfirmed, isPayingConfirmed, isClaimingConfirmed]);

  if (isBountyLoading || isLoadingAdmin) {
    return <div className="text-center py-8">Loading bounty details...</div>;
  }

  if (adminError) {
    return <div className="text-center py-8 text-red-500">Error loading admin status: {adminError.message}</div>;
  }

  const currentBounty = bountyData ? {
    // @ts-ignore
    id: bountyData[0].toString(),
    // @ts-ignore
    creator: bountyData[1],
    // @ts-ignore
    title: bountyData[2],
    // @ts-ignore
    description: bountyData[3],
    // @ts-ignore
    reward: bountyData[4],
    // @ts-ignore
    status: bountyData[6],
    // @ts-ignore
    acceptor: bountyData[7], // New field
  } : null;

  if (!currentBounty) {
    return <div className="text-center py-8">Bounty not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Bounty Details for ID: {currentBounty.id}</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{currentBounty.title}</h2>
        <p className="text-gray-700 mb-4">{currentBounty.description}</p>
        <p className="text-gray-700 mb-2">Reward: {`${Number(currentBounty.reward) / 1e18} Etherium`}</p>
        <p className="text-gray-700 mb-2">Status: {statusMap[currentBounty.status]}</p>
        {statusMap[currentBounty.status] === 'Claimed' && currentBounty.acceptor && (
          <p className="text-gray-700 mb-2">Claimed by: {currentBounty.acceptor}</p>
        )}
        <p className="text-gray-700 mb-2">Creator: {currentBounty.creator}</p>

        {winnerInfo && (
          <div className="mt-4 p-4 bg-green-50 rounded-md">
            <h2 className="text-xl font-semibold text-green-800 mb-2">Winner Information:</h2>
            <p className="text-gray-700">
              User Name: <span className="font-medium">{winnerInfo.userName}</span>
            </p>
            <p className="text-gray-700">
              PR Link:{' '}
              <a
                href={winnerInfo.prLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {winnerInfo.prLink}
              </a>
            </p>
          </div>
        )}

        <div className="mt-6 flex space-x-4">
          {/* Actions for Bounty Creator */}
          {currentBounty.creator === address && (
            <>
              {statusMap[currentBounty.status] === 'Claimed' && (
                <button
                  onClick={handleAcceptBounty}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  disabled={isAccepting || isAcceptingConfirming}
                >
                  {isAccepting || isAcceptingConfirming ? 'Accepting...' : 'Accept Claim'}
                </button>
              )}
              {statusMap[currentBounty.status] === 'Accepted' && (
                <button
                  onClick={handleCompleteBounty}
                  className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                  disabled={isCompleting || isCompletingConfirming}
                >
                  {isCompleting || isCompletingConfirming ? 'Completing...' : 'Complete Bounty'}
                </button>
              )}
              {statusMap[currentBounty.status] === 'Completed' && isAdmin && (
                <button
                  onClick={handlePayBounty}
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                  disabled={isPaying || isPayingConfirming}
                >
                  {isPaying || isPayingConfirming ? 'Paying...' : 'Pay Bounty'}
                </button>
              )}
            </>
          )}

          {/* Actions for Non-Creator Clients */}
          {currentBounty.creator !== address && (
            <>
              {statusMap[currentBounty.status] === 'Open' && (
                <button
                  onClick={handleClaimBounty}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  disabled={isClaiming || isClaimingConfirming}
                >
                  {isClaiming || isClaimingConfirming ? 'Claiming...' : 'Claim Bounty'}
                </button>
              )}
              {statusMap[currentBounty.status] === 'Claimed' && (
                <button
                  className="bg-gray-400 text-white font-bold py-2 px-4 rounded cursor-not-allowed"
                  disabled
                >
                  Claimed
                </button>
              )}
              {statusMap[currentBounty.status] === 'Accepted' && (
                <button
                  onClick={handleCompleteBounty}
                  className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                  disabled={isCompleting || isCompletingConfirming}
                >
                  {isCompleting || isCompletingConfirming ? 'Submitting...' : 'Submit Solution'}
                </button>
              )}
            </>
          )}

          {/* Actions for Non-Creator Clients */}
          {currentBounty.creator !== address && (
            <>
              {statusMap[currentBounty.status] === 'Open' && (
                <button
                  onClick={handleAcceptBounty}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  disabled={isAccepting || isAcceptingConfirming}
                >
                  {isAccepting || isAcceptingConfirming ? 'Claiming...' : 'Claim Bounty'}
                </button>
              )}
              {statusMap[currentBounty.status] === 'Accepted' && (
                <button
                  onClick={handleCompleteBounty}
                  className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                  disabled={isCompleting || isCompletingConfirming}
                >
                  {isCompleting || isCompletingConfirming ? 'Submitting...' : 'Submit Solution'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BountyDetailPage;