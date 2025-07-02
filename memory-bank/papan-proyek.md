### STATUS [Update: 25-06-2025]
- UI dasar untuk sistem bounty telah dibuat. Logika inti di smart contract dan oracle sudah siap.

### BABY-STEP BERJALAN: Mengintegrasikan Papan Bounty dengan `BountyContract.sol` secara Penuh
- **Tujuan:** Menghubungkan frontend secara penuh dengan smart contract, memastikan data bounty (termasuk status dan data pemenang) ditampilkan secara dinamis dan otomatis sesuai alur kerja final.
- **Tugas:**
    - [ ] **T1:** Implementasikan fungsi `fetchBounties` yang membaca semua data bounty dari smart contract dan menampilkannya di Papan Bounty. | **File:** `apps/web/pages/index.tsx` | **Tes:** Papan Bounty menampilkan data nyata dari blockchain lokal, bukan lagi data dummy. | **Assignee:** CortexAI
    - [ ] **T2:** Sempurnakan komponen `BountyCard.tsx` untuk menampilkan semua data yang dibutuhkan: Judul, Deskripsi singkat, Hadiah ("1 Etherium"), dan Status (dengan warna). | **File:** `apps/web/components/BountyCard.tsx` | **Tes:** Kartu bounty menampilkan data sesuai spesifikasi. | **Assignee:** CortexAI
    - [ ] **T3:** Implementasikan logika untuk menampilkan `Nama User` & `Link GitHub` pemenang. | **File:** `apps/web/pages/bounty/[id].tsx` | **Tes:** Setelah `mock_oracle.py` berjalan, halaman detail bounty menampilkan nama dan link PR pemenang. | **Assignee:** CortexAI
    - [ ] **T4:** Fungsikan form "Buat Bounty Baru" agar bisa mengirim transaksi (`useContractWrite`) ke `BountyContract.sol` untuk membuat bounty baru. | **File:** `apps/web/pages/create-bounty.tsx` | **Tes:** Mengisi form dan submit berhasil membuat bounty baru yang langsung muncul di Papan Bounty. | **Assignee:** CortexAI
    - [ ] **T5:** Lakukan pengujian End-to-End untuk seluruh alur demo. | **File:** Seluruh project | **Tes:** Alur dari pembuatan bounty, simulasi PR merge, hingga status "Diterima" di website berjalan lancar. | **Assignee:** Rian

### SARAN & RISIKO
- Untuk T3, karena nama user dan link PR tidak disimpan on-chain, data ini harus diambil dari log event smart contract atau (untuk simplifikasi demo) dibaca dari `dummy-events.json` oleh frontend.