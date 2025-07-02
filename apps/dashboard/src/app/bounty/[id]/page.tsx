"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { abi as BonusEscrowABI } from '../../../../../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json';
import deployedContractAddress from '../../../contracts/deployed_contract_address.json';

interface BountyEvent {
  bountyId: string;
  eventName: string;
  userName: string;
  prLink: string;
}

const statusMap: { [key: number]: string } = {
  0: 'Open',
  1: 'Accepted',
  2: 'Completed',
  3: 'Paid',
};

const BountyDetailPage: React.FC = () => {
  const params = useParams();
  const bountyId = params.id as string;
  const [winnerInfo, setWinnerInfo] = useState<{ userName: string; prLink: string } | null>(null);
  const { address } = useAccount();

  const { data: bountyData, isLoading: isBountyLoading } = useReadContract({
    address: deployedContractAddress.contractAddress as `0x${string}`,
    abi: BonusEscrowABI,
    functionName: 'bounties',
    args: [BigInt(bountyId)],
  });

  const { writeContract: acceptBountyWrite, isPending: isAccepting } = useWriteContract();
  const { writeContract: completeBountyWrite, isPending: isCompleting } = useWriteContract();
  const { writeContract: payBountyWrite, isPending: isPaying } = useWriteContract();

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
    const fetchWinnerInfo = async () => {
      if (bountyData && statusMap[Number((bountyData as any).status)] === 'Accepted') {
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
  }, [bountyData, bountyId]);

  if (isBountyLoading) {
    return <div className="text-center py-8">Loading bounty details...</div>;
  }

  const currentBounty = bountyData ? {
    id: (bountyData as any).id.toString(),
    creator: (bountyData as any).creator,
    title: (bountyData as any).title,
    description: (bountyData as any).description,
    githubUrl: (bountyData as any).githubUrl,
    reward: (bountyData as any).reward,
    status: Number((bountyData as any).status),
    claimant: (bountyData as any).claimant,
    solutionGithubUrl: (bountyData as any).solutionGithubUrl,
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
          {statusMap[currentBounty.status] === 'Open' && currentBounty.creator === address && (
            <button
              onClick={handleAcceptBounty}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              disabled={isAccepting}
            >
              {isAccepting ? 'Accepting...' : 'Accept Bounty'}
            </button>
          )}
          {statusMap[currentBounty.status] === 'Accepted' && (
            <button
              onClick={handleCompleteBounty}
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
              disabled={isCompleting}
            >
              {isCompleting ? 'Completing...' : 'Complete Bounty'}
            </button>
          )}
          {statusMap[currentBounty.status] === 'Completed' && currentBounty.creator === address && (
            <button
              onClick={handlePayBounty}
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
              disabled={isPaying}
            >
              {isPaying ? 'Paying...' : 'Pay Bounty'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BountyDetailPage;
