#EscrowFlow

## Daftar Isi
1. [Gambaran Umum Proyek](#gambaran-umum-proyek)
2. [Arsitektur Sistem](#arsitektur-sistem)
3. [Struktur Proyek](#struktur-proyek)
4. [Smart Contract](#smart-contract)
5. [Frontend Dashboard](#frontend-dashboard)
6. [Python Oracle](#python-oracle)
7. [Konfigurasi dan Setup](#konfigurasi-dan-setup)
8. [Workflow Penggunaan](#workflow-penggunaan)
9. [API dan Fungsi](#api-dan-fungsi)
10. [Troubleshooting](#troubleshooting)
11. [Pengembangan dan Testing](#pengembangan-dan-testing)

---

## Gambaran Umum Proyek

**EscrowFlow** adalah sistem bonus transparan dan otomatis yang memanfaatkan smart contract Ethereum untuk mengelola bounty/hadiah dalam lingkungan pengembangan lokal. Sistem ini dirancang untuk memvalidasi workflow end-to-end menggunakan data dummy tanpa memerlukan layanan eksternal atau interaksi blockchain publik.

### Fitur Utama
- **Smart Contract Escrow**: Mengelola penguncian dan pembayaran bonus secara otomatis
- **Dashboard Web**: Interface React/Next.js untuk monitoring dan interaksi
- **Python Oracle**: Script untuk simulasi trigger eksternal
- **Local Blockchain**: Menggunakan Hardhat Network untuk development
- **MetaMask Integration**: Koneksi wallet untuk interaksi user

### Teknologi yang Digunakan
- **Blockchain**: Solidity, Hardhat, Ethers.js
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend Oracle**: Python 3.9+, Web3.py
- **Wallet**: MetaMask integration dengan Wagmi
- **Development**: Node.js, npm/yarn

---

## Arsitektur Sistem

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Smart Contract │    │  Python Oracle  │
│   Dashboard     │◄──►│   BonusEscrow   │◄──►│   Mock Events   │
│   (Next.js)     │    │   (Solidity)    │    │   (Web3.py)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Hardhat Node   │
                    │  (Local Chain)  │
                    └─────────────────┘
```

### Komponen Utama

1. **Smart Contract Layer**
   - `BonusEscrow.sol`: Contract utama untuk mengelola bounty
   - Deployment scripts dan konfigurasi Hardhat

2. **Frontend Layer**
   - Admin Dashboard: Untuk membuat dan mengelola bounty
   - Client Dashboard: Untuk melihat dan mengklaim bounty
   - Wallet integration dengan MetaMask

3. **Oracle Layer**
   - Python script untuk simulasi event eksternal
   - Pembacaan dummy events dari JSON
   - Trigger otomatis untuk approval bounty

4. **Infrastructure Layer**
   - Hardhat local blockchain
   - Development tools dan utilities

---

## Struktur Proyek

```
EscrowEagle/
├── apps/
│   └── dashboard/                 # Frontend Next.js Application
│       ├── src/
│       │   ├── app/              # Next.js App Router
│       │   │   ├── admin/        # Admin dashboard pages
│       │   │   ├── api/          # API routes
│       │   │   ├── bounty/       # Bounty detail pages
│       │   │   ├── layout.tsx    # Root layout
│       │   │   ├── page.tsx      # Home page
│       │   │   └── wagmi.ts      # Wagmi configuration
│       │   ├── components/       # React components
│       │   │   ├── BountyCard.tsx
│       │   │   ├── ClientDashboard.tsx
│       │   │   ├── ConnectWallet.tsx
│       │   │   ├── DebugInfo.tsx
│       │   │   └── ...
│       │   ├── hooks/            # Custom React hooks
│       │   │   ├── useIsAdmin.tsx
│       │   │   ├── useAdminActions.tsx
│       │   │   └── useClaimBounty.tsx
│       │   ├── contracts/        # Contract artifacts
│       │   └── utils/            # Utility functions
│       ├── public/               # Static assets
│       ├── package.json
│       └── next.config.ts
├── src/                          # Smart Contract Development
│   ├── contracts/
│   │   └── BonusEscrow.sol      # Main smart contract
│   ├── deploy/
│   │   └── 01_deploy_escrow.js  # Deployment script
│   ├── artifacts/               # Compiled contracts
│   ├── deployments/             # Deployment records
│   ├── hardhat.config.js        # Hardhat configuration
│   └── helper-hardhat-config.js # Helper configurations
├── python_workspace/            # Python Oracle
│   ├── src/
│   │   └── main.py             # Main oracle script
│   ├── venv/                   # Python virtual environment
│   └── requirements.txt        # Python dependencies
├── package.json                # Root package configuration
├── README.md                   # Project documentation
├── SETUP_METAMASK.md          # MetaMask setup guide
├── TROUBLESHOOTING.md         # Troubleshooting guide
└── DOKUMENTASI_ESCROWFLOW.md  # This documentation
```

---

## Smart Contract

### BonusEscrow.sol

Smart contract utama yang mengelola sistem bounty dengan fitur-fitur berikut:

#### State Variables
```solidity
address public owner;                    // Contract owner
uint256 public nextBountyId;            // Counter untuk bounty ID
mapping(uint256 => Bounty) public bounties;  // Mapping bounty data
uint256[] bountyIds;                     // Array untuk tracking bounty IDs
```

#### Struct Bounty
```solidity
struct Bounty {
    uint256 id;                 // Unique bounty ID
    address creator;            // Address pembuat bounty
    string title;               // Judul bounty
    string description;         // Deskripsi bounty
    string githubUrl;           // URL GitHub repository
    uint256 reward;             // Jumlah reward dalam Wei
    Status status;              // Status bounty (Open/Claimed/Paid)
    address claimant;           // Address yang mengklaim bounty
    string solutionGithubUrl;   // URL solusi yang disubmit
}
```

#### Enum Status
```solidity
enum Status { 
    Open,     // Bounty tersedia untuk diklaim
    Claimed,  // Bounty sudah diklaim, menunggu approval
    Paid      // Bounty sudah dibayar
}
```

#### Events
```solidity
event BountyCreated(uint256 indexed id, address indexed creator, string title, string githubUrl, uint256 reward);
event BountyClaimed(uint256 indexed id, address indexed claimant);
event BountyApproved(uint256 indexed id, address indexed claimant, uint256 reward);
```

#### Fungsi Utama

##### 1. createBounty()
```solidity
function createBounty(
    string memory _title,
    string memory _description,
    string memory _githubUrl
) public payable onlyOwner
```
- **Akses**: Hanya owner
- **Fungsi**: Membuat bounty baru dengan reward ETH
- **Parameter**: title, description, githubUrl
- **Requirement**: msg.value > 0 (harus ada reward)

##### 2. claimBounty()
```solidity
function claimBounty(uint256 _bountyId) public
```
- **Akses**: Public
- **Fungsi**: Mengklaim bounty yang tersedia
- **Parameter**: bountyId
- **Requirement**: Status bounty harus Open

##### 3. submitSolution()
```solidity
function submitSolution(uint256 _bountyId, string memory _solutionGithubUrl) public
```
- **Akses**: Hanya claimant
- **Fungsi**: Submit URL solusi untuk bounty yang diklaim
- **Parameter**: bountyId, solutionGithubUrl
- **Requirement**: Hanya claimant yang bisa submit

##### 4. approveBounty()
```solidity
function approveBounty(uint256 _bountyId) public onlyOwner
```
- **Akses**: Hanya owner
- **Fungsi**: Approve dan bayar bounty ke claimant
- **Parameter**: bountyId
- **Requirement**: Status bounty harus Claimed

##### 5. getAllBounties()
```solidity
function getAllBounties() public view returns (Bounty[] memory)
```
- **Akses**: Public view
- **Fungsi**: Mengambil semua bounty yang ada
- **Return**: Array of Bounty struct

##### 6. getBountyStatus()
```solidity
function getBountyStatus(uint256 _bountyId) public view returns (Status)
```
- **Akses**: Public view
- **Fungsi**: Mengambil status bounty tertentu
- **Parameter**: bountyId
- **Return**: Status enum

#### Modifier
```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Only owner can call this function");
    _;
}
```

---

## Frontend Dashboard

### Teknologi Stack
- **Framework**: Next.js 15 dengan App Router
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Blockchain Integration**: Wagmi + Ethers.js
- **TypeScript**: Full type safety

### Struktur Komponen

#### 1. Layout dan Routing

##### app/layout.tsx
```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

##### app/page.tsx
Main page yang menampilkan:
- Header dengan tombol Connect Wallet
- Switch antara Admin dan Client view
- Debug information
- Setup instructions
- Dashboard sesuai role user

#### 2. Komponen Utama

##### ConnectWallet.tsx
```typescript
export function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  
  // Wallet connection logic
}
```
- Mengelola koneksi MetaMask
- Menampilkan status koneksi
- Handle connect/disconnect

##### AdminDashboard
```typescript
export default function AdminDashboard() {
  const [bounties, setBounties] = useState<Bounty[]>([])
  const { createBounty, approveBounty } = useAdminActions()
  
  // Admin functionality
}
```
- Form untuk membuat bounty baru
- List bounty yang dibuat admin
- Tombol approve untuk bounty yang diklaim

##### ClientDashboard.tsx
```typescript
export default function ClientDashboard({ isAdminView }: { isAdminView: boolean }) {
  const [availableBounties, setAvailableBounties] = useState<Bounty[]>([])
  const { claimBounty } = useClaimBounty()
  
  // Client functionality
}
```
- Menampilkan bounty yang tersedia
- Tombol claim bounty
- Form submit solusi

##### BountyCard.tsx
```typescript
interface BountyCardProps {
  bounty: Bounty
  onClaim?: (id: number) => void
  onApprove?: (id: number) => void
  showActions?: boolean
}

export default function BountyCard({ bounty, onClaim, onApprove, showActions }: BountyCardProps)
```
- Menampilkan detail bounty
- Action buttons sesuai context
- Status indicator

#### 3. Custom Hooks

##### useIsAdmin.tsx
```typescript
export const useIsAdmin = () => {
  const { address: userAddress } = useAccount()
  
  const { data: ownerAddress, isLoading: isAdminLoading } = useReadContract({
    address: deployedContractAddress.contractAddress as `0x${string}`,
    abi: BonusEscrowABI,
    functionName: 'owner',
  })
  
  const isAdmin = !!(userAddress && ownerAddress && 
    userAddress.toLowerCase() === (ownerAddress as string).toLowerCase())
  
  return { isAdmin, isAdminLoading }
}
```

##### useAdminActions.tsx
```typescript
export const useAdminActions = () => {
  const { writeContract } = useWriteContract()
  
  const createBounty = async (title: string, description: string, githubUrl: string, reward: string) => {
    return writeContract({
      address: deployedContractAddress.contractAddress as `0x${string}`,
      abi: BonusEscrowABI,
      functionName: 'createBounty',
      args: [title, description, githubUrl],
      value: parseEther(reward),
    })
  }
  
  const approveBounty = async (bountyId: number) => {
    return writeContract({
      address: deployedContractAddress.contractAddress as `0x${string}`,
      abi: BonusEscrowABI,
      functionName: 'approveBounty',
      args: [bountyId],
    })
  }
  
  return { createBounty, approveBounty }
}
```

##### useClaimBounty.tsx
```typescript
export const useClaimBounty = () => {
  const { writeContract } = useWriteContract()
  
  const claimBounty = async (bountyId: number) => {
    return writeContract({
      address: deployedContractAddress.contractAddress as `0x${string}`,
      abi: BonusEscrowABI,
      functionName: 'claimBounty',
      args: [bountyId],
    })
  }
  
  return { claimBounty }
}
```

#### 4. Konfigurasi Wagmi

##### app/wagmi.ts
```typescript
import { http, createConfig } from 'wagmi'
import { hardhat } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'

export const config = createConfig({
  chains: [hardhat],
  connectors: [metaMask()],
  transports: {
    [hardhat.id]: http('http://localhost:8545'),
  },
})
```

#### 5. Debug Components

##### DebugInfo.tsx
Menampilkan informasi debug untuk development:
- Status koneksi wallet
- Chain ID aktif
- Address yang terhubung
- Status admin
- Jumlah bounty di contract

##### SetupInstructions.tsx
Menampilkan instruksi setup jika:
- Wallet belum terhubung
- Network salah (bukan localhost:8545)
- Account bukan development account

---

## Python Oracle

### Fungsi Utama
Python Oracle berfungsi sebagai bridge antara event eksternal (simulasi) dengan smart contract untuk otomasi approval bounty.

### main.py Structure

#### 1. Koneksi ke Hardhat Node
```python
hardhat_node_url = "http://127.0.0.1:8545/"
w3 = Web3(Web3.HTTPProvider(hardhat_node_url))

if w3.is_connected():
    print("Successfully connected to Hardhat node.")
```

#### 2. Load Contract Configuration
```python
# Read contract address
with open("./deployed_contract_address.json", "r") as f:
    data = json.load(f)
    contract_address = data.get("contractAddress")

# Read ABI
with open("../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json", "r") as f:
    bonus_escrow_json = json.load(f)
    bonus_escrow_abi = bonus_escrow_json.get("abi")

# Create contract instance
contract = w3.eth.contract(address=contract_address, abi=bonus_escrow_abi)
```

#### 3. Oracle Logic
```python
# Read dummy events
with open(dummy_events_path, "r") as f:
    events = json.load(f)

for event in events:
    if event.get("eventType") == "PR_MERGED":
        bounty_id = event.get("bountyId")
        winner_wallet = event.get("winnerWallet")
        pr_link = event.get("prLink")
        
        # Call approveBounty function
        tx_hash = contract.functions.approveBounty(bounty_id).transact({
            'from': owner_address
        })
        
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        if receipt.status == 1:
            print(f"Bounty {bounty_id} approved and paid successfully!")
```

#### 4. Dummy Events Format
```json
[
  {
    "eventType": "PR_MERGED",
    "bountyId": 0,
    "winnerWallet": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "prLink": "https://github.com/example/repo/pull/123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
]
```

### Dependencies
```txt
web3
```

---

## Konfigurasi dan Setup

### 1. Prerequisites
- Node.js 18+ atau 20+
- Python 3.9+
- MetaMask browser extension
- Git

### 2. Installation Steps

#### A. Clone dan Setup Root
```bash
git clone <repository-url>
cd EscrowEagle
npm install
```

#### B. Setup Smart Contract Environment
```bash
cd src
npm install
```

#### C. Setup Frontend Dashboard
```bash
cd apps/dashboard
npm install
```

#### D. Setup Python Oracle
```bash
cd python_workspace
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Hardhat Configuration

#### hardhat.config.js
```javascript
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");

module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      // Hardhat Network settings
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0, // First account as deployer
    },
  },
};
```

#### helper-hardhat-config.js
```javascript
const developmentChains = ["hardhat", "localhost"];
const networkConfig = {
  31337: {
    name: "localhost",
  },
};

module.exports = {
  networkConfig,
  developmentChains,
};
```

### 4. MetaMask Setup

#### Network Configuration
- **Network Name**: Hardhat Local
- **RPC URL**: http://localhost:8545
- **Chain ID**: 31337
- **Currency Symbol**: ETH

#### Development Account Import
- **Private Key**: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- **Address**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- **Balance**: ~10000 ETH

---

## Workflow Penggunaan

### 1. Development Workflow

#### A. Start Local Blockchain
```bash
# Terminal 1 - Start Hardhat node
npm run start:hardhat
```

#### B. Deploy Smart Contract
```bash
# Terminal 2 - Deploy contract
npm run deploy:contract
```

#### C. Start Frontend Dashboard
```bash
# Terminal 3 - Start Next.js app
cd apps/dashboard
npm run dev
```

#### D. Run Python Oracle (Optional)
```bash
# Terminal 4 - Run oracle
cd python_workspace
source venv/bin/activate  # or .\venv\Scripts\activate on Windows
python src/main.py
```

### 2. User Workflow

#### A. Admin Workflow
1. **Connect Wallet**: Pastikan MetaMask terhubung dengan account owner
2. **Create Bounty**: 
   - Masukkan title, description, GitHub URL
   - Set reward amount dalam ETH
   - Submit transaction
3. **Monitor Bounties**: Lihat bounty yang dibuat di Admin Dashboard
4. **Approve Bounty**: 
   - Tunggu bounty diklaim oleh client
   - Review solusi yang disubmit
   - Approve untuk transfer reward

#### B. Client Workflow
1. **Connect Wallet**: Terhubung dengan account non-owner
2. **Browse Bounties**: Lihat available bounties di Client Dashboard
3. **Claim Bounty**: Klik "Claim" pada bounty yang diminati
4. **Submit Solution**: 
   - Kerjakan task sesuai requirement
   - Submit GitHub URL solusi
5. **Wait for Approval**: Tunggu admin approve untuk mendapat reward

### 3. Oracle Workflow
1. **Monitor Events**: Oracle membaca dummy-events.json
2. **Process PR_MERGED**: Ketika ada event PR merged
3. **Auto Approve**: Otomatis approve bounty yang sesuai
4. **Transfer Reward**: Smart contract transfer ETH ke winner

---

## API dan Fungsi

### 1. Smart Contract Functions

#### Read Functions
```solidity
// Get contract owner
function owner() public view returns (address)

// Get next bounty ID
function nextBountyId() public view returns (uint256)

// Get specific bounty
function bounties(uint256 id) public view returns (Bounty memory)

// Get all bounties
function getAllBounties() public view returns (Bounty[] memory)

// Get bounty status
function getBountyStatus(uint256 _bountyId) public view returns (Status)
```

#### Write Functions
```solidity
// Create new bounty (owner only)
function createBounty(string memory _title, string memory _description, string memory _githubUrl) public payable onlyOwner

// Claim bounty (public)
function claimBounty(uint256 _bountyId) public

// Submit solution (claimant only)
function submitSolution(uint256 _bountyId, string memory _solutionGithubUrl) public

// Approve bounty (owner only)
function approveBounty(uint256 _bountyId) public onlyOwner
```

### 2. Frontend Hooks API

#### useIsAdmin
```typescript
const { isAdmin, isAdminLoading } = useIsAdmin()
```

#### useAdminActions
```typescript
const { createBounty, approveBounty } = useAdminActions()

// Create bounty
await createBounty(title, description, githubUrl, rewardAmount)

// Approve bounty
await approveBounty(bountyId)
```

#### useClaimBounty
```typescript
const { claimBounty } = useClaimBounty()

// Claim bounty
await claimBounty(bountyId)
```

### 3. Python Oracle API

#### Web3 Contract Interaction
```python
# Read contract data
owner_address = contract.functions.owner().call()
bounty_count = contract.functions.nextBountyId().call()

# Write contract data
tx_hash = contract.functions.approveBounty(bounty_id).transact({
    'from': owner_address
})
```

---

## Troubleshooting

### 1. Common Issues

#### A. Bounty Tidak Muncul di Dashboard
**Symptoms**: Bounty sudah dibuat tapi tidak tampil di UI

**Solutions**:
1. **Check MetaMask Connection**:
   - Pastikan terhubung ke Hardhat Local (Chain ID: 31337)
   - Pastikan menggunakan development account
   - Refresh halaman setelah connect

2. **Check Debug Information**:
   - Lihat Debug Info di halaman web
   - Pastikan "Wallet Connected": Yes
   - Pastikan "Chain ID": 31337
   - Pastikan "Is Admin": Yes (untuk admin view)

3. **Check Contract Deployment**:
   ```bash
   # Verify contract is deployed
   cd apps/dashboard
   node debug-contract.js
   ```

#### B. Transaction Failed
**Symptoms**: MetaMask transaction gagal atau pending

**Solutions**:
1. **Reset MetaMask Account**:
   - Settings → Advanced → Reset Account
   - Ini akan clear pending transactions

2. **Check Gas Settings**:
   - Pastikan gas limit cukup
   - Untuk local development, gas price bisa 0

3. **Check Account Balance**:
   - Pastikan account punya ETH untuk gas
   - Development account harus punya ~10000 ETH

#### C. Contract Connection Error
**Symptoms**: "Contract not found" atau connection error

**Solutions**:
1. **Redeploy Contract**:
   ```bash
   npm run deploy:contract
   ```

2. **Check Contract Address**:
   - Pastikan `deployed_contract_address.json` ada
   - Pastikan address sesuai dengan deployment

3. **Restart Hardhat Node**:
   - Stop hardhat node (Ctrl+C)
   - Start ulang: `npm run start:hardhat`
   - Deploy ulang contract

### 2. Debug Tools

#### A. Debug Contract Script
```javascript
// apps/dashboard/debug-contract.js
const { ethers } = require('ethers');
const BonusEscrowJson = require('../../src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json');
const deployedContractAddress = require('./src/contracts/deployed_contract_address.json');

async function debugContract() {
  const provider = new ethers.JsonRpcProvider('http://localhost:8545');
  const contract = new ethers.Contract(
    deployedContractAddress.contractAddress,
    BonusEscrowJson.abi,
    provider
  );
  
  console.log('Contract Owner:', await contract.owner());
  console.log('Next Bounty ID:', await contract.nextBountyId());
  console.log('All Bounties:', await contract.getAllBounties());
}

debugContract().catch(console.error);
```

#### B. Frontend Debug Component
```typescript
// components/DebugInfo.tsx
export default function DebugInfo() {
  const { address, isConnected, chain } = useAccount()
  const { isAdmin } = useIsAdmin()
  
  return (
    <div className="bg-yellow-100 p-4 rounded mb-4">
      <h3>Debug Information</h3>
      <p>Wallet Connected: {isConnected ? 'Yes' : 'No'}</p>
      <p>Address: {address}</p>
      <p>Chain ID: {chain?.id}</p>
      <p>Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
    </div>
  )
}
```

### 3. Error Messages dan Solutions

#### "Only owner can call this function"
- **Cause**: Non-owner mencoba call owner-only function
- **Solution**: Pastikan menggunakan owner account untuk admin functions

#### "Bounty is not open for claims"
- **Cause**: Bounty sudah diklaim atau dibayar
- **Solution**: Pilih bounty dengan status "Open"

#### "Bounty has not been claimed"
- **Cause**: Mencoba approve bounty yang belum diklaim
- **Solution**: Tunggu bounty diklaim dulu sebelum approve

#### "Network not supported"
- **Cause**: MetaMask terhubung ke network yang salah
- **Solution**: Switch ke Hardhat Local network (Chain ID: 31337)

---

## Pengembangan dan Testing

### 1. Development Environment

#### A. File Structure untuk Development
```
src/
├── contracts/
│   ├── BonusEscrow.sol          # Main contract
│   └── test/                    # Test contracts (future)
├── deploy/
│   └── 01_deploy_escrow.js      # Deployment script
├── test/                        # Contract tests (future)
└── scripts/                     # Utility scripts (future)
```

#### B. Hardhat Tasks
```javascript
// hardhat.config.js - Custom tasks
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

task("balance", "Prints an account's balance")
  .addParam("account", "The account's address")
  .setAction(async (taskArgs, hre) => {
    const balance = await hre.ethers.provider.getBalance(taskArgs.account);
    console.log(hre.ethers.utils.formatEther(balance), "ETH");
  });
```

### 2. Testing Strategy

#### A. Smart Contract Testing (Future Implementation)
```javascript
// test/BonusEscrow.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BonusEscrow", function () {
  let bonusEscrow;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const BonusEscrow = await ethers.getContractFactory("BonusEscrow");
    bonusEscrow = await BonusEscrow.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await bonusEscrow.owner()).to.equal(owner.address);
    });
  });

  describe("Bounty Creation", function () {
    it("Should create bounty with correct data", async function () {
      const reward = ethers.utils.parseEther("1.0");
      await bonusEscrow.createBounty("Test Bounty", "Description", "github.com", { value: reward });
      
      const bounty = await bonusEscrow.bounties(0);
      expect(bounty.title).to.equal("Test Bounty");
      expect(bounty.reward).to.equal(reward);
    });
  });
});
```

#### B. Frontend Testing
```typescript
// __tests__/components/BountyCard.test.tsx
import { render, screen } from '@testing-library/react'
import BountyCard from '@/components/BountyCard'

const mockBounty = {
  id: 0,
  title: "Test Bounty",
  description: "Test Description",
  reward: "1000000000000000000", // 1 ETH in Wei
  status: 0, // Open
}

test('renders bounty card with correct information', () => {
  render(<BountyCard bounty={mockBounty} />)
  
  expect(screen.getByText('Test Bounty')).toBeInTheDocument()
  expect(screen.getByText('Test Description')).toBeInTheDocument()
  expect(screen.getByText('1 ETH')).toBeInTheDocument()
})
```

### 3. Deployment Scripts

#### A. Enhanced Deployment Script
```javascript
// deploy/01_deploy_escrow.js
const { network } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  
  log("----------------------------------------------------");
  log("Deploying BonusEscrow...");
  
  const bonusEscrow = await deploy("BonusEscrow", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  
  log(`BonusEscrow deployed at ${bonusEscrow.address}`);
  
  // Save contract address for frontend
  const fs = require("fs");
  const path = require("path");
  
  const addressPath = path.join(__dirname, "../../apps/dashboard/src/contracts/deployed_contract_address.json");
  fs.writeFileSync(addressPath, JSON.stringify({
    contractAddress: bonusEscrow.address,
    network: network.name,
    chainId: network.config.chainId,
    deployedAt: new Date().toISOString()
  }, null, 2));
  
  // Verify contract if on testnet/mainnet
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(bonusEscrow.address, []);
  }
};

module.exports.tags = ["all", "bonus-escrow"];
```

#### B. Verification Utility
```javascript
// utils/verify.js
const { run } = require("hardhat");

const verify = async (contractAddress, args) => {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!");
    } else {
      console.log(e);
    }
  }
};

module.exports = { verify };
```

### 4. Monitoring dan Logging

#### A. Event Monitoring
```javascript
// scripts/monitor-events.js
const { ethers } = require("hardhat");

async function monitorEvents() {
  const BonusEscrow = await ethers.getContractFactory("BonusEscrow");
  const bonusEscrow = BonusEscrow.attach(process.env.CONTRACT_ADDRESS);
  
  // Listen to BountyCreated events
  bonusEscrow.on("BountyCreated", (id, creator, title, githubUrl, reward) => {
    console.log(`New Bounty Created:
      ID: ${id}
      Creator: ${creator}
      Title: ${title}
      GitHub: ${githubUrl}
      Reward: ${ethers.utils.formatEther(reward)} ETH
    `);
  });
  
  // Listen to BountyClaimed events
  bonusEscrow.on("BountyClaimed", (id, claimant) => {
    console.log(`Bounty Claimed:
      ID: ${id}
      Claimant: ${claimant}
    `);
  });
  
  // Listen to BountyApproved events
  bonusEscrow.on("BountyApproved", (id, claimant, reward) => {
    console.log(`Bounty Approved:
      ID: ${id}
      Claimant: ${claimant}
      Reward: ${ethers.utils.formatEther(reward)} ETH
    `);
  });
}

monitorEvents().catch(console.error);
```

#### B. Performance Monitoring
```typescript
// utils/performance.ts
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  startTimer(operation: string): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      if (!this.metrics.has(operation)) {
        this.metrics.set(operation, []);
      }
      this.metrics.get(operation)!.push(duration);
      console.log(`${operation} took ${duration.toFixed(2)}ms`);
    };
  }
  
  getAverageTime(operation: string): number {
    const times = this.metrics.get(operation) || [];
    return times.reduce((a, b) => a + b, 0) / times.length;
  }
}
```

### 5. CI/CD Pipeline (Future)

#### A. GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test and Deploy

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run Hardhat tests
      run: npx hardhat test
    
    - name: Run frontend tests
      run: |
        cd apps/dashboard
        npm ci
        npm test
    
    - name: Build frontend
      run: |
        cd apps/dashboard
        npm run build
```

---

## Kesimpulan

EscrowFlow adalah sistem bounty management yang komprehensif dengan arsitektur yang solid dan implementasi yang lengkap. Sistem ini mendemonstrasikan integrasi yang baik antara smart contract, frontend modern, dan automation oracle.

### Key Strengths:
1. **Smart Contract Security**: Implementasi modifier dan access control yang proper
2. **Modern Frontend**: Next.js 15 dengan TypeScript dan Wagmi integration
3. **Developer Experience**: Comprehensive debugging tools dan documentation
4. **Automation**: Python oracle untuk event processing
5. **Local Development**: Complete local blockchain environment

### Future Enhancements:
1. **Testing Suite**: Comprehensive unit dan integration tests
2. **Security Audit**: Professional smart contract audit
3. **UI/UX Improvements**: Enhanced user interface dan experience
4. **Real Oracle Integration**: Integration dengan GitHub API atau external services
5. **Multi-chain Support**: Support untuk multiple blockchain networks
6. **Advanced Features**: Dispute resolution, milestone-based payments, reputation system

Dokumentasi ini memberikan panduan lengkap untuk memahami, menggunakan, dan mengembangkan sistem EscrowFlow lebih lanjut.
