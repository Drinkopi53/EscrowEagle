"use client";

import React, { useEffect, useState } from 'react';
import { ConnectWallet } from "@/components/ConnectWallet";
import BountyCard from "@/components/BountyCard";
import { useContractRead } from 'wagmi';
import { abi as BonusEscrowABI } from '../../../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json';
import deployedContractAddress from '../../../../python_workspace/deployed_contract_address.json';
import Link from 'next/link';

interface Bounty {
  id: string;
  title: string;
  description: string;
  reward: bigint;
  status: number; // Assuming status is an enum or integer
}

const statusMap: { [key: number]: string } = {
  0: 'Open',
  1: 'Accepted',
  2: 'Completed',
  3: 'Paid',
};

export default function Home() {
  const [bounties, setBounties] = useState<Bounty[]>([]);

  const { data: fetchedBounties, isLoading: isBountiesLoading } = useContractRead({
    address: deployedContractAddress.contractAddress as `0x${string}`,
    abi: BonusEscrowABI,
    functionName: 'getAllBounties', // Assuming a function to get all bounties
  });

  useEffect(() => {
    if (fetchedBounties) {
      // @ts-ignore
      const formattedBounties: Bounty[] = fetchedBounties.map((bounty: any, index: number) => ({
        id: `0x${index.toString(16).padStart(40, '0')}`, // Dummy ID for now, replace with actual bounty ID from contract if available
        title: bounty.title,
        description: bounty.description,
        reward: bounty.reward,
        status: bounty.status,
      }));
      setBounties(formattedBounties);
    }
  }, [fetchedBounties]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      <header className="w-full max-w-4xl flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Trust-Chain Bonus Dashboard
        </h1>
        <ConnectWallet />
      </header>

      <main className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Available Bounties
          </h2>
          <Link href="/create-bounty" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Create New Bounty
          </Link>
        </div>

        {isBountiesLoading ? (
          <div className="text-center py-8">Loading bounties...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bounties.map((bounty) => (
              <BountyCard
                key={bounty.id}
                id={bounty.id}
                title={bounty.title}
                description={bounty.description}
                reward={`${Number(bounty.reward) / 1e18} Etherium`}
                status={statusMap[bounty.status]}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
