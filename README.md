# 💸 RAW LOGIC — Financial Core & AI Assistant

[![Laravel](https://img.shields.io/badge/Laravel-11.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-Modern%20Monolith-9553E9?style=for-the-badge&logo=inertia&logoColor=white)](https://inertiajs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-Neo%20Brutalism-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini%201.5-8E75FF?style=for-the-badge&logo=google-gemini&logoColor=white)](https://gemini.google.com)

**RAW LOGIC** adalah aplikasi manajemen keuangan pribadi & bisnis modern dengan pendekatan desain **Neo-Brutalism** (thick borders, hard offset shadows, high-contrast palette) dan didukung oleh **AI Multimodal Assistant** yang cerdas untuk pencatatan transaksi otomatis via percakapan maupun pemindaian foto struk (*OCR Receipt Scan*).

---

## 📸 Fitur-Fitur Utama (Key Features)

### 1. 📊 Main Dashboard
- **Total Balance Summary**: Menampilkan akumulasi saldo terkini dari seluruh wallet aktif secara *real-time*.
- **Quick Wallet Rows**: Akses cepat ke setiap wallet dengan kartu visual khas neo-brutalism.
- **Ringkasan Pemasukan & Pengeluaran**: Diagram dan statistik pengeluaran vs pemasukan bulanan.
- **Recent Transactions**: Riwayat transaksi terbaru yang diperbarui secara instan.

### 2. 💳 Manajemen Wallets & Budgeting
- **Multi-Wallet**: Kelola kas pribadi, e-wallet (GoPay, OVO, ShopeePay), rekening bank (BCA, Mandiri), dan kas bisnis secara terpisah.
- **Customization**: Bebas pilih warna kartu, tipe wallet, dan ikon material.
- **Batas Budget Bulanan**: Atur batas maksimal pengeluaran per wallet lengkap dengan progress bar indikator penggunaan budget (*Warning Red* saat mendekati limit).
- **Shortcut Transaksi Cepat**: Input pemasukan/pengeluaran cepat langsung dari halaman detail wallet.

### 3. 🎯 Target Tabungan (Savings Goals)
- **Full Dynamic CRUD**: Buat target finansial baru (misal: *Liburan Jepang*, *MacBook Pro*, *DP Rumah*).
- **Nabung & Tarik Dana**: Fitur setoran (*Deposit*) dan penarikan (*Withdraw*) tabungan dengan modal inline tanpa perlu navigasi halaman.
- **Progress Tracking**: Persentase otomatis ketercapaian target, estimasi sisa kebutuhan dana, dan status target (*Aktif*, *Tercapai*, *Dibatalkan*).

### 4. 🤖 AI Assistant & OCR Receipt Scanner (`/chat`)
- **Multimodal OCR Receipt Scan**: Unggah foto nota/struk belanja dari **Galeri** atau jepret langsung via **Kamera HP**, AI akan memindai toko, nominal total, kategori, dan tanggal secara otomatis.
- **Natural Language Input**: Ketik pesan biasa seperti *"Beli kuota 50rb pake Usaha E-Wallet"* atau *"Gaji 5jt ke Rekening Utama"*, AI akan mengenali nominal, jenis transaksi, dan wallet terkait.
- **Pilihan AI Model Selector (`.env` Sync)**: Bebas beralih antar AI Engine:
  - 🤖 **GPT-4o (OpenAI)**
  - 🔮 **Gemini 1.5 Pro (Google AI)**
  - 🧠 **Claude 3.5 Sonnet (Anthropic)**
  - ⚡ **DeepSeek V3 (DeepSeek)**
  - 💾 **RAW LOGIC Core AI (Local Engine)**
- **Interactive AI Receipt Card**: Respon AI berupa kartu struk interaktif dengan **Dropdown Pemilihan Wallet** dan **Toggle Tipe (Pemasukan / Pengeluaran)** yang bisa disesuaikan sebelum dikonfirmasi ke database.
- **Modal Edit Struk**: Fitur edit detail nominal, kategori, dan catatan struk sebelum konfirmasi.

### 5. 📉 Reports & Financial Analysis
- Filter laporan keuangan berdasarkan periode tanggal, bulan, atau wallet spesifik.
- Distribusi pengeluaran per kategori.
- Ekspor data transaksi dalam format CSV / PDF.

### 6. 📱 Integration & Authentication
- **Dual Login**: Mendukung Login via Email atau Nomor WhatsApp + Password.
- **Google OAuth 2.0**: Login / Register instan 1-klik menggunakan akun Google.
- **WhatsApp Integration Settings**: Pengaturan webhook & koneksi bot WhatsApp.
- **Currency Format IDR**: Seluruh input nominal uang dilengkapi titik pemisah ribuan otomatis (`1.500.000`).

---

## 🛠️ Stack Teknologi (Tech Stack)

- **Backend Framework**: Laravel 11.x (PHP >= 8.2)
- **Frontend Framework**: React 18.x (Vite build tool)
- **Glue Stack**: Inertia.js (Single Page Application tanpa API REST terpisah)
- **UI Styling**: Tailwind CSS + Custom Neo-Brutalism Classes (`neo-border`, `neo-shadow`)
- **Database**: MySQL 8.x
- **Authentication**: Laravel Fortify / Custom Auth + Laravel Socialite (Google OAuth)
- **AI Integrations**: OpenAI API (GPT-4o), Google Gemini API, Anthropic API, DeepSeek API

---

## 📁 Struktur Direktori Utama

```
catat-keuangan/
├── app/
│   ├── Http/Controllers/
│   │   ├── AuthController.php        # Autentikasi, Register & Google OAuth
│   │   ├── DashboardController.php   # Data Ringkasan Dashboard
│   │   ├── WalletController.php      # CRUD Wallet & Budgeting Limit
│   │   ├── GoalController.php        # CRUD Savings Goals, Deposit & Withdraw
│   │   ├── TransactionController.php # Pencatatan Transaksi Manual
│   │   ├── ChatController.php        # Manajemen AI Chat & Konfirmasi Struk DB
│   │   ├── ReportController.php      # Laporan Keuangan & Analisis
│   │   └── SettingController.php     # Pengaturan Bot WhatsApp
│   ├── Models/                       # Eloquent Models (User, Wallet, SavingsGoal, ChatMessage, Transaction, dll)
│   └── Services/
│       └── AiService.php             # Engine Koneksi HTTP Real API (OpenAI, Gemini, Claude, DeepSeek)
├── database/
│   ├── migrations/                   # Schema Tabel MySQL Database
│   └── seeders/                      # Sample Data Seeder
├── resources/
│   ├── js/
│   │   ├── Components/
│   │   │   ├── CurrencyInput.jsx     # Input Nominal Uang Format IDR Realtime
│   │   │   ├── GoalCard.jsx          # Kartu Neo-Brutalist Target Tabungan
│   │   │   ├── SideNav.jsx           # Navigasi Samping Desktop
│   │   │   └── TopNav.jsx            # Header Bar
│   │   ├── Layouts/
│   │   │   └── AuthenticatedLayout.jsx
│   │   └── Pages/
│   │       ├── Dashboard.jsx         # Halaman Utamah Dashboard
│   │       ├── Wallets/              # Index & Detail Wallet
│   │       ├── Goals/                # Index Target Tabungan
│   │       ├── Chat/                 # Halaman AI Assistant Chat & OCR
│   │       ├── Transactions/         # Form Tambah Transaksi
│   │       └── Reports/              # Halaman Laporan Keuangan
└── routes/
    └── web.php                       # Definisi Route Web & Inertia Pages
```

---

## ⚙️ Panduan Instalasi & Jalankan Proyek

### 1. Prasyarat System
- PHP >= 8.2 (dengan ekstensi `pdo_mysql`, `mbstring`, `gd`, `fileinfo`)
- Composer >= 2.x
- Node.js >= 18.x & NPM
- MySQL Server (XAMPP / Laragon / Local MySQL)

### 2. Langkah-Langkah Setup

1. **Clone Repository & Masuk ke Folder**:
   ```bash
   git clone https://github.com/username/catat-keuangan.git
   cd catat-keuangan
   ```

2. **Install Depedensi Backend (Composer)**:
   ```bash
   composer install
   ```

3. **Install Depedensi Frontend (NPM)**:
   ```bash
   npm install
   ```

4. **Salin File Environment `.env`**:
   ```bash
   cp .env.example .env
   ```

5. **Konfigurasi File `.env`**:
   Buka file `.env` dan atur koneksi database serta API Key yang diperlukan:
   ```env
   APP_NAME="RAW LOGIC"
   APP_URL=http://localhost:8000

   # Database MySQL
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=catat_db
   DB_USERNAME=root
   DB_PASSWORD=

   # Google OAuth (Opsional untuk Login Google)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/auth/google/callback

   # AI Assistant API Keys (Isi untuk koneksi API Real Live)
   DEFAULT_AI_MODEL=gpt-4o
   OPENAI_API_KEY=sk-proj-your-openai-key
   GEMINI_API_KEY=your-gemini-api-key
   ANTHROPIC_API_KEY=your-anthropic-api-key
   DEEPSEEK_API_KEY=your-deepseek-api-key
   ```

6. **Generate Application Key**:
   ```bash
   php artisan key:generate
   ```

7. **Jalankan Migrasi Database & Seeder**:
   ```bash
   php artisan migrate --seed
   ```

8. **Buat Symlink Storage (Untuk Upload Foto Struk)**:
   ```bash
   php artisan storage:link
   ```

9. **Build Aset Frontend**:
   ```bash
   # Untuk Mode Produksi
   npm run build

   # Atau Untuk Mode Development / Hot Reload
   npm run dev
   ```

10. **Jalankan Server Lokal Laravel**:
    ```bash
    php artisan serve
    ```

11. Buka browser Anda di `http://127.0.0.1:8000`.

---

## 🎨 Panduan Desain (Neo-Brutalist Design System)

Aplikasi ini menggunakan palet warna dan prinsip desain Neo-Brutalism:
- **Primary Color**: `#3B4CCA` (Royal Blue) & `#8B5CF6` (Vibrant Purple)
- **Accent Background**: `#F1EEFF` (Light Lilac) & `#FDF8FF` (Off-white)
- **Positive / Income**: `#4ADE80` (Emerald Green) & `#DCFCE7`
- **Negative / Expense**: `#F87171` (Coral Red) & `#FFDAD6`
- **Borders & Shadows**: `border-4 border-[#1C1A27]` dengan offset hard shadow `shadow-[4px_4px_0px_0px_#1C1A27]`.

---

## 📄 Lisensi

Proyek ini dikembangkan secara open-source di bawah lisensi [MIT License](LICENSE).
