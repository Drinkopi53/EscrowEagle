# Panduan Diagnostik dan Penyelesaian Bug Status UI Tombol 'Claim Bounty'

## Deskripsi Masalah

Bug ini terjadi ketika pengguna berhasil mengklaim hadiah dengan mengklik tombol 'Claim Bounty', tetapi status tombol di antarmuka pengguna (UI) gagal beralih ke 'Cancel'. Tombol 'Cancel' dimaksudkan untuk memungkinkan pengguna membatalkan klaim hadiah mereka. Kegagalan pembaruan status ini menyebabkan kebingungan pengguna dan pengalaman yang tidak konsisten, karena UI tidak mencerminkan status klaim hadiah yang sebenarnya.

## Langkah-langkah untuk Mereproduksi Masalah

1.  **Akses Halaman Detail Hadiah:** Navigasikan ke halaman detail hadiah tertentu di aplikasi web (misalnya, `apps/dashboard/src/app/bounty/[id]/page.tsx`).
2.  **Identifikasi Hadiah yang Dapat Diklaim:** Pastikan hadiah yang ditampilkan memiliki status 'Open' dan memenuhi kriteria untuk diklaim oleh pengguna saat ini.
3.  **Klik Tombol 'Claim Bounty':** Klik tombol 'Claim Bounty' yang terlihat di halaman.
4.  **Konfirmasi Transaksi:** Setujui transaksi di dompet kripto (misalnya, MetaMask) saat diminta.
5.  **Amati Status Tombol:** Setelah transaksi berhasil dikonfirmasi di blockchain, amati status tombol 'Claim Bounty'.
6.  **Perilaku yang Diharapkan:** Tombol seharusnya beralih dari 'Claim Bounty' menjadi 'Cancel'.
7.  **Perilaku yang Diamati (Bug):** Tombol tetap dalam status 'Claim Bounty' atau status lain yang tidak benar, meskipun klaim berhasil.

## Potensi Akar Penyebab

*   **Pembaruan Status yang Salah:** Logika front-end mungkin tidak memicu pembaruan status UI yang benar setelah transaksi klaim berhasil. Ini bisa disebabkan oleh:
    *   Kurangnya pembaruan status di `useEffect` setelah `isTxSuccess` di `useClaimBounty.tsx`.
    *   Data hadiah yang tidak di-refetch dengan benar di `page.tsx` setelah klaim.
*   **Penanganan Respons API/Blockchain:** Aplikasi mungkin tidak memproses respons transaksi blockchain dengan benar, sehingga gagal memperbarui status UI.
    *   `useWaitForTransactionReceipt` mungkin tidak memicu `isTxSuccess` dengan benar.
    *   Kesalahan dalam mengurai data dari kontrak pintar.
*   **Kondisi Balapan (Race Conditions):** Ada kemungkinan kondisi balapan di mana pembaruan UI terjadi sebelum status transaksi blockchain sepenuhnya dikonfirmasi, atau pembaruan lain menimpa status yang benar.
*   **Cache Data yang Usang:** Data yang di-cache oleh `react-query` atau `wagmi` mungkin tidak di-invalidate atau di-refetch dengan benar, menyebabkan UI menampilkan data yang usang.
*   **Kesalahan Logika Kondisional:** Logika yang mengontrol rendering tombol ('Claim Bounty' vs. 'Cancel') mungkin memiliki kondisi yang salah atau tidak lengkap.

## Langkah-langkah Penyelesaian Detail

### 1. Periksa Permintaan Jaringan dan Respons Blockchain

*   **Gunakan Alat Pengembang Browser:** Buka tab 'Network' di alat pengembang browser Anda (Chrome DevTools, Firefox Developer Tools).
*   **Pantau Transaksi:** Setelah mengklik 'Claim Bounty' dan mengonfirmasi transaksi, perhatikan permintaan jaringan yang terkait dengan interaksi blockchain.
*   **Verifikasi Status Transaksi:** Pastikan transaksi berhasil dan tidak ada kesalahan yang dilaporkan. Periksa respons dari node blockchain atau layanan API yang relevan.
*   **Periksa Event Kontrak:** Jika ada event yang dipancarkan oleh kontrak pintar setelah klaim berhasil, pastikan event tersebut diterima dan diproses oleh front-end.

### 2. Debug Status Front-end

*   **Inspeksi Komponen `page.tsx`:**
    *   Gunakan React DevTools untuk memeriksa status komponen `BountyDetailPage` di `apps/dashboard/src/app/bounty/[id]/page.tsx`.
    *   Periksa nilai `bountyData` dan `claimantsData` setelah klaim berhasil. Pastikan data ini mencerminkan status klaim yang diperbarui (misalnya, alamat pengguna saat ini muncul di `claimantsData`).
    *   Periksa apakah `statusMap[currentBounty!.status]` berubah menjadi status yang benar setelah klaim.
*   **Inspeksi Hook `useClaimBounty.tsx`:**
    *   Tambahkan `console.log` di dalam `useEffect` di `apps/dashboard/src/hooks/useClaimBounty.tsx` untuk memverifikasi kapan `isTxSuccess` menjadi `true`.
    *   Pastikan `queryClient.invalidateQueries` dipanggil dengan benar untuk `queryKey` yang relevan (terutama yang terkait dengan data hadiah dan klaim).
    *   Verifikasi bahwa `onClaimSuccess` dipanggil.

### 3. Verifikasi Kontrak API dan Logika Smart Contract

*   **Periksa Implementasi Smart Contract:** Tinjau fungsi `claimBounty` dan `cancelClaim` di kontrak pintar (`src/contracts/BonusEscrow.sol`). Pastikan logika internalnya dengan benar memperbarui status hadiah dan daftar klaim.
*   **Simulasi Transaksi:** Gunakan alat seperti Hardhat atau Foundry untuk mensimulasikan transaksi klaim dan memverifikasi bahwa status kontrak berubah seperti yang diharapkan.
*   **Periksa ABI:** Pastikan ABI yang digunakan di front-end (`src/artifacts/contracts/BonusEscrow.sol/BonusEscrow.json`) cocok dengan kontrak yang di-deploy.

### 4. Menerapkan Logika Perubahan Status

*   **Pembaruan `useClaimBounty.tsx`:**
    *   Pastikan `onClaimSuccess` di `useClaimBounty.tsx` memicu refetch data hadiah di `page.tsx`. Ini bisa dilakukan dengan meneruskan fungsi `refetchBountyData` dan `refetchClaimantsData` dari `page.tsx` ke `useClaimBounty` sebagai callback.
    *   Contoh:
        ```typescript
        // di page.tsx
        const { claimBounty, cancelClaim, isLoading, isSuccess, isError, error } = useClaimBounty(() => {
          refetchBountyData();
          refetchClaimantsData();
        });
        ```
*   **Logika Kondisional Tombol di `page.tsx`:**
    *   Periksa logika yang menentukan kapan tombol 'Claim Bounty' atau 'Cancel' ditampilkan. Pastikan kondisi ini secara akurat mencerminkan status klaim pengguna saat ini.
    *   Contoh:
        ```typescript
        // Di dalam komponen BountyDetailPage, di mana tombol dirender
        {currentBounty.status === 0 && !claimants?.includes(address) && (
          <button
            onClick={() => claimBounty(bountyId)}
            disabled={isLoading} // isLoading dari useClaimBounty
            className="btn-cozy btn-cozy-primary"
          >
            {isLoading ? 'Claiming...' : 'Claim Bounty'}
          </button>
        )}
        {currentBounty.status === 0 && claimants?.includes(address) && (
          <button
            onClick={() => cancelClaim(bountyId)}
            disabled={isLoading} // isLoading dari useClaimBounty
            className="btn-cozy btn-cozy-error"
          >
            {isLoading ? 'Cancelling...' : 'Cancel Claim'}
          </button>
        )}
        ```
        *Catatan: `isLoading` di sini harus berasal dari `useClaimBounty` untuk mencerminkan status transaksi klaim/pembatalan.*

## Langkah-langkah Verifikasi

1.  **Ulangi Langkah Reproduksi:** Ikuti langkah-langkah reproduksi masalah.
2.  **Verifikasi Perilaku Tombol:** Setelah klaim berhasil, pastikan tombol 'Claim Bounty' segera beralih ke 'Cancel'.
3.  **Periksa Status Blockchain:** Verifikasi di penjelajah blok (block explorer) bahwa transaksi klaim berhasil dan status hadiah di kontrak pintar telah diperbarui dengan benar.
4.  **Uji Pembatalan Klaim:** Jika tombol 'Cancel' muncul, coba klik untuk memastikan fungsionalitas pembatalan klaim juga berfungsi dengan benar.
5.  **Uji Kasus Edge:**
    *   Apa yang terjadi jika pengguna mencoba mengklaim hadiah yang sudah diklaim?
    *   Apa yang terjadi jika transaksi gagal? Pastikan UI menampilkan pesan kesalahan yang sesuai.
