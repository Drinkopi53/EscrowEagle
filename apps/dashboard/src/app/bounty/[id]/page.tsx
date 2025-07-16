"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useClaimBounty } from '@/hooks/useClaimBounty';
import { useParams, useRouter } from 'next/navigation';
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { abi as BonusEscrowABI } from '../../../../../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json';
import deployedContractAddress from '../../../contracts/deployed_contract_address.json';

interface BountyEvent {
  bountyId: string;
  eventName: string;
  userName?: string; // Pilihan
  address?: string;  // Optional
  prLink: string;
}

const statusMap: { [key: number]: string } = {
  0: 'Open',
  1: 'Paid', // Simplified status: 1 now directly maps to Paid
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'Open':
      return 'badge-cozy badge-cozy-open';
    case 'Paid':
      return 'badge-cozy badge-cozy-paid';
    default:
      return 'badge-cozy badge-cozy-error'; // Fallback for unexpected statuses
  }
};

// Lol

const BountyDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const bountyId = params.id as string;
  const [winnerInfo, setWinnerInfo] = useState<{ userName: string; prLink: string } | null>(null);
  const [committers, setCommitters] = useState<BountyEvent[]>([]);
  const { address } = useAccount();
  const { isAdmin } = useIsAdmin();

  const { data: bountyData, isLoading: isBountyLoading, error: bountyError, refetch: refetchBountyData } = useReadContract({
    address: deployedContractAddress.contractAddress as `0x${string}`,
    abi: BonusEscrowABI,
    functionName: 'bounties',
    args: [BigInt(bountyId)],
    query: { 
      enabled: !!bountyId && !isNaN(Number(bountyId)), // Only fetch if bountyId is valid
    },
  });

  const { data: claimantsData, isLoading: isLoadingClaimants, refetch: refetchClaimantsData } = useReadContract({
    address: deployedContractAddress.contractAddress as `0x${string}`,
    abi: BonusEscrowABI,
    functionName: 'getClaimants',
    args: [BigInt(bountyId)],
    query: {
      enabled: !!bountyId && !isNaN(Number(bountyId)), // Only fetch if bountyId is valid
    },
  });

  const { writeContract: payBountyWrite, isPending: isPaying } = useWriteContract();
  const { writeContract: cancelClaimByAdminWrite, isPending: isCancelling } = useWriteContract();
  const { claimBounty, cancelClaim, isLoading: isClaiming } = useClaimBounty(() => {
    refetchBountyData();
    refetchClaimantsData();
  });

  const handleCancelClaim = (claimantAddress: string) => {
    cancelClaimByAdminWrite({
      address: deployedContractAddress.contractAddress as `0x${string}`,
      abi: BonusEscrowABI,
      functionName: 'cancelClaimByAdmin',
      args: [BigInt(bountyId), claimantAddress as `0x${string}`],
    });
  };

  const handleApproveCommiter = (winnerAddress: string) => {
    payBountyWrite({
      address: deployedContractAddress.contractAddress as `0x${string}`,
      abi: BonusEscrowABI,
      functionName: 'payBounty',
      args: [BigInt(bountyId), winnerAddress as `0x${string}`],
    });
  };

  // Fetch committers from our new backend API
  const fetchCommitters = useCallback(async () => {
      if (!bountyId) return;
      try {
          const response = await fetch(`http://localhost:3001/api/bounties/${bountyId}/committers`);
          const data: BountyEvent[] = await response.json();
          setCommitters(data);
      } catch (error) {
          console.error('Error fetching committers:', error);
      }
  }, [bountyId]);

  useEffect(() => {
    // Fetch winner info from the dummy file (as backend doesn't support it yet)
    const fetchWinnerInfo = async () => {
      if (bountyData && statusMap[Number((bountyData as any).status)] === 'Accepted') {
        try {
          const response = await fetch('/dummy-events.json');
          const events: BountyEvent[] = await response.json();
          const prMergedEvent = events.find(
            (event) => event.eventName === 'PR_MERGED' && event.bountyId === bountyId
          );
          if (prMergedEvent && prMergedEvent.userName) {
            setWinnerInfo({
              userName: prMergedEvent.userName,
              prLink: prMergedEvent.prLink,
            });
          }
        } catch (error) {
          console.error('Error fetching dummy winner events:', error);
        }
      }
    };

    fetchWinnerInfo();
    fetchCommitters();
  }, [bountyData, bountyId, refetchBountyData, refetchClaimantsData, fetchCommitters]);

  const handleRefresh = useCallback(async () => {
    await refetchBountyData();
    await refetchClaimantsData();

    await fetchCommitters();
  }, [refetchBountyData, refetchClaimantsData, fetchCommitters]);

  if (isBountyLoading || isLoadingClaimants) {
    return (
      <div className="min-h-screen bg-cozy-main flex items-center justify-center">
        <div className="text-center">
          <div className="text-cozy-main text-lg font-medium">Loading bounty details...</div>
        </div>
      </div>
    );
  }

  // Validate bountyId
  if (!bountyId || isNaN(Number(bountyId))) {
    return (
      <div className="min-h-screen bg-cozy-main flex items-center justify-center">
        <div className="text-center">
          <div className="text-cozy-main text-lg font-medium mb-4">Invalid bounty ID.</div>
          <button
            onClick={() => router.push('/')}
            className="btn-cozy btn-cozy-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show error if contract read failed
  if (bountyError) {
    return (
      <div className="min-h-screen bg-cozy-main flex items-center justify-center">
        <div className="text-center">
          <div className="text-cozy-main text-lg font-medium mb-4">Error loading bounty data.</div>
          <div className="text-cozy-main text-sm mb-4 opacity-70">{bountyError.message}</div>
          <button
            onClick={() => router.push('/')}
            className="btn-cozy btn-cozy-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentBounty = bountyData ? {
    id: bountyId, // Use bountyId from URL params for consistency
    creator: (bountyData as any[])[1],
    title: (bountyData as any[])[2],
    description: (bountyData as any[])[3],
    githubUrl: (bountyData as any[])[4],
    reward: (bountyData as any[])[5],
    status: Number((bountyData as any[])[6]),
  } : null;

  if (!currentBounty || !currentBounty.creator) {
    return (
      <div className="min-h-screen bg-cozy-main flex items-center justify-center">
        <div className="text-center">
          <div className="text-cozy-main text-lg font-medium mb-4">Bounty not found or not yet created.</div>
          <div className="text-cozy-main text-sm mb-4 opacity-70">Bounty ID: {bountyId}</div>
          <button
            onClick={() => router.push('/')}
            className="btn-cozy btn-cozy-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // At this point, we know currentBounty is not null due to early returns above
  const statusBadgeClass = getStatusBadgeClass(statusMap[currentBounty!.status]);
  const claimants = claimantsData as string[] | undefined;

  return (
    <div className="min-h-screen bg-cozy-main py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button and Refresh Button */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <button
              onClick={() => router.push('/')}
              className="btn-cozy btn-cozy-secondary mb-4"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-cozy-main mb-2">
              Bounty Details
            </h1>
            <p className="text-cozy-main opacity-80">ID: {currentBounty!.id}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="btn-cozy btn-cozy-secondary"
          >
            Refresh Data
          </button>
        </div>

        {/* Main Bounty Card */}
        <div className="bg-cozy-card shadow-lg rounded-lg border border-cozy p-8 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-cozy-main">{currentBounty!.title}</h2>
            <span className={statusBadgeClass}>
              {statusMap[currentBounty!.status]}
            </span>
          </div>
          
          <p className="text-cozy-main mb-6 text-lg leading-relaxed">
            {currentBounty!.description}
          </p>

          {/* GitHub URL */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-cozy-main mb-2 uppercase tracking-wide">
              GitHub Repository
            </h3>
            <a 
              href={currentBounty!.githubUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="link-cozy text-lg break-all"
            >
              {currentBounty!.githubUrl}
            </a>
          </div>

          {/* Reward and Creator Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-cozy-main bg-opacity-5 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-cozy-main mb-2 uppercase tracking-wide">
                Reward
              </h3>
              <p className="text-2xl font-bold text-cozy-accent-primary">
                {`${Number(currentBounty!.reward) / 1e18} ETH`}
              </p>
            </div>
            <div className="bg-cozy-main bg-opacity-5 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-cozy-main mb-2 uppercase tracking-wide">
                Creator
              </h3>
              <p className="text-sm text-cozy-main font-mono break-all">
                {currentBounty!.creator}
              </p>
            </div>
          </div>

          {/* Winner Information */}
          {winnerInfo && (
            <div className="bg-cozy-status-paid-bg rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-cozy-status-paid-text mb-4">
                🎉 Winner Information
              </h3>
              <div className="space-y-2">
                <p className="text-cozy-status-paid-text">
                  <span className="font-medium">User Name:</span> {winnerInfo!.userName}
                </p>
                <p className="text-cozy-status-paid-text">
                  <span className="font-medium">PR Link:</span>{' '}
                  <a
                    href={winnerInfo!.prLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-cozy underline"
                  >
                    {winnerInfo!.prLink}
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* Claimants Table */}
          {claimants && claimants.length > 0 && (
            <div className="mt-8 pt-6 border-t border-cozy">
              <h3 className="text-xl font-bold text-cozy-main mb-4">
                Claimants ({ claimants.length })
              </h3>
              <div className="overflow-x-auto bg-cozy-main bg-opacity-5 rounded-lg border border-cozy">
                <table className="min-w-full text-left text-sm text-cozy-main">
                  <thead className="border-b border-cozy font-medium bg-cozy-main bg-opacity-5">
                    <tr>
                      <th scope="col" className="px-6 py-4 w-16">#</th>
                      <th scope="col" className="px-6 py-4">Address</th>
                      {isAdmin && <th scope="col" className="px-6 py-4">Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {claimants.map((claimant, index) => (
                      <tr key={index} className="border-b border-cozy transition duration-300 ease-in-out hover:bg-cozy-main hover:bg-opacity-10">
                        <td className="whitespace-nowrap px-6 py-4 font-medium">{index + 1}</td>
                        <td className="whitespace-nowrap px-6 py-4 font-mono">{claimant}</td>
                        {isAdmin && (
                          <td className="whitespace-nowrap px-6 py-4">
                            <button
                              onClick={() => handleCancelClaim(claimant)}
                              disabled={isCancelling}
                              className="btn-cozy btn-cozy-error btn-sm"
                            >
                              {isCancelling ? 'Cancelling...' : 'Cancel'}
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Committers Table - Hidden if bounty is Paid */}
          {committers && committers.length > 0 && statusMap[currentBounty!.status] !== 'Paid' && (
            <div className="mt-8 pt-6 border-t border-cozy">
              <h3 className="text-xl font-bold text-cozy-main mb-4">
                Commiters ({committers.length})
              </h3>
              <div className="overflow-x-auto bg-cozy-main bg-opacity-5 rounded-lg border border-cozy">
                <table className="min-w-full text-left text-sm text-cozy-main">
                  <thead className="border-b border-cozy font-medium bg-cozy-main bg-opacity-5">
                    <tr>
                      <th scope="col" className="px-6 py-4 w-16">#</th>
                      <th scope="col" className="px-6 py-4">Address</th>
                      <th scope="col" className="px-6 py-4">Commit Link</th>
                      <th scope="col" className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {committers.map((committer, index) => (
                      <tr key={index} className="border-b border-cozy transition duration-300 ease-in-out hover:bg-cozy-main hover:bg-opacity-10">
                        <td className="whitespace-nowrap px-6 py-4 font-medium">{index + 1}</td>
                        <td className="whitespace-nowrap px-6 py-4 font-mono">{committer.address}</td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <a
                            href={committer.prLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-cozy underline"
                          >
                            {committer.prLink}
                          </a>
                        </td>
                        {currentBounty.creator === address && (
                          <td className="whitespace-nowrap px-6 py-4">
                            <button
                              onClick={() => handleApproveCommiter(committer.address!)}
                              disabled={statusMap[currentBounty.status] !== 'Open' || isPaying}
                              className="btn-cozy btn-cozy-primary btn-sm"
                            >
                              {isPaying ? 'Approving...' : 'Approve'}
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Buttons (removed Complete Bounty button) */}
          <div className="flex flex-wrap gap-4">
            {currentBounty.status === 0 && !claimants?.includes(address as string) && (
              <button
                onClick={() => claimBounty(bountyId)}
                disabled={isClaiming}
                className="btn-cozy btn-cozy-primary"
              >
                {isClaiming ? 'Claiming...' : 'Claim Bounty'}
              </button>
            )}
            {currentBounty.status === 0 && claimants?.includes(address as string) && (
              <button
                onClick={() => cancelClaim(bountyId)}
                disabled={isClaiming}
                className="btn-cozy btn-cozy-error"
              >
                {isClaiming ? 'Cancelling...' : 'Cancel Claim'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BountyDetailPage;
