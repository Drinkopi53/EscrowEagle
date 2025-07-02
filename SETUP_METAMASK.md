# Setup MetaMask untuk Development

## Langkah-langkah Setup MetaMask:

### 1. Tambahkan Network Localhost
1. Buka MetaMask
2. Klik dropdown network (biasanya "Ethereum Mainnet")
3. Klik "Add Network" atau "Custom RPC"
4. Masukkan detail berikut:
   - **Network Name**: Hardhat Local
   - **New RPC URL**: http://localhost:8545
   - **Chain ID**: 31337
   - **Currency Symbol**: ETH
   - **Block Explorer URL**: (kosongkan)

### 2. Import Account Development
1. Di MetaMask, klik icon account (lingkaran di kanan atas)
2. Pilih "Import Account"
3. Pilih "Private Key"
4. Masukkan private key berikut (ini adalah account pertama dari Hardhat):
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
5. Klik "Import"

### 3. Verifikasi Setup
- Address yang ter-import harus: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Network harus: Hardhat Local (Chain ID: 31337)
- Balance harus: ~10000 ETH

### 4. Troubleshooting
Jika bounty tidak muncul:
1. Pastikan MetaMask terhubung ke network Hardhat Local
2. Pastikan menggunakan account dengan address `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
3. Refresh halaman web
4. Periksa console browser untuk error
5. Lihat Debug Information di halaman web

## Account Development Lainnya:
Jika perlu account lain untuk testing:

**Account 2:**
- Address: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- Private Key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`

**Account 3:**
- Address: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
- Private Key: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`