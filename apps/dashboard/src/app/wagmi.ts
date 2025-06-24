import { http, createConfig } from 'wagmi';
import { hardhat } from 'wagmi/chains';
import { injected, metaMask } from 'wagmi/connectors';

export const config = createConfig({
  chains: [hardhat],
  connectors: [
    injected(),
    metaMask(),
  ],
  transports: {
    [hardhat.id]: http(),
  },
});