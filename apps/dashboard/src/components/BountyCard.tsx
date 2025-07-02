"use client";
import React from 'react';
import { useClaimBounty } from '@/hooks/useClaimBounty';
import { useAdminActions } from '@/hooks/useAdminActions';
interface BountyCardProps {
  id: string;
  title: string;
  description: string; // Added description prop
  githubUrl: string;
  reward: string;
  rewardAmount: bigint;
  status: string;
  isAdminView: boolean;
  claimantAddress?: string;
  solutionGithubUrl?: string; // New prop for client-submitted solution URL
  onApproveBounty?: (bountyId: string, solutionGithubUrl: string) => void; // Callback for admin approval
  verificationStatus?: { id: string; status: 'idle' | 'verifying' | 'success' | 'failed'; message: string } | null; // Status of GitHub verification
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Open':
      return 'bg-blue-100 text-blue-800';
    case 'Claimed':
      return 'bg-yellow-100 text-yellow-800';
    case 'Paid':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const BountyCard: React.FC<BountyCardProps> = ({ id, title, description, githubUrl, reward, rewardAmount, status, isAdminView, claimantAddress, solutionGithubUrl, onApproveBounty, verificationStatus }) => {
  const statusColorClass = getStatusColor(status);
  const { claimBounty, isLoading: isClaiming, isSuccess: isClaimSuccess, isError: isClaimError, error: claimError } = useClaimBounty();
  const { approveBounty, isLoading: isAdminActionLoading, isSuccess: isAdminActionSuccess, isError: isAdminActionError, error: adminActionError, hash: adminActionHash } = useAdminActions();
  const { submitSolution, isLoading: isSubmittingSolution, isSuccess: isSubmitSuccess, isError: isSubmitError, error: submitError } = useAdminActions(); // Reusing useAdminActions for submitSolution

  const [localSolutionGithubUrl, setLocalSolutionGithubUrl] = React.useState(solutionGithubUrl || '');

  const handleClaim = () => {
    claimBounty(id);
  };

  const handleApprove = () => {
    if (onApproveBounty && solutionGithubUrl) {
      onApproveBounty(id, solutionGithubUrl);
    } else if (onApproveBounty && localSolutionGithubUrl) {
      onApproveBounty(id, localSolutionGithubUrl);
    }
  };

  const handleSubmitSolutionUrl = async () => {
    if (!localSolutionGithubUrl) {
      alert('Please enter a GitHub solution URL.');
      return;
    }
    submitSolution(id, localSolutionGithubUrl);
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
      {!isAdminView && status === 'Claimed' && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">You have claimed this bounty. Please submit your solution URL:</p>
          <input
            type="text"
            value={localSolutionGithubUrl}
            onChange={(e) => setLocalSolutionGithubUrl(e.target.value)}
            placeholder="Enter GitHub PR/commit URL"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
          />
          <button
            onClick={handleSubmitSolutionUrl}
            disabled={isSubmittingSolution}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {isSubmittingSolution ? 'Submitting...' : 'Submit Solution URL'}
          </button>
          {isSubmitSuccess && (
            <p className="text-green-500 text-sm mt-2">Solution URL submitted successfully!</p>
          )}
          {isSubmitError && (
            <p className="text-red-500 text-sm mt-2">Error submitting solution: {submitError?.message}</p>
          )}
        </div>
      )}
      {isAdminView && status === 'Claimed' && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Claimed by: <span className="font-mono text-xs">{claimantAddress}</span></p>
          {solutionGithubUrl && (
            <p className="text-sm text-gray-600 mb-2">Solution PR: <a href={solutionGithubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate">{solutionGithubUrl}</a></p>
          )}
          <button
            onClick={handleApprove}
            disabled={isAdminActionLoading}
            className="w-full bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {isAdminActionLoading ? 'Approving...' : 'Approve & Pay Bounty'}
          </button>
          {isAdminActionSuccess && (
            <p className="text-green-500 text-sm mt-2">Bounty approved and paid! Tx Hash: {adminActionHash}</p>
          )}
          {isAdminActionError && (
            <p className="text-red-500 text-sm mt-2">Error approving bounty: {adminActionError instanceof Error ? adminActionError.message : 'An unknown error occurred.'}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default BountyCard;
