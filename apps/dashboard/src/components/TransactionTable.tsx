"use client";

import React, { useState, useEffect } from 'react';
import { usePublicClient, useWatchContractEvent } from 'wagmi';
import { decodeEventLog, formatEther } from 'viem';
import { abi as BonusEscrowABI } from '../../../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json';
import deployedContractAddress from '../../../../python_workspace/deployed_contract_address.json';

interface Transaction {
  id: string;
  description: string;
  amount: string;
  status: string;
  type: string;
  address?: `0x${string}`;
}

interface TransactionTableProps {
  account: `0x${string}` | undefined;
}

export function TransactionTable({ account }: TransactionTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const publicClient = usePublicClient();

  const processDecodedLogs = (logs: readonly any[]): Transaction[] => {
    const newTransactions: Transaction[] = [];
    for (const log of logs) {
      if (!log) continue;
      const { eventName, args } = log;

      if (eventName === 'BountyCreated' && args.creator === account) {
        newTransactions.push({
          id: args.id.toString(),
          description: `Bounty Created: ${args.title}`,
          amount: `${formatEther(args.reward)} ETH`,
          status: 'Completed',
          type: 'Created',
          address: args.creator,
        });
      } else if (eventName === 'BountyClaimed' && args.claimant === account) {
        newTransactions.push({
          id: args.id.toString(),
          description: `You claimed bounty #${args.id.toString()}`,
          amount: 'N/A',
          status: 'Completed',
          type: 'Claimed',
          address: args.claimant,
        });
      } else if (eventName === 'BountyAccepted' && args.acceptor === account) {
        newTransactions.push({
          id: args.id.toString(),
          description: `Bounty Accepted by you`,
          amount: 'N/A',
          status: 'Completed',
          type: 'Accepted',
          address: args.acceptor,
        });
      } else if (eventName === 'BountyPaid' && args.winner === account) {
        newTransactions.push({
          id: args.id.toString(),
          description: `Bounty Paid to you`,
          amount: 'N/A',
          status: 'Completed',
          type: 'Paid',
          address: args.winner,
        });
      }
    }
    return newTransactions;
  };

  useEffect(() => {
    const fetchHistoricalLogs = async () => {
      if (!publicClient || !account) {
        setTransactions([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const logs = await publicClient.getLogs({
          address: deployedContractAddress.contractAddress as `0x${string}`,
          fromBlock: 'earliest',
          toBlock: 'latest',
        });

        const decodedLogs = logs.map(log => {
          try {
            return decodeEventLog({ abi: BonusEscrowABI, data: log.data, topics: log.topics });
          } catch {
            return null;
          }
        });

        const processedTxs = processDecodedLogs(decodedLogs);
        setTransactions(processedTxs.reverse());
      } catch (error) {
        console.error("Failed to fetch historical logs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoricalLogs();
  }, [publicClient, account]);

  useWatchContractEvent({
    address: deployedContractAddress.contractAddress as `0x${string}`,
    abi: BonusEscrowABI,
    onLogs: (logs) => {
      const newTransactions = processDecodedLogs(logs);
      if (newTransactions.length > 0) {
        setTransactions((prev) => [...newTransactions, ...prev]);
      }
    },
  });

  if (isLoading) {
    return <p className="text-center text-gray-500">Loading transaction history...</p>;
  }

  return (
    <div className="overflow-x-auto">
      {transactions.length === 0 ? (
        <p className="text-center text-gray-500">No relevant transactions found for your account.</p>
      ) : (
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">Type</th>
              <th className="py-3 px-4 text-left">Description</th>
              <th className="py-3 px-4 text-left">Amount</th>
              <th className="py-3 px-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {transactions.map((tx, index) => (
              <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-4">{tx.id}</td>
                <td className="py-3 px-4">{tx.type}</td>
                <td className="py-3 px-4">{tx.description}</td>
                <td className="py-3 px-4">{tx.amount}</td>
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
      )}
    </div>
  );
}