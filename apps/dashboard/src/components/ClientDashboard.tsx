"use client";

import React, { useEffect, useState } from 'react';
import BountyCard from "@/components/BountyCard";
import { useContractRead } from 'wagmi';
import BonusEscrowJson from '../../../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json';
const BonusEscrowABI = BonusEscrowJson.abi;
import deployedContractAddress from '../contracts/deployed_contract_address.json';

interface Bounty {
  id: string;
  title: string;
  githubUrl: string;
  reward: bigint;
  status: number;
  acceptor: string; // Add acceptor to the interface
}

const statusMap: { [key: number]: string } = {
  0: 'Open',
  1: 'Accepted',
  2: 'Completed',
  3: 'Paid',
};

export default function ClientDashboard({ isAdminView }: { isAdminView: boolean }) {
  const [bounties, setBounties] = useState<Bounty[]>([]);

  const { data: fetchedBounties, isLoading: isBountiesLoading, refetch } = useContractRead({
    address: deployedContractAddress.contractAddress as `0x${string}`,
    abi: BonusEscrowABI,
    functionName: 'getAllBounties',
  });

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 15000); // Refetch every 15 seconds to reduce load
    return () => clearInterval(interval);
  }, [refetch]);


  useEffect(() => {
    console.log("Fetched Bounties (raw):", fetchedBounties);
    if (fetchedBounties && Array.isArray(fetchedBounties)) {
      const formattedBounties: Bounty[] = fetchedBounties
        .filter(bounty => bounty && bounty.id !== undefined &&
          (Number(bounty.status) === 0 || (isAdminView && (Number(bounty.status) === 2 || Number(bounty.status) === 3)))) // Show 'Open' for clients, 'Open', 'Completed', and 'Paid' for admin
        .map((bounty: any) => ({
          id: bounty.id.toString(),
          title: bounty.title,
          githubUrl: bounty.githubUrl,
          reward: bounty.reward,
          status: Number(bounty.status),
          acceptor: bounty.acceptor,
      }));
      setBounties(formattedBounties);
    }
  }, [fetchedBounties]);

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
              githubUrl={bounty.githubUrl}
              reward={`${Number(bounty.reward) / 1e18} ETH`}
              rewardAmount={bounty.reward}
              status={statusMap[bounty.status]}
              isAdminView={isAdminView}
              acceptorAddress={bounty.acceptor} // Pass acceptor address
            />
          ))}
        </div>
      )}
    </main>
  );
}
