# Rencana Implementasi Integrasi Sistem Bounty Frontend

## Tujuan
Menghubungkan frontend secara penuh dengan smart contract, memastikan data bounty (termasuk status dan data pemenang) ditampilkan secara dinamis dan otomatis sesuai alur kerja final.

## Fase 1: Persiapan dan Struktur File

1.  **Buat `dummy-events.json`:**
    *   Buat file `apps/dashboard/public/dummy-events.json` dengan struktur data dummy untuk event `PR_MERGED`. Ini akan digunakan untuk T3.
    *   Contoh struktur:
        ```json
        [
          {
            "bountyId": "0x...",
            "eventName": "PR_MERGED",
            "userName": "github_user",
            "prLink": "https://github.com/repo/pr/123"
          }
        ]
        ```
2.  **Buat Komponen `BountyCard.tsx`:**
    *   Buat file `apps/dashboard/src/components/BountyCard.tsx`.
    *   Definisikan antarmuka (interface) untuk properti bounty.
    *   Implementasikan tampilan kartu bounty dengan Judul, Deskripsi singkat, Hadiah, dan Status (dengan warna). Ini akan digunakan untuk T2.
3.  **Buat Halaman Detail Bounty:**
    *   Buat direktori `apps/dashboard/src/app/bounty/[id]`.
    *   Buat file `apps/dashboard/src/app/bounty/[id]/page.tsx`. Ini akan digunakan untuk T3.
4.  **Buat Halaman Buat Bounty:**
    *   Buat direktori `apps/dashboard/src/app/create-bounty`.
    *   Buat file `apps/dashboard/src/app/create-bounty/page.tsx`. Ini akan digunakan untuk T4.

## Fase 2: Implementasi Fungsionalitas Wagmi dan Logika Bisnis

1.  **T1: Implementasi `fetchBounties` di `apps/dashboard/src/app/page.tsx`:**
    *   Impor ABI (`src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json`) dan alamat kontrak (`python_workspace/deployed_contract_address.json`).
    *   Gunakan `useContractRead` dari wagmi untuk membaca array data bounty dari smart contract.
    *   Gunakan `useEffect` dan `useState` untuk menyimpan dan menampilkan data ini.
    *   Render daftar bounty menggunakan komponen `BountyCard.tsx` yang baru dibuat.
    *   Pastikan format hadiah selalu "1 Etherium" atau sesuai jumlah yang ditetapkan.
2.  **T2: Sempurnakan `BountyCard.tsx`:**
    *   Pastikan komponen `BountyCard.tsx` menampilkan semua data yang dibutuhkan: Judul, Deskripsi singkat, Hadiah ("1 Etherium"), dan Status (dengan warna). Ini akan dilakukan bersamaan dengan T1.
3.  **T3: Implementasi Logika Pemenang di `apps/dashboard/src/app/bounty/[id]/page.tsx`:**
    *   Baca `bountyId` dari parameter URL.
    *   Gunakan `useContractRead` untuk mendapatkan status bounty.
    *   Jika status bounty adalah "Diterima", buat panggilan untuk membaca `dummy-events.json`.
    *   Temukan event `PR_MERGED` yang sesuai dengan `bountyId`.
    *   Tampilkan `userName` dan `prLink` dari event tersebut.
4.  **T4: Fungsikan Form "Buat Bounty Baru" di `apps/dashboard/src/app/create-bounty/page.tsx`:**
    *   Buat form untuk input Judul, Deskripsi, dan Hadiah.
    *   Gunakan hook `useContractWrite` dari wagmi untuk memanggil fungsi `createBounty` di smart contract.
    *   Tangani status transaksi (loading, success, error) di UI.
    *   Setelah bounty berhasil dibuat, arahkan pengguna kembali ke halaman utama atau tampilkan pesan sukses.

## Fase 3: Pengujian dan Finalisasi

1.  **Pengujian Lokal:**
    *   Pastikan semua fungsionalitas bekerja dengan benar di lingkungan pengembangan lokal.
2.  **Git Commit:**
    *   Siapkan git commit dengan pesan: `Feat(CortexAI): Full integration of bounty system on website UI.`

## Diagram Alur

```mermaid
graph TD
    A[Mulai Tugas] --> B(Baca papan-proyek.md);
    B --> C{Kumpulkan Informasi Awal?};
    C -- Ya --> D[Identifikasi File Frontend & Data Kontrak];
    D --> E[Konfirmasi Jalur File Frontend];
    E --> F[Cari dummy-events.json];
    F --> G[Baca ABI & Alamat Kontrak];
    G --> H{Informasi Lengkap?};
    H -- Ya --> I[Buat Rencana Implementasi];
    I --> J(Fase 1: Persiapan & Struktur File);
    J --> J1[Buat dummy-events.json];
    J --> J2[Buat BountyCard.tsx];
    J --> J3[Buat apps/dashboard/src/app/bounty/[id]/page.tsx];
    J --> J4[Buat apps/dashboard/src/app/create-bounty/page.tsx];
    J --> K(Fase 2: Implementasi Fungsionalitas);
    K --> K1[T1: Implementasi fetchBounties di page.tsx];
    K --> K2[T2: Sempurnakan BountyCard.tsx];
    K --> K3[T3: Logika Pemenang di bounty/[id]/page.tsx];
    K --> K4[T4: Form Buat Bounty Baru di create-bounty/page.tsx];
    K --> L(Fase 3: Pengujian & Finalisasi);
    L --> L1[Pengujian Lokal];
    L --> L2[Siapkan Git Commit];
    L --> M[Selesai];