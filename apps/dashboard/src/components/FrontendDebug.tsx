"use client";

import React, { useEffect, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { ethers } from 'ethers';
import BonusEscrowJson from '../../../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json';
import deployedContractAddress from '../contracts/deployed_contract_address.json';
import { safeStringify } from '../utils/bigint-serializer';

const BonusEscrowABI = BonusEscrowJson.abi;

export default function FrontendDebug() {
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const { address, isConnected, chain } = useAccount();

  const addLog = (message: string) => {
    setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const { data: fetchedBounties, isLoading: isBountiesLoading, error: bountiesError, refetch } = useReadContract({
    address: deployedContractAddress.contractAddress as `0x${string}`,
    abi: BonusEscrowABI,
    functionName: 'getAllBounties',
    query: {
      enabled: true,
    },
  });

  const { data: ownerAddress, error: ownerError } = useReadContract({
    address: deployedContractAddress.contractAddress as `0x${string}`,
    abi: BonusEscrowABI,
    functionName: 'owner',
  });

  useEffect(() => {
    addLog('=== FRONTEND DEBUG STARTED ===');
    addLog(`Wallet connected: ${isConnected}`);
    addLog(`Current address: ${address || 'None'}`);
    addLog(`Chain ID: ${chain?.id || 'Unknown'}`);
    addLog(`Contract address: ${deployedContractAddress.contractAddress}`);
  }, [isConnected, address, chain]);

  useEffect(() => {
    if (ownerAddress) {
      addLog(`Contract owner: ${ownerAddress}`);
      addLog(`Is admin: ${address && ownerAddress && address.toLowerCase() === (ownerAddress as string).toLowerCase()}`);
    }
    if (ownerError) {
      addLog(`Owner error: ${ownerError.message}`);
    }
  }, [ownerAddress, ownerError, address]);

  useEffect(() => {
    addLog(`Bounties loading: ${isBountiesLoading}`);
    if (bountiesError) {
      addLog(`Bounties error: ${bountiesError.message}`);
    }
    if (fetchedBounties) {
      addLog(`Raw bounties data received: ${safeStringify(fetchedBounties)}`);
      addLog(`Bounties count: ${Array.isArray(fetchedBounties) ? fetchedBounties.length : 'Not array'}`);
      
      if (Array.isArray(fetchedBounties) && fetchedBounties.length > 0) {
        addLog('=== BOUNTY PROCESSING ===');
        
        // Test filtering logic
        const filtered = fetchedBounties.filter(bounty => bounty && bounty.id !== undefined);
        addLog(`After filter (bounty && bounty.id !== undefined): ${filtered.length}`);
        
        // Test mapping logic
        try {
          const mapped = filtered.map((bounty: any, index: number) => {
            addLog(`Processing bounty ${index}: ${safeStringify(bounty)}`);
            
            const result = {
              id: bounty.id.toString(),
              creator: bounty.creator,
              title: bounty.title,
              description: bounty.description,
              githubUrl: bounty.githubUrl,
              reward: bounty.reward,
              status: Number(bounty.status),
              claimant: bounty.claimant,
              solutionGithubUrl: bounty.solutionGithubUrl || '',
            };
            
            addLog(`Mapped bounty ${index}: ${safeStringify(result)}`);
            return result;
          });
          
          addLog(`Total mapped bounties: ${mapped.length}`);
          
          // Test admin filtering
          if (address) {
            const adminBounties = mapped.filter(bounty => bounty.creator.toLowerCase() === address.toLowerCase());
            addLog(`Admin bounties (creator === current address): ${adminBounties.length}`);
            adminBounties.forEach((bounty, i) => {
              addLog(`Admin bounty ${i}: ${bounty.title} (ID: ${bounty.id})`);
            });
          }
          
        } catch (error: any) {
          addLog(`Mapping error: ${error.message}`);
        }
      }
    }
  }, [fetchedBounties, isBountiesLoading, bountiesError, address]);

  const clearLog = () => setDebugLog([]);

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-red-800">🐛 Frontend Debug Log</h3>
        <div className="space-x-2">
          <button 
            onClick={() => refetch()} 
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
          >
            Refetch
          </button>
          <button 
            onClick={clearLog} 
            className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="bg-white p-3 rounded border max-h-96 overflow-y-auto">
        <pre className="text-xs whitespace-pre-wrap">
          {debugLog.join('\n')}
        </pre>
      </div>
    </div>
  );
}