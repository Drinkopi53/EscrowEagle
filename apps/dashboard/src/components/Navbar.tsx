import Link from 'next/link';
import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-2xl font-bold">
          Trust-Chain Bonus
        </Link>
        <div className="space-x-4">
          <Link href="/bounties" className="text-gray-300 hover:text-white">
            Bounties
          </Link>
          <Link href="/create-bounty" className="text-gray-300 hover:text-white">
            Create Bounty
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;