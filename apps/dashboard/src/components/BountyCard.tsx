"use client";
import React from 'react';
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

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'Open':
      return 'badge-cozy badge-cozy-open';
    case 'Paid':
      return 'badge-cozy badge-cozy-paid';
    default: // Assuming other statuses might use a default or error-like cozy badge
      return 'badge-cozy badge-cozy-error';
  }
};

const BountyCard: React.FC<BountyCardProps> = ({ id, title, description, githubUrl, reward, status, isAdminView, claimants = [], onClaimSuccess }) => {
  const { address } = useAccount();
  const statusBadgeClass = getStatusBadgeClass(status);
  const { claimBounty, cancelClaim, isLoading: isClaiming, isSuccess: isClaimSuccess, isError: isClaimError, error: claimError } = useClaimBounty(onClaimSuccess);

  const handleClaim = () => {
    claimBounty(id);
  };

  const handleCancelClaim = () => {
    cancelClaim(id);
  };

  const hasClaimed = claimants.some(c => c.toLowerCase() === address?.toLowerCase());

  return (
    <div className="bg-cozy-card shadow-md rounded-lg p-6 mb-4 flex flex-col border border-cozy">
      <h3 className="text-xl font-semibold text-cozy-main mb-2">{title}</h3>
      <p className="text-cozy-main text-sm mb-2">{description}</p>
      <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="link-cozy mb-4 truncate">
        {githubUrl}
      </a>
      <div className="flex-grow"></div>
      <div className="flex justify-between items-center mt-auto">
        <span className="text-lg font-bold text-cozy-accent-primary">{reward}</span>
        <span className={statusBadgeClass}>
          {status}
        </span>
      </div>
      <a href={`/bounty/${id}`} className="mt-4 inline-block link-cozy font-medium">
        View Details
      </a>
      {status === 'Open' && claimants.length > 0 && (
        <p className="text-sm text-cozy-main mt-2">Claimants: {claimants.length}</p>
      )}
      {!isAdminView && status === 'Open' && (
        <div className="mt-4">
          {hasClaimed ? (
            <div className="flex space-x-2">
              <button
                disabled={true}
                className="w-full btn-cozy btn-cozy-disabled"
              >
                Claimed
              </button>
              <button
                onClick={handleCancelClaim}
                disabled={isClaiming}
                className="w-full btn-cozy btn-cozy-danger"
              >
                {isClaiming ? 'Cancelling...' : 'Cancel Claim'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleClaim}
              disabled={isClaiming}
              className="w-full btn-cozy btn-cozy-secondary"
            >
              {isClaiming ? 'Submitting Claim...' : 'Claim Bounty'}
            </button>
          )}
          {isClaimSuccess && (
            <p className="text-sm mt-2" style={{color: 'var(--cozy-status-paid-text)'}}>Action successful!</p>
          )}
          {isClaimError && (
            <p className="text-sm mt-2" style={{color: 'var(--cozy-status-error-text)'}}>{claimError?.message}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default BountyCard;
