import React, { useState } from 'react'; // Import useState
import { type Bounty } from '../app/bounties/page'; // Import Bounty type

interface BountyCardProps {
  id: string;
  title: string;
  description: string;
  reward: string;
  status: string;
  creator: `0x${string}`;
  currentAccount: `0x${string}` | undefined;
  isAdmin: boolean; // Add isAdmin prop
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Open':
      return 'bg-blue-100 text-blue-800';
    case 'Claimed':
      return 'bg-orange-100 text-orange-800'; // New status color
    case 'Accepted':
      return 'bg-green-100 text-green-800';
    case 'Completed':
      return 'bg-purple-100 text-purple-800';
    case 'Paid':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

import { useContractWrite, useWaitForTransactionReceipt } from 'wagmi';
// import { useSendTransaction } from 'wagmi'; // Removed
// import { encodeFunctionData } from 'viem'; // Removed
import { abi as BonusEscrowABI } from '../../../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json';
import deployedContractAddress from '../../../../python_workspace/deployed_contract_address.json';
import { useQueryClient } from '@tanstack/react-query';

const BountyCard: React.FC<BountyCardProps> = ({ id, title, description, reward, status, creator, currentAccount, isAdmin }) => {
  const statusColorClass = getStatusColor(status);
  const queryClient = useQueryClient();
  const [optimisticallyClaimed, setOptimisticallyClaimed] = useState(false);

  // Log props for debugging
  console.log(`Bounty ID: ${id}, Status: ${status}, Creator: ${creator}, Current Account: ${currentAccount}, Is Admin: ${isAdmin}`);

  // Renamed for clarity, will be configured for 'acceptClaim'
  const { data: acceptClaimHash, writeContract: acceptClaimWrite, isPending: isAcceptingClaim } = useContractWrite();
  const { isLoading: isAcceptingClaimConfirming, isSuccess: isAcceptingClaimConfirmed } = useWaitForTransactionReceipt({
    hash: acceptClaimHash, // Updated hash variable
  });

  // Hooks for claimBounty (on-chain) are removed as it's now optimistic and handled by local state

  const { data: completeHash, writeContract: completeBountyWrite, isPending: isCompleting } = useContractWrite();
  const { isLoading: isCompletingConfirming, isSuccess: isCompletingConfirmed } = useWaitForTransactionReceipt({
    hash: completeHash,
  });

  const handleClaimBounty = () => {
    if (!currentAccount) {
      alert('Please connect your wallet to claim bounties.');
      return;
    }
    // Optimistic UI update
    setOptimisticallyClaimed(true);
    alert('Your claim has been noted. The bounty creator will review and confirm valid claims.');
    // No on-chain transaction for claiming by client anymore
  };

  const handleAcceptClaim = () => {
    if (!currentAccount) {
      alert('Please connect your wallet.');
      return;
    }
    if (currentAccount !== creator) {
      alert('Only the bounty creator can accept a claim.');
      return;
    }

    const claimantAddress = prompt('Enter the Ethereum address of the client whose claim you want to accept:');
    if (!claimantAddress) {
      alert('Claimant address is required.');
      return;
    }
    // Basic address validation (length, 0x prefix) - can be improved
    if (!/^0x[a-fA-F0-9]{40}$/.test(claimantAddress)) {
      alert('Invalid Ethereum address format.');
      return;
    }

    acceptClaimWrite({
      address: deployedContractAddress.contractAddress as `0x${string}`,
      abi: BonusEscrowABI,
      functionName: 'acceptClaim', // Updated function name
      args: [BigInt(id), claimantAddress as `0x${string}`], // Added claimantAddress
      account: currentAccount,
    });
  };

  const handleCompleteBounty = () => {
    if (!currentAccount) {
      alert('Please connect your wallet to complete bounties.');
      return;
    }
    completeBountyWrite({
      address: deployedContractAddress.contractAddress as `0x${string}`,
      abi: BonusEscrowABI,
      functionName: 'completeBounty',
      args: [BigInt(id)],
      account: currentAccount,
    });
  };

  React.useEffect(() => {
    // Updated to use isAcceptingClaimConfirmed
    if (isAcceptingClaimConfirmed || isCompletingConfirmed) {
      queryClient.invalidateQueries({ queryKey: ['BonusEscrow', deployedContractAddress.contractAddress, 'getAllBounties'] });
      queryClient.invalidateQueries({ queryKey: ['BonusEscrow', deployedContractAddress.contractAddress, 'bounties', BigInt(id)] });
      // Potentially reset optimistic claim state if this card was accepted by this creator
      if (isAcceptingClaimConfirmed && currentAccount === creator) {
        setOptimisticallyClaimed(false);
      }
    }
  }, [isAcceptingClaimConfirmed, isCompletingConfirmed, queryClient, id, currentAccount, creator]);

  const renderActionButton = () => {
    // Case 1: Bounty is Open
    if (status === 'Open') {
      // If the current user is the creator
      if (creator === currentAccount) {
        return (
          <button
            onClick={handleAcceptClaim}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
            disabled={isAcceptingClaim || isAcceptingClaimConfirming}
          >
            {isAcceptingClaim || isAcceptingClaimConfirming ? 'Accepting Claim...' : 'Accept Claim'}
          </button>
        );
      }
      // If the current user is a potential client (not creator, not admin)
      if (!isAdmin) {
        if (optimisticallyClaimed) {
          return (
            <button
              className="bg-orange-400 text-white font-bold py-2 px-4 rounded text-sm cursor-not-allowed"
              disabled
            >
              Claimed (Awaiting Acceptance)
            </button>
          );
        }
        return (
          <button
            onClick={handleClaimBounty}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm"
          >
            Claim Bounty
          </button>
        );
      }
      // Admin sees nothing here if bounty is Open
      return null;
    }

    // The 'Claimed' status (on-chain) has been removed.
    // Bounties go from 'Open' directly to 'Accepted' via the creator's acceptClaim transaction.
    // Optimistic 'Claimed (Awaiting Acceptance)' is handled within the 'Open' status block for the client.

    // Case 3: Bounty is Accepted
    if (status === 'Accepted') {
      // If the current user is the bounty acceptor (client who got accepted)
      const cachedBounty = queryClient.getQueryData<Bounty>(['BonusEscrow', deployedContractAddress.contractAddress, 'bounties', BigInt(id)]);
      if (currentAccount && cachedBounty && currentAccount === cachedBounty.acceptor) {
        return (
          <button
            onClick={handleCompleteBounty}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded text-sm"
            disabled={isCompleting || isCompletingConfirming}
          >
            {isCompleting || isCompletingConfirming ? 'Submitting...' : 'Submit Solution'}
          </button>
        );
      }
      // If the current user is the creator, or an admin, or not the acceptor, show no specific action button here
      // (unless we want a "View Submission" button for creator later)
      return null;
    }

    // Default: No button
    return null;
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-4">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-700 mb-4">{description}</p>
      <div className="flex justify-between items-center">
        <span className="text-lg font-bold text-indigo-600">{reward}</span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColorClass}`}>
          {/* Display optimistic status for client if applicable */}
          {(status === 'Open' && optimisticallyClaimed && currentAccount !== creator && !isAdmin) ? 'Claimed (Pending)' : status}
        </span>
      </div>
      <a href={`/bounty/${id}`} className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium">
        View Details
      </a>
      <div className="mt-4 flex space-x-2">
        {renderActionButton()}
      </div>
    </div>
  );
};

export default BountyCard;