# Troubleshooting: Bounty Tidak Muncul di Dashboard

## Masalah
Setelah membuat bounty, bounty tidak muncul di **Bounty List admin** dan **Available Bounties client**.

## Root Cause Analysis
Berdasarkan debug script, ditemukan bahwa:
1. ✅ Smart contract berfungsi dengan baik
2. ✅ Bounty sudah tersimpan di blockchain (ada 1 bounty dengan ID 0)
3. ✅ Contract owner: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
4. ❌ **Masalah utama: MetaMask tidak terhubung dengan benar**

## Solusi

### 1. Setup MetaMask dengan Benar
Pastikan MetaMask dikonfigurasi untuk development:

**Network Configuration:**
- Network Name: `Hardhat Local`
- RPC URL: `http://localhost:8545`
- Chain ID: `31337`
- Currency Symbol: `ETH`

**Import Development Account:**
- Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

### 2. Verifikasi Setup
Setelah setup MetaMask, periksa di halaman web:
- **Debug Information** akan menampilkan status koneksi
- **Setup Instructions** akan hilang jika sudah benar
- **Wallet Connected**: harus "Yes"
- **Chain ID**: harus "31337"
- **Is Admin**: harus "Yes" (jika menggunakan account owner)

### 3. Perbaikan Code yang Sudah Dilakukan

#### a. Fixed useIsAdmin Hook
```typescript
// Sebelum: useContractRead (deprecated)
const { data: ownerAddress, isLoading: isAdminLoading } = useContractRead({

// Sesudah: useReadContract
const { data: ownerAddress, isLoading: isAdminLoading } = useReadContract({
```

#### b. Updated Wagmi Transport
```typescript
// Sebelum: default transport
transports: {
  [hardhat.id]: http(),
},

// Sesudah: explicit localhost
transports: {
  [hardhat.id]: http('http://localhost:8545'),
},
```

#### c. Added Debug Components
- `DebugInfo.tsx`: Menampilkan status koneksi dan data kontrak
- `SetupInstructions.tsx`: Panduan setup MetaMask

### 4. Langkah Testing
1. Pastikan Hardhat node berjalan: `npx hardhat node`
2. Deploy kontrak: `npx hardhat deploy --network localhost`
3. Setup MetaMask sesuai instruksi
4. Jalankan frontend: `npm run dev`
5. Periksa Debug Information di halaman web
6. Coba buat bounty baru dari Admin Dashboard

### 5. Expected Behavior Setelah Fix
- **Admin Dashboard**: Menampilkan bounty yang dibuat oleh admin yang login
- **Client Dashboard**: Menampilkan semua bounty yang tersedia
- **Debug Info**: Menampilkan koneksi yang benar dan data bounty

## Files yang Dimodifikasi
1. `src/hooks/useIsAdmin.tsx` - Fixed deprecated hook
2. `src/app/wagmi.ts` - Updated transport configuration
3. `src/app/page.tsx` - Added debug components
4. `src/components/DebugInfo.tsx` - New debug component
5. `src/components/SetupInstructions.tsx` - New setup guide
6. `src/components/ClientDashboard.tsx` - Fixed filtering logic

## Verification Script
Gunakan `debug-contract.js` untuk memverifikasi kontrak:
```bash
cd apps/dashboard
node debug-contract.js
```

Script ini akan menampilkan:
- Available accounts
- Contract owner
- Number of bounties
- Bounty data