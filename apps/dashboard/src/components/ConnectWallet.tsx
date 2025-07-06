"use client";

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export function ConnectWallet() {
  const { address, isConnected, connector } = useAccount();
  const { connect } = useConnect();
  const { disconnect, isPending, isSuccess, isError, error } = useDisconnect();

  if (isConnected) {
    console.log('Current connected connector:', connector);
    return (
      <div className="flex items-center space-x-2">
        <p className="text-sm text-gray-600">Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
        <button
          onClick={() => {
            console.log('Disconnect button clicked');
            disconnect();
            console.log('Disconnect state after call:', { isPending, isSuccess, isError, error });
          }}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          Disconnect
        </button>
      </div>
    );
  }

  if (isPending) {
    return <p className="text-sm text-gray-600">Disconnecting...</p>;
  }

  if (isError) {
    return <p className="text-sm text-red-600">Error disconnecting: {error?.message}</p>;
  }

  return (
    <button
      onClick={() => {
        console.log('Connect Wallet button clicked');
        connect({ connector: injected() });
      }}
      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
    >
      Connect Wallet
    </button>
  );
}