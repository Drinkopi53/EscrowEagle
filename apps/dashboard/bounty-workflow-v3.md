### Rencana Arsitektur & Alur Kerja V3 (Model Escrow)

Berdasarkan masukan terbaru, sistem akan diubah secara fundamental untuk menggunakan model escrow, di mana platform (smart contract) bertindak sebagai penjamin dana.

**Aktor:**
*   **Administrator**: Mendanai bounty, meninjau klaim, dan menyetujui pembayaran.
*   **User (Claimant)**: Mengklaim dan mengerjakan bounty.

---

**1. Pembuatan & Pendanaan Bounty (oleh Admin)**
*   **Tindakan**: Admin membuat dan mendanai bounty secara bersamaan.
*   **Logika**: Fungsi `createBounty` bersifat `payable`. Dana dari Admin dikirim dan disimpan di dalam saldo kontrak (escrow). Status bounty diatur ke `Open`.

**2. Pengklaiman Bounty (oleh User)**
*   **Tindakan**: User mengklaim bounty yang tersedia tanpa biaya.
*   **Logika**: Fungsi `claimBounty` akan mencatat alamat User sebagai `claimant` dan mengubah status bounty menjadi `PendingReview`.

**3. Evaluasi & Persetujuan (oleh Admin)**
*   **Tindakan**: Admin meninjau klaim dan mengklik "Approve & Pay".
*   **Logika**: Fungsi `approvePayment` akan dipanggil. Fungsi ini memverifikasi bahwa pemanggil adalah Admin dan statusnya adalah `PendingReview`. Kemudian, ia mentransfer dana yang sudah tersimpan di escrow ke alamat `claimant` dan mengubah status menjadi `Paid`.

---

### Diagram Arsitektur (Model Escrow)

**Diagram Proses:**
```mermaid
graph TD
    subgraph "Tahap Persiapan (Admin)"
        A[Admin Membuat & Mendanai Bounty] -- Transaksi Payable --> B{Dana Disimpan di Kontrak (Escrow)};
        B --> C[Bounty Muncul (Status: Open)];
    end

    subgraph "Tahap Klaim (User)"
        C --> D[User Mengklaim Bounty];
        D --> E{Alamat User Tercatat (Status: PendingReview)};
    end

    subgraph "Tahap Verifikasi & Pembayaran (Admin)"
        E --> F[Admin Meninjau & Menyetujui Klaim];
        F -- Panggil approvePayment() --> G{Kontrak Mentransfer Dana dari Escrow ke User};
        G --> H[Status Bounty: Paid];
    end
```

**Diagram Aliran Dana:**
```mermaid
sequenceDiagram
    participant AdminWallet as Dompet Admin
    participant PlatformContract as Kontrak Platform
    participant UserWallet as Dompet User

    AdminWallet->>+PlatformContract: Panggil createBounty() + Kirim 1 ETH
    Note right of PlatformContract: Dana 1 ETH sekarang disimpan di kontrak
    PlatformContract-->>-AdminWallet: Bounty Dibuat

    UserWallet->>+PlatformContract: Panggil claimBounty()
    PlatformContract-->>-UserWallet: Klaim Berhasil

    AdminWallet->>+PlatformContract: Panggil approvePayment()
    PlatformContract->>+UserWallet: Transfer 1 ETH
    UserWallet-->>-PlatformContract: Dana Diterima
    PlatformContract-->>-AdminWallet: Pembayaran Selesai