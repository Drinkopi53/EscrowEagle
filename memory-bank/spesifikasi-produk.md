# Dokumen Kebutuhan Produk (PRD): Trust-Chain Bonus (Simulasi Lokal)

## 1. Tinjauan Produk

**Visi Produk:** **Mensimulasikan** sistem bonus yang transparan dan otomatis untuk tim remote menggunakan **smart contract yang berjalan di blockchain lokal**. Sistem ini dipicu oleh **data dummy** untuk memahami alur kerja dan logika bisnis tanpa koneksi ke layanan eksternal.

**Target Pengguna:**
* **Pengembang & Arsitek Sistem:** Untuk mempelajari, menguji, dan memvalidasi alur kerja sistem pembayaran bonus berbasis blockchain di lingkungan yang aman dan terkontrol.

**Tujuan Bisnis:** Memvalidasi konsep dan alur kerja aplikasi secara end-to-end di lingkungan lokal sebelum mempertimbangkan pengembangan ke jaringan publik.

**Metrik Kesuksesan:**
* Keberhasilan eksekusi alur penuh: dari pembacaan data dummy, pemicuan oleh script Python, hingga perubahan state di smart contract lokal.
* Waktu yang dibutuhkan untuk setup dan menjalankan simulasi pertama.

## 2. Kebutuhan Fitur

| Fitur | Deskripsi | User Stories | Prioritas |
|---|---|---|---|
| **Dashboard Monitoring Lokal** | Antarmuka web sederhana untuk berinteraksi dengan smart contract di blockchain lokal. | Sebagai Rian, saya ingin melihat state dari smart contract (misal: saldo escrow) yang berjalan di Hardhat Network. | Wajib |
| **Simulasi Pemicu Kinerja** | Penggunaan file data dummy untuk merepresentasikan event dari dunia luar (spt: GitHub/Trello). | Sebagai sistem, saya harus bisa membaca **data dummy** dari file `dummy-events.json` untuk mensimulasikan pencapaian target. | Wajib |
| **Smart Contract Lokal** | Logika inti di blockchain **lokal (Hardhat Network)** untuk mengunci dan membayar bonus. | Sebagai Dito (dalam simulasi), bonus saya harus terkunci di escrow pada blockchain lokal. | Wajib |
| **Python Mock Oracle Script** | **Script Python** yang bertindak sebagai "Oracle" di lingkungan lokal. | Sebagai sistem, script Python harus membaca `dummy-events.json`, dan jika ada event "target tercapai", ia akan memicu fungsi pembayaran di smart contract lokal. | Wajib |

## 3. Alur Simulasi
1.  Rian (Arsitek) menjalankan node blockchain lokal (Hardhat).
2.  Rian men-deploy `BonusEscrow.sol` ke jaringan lokal tersebut.
3.  Rian mengedit file `dummy-events.json` untuk menambahkan event baru, contoh: `{ "event": "API_COMPLETED", "developer_wallet": "0x...", "bonus": 1.0 }`.
4.  Rian menjalankan script Python `mock_oracle.py`.
5.  Script tersebut membaca event baru, terhubung ke node Hardhat lokal, dan memanggil fungsi `releaseBonus()` pada smart contract yang sudah di-deploy.
6.  Rian memeriksa state di smart contract (melalui dashboard atau script) untuk memastikan bonus telah "terkirim".

## 4. Spesifikasi Teknis (Simulasi Lokal)

### Frontend
- **Tech Stack:** Next.js (React), Ethers.js (dikonfigurasi untuk terhubung ke `http://127.0.0.1:8545/`).

### Smart Contract
- **Lingkungan:** **Hardhat Network**.
- **Bahasa:** Solidity.
- **Catatan:** **Tidak menggunakan Chainlink** atau oracle publik lainnya.

### Simulasi & Data Dummy
- **Bahasa Pemicu:** **Python 3**.
- **Library:** `web3.py` untuk berinteraksi dengan node Hardhat lokal.
- **Sumber Data:** File `dummy-events.json` di root proyek.

## 5. Rencana Rilis (MVP Simulasi Lokal)
- **Fitur:**
    1.  Smart contract `BonusEscrow.sol` yang bisa di-deploy ke Hardhat Network.
    2.  Script Python `mock_oracle.py` yang bisa membaca file JSON dan memanggil satu fungsi di smart contract.
    3.  File `dummy-events.json` dengan struktur yang telah ditentukan.
- **Tujuan MVP:** Membuktikan bahwa script Python dapat mengubah state smart contract di lingkungan lokal berdasarkan data dari sebuah file.