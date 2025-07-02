"use client";

import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { ethers } from 'ethers';
import BonusEscrowJson from '../../../../../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json';
import deployedContractAddress from '../../../contracts/deployed_contract_address.json';
import BountyCard from '@/components/BountyCard';
import { useIsAdmin } from '@/hooks/useIsAdmin';

const BonusEscrowABI = BonusEscrowJson.abi;

interface Bounty {
  id: string;
  creator: string; // Added creator to Bounty interface
  title: string;
  description: string; // Added description to Bounty interface
  githubUrl: string;
  reward: bigint;
  status: number;
  claimant: string;
  solutionGithubUrl?: string; // New field for client-submitted solution URL
}

const statusMap: { [key: number]: string } = {
  0: 'Open',
  1: 'Claimed',
  2: 'Paid',
};

export default function AdminDashboard() {
  const { address } = useAccount();
  const { isAdmin, isAdminLoading } = useIsAdmin();
  const [githubUrl, setGithubUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); // New state for description
  const [amount, setAmount] = useState('1'); // Default to 1 ETH
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [filterStatus, setFilterStatus] = useState<number | null>(null); // null for all, 0 for Open, 1 for Claimed, 2 for Paid
  const [verificationStatus, setVerificationStatus] = useState<{ id: string; status: 'idle' | 'verifying' | 'success' | 'failed'; message: string } | null>(null);

  const { data: hash, isPending: isWriteLoading, isError: isWriteError, writeContract } = useWriteContract();

  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const { data: fetchedBounties, isLoading: isBountiesLoading, refetch } = useReadContract({
    address: deployedContractAddress.contractAddress as `0x${string}`,
    abi: BonusEscrowABI,
    functionName: 'getAllBounties',
    query: {
      enabled: true,
    },
  });

  useEffect(() => {
    console.log("=== ADMIN DASHBOARD DEBUG ===");
    console.log("Admin Dashboard: Raw fetchedBounties:", fetchedBounties);
    console.log("Admin Dashboard: fetchedBounties type:", typeof fetchedBounties);
    console.log("Admin Dashboard: Is array:", Array.isArray(fetchedBounties));
    console.log("Admin Dashboard: Current address:", address);
    console.log("Admin Dashboard: filterStatus:", filterStatus);
    
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
      console.log("Admin Dashboard: Formatted Bounties (after mapping):", formattedBounties);
      
      // Filter bounties by the connected admin's address
      const adminBounties = formattedBounties.filter(bounty => bounty.creator.toLowerCase() === address?.toLowerCase());

      const filteredBounties = filterStatus === null
        ? adminBounties
        : adminBounties.filter(bounty => bounty.status === filterStatus);
      
      console.log("Admin Dashboard: Filtered Bounties (before setting state):", filteredBounties);
      setBounties(filteredBounties);
    }
  }, [fetchedBounties, filterStatus, address, refetch]);

  useEffect(() => {
    if (isTxSuccess) {
      refetch();
      // Introduce a delay before refetching to allow blockchain state to propagate
      const timer = setTimeout(() => {
        refetch();
      }, 5000); // Increased to 5 second delay to allow blockchain state to propagate

      setGithubUrl('');
      setTitle('');
      setDescription(''); // Clear description after successful creation
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
    if (!githubUrl || !title || !description || !amount) { // Added description to validation
      alert('Please fill all fields');
      return;
    }

    console.log("Creating bounty with:", { title, description, githubUrl, amount }); // Added description to log

    writeContract({
      address: deployedContractAddress.contractAddress as `0x${string}`,
      abi: BonusEscrowABI,
      functionName: 'createBounty',
      args: [
        title,
        description, // Pass description to the smart contract
        githubUrl
      ],
      value: ethers.parseEther(amount),
    });
  };

  const handleApproveBounty = async (bountyId: string, solutionGithubUrl: string) => {
    setVerificationStatus({ id: bountyId, status: 'verifying', message: 'Verifying GitHub commit...' });
    try {
      const response = await fetch('/api/github-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ solutionGithubUrl }),
      });

      const data = await response.json();

      if (data.success) {
        setVerificationStatus({ id: bountyId, status: 'success', message: 'GitHub commit verified. Processing payment...' });
        // Call the smart contract function to approve and pay
        // This part needs to be implemented using useAdminActions or similar
        // For now, let's just log and simulate success
        console.log(`GitHub commit for bounty ${bountyId} verified. Ready to approve payment.`);
        // Assuming useAdminActions.approveBounty is available and works
        // useAdminActions.approveBounty(bountyId); // This needs to be properly integrated
        // For now, we'll just update the status locally for demonstration
        // In a real app, you'd wait for the blockchain transaction to confirm
        setVerificationStatus({ id: bountyId, status: 'success', message: 'Payment approved (simulated).' });
      } else {
        setVerificationStatus({ id: bountyId, status: 'failed', message: `GitHub verification failed: ${data.message}` });
      }
    } catch (error: any) {
      console.error('Error during GitHub verification:', error);
      setVerificationStatus({ id: bountyId, status: 'failed', message: `Verification error: ${error.message}` });
    }
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
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 font-bold mb-2">
              Bounty Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Provide a detailed description of the task."
              rows={4}
              required
            ></textarea>
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
            Bounty List
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterStatus(null)}
              className={`py-2 px-4 rounded ${filterStatus === null ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus(0)}
              className={`py-2 px-4 rounded ${filterStatus === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              Open
            </button>
            <button
              onClick={() => setFilterStatus(1)}
              className={`py-2 px-4 rounded ${filterStatus === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              Claimed
            </button>
            <button
              onClick={() => setFilterStatus(2)}
              className={`py-2 px-4 rounded ${filterStatus === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              Paid
            </button>
            <button
              onClick={() => refetch()}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Refresh
            </button>
          </div>
        </div>
        {isBountiesLoading ? (
          <div className="text-center py-8">Loading bounties...</div>
        ) : bounties.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No bounties available for this status.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bounties.map((bounty) => (
              <BountyCard
                key={bounty.id}
                id={bounty.id}
                title={bounty.title}
                description={bounty.description} 
                githubUrl={bounty.githubUrl}
                reward={`${ethers.formatEther(bounty.reward)} ETH`}
                rewardAmount={bounty.reward}
                status={statusMap[bounty.status]}
                isAdminView={true}
                claimantAddress={bounty.claimant}
                solutionGithubUrl={bounty.solutionGithubUrl}
                onApproveBounty={handleApproveBounty}
                verificationStatus={verificationStatus?.id === bounty.id ? verificationStatus : null}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
