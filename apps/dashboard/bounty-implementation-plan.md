### Rencana Implementasi Bounty

Berikut adalah rencana langkah demi langkah untuk mengimplementasikan fitur bounty:

1.  **Pembaruan Smart Contract (`BonusEscrow.sol`):**
    *   Ubah fungsi `acceptBounty` untuk secara otomatis menggunakan alamat pengirim (`msg.sender`) sebagai penerima bounty, daripada meneruskannya sebagai argumen. Ini lebih aman dan merupakan praktik standar.
    *   Tambahkan kontrol akses ke fungsi `completeBounty` dan `payBounty` sehingga hanya pemilik kontrak (admin) yang dapat memanggilnya.

2.  **Pembaruan Frontend:**

    *   **Hook `useApplyForBounty.tsx`:**
        *   Perbarui hook untuk mencerminkan perubahan pada fungsi `acceptBounty` di smart contract. Tidak perlu lagi mengirim alamat penerima.

    *   **Buat Hook Admin Baru:**
        *   Buat hook `useCompleteBounty.tsx` untuk memanggil fungsi `completeBounty` dari smart contract.
        *   Buat hook `usePayBounty.tsx` untuk memanggil fungsi `payBounty` dari smart contract. Hook ini akan memerlukan alamat pemenang sebagai argumen.

    *   **Komponen `BountyCard.tsx`:**
        *   Untuk tampilan admin (`isAdminView={true}`), tambahkan tombol baru:
            *   Tombol "Selesaikan Bounty" akan muncul saat status bounty adalah "Diterima". Mengklik tombol ini akan memanggil hook `useCompleteBounty`.
            *   Tombol "Bayar Bounty" akan muncul saat status bounty adalah "Selesai". Mengklik tombol ini akan menampilkan input teks untuk memasukkan alamat pemenang dan tombol untuk memanggil hook `usePayBounty`.

### Diagram Alur Arsitektur

Diagram berikut mengilustrasikan bagaimana berbagai bagian sistem akan berinteraksi:

```mermaid
graph TD
    subgraph "Aplikasi Frontend (Next.js)"
        AdminDashboard -- "Menampilkan" --> BountyCard
        ClientDashboard -- "Menampilkan" --> BountyCard
        BountyCard -- "Menggunakan Hook" --> useApplyForBounty
        BountyCard -- "Akan Menggunakan Hook" --> useCompleteBounty
        BountyCard -- "Akan Menggunakan Hook" --> usePayBounty
    end

    subgraph "Smart Contract (Solidity)"
        BonusEscrowContract[BonusEscrow.sol]
    end

    subgraph "Interaksi Kontrak (via Wagmi)"
        useApplyForBounty -- "Memanggil" --> acceptBounty[acceptBounty]
        useCompleteBounty -- "Akan Memanggil" --> completeBounty[completeBounty]
        usePayBounty -- "Akan Memanggil" --> payBounty[payBounty]
        AdminDashboard -- "Memanggil" --> createBounty[createBounty]
    end

    BonusEscrowContract -- "Memiliki Fungsi" --> createBounty
    BonusEscrowContract -- "Memiliki Fungsi" --> acceptBounty
    BonusEscrowContract -- "Memiliki Fungsi" --> completeBounty
    BonusEscrowContract -- "Memiliki Fungsi" --> payBounty

    AdminDashboard -- "Membaca Data" --> getAllBounties[getAllBounties]
    ClientDashboard -- "Membaca Data" --> getAllBounties
    BonusEscrowContract -- "Memiliki Fungsi" --> getAllBounties