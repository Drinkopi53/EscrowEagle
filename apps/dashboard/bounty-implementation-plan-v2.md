### Rencana Implementasi Bounty (Revisi V2)

Berdasarkan masukan, alur kerja diubah untuk memisahkan pembuatan bounty dari pendanaan awal.

1.  **Perubahan Smart Contract (`BonusEscrow.sol`):**
    *   Ubah fungsi `createBounty` agar tidak lagi `payable`. Fungsi ini akan menerima `_reward` sebagai argumen `uint256` untuk mencatat jumlah hadiah, tetapi tidak akan menahan dana apa pun saat pembuatan.
    *   Ubah fungsi `payBounty` menjadi `payable`. Ketika admin membayar bounty, mereka akan memanggil fungsi ini dan mengirimkan jumlah ETH yang sesuai bersamaan dengan transaksi. Smart contract akan segera mentransfer dana tersebut ke alamat `acceptor` yang tercatat.

2.  **Perubahan Frontend:**
    *   **Dasbor Admin (`AdminDashboard`):** Formulir "Create Bounty" akan diubah untuk memanggil fungsi `createBounty` yang baru tanpa mengirimkan `value` (ETH). Input jumlah hadiah akan tetap ada, tetapi nilainya akan diteruskan sebagai argumen ke fungsi kontrak.
    *   **Hook (`usePayBounty.tsx`):** Hook ini akan diperbarui untuk menerima jumlah hadiah (`reward`) dan meneruskannya sebagai `value` dalam parameter transaksi `writeContract`.
    *   **Komponen `BountyCard.tsx`:** Tombol "Pay Bounty" pada tampilan admin akan diperbarui untuk memanggil hook `usePayBounty` yang telah direvisi, dengan meneruskan jumlah hadiah yang diperlukan untuk transaksi.

### Diagram Alur Baru

```mermaid
graph TD
    subgraph "Alur Admin"
        A[Admin Membuat Bounty (Tanpa Biaya Transaksi)] --> B(Bounty Muncul di Dasbor);
        F[Admin Menyetujui PR GitHub] --> G{Admin Mengklik "Bayar Bounty"};
    end

    subgraph "Alur Klien"
        C[Klien Melihat Bounty] --> D{Klien Mendaftar & Mengerjakan Tugas};
        D --> E[Klien Mengirimkan PR GitHub];
    end

    subgraph "Alur Sistem Pembayaran"
        G -- "Memicu fungsi payBounty() yang payable" --> H[Dompet Admin Mengirim ETH ke Kontrak];
        H --> I[Kontrak Langsung Mengirim ETH ke Dompet Klien];
        I --> J[Status Bounty: Dibayar];
    end

    B --> C;
    E --> F;