"use client";

import dynamic from 'next/dynamic';
import React from 'react';

const WagmiClientProvider = dynamic(
  () => import('./WagmiClientProvider').then((mod) => mod.WagmiClientProvider),
  { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiClientProvider>
      {children}
    </WagmiClientProvider>
  );
}