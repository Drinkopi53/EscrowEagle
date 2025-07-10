"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
    default:
      return 'badge-cozy badge-cozy-error';
  }
};

const BountyCard: React.FC<BountyCardProps> = ({ 
  id, 
  title, 
  description, 
  githubUrl, 
  reward, 
  status, 
  isAdminView, 
  claimants = [], 
  onClaimSuccess 
}) => {
  const { address } = useAccount();
  const router = useRouter();
  const statusBadgeClass = getStatusBadgeClass(status);
  const { claimBounty, cancelClaim, isLoading: isClaiming, isSuccess: isClaimSuccess, isError: isClaimError, error: claimError } = useClaimBounty(onClaimSuccess);

  const [isClaimedByUser, setIsClaimedByUser] = React.useState(false);

  React.useEffect(() => {
    if (address && claimants) {
      setIsClaimedByUser(claimants.some(c => c.toLowerCase() === address.toLowerCase()));
    }
  }, [claimants, address]);

  const handleClaim = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    claimBounty(id);
    setIsClaimedByUser(true);
  };

  const handleCancelClaim = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    cancelClaim(id);
    setIsClaimedByUser(false);
  };

  const handleCardClick = () => {
    router.push(`/bounty/${id}`);
  };

  if (isAdminView) {
    return (
      <div 
        onClick={handleCardClick}
        className="bg-cozy-card shadow-md rounded-lg p-6 flex flex-col border border-cozy h-full cursor-pointer"
      >
        <h3 className="text-xl font-semibold text-cozy-main mb-2">{title}</h3>
        <p className="text-cozy-main text-sm mb-2">{description}</p>
        <a 
          href={githubUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="link-cozy mb-4 truncate"
          onClick={(e) => e.stopPropagation()} // Prevent card navigation when clicking the external link
        >
          {githubUrl}
        </a>
        <div className="flex-grow"></div>
        <div className="flex justify-between items-center mt-auto">
          <span className="text-lg font-bold text-cozy-accent-primary">{reward}</span>
          <span className={statusBadgeClass}>
            {status}
          </span>
        </div>
        <div className="mt-4 text-right font-medium text-blue-500 hover:underline">
          View Details
        </div>
        {status === 'Open' && claimants.length > 0 && (
          <div className="mt-4 border-t border-cozy pt-4">
            <h4 className="font-semibold text-cozy-main">Claimants ({claimants.length})</h4>
          </div>
        )}
      </div>
    );
  }

  // Default view for non-admins
  return (
    <div className="bg-cozy-card shadow-md rounded-lg p-6 flex flex-col border border-cozy h-full">
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
      <Link href={`/bounty/${id}`} className="mt-4 inline-block link-cozy font-medium">
        View Details
      </Link>
      {status === 'Open' && (
        <div className="mt-4">
          {isClaimedByUser ? (
            <button
              onClick={handleCancelClaim}
              disabled={isClaiming}
              className="w-full btn-cozy btn-cozy-error"
            >
              {isClaiming ? 'Cancelling...' : 'Cancel Claim'}
            </button>
          ) : (
            <button
              onClick={handleClaim}
              disabled={isClaiming || !address}
              className="w-full btn-cozy btn-cozy-secondary"
            >
              {isClaiming ? 'Submitting Claim...' : !address ? 'Connect Wallet to Claim' : 'Claim Bounty'}
            </button>
          )}
          {isClaimSuccess && (
            <p className="text-sm mt-2 text-green-600">Action successful!</p>
          )}
          {isClaimError && (
            <p className="text-sm mt-2 text-red-600">Error: {claimError?.message ?? 'An unknown error occurred'}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default BountyCard;
