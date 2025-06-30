"use client";

import React, { useState } from 'react';
import { ConnectWallet } from "@/components/ConnectWallet";
import AdminDashboard from './admin/dashboard/page';
import ClientDashboard from '@/components/ClientDashboard';
import { useIsAdmin } from '@/hooks/useIsAdmin';

export default function Home() {
  const [isAdminView, setIsAdminView] = useState(false);
  const { isAdmin, isAdminLoading } = useIsAdmin();

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
      </header>
      {isAdminView && isAdmin ? <AdminDashboard /> : <ClientDashboard isAdminView={false} />}
    </div>
  );
}
