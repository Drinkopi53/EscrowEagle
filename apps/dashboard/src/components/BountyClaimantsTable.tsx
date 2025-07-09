// apps/dashboard/src/components/BountyClaimantsTable.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'; // Using Heroicons for sort indicators

export interface Claimant {
  id: string;
  name: string;
  status: string; // Example: 'Claimed', 'Pending', 'Cancelled'
  claimedAt: string; // ISO date string for sorting
  // Add other relevant fields for claimants
}

interface BountyClaimantsTableProps {
  claimants: Claimant[];
  onCancelClaim: (claimantId: string) => void;
  isLoading?: boolean;
}

type SortKey = keyof Claimant | null;
type SortOrder = 'asc' | 'desc';

const BountyClaimantsTable: React.FC<BountyClaimantsTableProps> = ({
  claimants,
  onCancelClaim,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedClaimantId, setSelectedClaimantId] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedAndFilteredClaimants = useMemo(() => {
    let filtered = claimants.filter(claimant =>
      claimant.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortKey) {
      filtered.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }
        // For dates (assuming ISO strings)
        if (sortKey === 'claimedAt') {
            return sortOrder === 'asc' ? new Date(valA).getTime() - new Date(valB).getTime() : new Date(valB).getTime() - new Date(valA).getTime();
        }
        return 0;
      });
    }
    return filtered;
  }, [claimants, searchTerm, sortKey, sortOrder]);

  const openConfirmModal = (claimantId: string) => {
    setSelectedClaimantId(claimantId);
    setShowConfirmModal(true);
  };

  const confirmCancelClaim = () => {
    if (selectedClaimantId) {
      onCancelClaim(selectedClaimantId);
    }
    setShowConfirmModal(false);
    setSelectedClaimantId(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-gray-600">Loading claimants...</p>
      </div>
    );
  }

  if (!claimants.length && !isLoading) {
    return <p className="text-center text-gray-500 py-10">No claimants for this bounty yet.</p>;
  }

  const SortIndicator: React.FC<{ columnKey: SortKey }> = ({ columnKey }) => {
    if (sortKey !== columnKey) return null;
    return sortOrder === 'asc' ? <ChevronUpIcon className="w-4 h-4 inline ml-1" /> : <ChevronDownIcon className="w-4 h-4 inline ml-1" />;
  };

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden">
      <div className="p-4 sm:p-6">
        <input
          type="text"
          placeholder="Search by client name..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleSort('name')}
              >
                Client Name <SortIndicator columnKey="name" />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleSort('status')}
              >
                Status <SortIndicator columnKey="status" />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleSort('claimedAt')}
              >
                Claimed Date <SortIndicator columnKey="claimedAt" />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedAndFilteredClaimants.map((claimant) => (
              <tr key={claimant.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{claimant.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    claimant.status === 'Claimed' ? 'bg-green-100 text-green-800' :
                    claimant.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    claimant.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {claimant.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {new Date(claimant.claimedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <button
                    onClick={() => openConfirmModal(claimant.id)}
                    className="text-red-600 hover:text-red-800 transition-colors font-semibold py-1 px-3 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    aria-label={`Cancel claim for ${claimant.name}`}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Cancellation</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to cancel this claim? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
              >
                No, keep it
              </button>
              <button
                onClick={confirmCancelClaim}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              >
                Yes, cancel claim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BountyClaimantsTable;

// Notes on improvements:
// 1. Styling: Uses Tailwind CSS for a modern look. Shadow, rounded corners, and distinct header.
//    - Status is visually distinct with colored badges.
//    - Table rows have hover effect.
// 2. Interactive Search: Added a search bar to filter claimants by name.
// 3. Sorting: Implemented sorting for Name, Status, and Claimed Date.
//    - Clicking on a column header sorts by that column. Clicking again toggles order.
//    - Sort indicators (arrows) are shown next to the active sort column header. (Using Heroicons for icons)
// 4. Confirmation Modal for Cancel:
//    - Clicking "Cancel" now opens a modal to confirm the action.
//    - This prevents accidental cancellations.
// 5. Responsiveness: `overflow-x-auto` allows the table to scroll horizontally on small screens.
//    - The modal is centered and responsive.
// 6. Loading and Empty States: Clearer loading indicator and message for when no claimants are present.
// 7. Accessibility: Added `scope="col"` to table headers and `aria-label` to the cancel button.
// 8. Code Structure:
//    - Component is self-contained and reusable.
//    - Uses React hooks for state management (searchTerm, sortKey, sortOrder, modal visibility).
//    - `useMemo` is used for optimizing the sorting and filtering of claimants.
// 9. Icons: Added Heroicons for sort indicators. Ensure `@heroicons/react` is installed (`npm install @heroicons/react` or `yarn add @heroicons/react`).
//    If you prefer not to add a new dependency, these can be replaced with SVG strings or other icon solutions.
//
// To use this component:
// - Import it into your bounty details page.
// - Pass the `claimants` array and `onCancelClaim` handler function as props.
// - Ensure Tailwind CSS is set up in your project.
// - Install Heroicons if you want to use the sort indicator icons as implemented.
//
// Example usage in a page component:
//
// import BountyClaimantsTable, { Claimant } from '@/components/BountyClaimantsTable';
//
// const MyBountyPage = () => {
//   const [claimants, setClaimants] = useState<Claimant[]>([]); // Fetch or manage this state
//   const handleCancel = (claimantId: string) => {
//     console.log("Cancel claim:", claimantId);
//     // Add backend call and update state logic here
//     setClaimants(prev => prev.filter(c => c.id !== claimantId));
//   };
//
//   // Fetch claimants logic here...
//
//   return (
//     <div>
//       <h1>Bounty Claimants</h1>
//       <BountyClaimantsTable claimants={claimants} onCancelClaim={handleCancel} isLoading={/* your loading state */} />
//     </div>
//   );
// };
//
// This component provides a significantly more interactive and modern table experience.
// Further enhancements could include pagination for very large datasets.
// The `claimedAt` field was added to the Claimant interface for sortable dates. Adjust types as needed.
// The date formatting `toLocaleDateString()` is basic; consider a library like `date-fns` or `moment` for more complex needs.
// The styling of status badges can be further customized.
// The modal is a common pattern for confirmation dialogues.
// Error handling for the `onCancelClaim` operation should be managed within the parent component or the handler itself.
// The table is designed to be flexible and can be adapted to more specific requirements.
// Remember to replace the dummy `claimedAt` values in your actual data with valid ISO date strings.
// Example: `claimedAt: new Date().toISOString()`
// The sort function handles strings, numbers, and specifically dates for 'claimedAt'.
// If other data types need sorting, the sort logic in `useMemo` can be extended.
// The table is now more user-friendly with search, sort, and confirmation for destructive actions.
// This addresses the core requirements of an "interactive and modern" table.
