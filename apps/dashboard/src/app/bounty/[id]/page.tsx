"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useReadContract } from 'wagmi';
import { ethers } from 'ethers';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useAdminActions } from '@/hooks/useAdminActions';
import BonusEscrowJson from '../../../../../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json';
import deployedContractAddress from '../../../contracts/deployed_contract_address.json';
import { readContract } from 'wagmi/actions';
import { config as wagmiConfig } from '@/app/wagmi';

const BonusEscrowABI = BonusEscrowJson.abi;

const statusMap: { [key: number]: string } = {
  0: 'Open',
  1: 'Paid',
};

export default function BountyDetail() {
  const router = useRouter();
  const params = useParams();
  const bountyId = params.id as string;
  const isValidBountyId = !!(bountyId && /^\d+$/.test(bountyId));

  const { isAdmin, isAdminLoading } = useIsAdmin();
  const [claimants, setClaimants] = useState<string[]>([]);

  const { data: allBounties, isLoading: isBountyLoading, refetch: refetchBounty } = useReadContract({
    address: deployedContractAddress.contractAddress as `0x${string}`,
    abi: BonusEscrowABI,
    functionName: 'getAllBounties',
    query: {
      enabled: isValidBountyId,
    },
  });

  const bounty = useMemo(() => {
    if (!allBounties || !Array.isArray(allBounties)) return null;
    const foundBounty = allBounties.find((b: any) => b.id.toString() === bountyId);
    if (!foundBounty) return null;

    return {
      id: foundBounty.id.toString(),
      creator: foundBounty.creator,
      title: foundBounty.title,
      description: foundBounty.description,
      githubUrl: foundBounty.githubUrl,
      reward: foundBounty.reward,
      status: Number(foundBounty.status),
    };
  }, [allBounties, bountyId]);

  const refetchClaimants = useCallback(async () => {
    if (!isValidBountyId) return;
    try {
      const data = await readContract(wagmiConfig, {
        address: deployedContractAddress.contractAddress as `0x${string}`,
        abi: BonusEscrowABI,
        functionName: 'getClaimants',
        args: [BigInt(bountyId)],
      });
      if (Array.isArray(data)) {
        setClaimants(data as string[]);
      }
    } catch (error) {
      console.error(`Failed to fetch claimants for bounty ${bountyId}:`, error);
    }
  }, [bountyId, isValidBountyId]);

  const onAdminActionSuccess = useCallback(() => {
    refetchBounty();
    refetchClaimants();
  }, [refetchBounty, refetchClaimants]);

  const { approveBounty, cancelClaimByAdmin, isLoading: isActionLoading } = useAdminActions(onAdminActionSuccess);

  useEffect(() => {
    if (isValidBountyId) {
      refetchClaimants();
    }
  }, [isValidBountyId, refetchClaimants]);

  if (isBountyLoading || isAdminLoading) {
    return <div className="text-center py-8">Loading bounty details...</div>;
  }

  if (!isValidBountyId) {
    return <div className="text-center py-8 text-red-500 font-bold">Invalid Bounty ID.</div>;
  }
  
  if (!bounty) {
    return <div className="text-center py-8 text-red-500 font-bold">Bounty not found.</div>;
  }

  const claimantsSection = isAdmin && bounty.status === 0 ? (
    <div className="mt-8 bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Claimants ({claimants.length})</h2>
      {claimants.length > 0 ? (
        <ul className="space-y-4">
          {claimants.map((claimant, index) => (
            <li key={index} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 p-4 rounded-lg shadow-sm">
              <span className="text-md font-mono text-gray-700 truncate mb-2 md:mb-0" title={claimant}>{claimant}</span>
              <div className="flex space-x-2 self-end md:self-auto">
                <button
                  onClick={() => approveBounty(bounty.id, claimant)}
                  disabled={isActionLoading}
                  className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded text-sm focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
                >
                  {isActionLoading ? 'Approving...' : 'Approve'}
                </button>
                <button
                  onClick={() => cancelClaimByAdmin(bounty.id, claimant)}
                  disabled={isActionLoading}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
                >
                  {isActionLoading ? 'Cancelling...' : 'Cancel'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No one has claimed this bounty yet.</p>
      )}
    </div>
  ) : null;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <button onClick={() => router.back()} className="mb-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
        &larr; Back to Dashboard
      </button>
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-gray-800">{bounty.title}</h1>
          <span className={`text-white text-sm font-semibold px-3 py-1 rounded-full ${bounty.status === 0 ? 'bg-green-500' : 'bg-gray-500'}`}>
            {statusMap[bounty.status]}
          </span>
        </div>
        <p className="text-gray-600 mb-4">{bounty.description}</p>
        <a href={bounty.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
          {bounty.githubUrl}
        </a>
        <div className="mt-4 text-2xl font-bold text-green-600">
          {ethers.formatEther(bounty.reward)} ETH
        </div>
      </div>
      {claimantsSection}
    </div>
  );
}

