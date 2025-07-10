"use client";

import React, { useState } from 'react';
import { ConnectWallet } from "@/components/ConnectWallet";
<<<<<<< HEAD
import BountyCard from "@/components/BountyCard";
import { useContractRead, useAccount, useDisconnect } from 'wagmi';
import BonusEscrowJson from '../../../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json';
const BonusEscrowABI = BonusEscrowJson.abi;
import deployedContractAddress from '../../../../python_workspace/deployed_contract_address.json';
import Link from 'next/link';

interface Bounty {
  id: string;
  title: string;
  description: string;
  reward: bigint;
  status: number; // Assuming status is an enum or integer
  creator: `0x${string}`; // Add creator property
}

const statusMap: { [key: number]: string } = {
  0: 'Open',
  1: 'Accepted',
  2: 'Completed',
  3: 'Paid',
};
=======
import AdminDashboard from './admin/dashboard/page';
import ClientDashboard from '@/components/ClientDashboard';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import DebugInfo from '@/components/DebugInfo';
import FrontendDebug from '@/components/FrontendDebug';
import { useAccount } from 'wagmi';
>>>>>>> 4ac9eb62872321850b038e6afa5d69b20f2971b1

const ADMIN_ACCOUNT = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as `0x${string}`; // Account 3 (Admin)

export default function Home() {
<<<<<<< HEAD
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const { data: fetchedBounties, isLoading: isBountiesLoading, isError: isBountiesError, error: bountiesError, refetch } = useContractRead({
    address: deployedContractAddress.contractAddress as `0x${string}`,
    abi: BonusEscrowABI,
    functionName: 'getAllBounties', // Assuming a function to get all bounties
  });

  useEffect(() => {
    if (isConnected && address !== ADMIN_ACCOUNT) {
      disconnect();
      alert('This page requires the Admin account. Please connect Account 3 (0x70997970C51812dc3A010C7d01b50e0d17dc79C8).');
    }
    if (fetchedBounties) {
      // @ts-ignore
      const formattedBounties: Bounty[] = fetchedBounties.map((bounty: any) => ({
        id: bounty.id.toString(), // Use the actual bounty ID from the contract
        title: bounty.title,
        description: bounty.description,
        reward: bounty.reward,
        status: bounty.status,
      }));
      setBounties(formattedBounties);
    }
  }, [fetchedBounties, address, isConnected, disconnect]);

  if (!isConnected || address !== ADMIN_ACCOUNT) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-10 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard Access</h1>
        <p className="text-lg text-gray-700 mb-6">
          Please connect with Account 3 (Admin) to access this dashboard.
        </p>
        <ConnectWallet />
      </div>
    );
  }
=======
  const [isAdminView, setIsAdminView] = useState(false);
  const { isAdmin, isAdminLoading } = useIsAdmin();
  const { address, isConnected, chain } = useAccount();
  
  const isCorrectNetwork = chain?.id === 31337;
  const isCorrectAccount = address?.toLowerCase() === '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
>>>>>>> 4ac9eb62872321850b038e6afa5d69b20f2971b1

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      <header className="w-full max-w-4xl flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Trust-Chain Bonus Dashboard
        </h1>
        <div className="flex items-center space-x-4">
          {isAdmin && (
            <button
              onClick={() => setIsAdminView(!isAdminView)}
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            >
              Switch to {isAdminView ? 'Client' : 'Admin'} View
            </button>
          )}
          <ConnectWallet />
        </div>
<<<<<<< HEAD

        {isBountiesLoading ? (
          <div className="text-center py-8">Loading bounties...</div>
        ) : bounties.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No bounties available. Create a new one!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bounties.map((bounty) => (
              <BountyCard
                key={bounty.id}
                id={bounty.id}
                title={bounty.title}
                description={bounty.description}
                reward={`${Number(bounty.reward) / 1e18} Etherium`}
                status={statusMap[bounty.status]}
                creator={bounty.creator} // Pass creator to BountyCard
                currentAccount={address} // Pass current account to BountyCard
                isAdmin={address === ADMIN_ACCOUNT} // Pass isAdmin prop
              />
            ))}
          </div>
        )}
      </main>
=======
      </header>
      <DebugInfo />
      <FrontendDebug />
      {isAdminView && isAdmin ? <AdminDashboard /> : <ClientDashboard isAdminView={isAdminView} />}
>>>>>>> 4ac9eb62872321850b038e6afa5d69b20f2971b1
    </div>
  );
}
