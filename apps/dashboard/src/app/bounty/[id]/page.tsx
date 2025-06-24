"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useContractRead } from 'wagmi';
import { abi as BonusEscrowABI } from '../../../../../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json';
import deployedContractAddress from '../../../../../../python_workspace/deployed_contract_address.json';

interface BountyEvent {
  bountyId: string;
  eventName: string;
  userName: string;
  prLink: string;
}

const BountyDetailPage: React.FC = () => {
  const params = useParams();
  const bountyId = params.id as string;
  const [winnerInfo, setWinnerInfo] = useState<{ userName: string; prLink: string } | null>(null);

  const { data: bountyStatus, isLoading: isBountyStatusLoading } = useContractRead({
    address: deployedContractAddress.contractAddress as `0x${string}`,
    abi: BonusEscrowABI,
    functionName: 'getBountyStatus', // Assuming a function to get bounty status
    args: [bountyId],
  });

  useEffect(() => {
    const fetchWinnerInfo = async () => {
      if (bountyStatus === 'Accepted') { // Assuming 'Accepted' is the status for a completed bounty
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
  }, [bountyStatus, bountyId]);

  if (isBountyStatusLoading) {
    return <div className="text-center py-8">Loading bounty details...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Bounty Details for ID: {bountyId}</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-gray-700 mb-2">Status: {bountyStatus as string}</p>
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
        {/* Add more bounty details here as needed */}
      </div>
    </div>
  );
};

export default BountyDetailPage;