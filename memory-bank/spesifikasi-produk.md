# Dokumen Kebutuhan Produk (PRD): Trust-Chain Bounty Platform (Simulasi Lokal)

## 1. Tinjauan Produk

**Visi Produk:** Mensimulasikan sebuah platform **code bounty** terdesentralisasi yang memberikan hadiah secara transparan dan otomatis kepada programmer berdasarkan **Pull Request (PR) yang berhasil di-merge**. Tujuan utamanya adalah untuk memvalidasi alur kerja dan logika bisnis secara end-to-end di lingkungan lokal yang aman dan terkontrol.

**Target Pengguna (dalam Konteks Simulasi):**
* **Manajer Proyek (Persona: Sari):** Pengguna yang berperan sebagai pembuat dan pendana bounty.
* **Programmer/Kontributor (Persona: Dito, Budi, Ani):** Pengguna yang berperan sebagai peserta yang mengerjakan tugas untuk mendapatkan hadiah.

**Tujuan Proyek:**
* Membangun prototipe fungsional untuk didemokan.
* Memvalidasi konsep sistem bounty kompetitif berbasis smart contract.
* Menyediakan cetak biru untuk potensi pengembangan ke jaringan publik di masa depan.

## 2. Persona Pengguna

### Persona 1: "Sari, Manajer Proyek"
-   **Tujuan:** Ingin memberikan insentif untuk penyelesaian tugas pengembangan dengan cara yang adil, transparan, dan kompetitif.
-   **Masalah (Pain Points) yang Disimulasikan:** Proses manual dalam menentukan pemenang dan melakukan transfer pembayaran bonus.

### Persona 2: "Dito, Programmer Kontributor"
-   **Tujuan:** Ingin berpartisipasi dalam sebuah tugas, bersaing dengan programmer lain, dan menerima hadiah secara otomatis dan instan setelah pekerjaannya disetujui.
-   **Masalah (Pain Points) yang Disimulasikan:** Ketidakpastian dan keterlambatan dalam menerima pembayaran hadiah.

## 3. Kebutuhan Fitur

| Fitur | Deskripsi | User Stories | Prioritas |
| :--- | :--- | :--- | :--- |
| **Dashboard Manajemen Bounty** | Antarmuka web untuk Manajer membuat, mendanai, dan memantau bounty. | Sebagai Sari, saya ingin bisa membuat **bounty baru** dengan menentukan judul, deskripsi, jumlah hadiah, dan tipe (Individu/Kompetitif) melalui sebuah form di website. | Wajib |
| **Papan Daftar Bounty** | Halaman utama website yang menampilkan semua bounty yang sedang aktif dan telah selesai. | Sebagai Dito, saya ingin bisa melihat daftar bounty yang tersedia, statusnya (Proses/Diterima/Gagal), dan hadiahnya dalam format "1 Etherium". | Wajib |
| **Bounty Smart Contract** | Logika inti di blockchain lokal (`Hardhat Network`) yang mengelola dana dan aturan bounty. | Logika contract harus bisa menangani skenario "siapa cepat dia dapat" dan memastikan hanya pemenang pertama yang dibayar. | Wajib |
| **Python Mock Oracle** | Script Python yang mensimulasikan event "PR Merged" dari GitHub. | Script harus membaca `dummy-events.json` dan secara otomatis memicu fungsi persetujuan di smart contract dengan mengirimkan data pemenang. | Wajib |

## 4. Alur Simulasi Final (End-to-End untuk Demo)

1.  **Pembuatan Bounty:**
    * Sari (pengguna) membuka website dan mengisi form "Buat Bounty Baru" dengan data: `Judul Project`, `Deskripsi Project`, `Link GitHub Repo`, dan `Hadiah` (misal: 1 ETH).
    * Website mengirim transaksi ke `BountyContract.sol` untuk membuat bounty baru.
    * Di "Papan Bounty", muncul entri baru dengan **Status: "Proses"**.

2.  **Simulasi Persetujuan PR:**
    * Seorang programmer (misal: `budi-dev`) menyelesaikan tugasnya.
    * Sari (pengguna demo) menyetujui pekerjaan tersebut dengan cara mengedit file `dummy-events.json` secara manual dan menambahkan event `PR_MERGED`.

3.  **Eksekusi oleh Oracle & Smart Contract:**
    * Script `mock_oracle.py` dijalankan (bisa manual atau terjadwal).
    * Script membaca event baru, mengambil data `winnerWallet`, dan memanggil fungsi `approveWinner()` di `BountyContract.sol`.
    * Smart contract mentransfer 1 ETH (simulasi) ke `winnerWallet` dan mengubah status internal bounty.

4.  **Pembaruan Otomatis di Website:**
    * Frontend mendeteksi perubahan state pada smart contract.
    * Tampilan di "Papan Bounty" untuk bounty yang relevan diperbarui secara otomatis.
    * **Status** berubah dari "Proses" menjadi **"Diterima"**.
    * Kolom **Nama User** diisi dengan `budi-dev`.
    * Kolom **Link GitHub** diisi dengan link PR yang disetujui.

## 5. Spesifikasi Teknis (Simulasi Lokal)

### Frontend
-   **Framework:** Next.js
-   **Styling:** Tailwind CSS **v3.4.1**
-   **Interaksi Blockchain:** Ethers.js, Wagmi

### Smart Contract
-   **Lingkungan:** Hardhat Network (Node RPC: `http://127.0.0.1:8545/`)
-   **Bahasa:** Solidity

### Simulasi & Oracle
-   **Bahasa Pemicu:** Python 3
-   **Library:** `web3.py`
-   **Sumber Event:** File `dummy-events.json`

## 6. Struktur Data Kunci

### `dummy-events.json`
Struktur data untuk event persetujuan PR yang akan dibaca oleh `mock_oracle.py`.
```json
[
  {
    "eventType": "PR_MERGED",
    "bountyId": 1,
    "prLink": "[https://github.com/username/project/pull/1](https://github.com/username/project/pull/1)",
    "userName": "dito_dev",
    "winnerWallet": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  }
]