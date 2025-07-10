"use client";

import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { ethers } from 'ethers';
import BonusEscrowJson from '../../../../../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json';
import deployedContractAddress from '../../../contracts/deployed_contract_address.json';
import BountyCard from '@/components/BountyCard';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useAdminActions } from '@/hooks/useAdminActions';
import { readContract } from 'wagmi/actions';
import { config as wagmiConfig } from '@/app/wagmi';

const BonusEscrowABI = BonusEscrowJson.abi;

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

export default function AdminDashboard() {
  const { address } = useAccount();
  const { isAdmin, isAdminLoading } = useIsAdmin();
  const [githubUrl, setGithubUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('1');
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [claimantsMap, setClaimantsMap] = useState<Record<string, string[]>>({});
  const [filterStatus, setFilterStatus] = useState<number | null>(0); // Default to Open
  
  const { approveBounty, cancelClaimByAdmin, isLoading: isApproving, isSuccess: isApproveSuccess } = useAdminActions();
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
    if (fetchedBounties && Array.isArray(fetchedBounties)) {
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
      
      const filteredBounties = filterStatus === null
        ? formattedBounties
        : formattedBounties.filter(bounty => bounty.status === filterStatus);
      
      setBounties(filteredBounties);

      // Fetch claimants for each open bounty
      filteredBounties.forEach(bounty => {
        if (bounty.status === 0) { // Only fetch for Open bounties
          fetchClaimants(bounty.id);
        }
      });
    }
  }, [fetchedBounties, filterStatus, address, refetch]);

  useEffect(() => {
    if (isTxSuccess || isApproveSuccess) {
      const timer = setTimeout(() => {
        refetch();
      }, 2000); // 2 second delay

      if (isTxSuccess) {
        setGithubUrl('');
        setTitle('');
        setDescription('');
        setAmount('1');
      }

      return () => clearTimeout(timer);
    }
  }, [isTxSuccess, isApproveSuccess, refetch]);

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

  const handleApproveBounty = (bountyId: string, winnerAddress: string) => {
    console.log(`Approving bounty ${bountyId} for winner ${winnerAddress}`);
    approveBounty(bountyId, winnerAddress);
  };

  const handleCancelClaimByAdmin = (bountyId: string, claimantAddress: string) => {
    console.log(`Admin cancelling claim for ${claimantAddress} on bounty ${bountyId}`);
    cancelClaimByAdmin(bountyId, claimantAddress);
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bounties.map((bounty) => {
              const claimants = claimantsMap[bounty.id] || [];
              return (
                <div key={bounty.id} className="bg-gray-50 p-4 rounded-lg shadow">
                  <BountyCard
                    id={bounty.id}
                    title={bounty.title}
                    description={bounty.description}
                    githubUrl={bounty.githubUrl}
                    reward={`${ethers.formatEther(bounty.reward)} ETH`}
                    status={statusMap[bounty.status]}
                    isAdminView={true}
                    claimants={claimants}
                    onClaimSuccess={refetch}
                  />
                  {bounty.status === 0 && claimants.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Claimants:</h4>
                      <ul className="space-y-2">
                        {claimants.map((claimant, index) => (
                          <li key={index} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                            <span className="text-sm font-mono text-gray-600 truncate" title={claimant}>{claimant}</span>
                            <div className="flex space-x-2">
                              {/* Approve button is temporarily hidden
                              <button
                                onClick={() => handleApproveBounty(bounty.id, claimant)}
                                disabled={isApproving}
                                className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded text-xs focus:outline-none focus:shadow-outline"
                              >
                                {isApproving ? '...' : 'Approve'}
                              </button>
                              */}
                              <button
                                onClick={() => handleCancelClaimByAdmin(bounty.id, claimant)}
                                disabled={isApproving}
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs focus:outline-none focus:shadow-outline"
                              >
                                {isApproving ? '...' : 'Cancel'}
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
