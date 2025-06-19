# Vibe Coding Initializer/Resetter Script v1.4 (Edisi PowerShell untuk Windows)

# Fungsi untuk mencatat progres dan mengarsipkan papan
function Archive-And-Log {
    # Ambil timestamp dengan format Windows
    $TIMESTAMP = Get-Date -Format "yyyyMMdd-HHmm"
    $ARCHIVE_FILE = "baby-steps-archive/baby-step-$TIMESTAMP.md"
    
    # Cari nama fitur dari file papan-proyek.md
    $FEATURE_NAME = (Get-Content "memory-bank/papan-proyek.md" | Select-String -Pattern "BABY-STEP BERJALAN:").Line -replace "### BABY-STEP BERJALAN: ", ""

    # 1. Arsipkan papan yang sudah selesai (Move-Item adalah padanan 'mv' di Linux)
    Move-Item -Path "memory-bank/papan-proyek.md" -Destination $ARCHIVE_FILE
    Write-Host "✅ Papan proyek diarsipkan ke: $ARCHIVE_FILE" -ForegroundColor Green

    # 2. Catat progres di file progress.md (Add-Content adalah padanan 'echo >>')
    $LOG_ENTRY = "$(Get-Date -Format "yyyy-MM-dd"): Selesai '$FEATURE_NAME'. Lihat arsip: $ARCHIVE_FILE"
    Add-Content -Path "memory-bank/progress.md" -Value $LOG_ENTRY
    Write-Host "✅ Progres dicatat di memory-bank/progress.md" -ForegroundColor Green
}

# Cek apakah ini adalah reset atau inisialisasi awal
# Di PowerShell, argumen disimpan dalam array $args
if ($args.Count -gt 0 -and $args[0] -eq "--reset") {
    Write-Host "🚀 Mereset alur kerja Vibe Coding..." -ForegroundColor Cyan
    Archive-And-Log
    # Salin template baru (Copy-Item adalah padanan 'cp' di Linux)
    Copy-Item -Path "vibe-guide/template-papan.md" -Destination "memory-bank/papan-proyek.md"
    Write-Host "✅ Papan proyek baru telah dibuat dari template." -ForegroundColor Green
    Write-Host "✨ Siklus berikutnya siap dimulai!" -ForegroundColor Magenta
    exit 0
}

# Inisialisasi awal
Write-Host "🚀 Inisialisasi Proyek Vibe Coding v1.4 (Edisi Windows)..." -ForegroundColor Cyan

# Buat direktori jika belum ada (New-Item -ItemType Directory adalah padanan 'mkdir -p')
New-Item -Path "memory-bank", "baby-steps-archive", "src" -ItemType Directory -Force | Out-Null

# Buat file jika belum ada (Test-Path adalah padanan '[ -f ]')
$filesToCreate = @(
    "memory-bank/spesifikasi-produk.md",
    "memory-bank/architecture.md",
    "memory-bank/progress.md",
    "vibe-guide/team-manifest.md"
)
foreach ($file in $filesToCreate) {
    if (-not (Test-Path $file)) {
        New-Item -Path $file -ItemType File | Out-Null
    }
}

# Pastikan VIBE_CODING_GUIDE.md ada
if (-not (Test-Path "vibe-guide/VIBE_CODING_GUIDE.md")) {
    Write-Host "⚠️  File vibe-guide/VIBE_CODING_GUIDE.md tidak ditemukan!" -ForegroundColor Yellow
    Write-Host "   Pastikan Anda telah menyalin folder vibe-guide/ dengan lengkap."
}

# Buat template jika belum ada menggunakan Here-String PowerShell
if (-not (Test-Path "vibe-guide/template-papan.md")) {
    @'
### STATUS [Update: <tanggal>]
- *Tulis ringkasan progres terakhir di sini.*

### REFERENSI ARSIP
- *Link ke baby-step sebelumnya yang relevan.*

### BABY-STEP BERJALAN: <Nama-Fitur-Spesifik>
- **Tujuan:** *Jelaskan hasil akhir yang diharapkan dari baby-step ini.*
- **Tugas:**
    - [ ] **T1:** Deskripsi tugas | **File:** `path/ke/file` | **Tes:** Kriteria sukses | **Assignee:** <Nama dari team-manifest.md>
    - [ ] **T2:** ... | **File:** ... | **Tes:** ... | **Assignee:** <Nama dari team-manifest.md>

### SARAN & RISIKO
- *(Bagian ini akan diisi oleh AI untuk memberikan saran atau peringatan risiko teknis)*
'@ | Set-Content -Path "vibe-guide/template-papan.md"
}

Copy-Item -Path "vibe-guide/template-papan.md" -Destination "memory-bank/papan-proyek.md"

Write-Host "✅ Struktur workspace berhasil dibuat." -ForegroundColor Green
Write-Host "📂 Struktur workspace Anda:"
Write-Host "   my-project/"
Write-Host "   ├── vibe-guide/               # Folder khusus panduan"
Write-Host "   │   ├── VIBE_CODING_GUIDE.md  # Panduan utama"
Write-Host "   │   ├── template-papan.md     # Template terstandarisasi"
Write-Host "   │   └── init_vibe.ps1         # Script setup otomatis (versi Windows)"
Write-Host "   ├── memory-bank/              # Konteks aktif"
Write-Host "   ├── baby-steps-archive/       # Riwayat pekerjaan"
Write-Host "   └── src/                      # Kode aplikasi"
Write-Host ""
Write-Host "➡️ Langkah selanjutnya:"
Write-Host "   1. Baca panduan: vibe-guide/VIBE_CODING_GUIDE.md"
Write-Host "   2. Daftarkan tim: vibe-guide/team-manifest.md"