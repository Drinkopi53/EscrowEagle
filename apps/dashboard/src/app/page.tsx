"use client";

import { ConnectWallet } from "@/components/ConnectWallet";
import { TransactionTable } from "@/components/TransactionTable";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      <header className="w-full max-w-4xl flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Trust-Chain Bonus Dashboard
        </h1>
        <ConnectWallet />
      </header>

      <main className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Recent Transactions
        </h2>
        <TransactionTable />
      </main>
    </div>
  );
}
