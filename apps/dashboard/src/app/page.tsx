"use client";

import React, { useState } from 'react';
import { ConnectWallet } from "@/components/ConnectWallet";
import AdminDashboard from './admin/dashboard/page';
import ClientDashboard from '@/components/ClientDashboard';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useAccount } from 'wagmi';

export default function Home() {
  const [isAdminView, setIsAdminView] = useState(false);
  const { isAdmin, isAdminLoading } = useIsAdmin();
  const { address, isConnected, chain } = useAccount();
  
  const isCorrectNetwork = chain?.id === 31337;
  const isCorrectAccount = address?.toLowerCase() === '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8 bg-cozy-main">
      <header className="w-full max-w-4xl flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-cozy-main">
          Trust-Chain Bonus Dashboard
        </h1>
        <div className="flex items-center space-x-4">
          {isAdmin && (
            <button
              onClick={() => setIsAdminView(!isAdminView)}
              className="btn-cozy btn-cozy-primary"
            >
              Switch to {isAdminView ? 'Client' : 'Admin'} View
            </button>
          )}
          <ConnectWallet /> {/* Assuming ConnectWallet will inherit or have its own cozy styling applied if necessary */}
        </div>
      </header>
      {isAdminView && isAdmin ? <AdminDashboard /> : <ClientDashboard isAdminView={isAdminView} />}
    </div>
  );
}
