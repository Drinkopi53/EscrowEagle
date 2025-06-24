"use client";

import React, { useState } from 'react';
import { useContractWrite, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseEther } from 'viem';
import { abi as BonusEscrowABI } from '../../../../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json';
import deployedContractAddress from '../../../../../python_workspace/deployed_contract_address.json';
import { useRouter } from 'next/navigation';

const CreateBountyPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('');
  const router = useRouter();
  const { address } = useAccount();

  const { data: hash, writeContract, isPending, isError, error } = useContractWrite({
    abi: BonusEscrowABI,
    address: deployedContractAddress.contractAddress as `0x${string}`,
    functionName: 'createBounty', // Assuming a function to create bounty
    // @ts-ignore
    account: address,
  });

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
      // Assuming createBounty takes title, description, and reward (in wei)
      await writeContract({
        args: [title, description],
        value: parseEther(reward),
        // @ts-ignore
        account: address,
      });
    } catch (err) {
      console.error('Error creating bounty:', err);
    }
  };

  React.useEffect(() => {
    if (isConfirmed) {
      alert('Bounty created successfully!');
      router.push('/'); // Redirect to home page after successful creation
    }
  }, [isConfirmed, router]);

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
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
            Description:
          </label>
          <textarea
            id="description"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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