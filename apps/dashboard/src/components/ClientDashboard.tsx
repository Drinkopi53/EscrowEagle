"use client";

import React, { useEffect, useState } from 'react';
import BountyCard from "@/components/BountyCard";
import { useReadContract } from 'wagmi';
import { ethers } from 'ethers';
import BonusEscrowJson from '../../../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json';
const BonusEscrowABI = BonusEscrowJson.abi;
import deployedContractAddress from '../contracts/deployed_contract_address.json';

interface Bounty {
  id: string;
  creator: string;
  title: string;
  description: string; // Added description to Bounty interface
  githubUrl: string;
  reward: bigint;
  status: number;
  claimant: string;
  solutionGithubUrl?: string; // Add solutionGithubUrl to Bounty interface
}

const statusMap: { [key: number]: string } = {
  0: 'Open',
  1: 'Claimed',
  2: 'Paid',
};

export default function ClientDashboard({ isAdminView }: { isAdminView: boolean }) {
  const [bounties, setBounties] = useState<Bounty[]>([]);

  const { data: fetchedBounties, isLoading: isBountiesLoading, refetch } = useReadContract({
    address: deployedContractAddress.contractAddress as `0x${string}`,
    abi: BonusEscrowABI,
    functionName: 'getAllBounties',
    query: {
      enabled: true,
    },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000); // Refetch every 5 seconds to ensure timely updates
    return () => clearInterval(interval);
  }, [refetch]);
  useEffect(() => {
    refetch(); // Refetch immediately when component mounts or isAdminView changes
  }, [isAdminView, refetch]);

  useEffect(() => {
    console.log("=== CLIENT DASHBOARD DEBUG ===");
    console.log("Client Dashboard: Raw fetchedBounties:", fetchedBounties);
    console.log("Client Dashboard: fetchedBounties type:", typeof fetchedBounties);
    console.log("Client Dashboard: Is array:", Array.isArray(fetchedBounties));
    console.log("Client Dashboard: isAdminView:", isAdminView);
    
    if (fetchedBounties && Array.isArray(fetchedBounties)) {
      const formattedBounties: Bounty[] = fetchedBounties
        .filter(bounty => bounty && bounty.id !== undefined) // Ensure bounty and its ID are defined
        .map((bounty: any) => ({
          id: bounty.id.toString(),
          creator: bounty.creator,
          title: bounty.title,
          description: bounty.description,
          githubUrl: bounty.githubUrl,
          reward: bounty.reward,
          status: Number(bounty.status),
          claimant: bounty.claimant,
          solutionGithubUrl: bounty.solutionGithubUrl || '',
        }));
      
      console.log("Client Dashboard: Formatted Bounties (after mapping):", formattedBounties);

      // For client view, show all bounties
      // For admin view in client dashboard, this shouldn't happen but show all anyway
      const filtered = formattedBounties;

      console.log("Client Dashboard: Filtered Bounties (before setting state):", filtered);
      setBounties(filtered);
    }
  }, [fetchedBounties, isAdminView, refetch]);

  useEffect(() => {
    console.log("Bounties state:", bounties);
    console.log("Bounties length:", bounties.length);
  }, [bounties]);

  return (
    <main className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Available Bounties
        </h2>
        <button
          onClick={() => refetch()}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Refresh
        </button>
      </div>

      {isBountiesLoading ? (
        <div className="text-center py-8">Loading bounties...</div>
      ) : bounties.length === 0 ? (
        <div className="text-center py-8 text-gray-600">No bounties available at the moment.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bounties.map((bounty) => (
            <BountyCard
              key={bounty.id}
              id={bounty.id}
              title={bounty.title}
              description={bounty.description} // Pass description
              githubUrl={bounty.githubUrl}
              reward={`${ethers.formatEther(bounty.reward)} ETH`}
              rewardAmount={bounty.reward}
              status={statusMap[bounty.status]}
              isAdminView={isAdminView}
              claimantAddress={bounty.claimant}
              solutionGithubUrl={bounty.solutionGithubUrl} // Pass solutionGithubUrl
            />
          ))}
        </div>
      )}
    </main>
  );
}
