"use client";
import React from 'react';
import { useApplyForBounty } from '@/hooks/useApplyForBounty';
import { useAdminActions } from '@/hooks/useAdminActions';
interface BountyCardProps {
  id: string;
  title: string;
  githubUrl: string;
  reward: string;
  rewardAmount: bigint;
  status: string;
  isAdminView: boolean;
  acceptorAddress?: string; // Add acceptorAddress as an optional prop
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Open':
      return 'bg-blue-100 text-blue-800';
    case 'PendingReview':
      return 'bg-yellow-100 text-yellow-800';
    case 'Paid':
      return 'bg-green-100 text-green-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const BountyCard: React.FC<BountyCardProps> = ({ id, title, githubUrl, reward, rewardAmount, status, isAdminView, acceptorAddress }) => {
  const statusColorClass = getStatusColor(status);
  const { applyForBounty, isLoading: isClaiming, isSuccess: isClaimSuccess, isError: isClaimError, error: claimError } = useApplyForBounty();
  const { completeBounty, payBounty, rejectBounty, isLoading: isAdminActionLoading, isSuccess: isAdminActionSuccess, isError: isAdminActionError, error: adminActionError, hash: adminActionHash, actionType: adminActionType } = useAdminActions();

  const handleClaim = () => {
    applyForBounty(id);
  };

  const handleComplete = () => {
    completeBounty(id);
  };

  const handlePay = () => {
    if (acceptorAddress) {
      payBounty(id, acceptorAddress);
    } else {
      console.error("Acceptor address not available for payment.");
      alert("Acceptor address not available for payment.");
    }
  };

  const handleReject = () => {
    rejectBounty(id);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-4 flex flex-col">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mb-4 truncate">
        {githubUrl}
      </a>
      <div className="flex-grow"></div>
      <div className="flex justify-between items-center mt-auto">
        <span className="text-lg font-bold text-indigo-600">{reward}</span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColorClass}`}>
          {status}
        </span>
      </div>
      <a href={`/bounty/${id}`} className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium">
        View Details
      </a>
      {!isAdminView && status === 'Open' && (
        <div className="mt-4">
          <button
            onClick={handleClaim}
            disabled={isClaiming}
            className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {isClaiming ? 'Claiming...' : 'Claim Bounty'}
          </button>
          {isClaimSuccess && (
            <p className="text-green-500 text-sm mt-2">Bounty claimed successfully!</p>
          )}
          {isClaimError && (
            <p className="text-red-500 text-sm mt-2">Error claiming bounty: {claimError?.message}</p>
          )}
        </div>
      )}
      {isAdminView && status === 'Accepted' && (
        <div className="mt-4">
          <button
            onClick={handleComplete}
            disabled={isAdminActionLoading && adminActionType === 'complete'}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {isAdminActionLoading && adminActionType === 'complete' ? 'Completing...' : 'Mark as Completed'}
          </button>
          {isAdminActionSuccess && adminActionType === 'complete' && (
            <p className="text-green-500 text-sm mt-2">Bounty marked as completed! Tx Hash: {adminActionHash}</p>
          )}
          {isAdminActionError && adminActionType === 'complete' && (
            <p className="text-red-500 text-sm mt-2">Error completing bounty: {adminActionError instanceof Error ? adminActionError.message : 'An unknown error occurred.'}</p>
          )}
        </div>
      )}
      {isAdminView && status === 'Completed' && (
        <div className="mt-4 flex space-x-2">
          <button
            onClick={handlePay}
            disabled={isAdminActionLoading && adminActionType === 'pay'}
            className="flex-1 bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {isAdminActionLoading && adminActionType === 'pay' ? 'Paying...' : 'Pay Bounty'}
          </button>
          <button
            onClick={handleReject}
            disabled={isAdminActionLoading && adminActionType === 'reject'}
            className="flex-1 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {isAdminActionLoading && adminActionType === 'reject' ? 'Rejecting...' : 'Reject Bounty'}
          </button>
        </div>
      )}
      {isAdminActionSuccess && adminActionType === 'pay' && (
        <p className="text-green-500 text-sm mt-2">Bounty paid! Tx Hash: {adminActionHash}</p>
      )}
      {isAdminActionError && adminActionType === 'pay' && (
        <p className="text-red-500 text-sm mt-2">Error paying bounty: {adminActionError instanceof Error ? adminActionError.message : 'An unknown error occurred.'}</p>
      )}
      {isAdminActionSuccess && adminActionType === 'reject' && (
        <p className="text-green-500 text-sm mt-2">Bounty rejected! Tx Hash: {adminActionHash}</p>
      )}
      {isAdminActionError && adminActionType === 'reject' && (
        <p className="text-red-500 text-sm mt-2">Error rejecting bounty: {adminActionError instanceof Error ? adminActionError.message : 'An unknown error occurred.'}</p>
      )}
    </div>
  );
};

export default BountyCard;
