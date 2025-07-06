"use client";

import React from 'react';

interface Transaction {
  id: string;
  description: string;
  recipient: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
}

const sampleTransactions: Transaction[] = [
  {
    id: 'tx_001',
    description: 'Bonus for Q1 performance',
    recipient: '0xAbC123DeF456...',
    amount: 1.5,
    status: 'Completed',
  },
  {
    id: 'tx_002',
    description: 'API completion bonus',
    recipient: '0xGhI789JkL012...',
    amount: 0.75,
    status: 'Pending',
  },
  {
    id: 'tx_003',
    description: 'Project milestone bonus',
    recipient: '0xMnO345PqR678...',
    amount: 2.0,
    status: 'Completed',
  },
  {
    id: 'tx_004',
    description: 'Bug bounty reward',
    recipient: '0xStU901VwX234...',
    amount: 0.25,
    status: 'Failed',
  },
];

export function TransactionTable() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="py-3 px-4 text-left">ID</th>
            <th className="py-3 px-4 text-left">Description</th>
            <th className="py-3 px-4 text-left">Recipient</th>
            <th className="py-3 px-4 text-left">Amount</th>
            <th className="py-3 px-4 text-left">Status</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {sampleTransactions.map((tx) => (
            <tr key={tx.id} className="border-b border-gray-200 hover:bg-gray-100">
              <td className="py-3 px-4">{tx.id}</td>
              <td className="py-3 px-4">{tx.description}</td>
              <td className="py-3 px-4">{tx.recipient.slice(0, 6)}...{tx.recipient.slice(-4)}</td>
              <td className="py-3 px-4">{tx.amount} ETH</td>
              <td className="py-3 px-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    tx.status === 'Completed' ? 'bg-green-200 text-green-800' :
                    tx.status === 'Pending' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-red-200 text-red-800'
                  }`}
                >
                  {tx.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}