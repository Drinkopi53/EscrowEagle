# Bounty Lifecycle Plan

This document outlines the detailed plan for the bounty lifecycle within the EscrowEagle application, aligning the frontend status representation with the `BonusEscrow.sol` smart contract's `Status` enum.

## Phase 1: Frontend `statusMap` Alignment

The initial step involves synchronizing the `statusMap` in the frontend components with the `Status` enum defined in the `BonusEscrow.sol` contract. This will remove the `PendingReview` and `Cancelled` states from the frontend to simplify the workflow and ensure consistency with the on-chain logic.

### Changes Required:

1.  **Update `EscrowEagle/apps/dashboard/src/app/admin/dashboard/page.tsx`**:
    Modify the `statusMap` to only include `Open`, `Accepted`, `Completed`, and `Paid`.

    ```typescript
    const statusMap: { [key: number]: string } = {
      0: 'Open',
      1: 'Accepted',
      2: 'Completed',
      3: 'Paid',
    };
    ```

2.  **Update `EscrowEagle/apps/dashboard/src/components/ClientDashboard.tsx`**:
    Modify the `statusMap` to only include `Open`, `Accepted`, `Completed`, and `Paid`.

    ```typescript
    const statusMap: { [key: number]: string } = {
      0: 'Open',
      1: 'Accepted',
      2: 'Completed',
      3: 'Paid',
    };
    ```

## Phase 2: Detailed Bounty Lifecycle Workflow

This phase describes the complete bounty lifecycle, from creation by an administrator to the final reward transfer to a client, based on the aligned contract and frontend states.

### Workflow Steps:

*   **Bounty Creation**: An administrator initiates the creation of a new bounty through the admin management interface. This involves providing a title, a GitHub URL (for work submission/tracking), and the ETH reward amount. The `createBounty` function in `BonusEscrow.sol` is called, and the bounty's status is set to `Open`.
*   **Visibility**: Once created, the bounty becomes immediately visible on both the administrator's dashboard and the client-facing platform. Clients can browse available bounties.
*   **Claiming/Acceptance**: A client can claim an `Open` bounty. This action calls the `acceptBounty` function in `BonusEscrow.sol`, changing the bounty's status to `Accepted`.
*   **Completion**: After a client has completed the work associated with an `Accepted` bounty, they will submit their work (e.g., by marking it as complete in the UI, which triggers the `completeBounty` function). The bounty's status transitions to `Completed`.
*   **Review and Approval**: The administrator reviews the submitted work for `Completed` bounties. If the work is satisfactory, the administrator approves it.
*   **Reward Transfer**: Upon successful verification and approval by the administrator, the `payBounty` function in `BonusEscrow.sol` is called. The designated ETH reward is automatically transferred from the contract's balance to the client's wallet. The bounty's status is then updated to `Paid`. If the work is rejected, the bounty status might revert to `Accepted` or a new mechanism for re-submission/cancellation would be needed (currently, the contract only supports `Completed` to `Paid`). For this plan, rejection will revert to the `Accepted` state, allowing the client to resubmit.

### Mermaid Diagram for Bounty Workflow:

```mermaid
graph TD
    A[Administrator Creates Bounty] --> B{Bounty Status: Open};
    B --> C[Bounty Visible to Clients];
    C --> D[Client Claims Bounty];
    D --> E{Bounty Status: Accepted};
    E --> F[Client Completes Work];
    F --> G{Bounty Status: Completed};
    G --> H[Administrator Reviews Work];
    H -- Approve --> I[Administrator Pays Bounty];
    I --> J{Bounty Status: Paid};
    H -- Reject --> E;