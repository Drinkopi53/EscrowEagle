"use client";

import React from 'react';
import { useAccount, useReadContract } from 'wagmi';
import BonusEscrowJson from '../../../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json';
import deployedContractAddress from '../contracts/deployed_contract_address.json';
import { safeStringify } from '../utils/bigint-serializer';

const BonusEscrowABI = BonusEscrowJson.abi;

export default function DebugInfo() {
  const { address, isConnected, chain } = useAccount();

  const { data: ownerAddress, error: ownerError } = useReadContract({
    address: deployedContractAddress.contractAddress as `0x${string}`,
    abi: BonusEscrowABI,
    functionName: 'owner',
  });

  const { data: nextBountyId, error: bountyIdError } = useReadContract({
    address: deployedContractAddress.contractAddress as `0x${string}`,
    abi: BonusEscrowABI,
    functionName: 'nextBountyId',
  });

  const { data: allBounties, error: bountiesError } = useReadContract({
    address: deployedContractAddress.contractAddress as `0x${string}`,
    abi: BonusEscrowABI,
    functionName: 'getAllBounties',
  });

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-bold mb-2">Debug Information</h3>
      <div className="space-y-2 text-sm">
        <div><strong>Wallet Connected:</strong> {isConnected ? 'Yes' : 'No'}</div>
        <div><strong>Current Address:</strong> {address || 'Not connected'}</div>
        <div><strong>Chain ID:</strong> {chain?.id || 'Unknown'}</div>
        <div><strong>Chain Name:</strong> {chain?.name || 'Unknown'}</div>
        <div><strong>Contract Address:</strong> {deployedContractAddress.contractAddress}</div>
        <div><strong>Contract Owner:</strong> {ownerAddress as string || 'Loading...'}</div>
        <div><strong>Is Admin:</strong> {address && ownerAddress && address.toLowerCase() === (ownerAddress as string).toLowerCase() ? 'Yes' : 'No'}</div>
        <div><strong>Next Bounty ID:</strong> {nextBountyId?.toString() || 'Loading...'}</div>
        <div><strong>Total Bounties:</strong> {allBounties ? (allBounties as any[]).length : 'Loading...'}</div>
        {allBounties && (
          <div>
            <strong>Bounties Data:</strong>
            <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-40">
              {safeStringify(allBounties, 2)}
            </pre>
          </div>
        )}
        {(ownerError || bountyIdError || bountiesError) && (
          <div className="text-red-600">
            <strong>Errors:</strong>
            {ownerError && <div>Owner Error: {ownerError.message}</div>}
            {bountyIdError && <div>Bounty ID Error: {bountyIdError.message}</div>}
            {bountiesError && <div>Bounties Error: {bountiesError.message}</div>}
          </div>
        )}
      </div>
    </div>
  );
}