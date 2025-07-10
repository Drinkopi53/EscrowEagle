### Rencana Implementasi Kontrol Akses Frontend

Untuk memastikan hanya admin yang dapat mengakses dasbor admin, kita akan mengimplementasikan kontrol akses berbasis peran di frontend.

1.  **Mendapatkan Alamat Pemilik Kontrak**: Kita akan membaca alamat `owner` dari smart contract, yang berfungsi sebagai satu-satunya sumber kebenaran untuk identitas Admin.

2.  **Membuat Hook `useIsAdmin`**: Sebuah hook React kustom baru (`useIsAdmin.tsx`) akan dibuat untuk merangkum logika pengecekan peran. Hook ini akan:
    *   Membaca alamat `owner` dari smart contract.
    *   Mendapatkan alamat pengguna yang saat ini terhubung dari dompet mereka.
    *   Membandingkan kedua alamat tersebut dan mengembalikan `true` jika cocok, `false` jika tidak.

3.  **Mengamankan Halaman Dasbor Admin**:
    *   Komponen `AdminDashboard` akan menggunakan hook `useIsAdmin`.
    *   Jika hook mengembalikan `false`, komponen akan menampilkan pesan "Akses Ditolak" atau sejenisnya, daripada merender konten admin.

4.  **Menyembunyikan Tautan Navigasi**:
    *   Komponen navigasi utama aplikasi akan menggunakan hook `useIsAdmin`.
    *   Tautan ke dasbor admin hanya akan dirender di UI jika pengguna adalah admin, mencegah pengguna non-admin untuk menemukannya.

### Diagram Alur Logika

```mermaid
graph TD
    subgraph "Pemuatan Halaman"
        A[Pengguna Mengunjungi Aplikasi] --> B{Hook useAccount (Wagmi)};
        B --> C[Dapatkan Alamat Pengguna Saat Ini];
        A --> D{Hook useContractRead};
        D --> E[Dapatkan Alamat Pemilik Kontrak];
    end

    subgraph "Logika Hook useIsAdmin"
        F[useIsAdmin] -- Menerima --> C;
        F -- Menerima --> E;
        F --> G{Bandingkan Alamat Pengguna dengan Alamat Pemilik};
        G -- Sama --> H[Kembalikan: true];
        G -- Berbeda --> I[Kembalikan: false];
    end

    subgraph "Render Komponen"
        J[Komponen AdminDashboard] -- Menggunakan --> F;
        J -- Hasil: true --> K[Tampilkan Konten Dasbor Admin];
        J -- Hasil: false --> L[Tampilkan Pesan 'Akses Ditolak'];

        M[Komponen Navigasi] -- Menggunakan --> F;
        M -- Hasil: true --> N[Tampilkan Tautan ke Dasbor Admin];
        M -- Hasil: false --> O[Sembunyikan Tautan ke Dasbor Admin];
    end