"use client";

import React from 'react';

export default function SetupInstructions() {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-bold text-yellow-800 mb-4">⚠️ Setup Required</h3>
      <div className="text-yellow-700 space-y-3">
        <p><strong>Untuk melihat bounties, pastikan MetaMask sudah dikonfigurasi dengan benar:</strong></p>
        
        <div className="bg-white p-4 rounded border">
          <h4 className="font-semibold mb-2">1. Tambahkan Network Hardhat Local:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Network Name:</strong> Hardhat Local</li>
            <li><strong>RPC URL:</strong> http://localhost:8545</li>
            <li><strong>Chain ID:</strong> 31337</li>
            <li><strong>Currency Symbol:</strong> ETH</li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded border">
          <h4 className="font-semibold mb-2">2. Import Account Development:</h4>
          <p className="text-sm mb-2">Private Key (untuk testing):</p>
          <code className="bg-gray-100 p-2 rounded text-xs block break-all">
            0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
          </code>
          <p className="text-xs mt-1 text-gray-600">
            Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
          </p>
        </div>

        <div className="bg-white p-4 rounded border">
          <h4 className="font-semibold mb-2">3. Pastikan:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>MetaMask terhubung ke network "Hardhat Local"</li>
            <li>Menggunakan account dengan address yang benar</li>
            <li>Hardhat node berjalan di terminal</li>
          </ul>
        </div>
      </div>
    </div>
  );
}