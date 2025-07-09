"use client";
import React, { useState } from 'react'; // Import useState
import { useClaimBounty } from '@/hooks/useClaimBounty';
import { useAccount } from 'wagmi';

interface BountyCardProps {
  id: string;
  title: string;
  description: string;
  githubUrl: string;
  reward: string;
  status: string;
  isAdminView: boolean;
  claimants?: string[];
  onClaimSuccess?: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Open':
      return 'bg-blue-100 text-blue-800';
    case 'Paid':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const BountyCard: React.FC<BountyCardProps> = ({ id, title, description, githubUrl, reward, status, isAdminView, claimants = [], onClaimSuccess }) => {
  const { address } = useAccount();
  const statusColorClass = getStatusColor(status);
  const { claimBounty, cancelClaim, isLoading: isClaiming, isSuccess: isClaimSuccess, isError: isClaimError, error: claimError } = useClaimBounty(onClaimSuccess);

  const [isClaimedByUser, setIsClaimedByUser] = React.useState(false);

  React.useEffect(() => {
    setIsClaimedByUser(claimants.some(c => c.toLowerCase() === address?.toLowerCase()));
  }, [claimants, address]);

  const handleClaim = () => {
    claimBounty(id);
    setIsClaimedByUser(true);
  };

  const handleCancelClaim = () => {
    cancelClaim(id);
    setIsClaimedByUser(false);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-4 flex flex-col">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-700 text-sm mb-2">{description}</p> {/* Display description */}
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
          {isClaimedByUser ? (
            <button
              onClick={handleCancelClaim}
              disabled={isClaiming}
              className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {isClaiming ? 'Cancelling...' : 'Cancel Claim'}
            </button>
          ) : (
            <button
              onClick={handleClaim}
              disabled={isClaiming}
              className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {isClaiming ? 'Submitting Claim...' : 'Claim Bounty'}
            </button>
          )}
          {isClaimSuccess && (
            <p className="text-green-500 text-sm mt-2">Action successful!</p>
          )}
          {isClaimError && (
            <p className="text-red-500 text-sm mt-2">Error: {claimError?.message}</p>
          )}
        </div>
      )}
      {isAdminView && status === 'Open' && claimants.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h4 className="font-semibold text-gray-800">Claimants ({claimants.length})</h4>
        </div>
      )}
    </div>
  );
};

export default BountyCard;
