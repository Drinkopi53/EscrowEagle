"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useReadContract, useAccount } from 'wagmi'; // Removed useWriteContract as it's in useAdminActions
import { useAdminActions } from '../../../hooks/useAdminActions'; // Import useAdminActions
import { abi as BonusEscrowABI } from '../../../../../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json';
import deployedContractAddress from '../../../contracts/deployed_contract_address.json';
import BountyClaimantsTable, { Claimant } from '../../../components/BountyClaimantsTable'; // Import the new component

interface BountyEvent {
  bountyId: string;
  eventName: string;
  userName: string;
  prLink: string;
  // Assuming claimedAt might come from event data or needs to be added
  claimedAt?: string;
}

const statusMap: { [key: number]: string } = {
  0: 'Open',
  1: 'Accepted',
  2: 'Completed',
  3: 'Paid',
};

// Dummy data for claimants - replace with actual data fetching logic
// Ensure claimedAt is a valid ISO string for sorting
const dummyClaimants: Claimant[] = [
  { id: '1', name: 'Client Alpha', status: 'Claimed', claimedAt: new Date('2023-01-15T10:00:00Z').toISOString() },
  { id: '2', name: 'Client Beta', status: 'Pending', claimedAt: new Date('2023-01-20T14:30:00Z').toISOString() },
  { id: '3', name: 'Client Gamma', status: 'Claimed', claimedAt: new Date('2023-01-10T09:00:00Z').toISOString() },
  { id: '4', name: 'Client Delta', status: 'Cancelled', claimedAt: new Date('2023-01-12T11:00:00Z').toISOString() },
];


const BountyDetailPage: React.FC = () => {
  const params = useParams();
  const bountyId = params.id as string;
  const [winnerInfo, setWinnerInfo] = useState<{ userName: string; prLink: string } | null>(null);
  const { address } = useAccount();
  const {
    approveBounty: approveBountyAction,
    cancelClaimByAdmin: cancelClaimByAdminAction,
    isLoading: isAdminActionLoading,
    isSuccess: isAdminActionSuccess,
    error: adminActionError
  } = useAdminActions();

  // State for claimants - initially using dummy data
  // TODO: Replace dummyClaimants with actual fetched data based on bountyId
  const [claimants, setClaimants] = useState<Claimant[]>(dummyClaimants);
  const [isLoadingClaimants, setIsLoadingClaimants] = useState(false);

  const { data: bountyData, isLoading: isBountyLoading, refetch: refetchBountyData } = useReadContract({
    address: deployedContractAddress.contractAddress as `0x${string}`,
    abi: BonusEscrowABI,
    functionName: 'bounties',
    args: [BigInt(bountyId)],
  });

  // TODO: Add a separate useReadContract call or similar mechanism to fetch actual claimants
  // for this specific bountyId. For now, dummy data is used.
  // Example:
  // const { data: fetchedClaimantsData, refetch: refetchClaimants } = useReadContract({
  //   address: deployedContractAddress.contractAddress as `0x${string}`,
  //   abi: BonusEscrowABI,
  //   functionName: 'getClaimants',
  //   args: [BigInt(bountyId)],
  // });
  // useEffect(() => {
  //   if (fetchedClaimantsData) {
  //     // Process fetchedClaimantsData into Claimant[] format
  //     // setClaimants(processedClaimants);
  //   }
  // }, [fetchedClaimantsData]);


  const handleAcceptBounty = () => {
    // This function might be part of useAdminActions or a different hook if it's not admin-specific
    // For now, assuming approveBountyAction from useAdminActions can be used if creator is admin
    // Or, it might need its own useWriteContract setup if any user (creator) can accept.
    // Based on current useAdminActions, it seems geared towards admin functions.
    // If `acceptBounty` is a general user action, it needs its own write call.
    // Let's assume for now it's an admin/creator action covered by useAdminActions
    console.log("Accept Bounty action to be implemented or integrated with a specific hook.");
    // approveBountyAction(bountyId, someWinnerAddress); // Requires winner address
  };

  const handleCompleteBounty = () => {
    console.log("Complete Bounty action to be implemented.");
    // This would also likely use useWriteContract or a specific hook
  };

  const handlePayBounty = () => {
    const currentBountyDetails = bountyData as any;
    if (currentBountyDetails && currentBountyDetails.claimant && currentBountyDetails.claimant !== '0x0000000000000000000000000000000000000000') {
      // Assuming payBounty is an admin/creator action
      // If it's general, it needs its own write call.
      // The approveBounty function in the contract actually handles the payment.
      // So, "Pay Bounty" likely means "Approve Bounty" for a specific winner.
      approveBountyAction(bountyId, currentBountyDetails.claimant);
    } else {
      alert("No winner (claimant) selected or bounty not in a payable state.");
    }
  };

  const handleCancelClaim = (claimantWalletAddress: string) => {
    // Assuming claimantId passed to this function is the wallet address string
    console.log(`Admin attempting to cancel claim for claimant: ${claimantWalletAddress} on bounty: ${bountyId}`);
    cancelClaimByAdminAction(bountyId, claimantWalletAddress);
    // Optimistic update or refetch will be handled by useAdminActions's onSuccess
  };

  useEffect(() => {
    if (isAdminActionSuccess) {
      // Refetch bounty data to get updated status/claimant list potentially
      refetchBountyData();
      // TODO: Specifically refetch claimants if that's a separate call
      // For now, if using dummy data, we might manually filter after a successful cancel
      // However, useAdminActions already invalidates queries, which should trigger refetch of `getAllBounties`.
      // If getClaimants is a separate query, it should also be invalidated or refetched.
      // For optimistic update with dummy data (example):
      // setClaimants(prev => prev.filter(c => c.id !== lastCancelledClaimantId));
      // This needs to be smarter if claimantId is not the wallet address directly.
      // For now, relying on query invalidation from useAdminActions.
      // If using dummy data: after successful cancellation, you might want to update the dummy list.
      // This part depends on how claimantId in the table maps to claimantAddress for the contract.
      // Let's assume `claimant.id` in the table IS the `claimantAddress`.
      console.log("Admin action (cancel claim) was successful. Data should refetch.");
    }
    if (adminActionError) {
        console.error("Error performing admin action:", adminActionError.message);
        // Optionally, show a toast notification to the user
    }
  }, [isAdminActionSuccess, adminActionError, refetchBountyData]);


  useEffect(() => {
    const fetchWinnerInfo = async () => { // Renamed to avoid conflict
      setIsLoadingClaimants(true);
      if (bountyData && statusMap[Number((bountyData as any).status)] === 'Accepted') {
        try {
          const response = await fetch('/dummy-events.json');
          const events: BountyEvent[] = await response.json();
          const prMergedEvent = events.find(
            (event) => event.eventName === 'PR_MERGED' && event.bountyId === bountyId
          );
          if (prMergedEvent) {
            setWinnerInfo({
              userName: prMergedEvent.userName,
              prLink: prMergedEvent.prLink,
            });
          }
          // TODO: Replace dummyClaimants with actual fetched data for this bountyId
        } catch (error) {
          console.error('Error fetching event data:', error);
        }
      }
      setIsLoadingClaimants(false);
    };

    fetchWinnerInfo();
  }, [bountyData, bountyId]);

  if (isBountyLoading || isLoadingClaimants) { // Combined loading states
    return <div className="text-center py-8">Loading bounty details...</div>;
  }

  const currentBounty = bountyData ? {
    id: (bountyData as any).id.toString(),
    creator: (bountyData as any).creator,
    title: (bountyData as any).title,
    description: (bountyData as any).description,
    githubUrl: (bountyData as any).githubUrl,
    reward: (bountyData as any).reward,
    status: Number((bountyData as any).status),
    claimant: (bountyData as any).claimant,
    solutionGithubUrl: (bountyData as any).solutionGithubUrl,
  } : null;

  if (!currentBounty) {
    return <div className="text-center py-8">Bounty not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 lg:p-8">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="p-6 sm:p-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
            {currentBounty.title}
          </h1>
          <p className="text-gray-600 mb-6 text-md leading-relaxed">
            {currentBounty.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Reward</p>
              <p className="text-lg font-semibold text-indigo-600">{`${Number(currentBounty.reward) / 1e18} ETH`}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className={`text-lg font-semibold ${
                statusMap[currentBounty.status] === 'Open' ? 'text-green-600' :
                statusMap[currentBounty.status] === 'Accepted' ? 'text-blue-600' :
                statusMap[currentBounty.status] === 'Completed' ? 'text-purple-600' :
                statusMap[currentBounty.status] === 'Paid' ? 'text-yellow-600' : 'text-gray-600'
              }`}>{statusMap[currentBounty.status]}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Creator</p>
              <p className="text-md text-gray-700 truncate" title={currentBounty.creator}>{currentBounty.creator}</p>
            </div>
            {currentBounty.githubUrl && (
                 <div>
                   <p className="text-sm font-medium text-gray-500">GitHub Issue</p>
                   <a
                    href={currentBounty.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-md text-indigo-600 hover:text-indigo-800 hover:underline truncate"
                    title={currentBounty.githubUrl}
                  >
                    {currentBounty.githubUrl.replace('https://github.com/', '')}
                  </a>
                 </div>
            )}
          </div>

          {winnerInfo && (
            <div className="mt-6 mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="text-xl font-semibold text-green-700 mb-2">Winner Information</h3>
              <p className="text-gray-700">
                User Name: <span className="font-medium">{winnerInfo.userName}</span>
              </p>
              <p className="text-gray-700">
                PR Link:{' '}
                <a
                  href={winnerInfo.prLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {winnerInfo.prLink}
                </a>
              </p>
            </div>
          )}

          {address === currentBounty.creator && (
            <div className="mt-6 mb-8 flex flex-wrap gap-3">
              {statusMap[currentBounty.status] === 'Open' && (
                <button
                  onClick={handleAcceptBounty}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out disabled:opacity-50"
                  disabled={isAccepting}
                >
                  {isAccepting ? 'Accepting...' : 'Accept Bounty'}
                </button>
              )}
              {/* Assuming admin/creator can complete if a solution is submitted, or if it's part of the flow */}
              {statusMap[currentBounty.status] === 'Accepted' && (
                 <button
                  onClick={handleCompleteBounty} // This might need a specific winner/solution
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out disabled:opacity-50"
                  disabled={isCompleting}
                >
                  {isCompleting ? 'Mark as Completed...' : 'Mark as Completed'}
                </button>
              )}
              {statusMap[currentBounty.status] === 'Completed' && (
                <button
                  onClick={handlePayBounty}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out disabled:opacity-50"
                  disabled={isPaying || !currentBounty.claimant || currentBounty.claimant === '0x0000000000000000000000000000000000000000'}
                >
                  {isPaying ? 'Paying...' : `Pay Bounty to ${currentBounty.claimant === address ? 'Yourself (Claimant)' : 'Winner'}`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Claimants Section */}
      {/* Only show claimants table if the current user is the bounty creator */}
      {address === currentBounty.creator && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Claimants</h2>
          <BountyClaimantsTable
            claimants={claimants}
            onCancelClaim={handleCancelClaim}
            isLoading={isLoadingClaimants}
          />
        </div>
      )}
    </div>
  );
};

export default BountyDetailPage;
