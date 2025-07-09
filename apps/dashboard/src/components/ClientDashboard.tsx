"use client";

import React, { useEffect, useState } from 'react';
import BountyCard from "@/components/BountyCard";
import { useReadContract, useAccount } from 'wagmi';
import { ethers } from 'ethers';
import BonusEscrowJson from '../../../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json';
const BonusEscrowABI = BonusEscrowJson.abi;
import deployedContractAddress from '../contracts/deployed_contract_address.json';
import { readContract } from 'wagmi/actions';
import { config as wagmiConfig } from '@/app/wagmi';

interface Bounty {
  id: string;
  creator: string;
  title: string;
  description: string;
  githubUrl: string;
  reward: bigint;
  status: number;
}

const statusMap: { [key: number]: string } = {
  0: 'Open',
  1: 'Paid',
};

export default function ClientDashboard({ isAdminView }: { isAdminView: boolean }) {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [claimantsMap, setClaimantsMap] = useState<Record<string, string[]>>({});
  const { address } = useAccount();

  const { data: fetchedBounties, isLoading: isBountiesLoading, refetch } = useReadContract({
    address: deployedContractAddress.contractAddress as `0x${string}`,
    abi: BonusEscrowABI,
    functionName: 'getAllBounties',
    query: {
      enabled: true,
    },
  });

  const fetchClaimants = async (bountyId: string) => {
    try {
      const data = await readContract(wagmiConfig, {
        address: deployedContractAddress.contractAddress as `0x${string}`,
        abi: BonusEscrowABI,
        functionName: 'getClaimants',
        args: [BigInt(bountyId)],
      });
      if (Array.isArray(data)) {
        setClaimantsMap(prev => ({ ...prev, [bountyId]: data as string[] }));
      }
    } catch (error) {
      console.error(`Failed to fetch claimants for bounty ${bountyId}:`, error);
    }
  };

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
    console.log("ClientDashboard: useEffect for fetchedBounties triggered.");
    if (fetchedBounties && Array.isArray(fetchedBounties)) {
      console.log("ClientDashboard: Fetched Bounties:", fetchedBounties);
      const formattedBounties: Bounty[] = fetchedBounties
        .filter(bounty => bounty && bounty.id !== undefined)
        .map((bounty: any) => ({
          id: bounty.id.toString(),
          creator: bounty.creator,
          title: bounty.title,
          description: bounty.description,
          githubUrl: bounty.githubUrl,
          reward: bounty.reward,
          status: Number(bounty.status),
        }));
      
      // Clients should see all non-paid bounties
      const filtered = formattedBounties.filter(bounty => bounty.status !== 1); // 1 is Paid

      setBounties(filtered);
      console.log("ClientDashboard: Set Bounties state:", filtered);

      // Fetch claimants for each open bounty
      filtered.forEach(bounty => {
        if (bounty.status === 0) { // Only fetch for Open bounties
          console.log(`ClientDashboard: Fetching claimants for bounty ID: ${bounty.id}`);
          fetchClaimants(bounty.id);
        }
      });
    }
  }, [fetchedBounties, isAdminView, refetch, address]);

  useEffect(() => {
    console.log("ClientDashboard: claimantsMap state updated:", claimantsMap);
  }, [claimantsMap]);

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
          {bounties.map((bounty) => {
            const claimants = claimantsMap[bounty.id] || [];
            return (
              <BountyCard
                key={bounty.id}
                id={bounty.id}
                title={bounty.title}
                description={bounty.description}
                githubUrl={bounty.githubUrl}
                reward={`${ethers.formatEther(bounty.reward)} ETH`}
                status={statusMap[bounty.status]}
                isAdminView={isAdminView}
                claimants={claimants}
                onClaimSuccess={refetch}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}
