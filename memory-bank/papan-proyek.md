### STATUS [Update: 19-06-2025]
- `spesifikasi-produk.md` (Versi Simulasi Lokal) telah divalidasi.
- Fondasi proyek simulasi lokal telah berhasil diinisialisasi, termasuk struktur monorepo, aplikasi Next.js, proyek Hardhat, kerangka script Python oracle, dan file data dummy awal.

### BABY-STEP BERJALAN: Komunikasi Smart Contract & Python (Hardhat Lokal)
- **Tujuan:** Membangun komunikasi dasar antara smart contract Solidity yang berjalan di Hardhat Network lokal dan script Python menggunakan `web3.py`.
- **Tugas:**
    - [ ] **T1:** Implementasi Fungsi Dasar `BonusEscrow.sol`
        - **Deskripsi:** Menulis fungsi `constructor` untuk menginisialisasi pemilik kontrak dan fungsi `deposit` untuk menerima ETH/token.
        - **File:** `src/contracts/BonusEscrow.sol`
        - **Tes:** Unit test untuk `constructor` dan `deposit` berhasil.
        - **Assignee:** CortexAI
    - [ ] **T2:** Script Deployment Hardhat
        - **Deskripsi:** Membuat script Hardhat untuk men-deploy `BonusEscrow.sol` ke Hardhat Network lokal dan mencatat alamat kontrak yang di-deploy.
        - **File:** `src/deploy/01_deploy_escrow.js`
        - **Tes:** Script berjalan sukses dan menampilkan alamat kontrak.
        - **Assignee:** CortexAI
    - [ ] **T3:** Koneksi Python ke Hardhat Node
        - **Deskripsi:** Menulis kode di `src/main.py` menggunakan `web3.py` untuk terhubung ke node Hardhat lokal (`http://127.0.0.1:8545/`).
        - **File:** `src/main.py`
        - **Tes:** Script Python berhasil terhubung ke node Hardhat.
        - **Assignee:** CortexAI
    - [ ] **T4:** Pembacaan Data Kontrak dari Python
        - **Deskripsi:** Menambahkan fungsi ke `src/main.py` untuk membaca alamat kontrak yang telah di-deploy (dari file sementara) dan mengambil salah satu data publiknya (misal: `owner`).
        - **File:** `src/main.py`
        - **Tes:** Script Python berhasil membaca alamat kontrak dan mengambil data publik.
        - **Assignee:** CortexAI

### SARAN & RISIKO
- **Pembagian Alamat Kontrak:** Untuk membagikan alamat kontrak yang di-deploy dari Hardhat ke script Python, disarankan untuk menyimpan alamat tersebut ke dalam file sementara (misal: `deployed_contract_address.json` atau `deployed_contract_address.txt`) setelah deployment oleh script Hardhat. Script Python kemudian dapat membaca file ini untuk mendapatkan alamat kontrak. Ini meminimalkan hardcoding dan memfasilitasi alur kerja pengembangan lokal.
- **Dependensi:** Pastikan semua dependensi Python (`web3.py`) dan Node.js/Hardhat terinstal dengan benar dan versi yang kompatibel.
