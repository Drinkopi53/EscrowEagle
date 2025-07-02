"use client";

import React, { useEffect, useState } from 'react'; // Tambahkan useState
import { useContractRead, useAccount, useBalance, useDisconnect } from 'wagmi';
// import { useQueryClient } from '@tanstack/react-query'; // Removed as it's not used
import { abi as BonusEscrowABI } from '../../../../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json';
import deployedContractAddress from '../../../../../python_workspace/deployed_contract_address.json';
import BountyCard from '../../components/BountyCard';
import { formatEther } from 'viem';
import { ConnectWallet } from '../../components/ConnectWallet';
import { TransactionTable } from '../../components/TransactionTable';
import { useIsAdmin } from '../../hooks/useIsAdmin'; // Import useIsAdmin hook

interface Bounty {
  id: bigint;
  creator: `0x${string}`;
  title: string;
  description: string;
  reward: bigint;
  status: number;
  acceptor: `0x${string}`; // Added acceptor field
}

const statusMap: { [key: number]: string } = {
  0: 'Open',
  1: 'Accepted',
  2: 'Completed',
  3: 'Paid',
};

const CLIENT_ACCOUNT = '0xF556CC52Ffa3a5747466a8A53ccE836DFc567e0a' as `0x${string}`; // Account 2 (Client)

const BountiesPage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const { isAdmin } = useIsAdmin(); // Use the useIsAdmin hook
  const [showTransactions, setShowTransactions] = useState(false); // State baru

  // const queryClient = useQueryClient(); // Removed as it's not used

  const { data: bounties, isLoading, isError, error } = useContractRead({
    address: deployedContractAddress.contractAddress as `0x${string}`,
    abi: BonusEscrowABI,
    functionName: 'getAllBounties',
  });

  useEffect(() => {
    if (isConnected && address !== CLIENT_ACCOUNT) {
      disconnect();
      alert('This page requires the Client account. Please connect Account 2 (0xF556CC52Ffa3a5747466a8A53ccE836DFc567e0a).');
    }
  }, [address, isConnected, disconnect]);

  if (!isConnected || address !== CLIENT_ACCOUNT) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-3xl font-bold mb-6">Client Dashboard Access</h1>
        <p className="text-lg mb-4">
          Please connect with Account 2 (Client) to view and interact with bounties.
        </p>
        <ConnectWallet />
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading bounties...</div>;
  }

  if (isError) {
    return <div className="text-center py-8 text-red-500">Error loading bounties: {error?.message}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Available Bounties</h1>
        <div className="text-right">
          <ConnectWallet />
          {balance && (
            <p className="text-sm text-gray-600 mt-2">
              Balance: {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {bounties && Array.isArray(bounties) && bounties.length > 0 ? (
          (bounties as Bounty[]).map((bounty) => (
            <BountyCard
              key={bounty.id.toString()}
              id={bounty.id.toString()}
              title={bounty.title}
              description={bounty.description}
              reward={`${formatEther(bounty.reward)} ETH`}
              status={statusMap[bounty.status]}
              creator={bounty.creator} // Pass creator to BountyCard
              currentAccount={address} // Pass current account to BountyCard
              isAdmin={isAdmin} // Pass isAdmin prop
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">No bounties available yet.</p>
        )}
      </div>

      <div className="mt-8"> {/* Wrapper untuk bagian riwayat transaksi */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Your Transaction History</h2>
          {!showTransactions && (
            <button
              onClick={() => setShowTransactions(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
            >
              Load Transactions
            </button>
          )}
        </div>
        {showTransactions && <TransactionTable account={address} />}
      </div>
    </div>
  );
};

export default BountiesPage;