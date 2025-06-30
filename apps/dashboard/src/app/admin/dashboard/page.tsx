"use client";

import React, { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useContractRead } from 'wagmi';
import { ethers } from 'ethers';
import BonusEscrowJson from '../../../../../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json';
import deployedContractAddress from '../../../contracts/deployed_contract_address.json';
import { ConnectWallet } from '@/components/ConnectWallet';
import BountyCard from '@/components/BountyCard';
import { useIsAdmin } from '@/hooks/useIsAdmin';

const BonusEscrowABI = BonusEscrowJson.abi;

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

export default function AdminDashboard() {
  const { isAdmin, isAdminLoading } = useIsAdmin();
  const [githubUrl, setGithubUrl] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('1'); // Default to 1 ETH
  const [bounties, setBounties] = useState<Bounty[]>([]);

  const { data: hash, isPending: isWriteLoading, isError: isWriteError, writeContract } = useWriteContract();

  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const { data: fetchedBounties, isLoading: isBountiesLoading, refetch } = useContractRead({
    address: deployedContractAddress.contractAddress as `0x${string}`,
    abi: BonusEscrowABI,
    functionName: 'getAllBounties',
  });

  useEffect(() => {
    if (fetchedBounties && Array.isArray(fetchedBounties)) {
      const formattedBounties: Bounty[] = fetchedBounties
        .filter(bounty => bounty && bounty[0] !== undefined) // Ensure bounty and its ID (bounty[0]) are defined
        .map((bounty: any) => ({
          id: bounty[0].toString(),
          title: bounty[2],
          githubUrl: bounty[3],
          reward: bounty[4],
          status: Number(bounty[5]),
          acceptor: bounty[6], // Assuming acceptor is at index 6
      }));
      setBounties(formattedBounties);
    }
  }, [fetchedBounties]);
  useEffect(() => {
    if (isTxSuccess) {
      // Introduce a delay before refetching to allow blockchain state to propagate
      const timer = setTimeout(() => {
        refetch();
      }, 2000); // 2 second delay

      setGithubUrl('');
      setTitle('');
      setAmount('1');

      return () => clearTimeout(timer); // Cleanup the timer if the component unmounts or isTxSuccess changes
    }
  }, [isTxSuccess, refetch]);

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000); // Refetch every 5 seconds
    return () => clearInterval(interval);
  }, [refetch]);

  const handleCreateBounty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl || !title || !amount) {
      alert('Please fill all fields');
      return;
    }

    console.log("Creating bounty with:", { title, githubUrl, amount });

    writeContract({
      address: deployedContractAddress.contractAddress as `0x${string}`,
      abi: BonusEscrowABI,
      functionName: 'createBounty',
      args: [
        title,
        githubUrl
      ],
      value: ethers.parseEther(amount),
    });
  };

  if (isAdminLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-8 text-red-500 font-bold">
        <h1>Access Denied</h1>
        <p>You must be an admin to view this page.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      <main className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create New Bounty</h2>
        <form onSubmit={handleCreateBounty}>
          <div className="mb-4">
            <label htmlFor="githubUrl" className="block text-gray-700 font-bold mb-2">
              GitHub Issue/PR URL
            </label>
            <input
              type="text"
              id="githubUrl"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="https://github.com/user/repo/issues/1"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 font-bold mb-2">
              Bounty Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="e.g., Fix the authentication bug"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="amount" className="block text-gray-700 font-bold mb-2">
              Amount (ETH)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="1"
              required
              step="0.01"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={isWriteLoading || isTxLoading}
            >
              {isWriteLoading || isTxLoading ? 'Processing...' : 'Create & Fund Bounty'}
            </button>
          </div>
        </form>

        {isTxSuccess && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
            Bounty created successfully!
          </div>
        )}
        {isWriteError && (
          <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
            Error creating bounty. Please try again.
          </div>
        )}
      </main>

      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
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
          <div className="text-center py-8 text-gray-600">No bounties available.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bounties.map((bounty) => (
              <BountyCard
                key={bounty.id}
                id={bounty.id}
                title={bounty.title}
                githubUrl={bounty.githubUrl}
                reward={`${ethers.formatEther(bounty.reward)} ETH`}
                rewardAmount={bounty.reward}
                status={statusMap[bounty.status]}
                isAdminView={true}
                // Pass the acceptor address if available
                acceptorAddress={bounty.acceptor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
