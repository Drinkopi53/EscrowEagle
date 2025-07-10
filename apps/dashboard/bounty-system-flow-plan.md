# Bounty System Flow Plan

This document outlines the detailed system flow for the bounty platform, incorporating Metamask login, admin and client dashboards, bounty creation, claiming, GitHub integration for task completion, and automated payment via a mock oracle.

## System Flow Diagram

```mermaid
graph TD
    A[User (Admin/Client) Connects Metamask] --> B{Is User Admin?};
    B -- Yes --> C[Admin Dashboard];
    B -- No --> D[Client Dashboard];

    C --> E[Admin Creates Bounty];
    E --> F[Bounty Data Stored on Smart Contract (BonusEscrow.sol)];
    F --> G[Bounty Displayed on Client Dashboard];

    G --> H[Client Claims Bounty];
    H --> I[Client's Wallet Linked to Bounty on Smart Contract];
    I --> J[Client Works on GitHub Task];
    J --> K[Client Submits PR Link to Dashboard];

    K --> L[Admin Reviews PR Externally on GitHub];
    L --> M[Admin Approves Bounty (Simulated via dummy-events.json)];
    M --> N[Mock Oracle (Python) Reads dummy-events.json];
    N --> O[Oracle Calls approveWinner() on BonusEscrow.sol];
    O --> P[BonusEscrow.sol Transfers ETH to Client];
    P --> Q[Bounty Status Updates on Dashboards];

    C --> R[Admin Views Bounty Status & Payments];
    D --> S[Client Views Claimed Bounties & Payments];
```

## Detailed Plan Steps:

1.  **Metamask Integration & Role Management:**
    *   **Goal:** Ensure seamless Metamask connection and differentiate between Admin and Client roles.
    *   **Action:**
        *   Leverage existing `EscrowEagle/apps/dashboard/src/app/wagmi.ts` and `EscrowEagle/apps/dashboard/src/components/ConnectWallet.tsx` for wallet connection.
        *   Review `EscrowEagle/apps/dashboard/src/hooks/useIsAdmin.tsx` to understand how admin status is determined. For this simulation, a simple check against a predefined admin wallet address (e.g., the deployer of the `BonusEscrow` contract) will be used.

2.  **Admin Dashboard: Bounty Creation:**
    *   **Goal:** Enable admins to create new bounties with specified details.
    *   **Action:**
        *   Modify `EscrowEagle/apps/dashboard/src/app/admin/dashboard/page.tsx` to include a form for "Create New Bounty".
        *   The form will collect: `Title`, `Description`, `GitHub Repository Link`, and `Reward Amount (in ETH)`.
        *   Implement a function (likely in `EscrowEagle/apps/dashboard/src/hooks/useAdminActions.tsx` or a new hook) to interact with the `BonusEscrow.sol` contract. This function will call a `createBounty` method on the contract, passing the collected bounty details.
        *   Ensure the admin's connected Metamask account is used to sign the transaction and fund the bounty (transferring the reward amount to the escrow contract).

3.  **Client Dashboard: Bounty Display & Claiming:**
    *   **Goal:** Allow clients to view available bounties and claim them.
    *   **Action:**
        *   Enhance `EscrowEagle/apps/dashboard/src/components/ClientDashboard.tsx` and potentially `EscrowEagle/apps/dashboard/src/app/page.tsx` to fetch and display a list of active bounties from the `BonusEscrow.sol` contract.
        *   Update `EscrowEagle/apps/dashboard/src/components/BountyCard.tsx` to display the `Title`, `Description`, `Reward`, `GitHub Repository Link`, and current `Status` of each bounty.
        *   Add a "Claim Bounty" button to each `BountyCard`.
        *   Implement a function (likely in `EscrowEagle/apps/dashboard/src/hooks/useClaimBounty.tsx`) that, when the button is clicked, calls a `claimBounty` method on the `BonusEscrow.sol` contract, associating the client's wallet address with the bounty.

4.  **Client Work & PR Submission:**
    *   **Goal:** Facilitate the client's work on GitHub and submission of their completed work.
    *   **Action:**
        *   The client performs the task on GitHub and creates a Pull Request (PR).
        *   Add a mechanism on the client dashboard (e.g., on the detailed bounty page `EscrowEagle/apps/dashboard/src/app/bounty/[id]/page.tsx`) for the client to submit their GitHub PR link after claiming a bounty. This submission will update the bounty's state on the smart contract (e.g., `submitPRLink` function).

5.  **Admin Approval & Oracle Integration (Simulated):**
    *   **Goal:** Enable admin to approve completed bounties, triggering payment via the oracle.
    *   **Action:**
        *   Admin manually reviews the submitted PR on GitHub.
        *   To simulate approval, the admin will need to manually edit `EscrowEagle/apps/dashboard/public/dummy-events.json` to add a `PR_MERGED` event for the specific bounty, including the `winnerWallet` (client's address) and `prLink`.
        *   The `EscrowEagle/python_workspace/src/main.py` (mock oracle) will be responsible for reading `dummy-events.json`. This script will need to be run periodically (manually or via a scheduled task) to detect new `PR_MERGED` events.
        *   Upon detecting a `PR_MERGED` event, the oracle script will call the `approveWinner` function on the `BonusEscrow.sol` contract, passing the `bountyId` and `winnerWallet`.

6.  **Smart Contract Payment & Dashboard Updates:**
    *   **Goal:** Automate payment to the client and update bounty status.
    *   **Action:**
        *   The `BonusEscrow.sol` contract's `approveWinner` function will:
            *   Verify the caller (oracle/admin).
            *   Transfer the escrowed ETH to the `winnerWallet` (client).
            *   Update the bounty's internal status to "Completed" or "Paid".
        *   The frontend (both admin and client dashboards) will need to continuously monitor the `BonusEscrow.sol` contract for state changes (e.g., using Wagmi hooks for contract events or polling) to automatically update the bounty status displayed on the dashboards.