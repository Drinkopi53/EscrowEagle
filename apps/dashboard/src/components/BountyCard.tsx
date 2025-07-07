"use client";
import React, { useState } from 'react'; // Import useState
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
  // Assume useClaimBounty hook will also provide unclaimBounty, isLoadingUnclaiming, isUnclaimSuccess, isUnclaimError, unclaimError
  const {
    claimBounty, isLoading: isClaiming, isSuccess: isClaimSuccess, isError: isClaimError, error: claimError,
    unclaimBounty, isLoading: isLoadingUnclaiming, isSuccess: isUnclaimSuccess, isError: isUnclaimError, error: unclaimError
  } = useClaimBounty();
  const { approveBounty, isLoading: isAdminActionLoading, isSuccess: isAdminActionSuccess, isError: isAdminActionError, error: adminActionError, hash: adminActionHash } = useAdminActions();
  const { submitSolution, isLoading: isSubmittingSolution, isSuccess: isSubmitSuccess, isError: isSubmitError, error: submitError } = useAdminActions(); // Reusing useAdminActions for submitSolution

  const [localSolutionGithubUrl, setLocalSolutionGithubUrl] = React.useState(solutionGithubUrl || '');
  const [isClaimedByCurrentUser, setIsClaimedByCurrentUser] = useState(false); // State for client-side claim status

  React.useEffect(() => {
    if (isClaimSuccess) {
      setIsClaimedByCurrentUser(true);
    }
  }, [isClaimSuccess]);

  const handleClaim = () => {
    claimBounty(id);
  };

  const handleCancelClaim = () => {
    if (unclaimBounty) {
      unclaimBounty(id); // Call the actual unclaim function
    } else {
      // Fallback or error handling if unclaimBounty is not available
      console.warn("unclaimBounty function is not available on useClaimBounty hook. Proceeding with UI change only.");
    }
    setIsClaimedByCurrentUser(false); // Revert UI state
  };

  // Effect to potentially revert isClaimedByCurrentUser if unclaiming fails
  React.useEffect(() => {
    if (isUnclaimError && !isLoadingUnclaiming) {
      // If unclaiming failed, we might want to set isClaimedByCurrentUser back to true,
      // or show a persistent error message. For now, let's assume the user might want to retry.
      // Potentially, we could re-set to true if the backend state is still 'Claimed'.
      // This depends on how we want to handle unclaim errors.
      // setIsClaimedByCurrentUser(true); // Example: revert if unclaim failed
      console.error("Failed to unclaim bounty:", unclaimError);
    }
    if (isUnclaimSuccess) {
        // Optionally, refresh bounty status from backend or rely on optimistic update
        console.log("Bounty unclaim processed successfully for ID:", id);
    }
  }, [isUnclaimError, isLoadingUnclaiming, isUnclaimSuccess, unclaimError, id]);

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
      {/* Client View: Claim/Cancel and Submit Solution */}
      {!isAdminView && (
        <>
          {status === 'Open' && !isClaimedByCurrentUser && (
            <div className="mt-4">
              <button
                onClick={handleClaim}
                disabled={isClaiming}
                className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {isClaiming ? 'Claiming...' : 'Claim Bounty'}
              </button>
              {isClaimSuccess && !isClaimedByCurrentUser && ( // Show success only if not yet transitioned to cancel
                <p className="text-green-500 text-sm mt-2">Bounty claimed successfully! Button will change shortly.</p>
              )}
              {isClaimError && (
                <p className="text-red-500 text-sm mt-2">Error claiming bounty: {claimError?.message}</p>
              )}
            </div>
          )}

          {(status === 'Claimed' || isClaimedByCurrentUser) && !isAdminView && (
            <div className="mt-4">
              <button
                onClick={handleCancelClaim}
                disabled={isLoadingUnclaiming}
                className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
              >
                {isLoadingUnclaiming ? 'Cancelling...' : 'Cancel Claim'}
              </button>
              {isUnclaimSuccess && (
                <p className="text-green-500 text-sm mt-2">Claim cancelled successfully. You can claim this bounty again if it's still open.</p>
              )}
              {isUnclaimError && (
                <p className="text-red-500 text-sm mt-2">Error cancelling claim: {unclaimError?.message}</p>
              )}
              {/* Only show solution submission if the bounty is still considered claimed by this user and not successfully unclaimed */}
              {isClaimedByCurrentUser && !isUnclaimSuccess && (
                <>
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
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* Admin View: Approve Bounty */}
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
        </>
      )}

      {/* Admin View: Approve Bounty */}
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
