"use client";

import React, { useState } from 'react';
import { useContractWrite, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { parseEther } from 'viem';
import BonusEscrowJson from '../../../../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json';
const BonusEscrowABI = BonusEscrowJson.abi;
import deployedContractAddress from '../../contracts/deployed_contract_address.json';
import { useRouter } from 'next/navigation';

const CreateBountyPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [reward, setReward] = useState('');
  const router = useRouter();
  const { address } = useAccount();

  const { data: hash, writeContract, isPending, isError, error } = useContractWrite();
  const queryClient = useQueryClient();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      alert('Please connect your wallet first.');
      return;
    }
    try {
      // The contract expects a title and a githubUrl.
      await writeContract({
        abi: BonusEscrowABI,
        address: deployedContractAddress.contractAddress as `0x${string}`,
        functionName: 'createBounty',
        args: [title, githubUrl],
        value: parseEther(reward),
        account: address,
      });
    } catch (err) {
      console.error('Error creating bounty:', err);
    }
  };

  React.useEffect(() => {
    if (isConfirmed) {
      alert('Bounty created successfully!');
      queryClient.invalidateQueries({ queryKey: ['BonusEscrow', deployedContractAddress.contractAddress, 'getAllBounties'] });
      router.push('/'); // Redirect to home page after successful creation
    }
  }, [isConfirmed, router, queryClient]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Create New Bounty</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
            Title:
          </label>
          <input
            type="text"
            id="title"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="githubUrl" className="block text-gray-700 text-sm font-bold mb-2">
            GitHub URL:
          </label>
          <input
            type="url"
            id="githubUrl"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="reward" className="block text-gray-700 text-sm font-bold mb-2">
            Reward (Ether):
          </label>
          <input
            type="number"
            id="reward"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={reward}
            onChange={(e) => setReward(e.target.value)}
            step="0.01"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={isPending || isConfirming}
        >
          {isPending ? 'Confirming...' : isConfirming ? 'Creating Bounty...' : 'Create Bounty'}
        </button>
        {isError && <p className="text-red-500 text-xs italic mt-2">Error: {error?.message}</p>}
        {isConfirmed && <p className="text-green-500 text-xs italic mt-2">Transaction Confirmed!</p>}
      </form>
    </div>
  );
};

export default CreateBountyPage;
