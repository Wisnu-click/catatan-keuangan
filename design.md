# Design System: Neo-Finance Brutalist Dashboard

## 1. Overview & Principles
Design system ini mengusung estetika **Neo-Brutalism** modern untuk aplikasi keuangan "RAW LOGIC".

### Visual Principles:
- **High Contrast & Structural Honesty**: Pembatas tebal (`4px solid #1C1A27`), sudut tajam, dan elemen berbercak warna kontras.
- **Hard Drop Shadows**: Offset bayangan tegas 6px tanpa blur (`6px 6px 0px 0px #1C1A27`).
- **Tactile Micro-Interactions**: Tombol dan kartu bergeser secara fisik saat hover (`translate(-2px, -2px)`) dan saat ditekan / click (`translate(6px, 6px)` dengan shadow menghilang).
- **Asymmetric Rotations**: Kemiringan acak ringan (`rotate(-0.5deg)`, `rotate(1deg)`) pada kartu dan lencana untuk kesan berani dan dinamis.
- **Monospaced & Grotesk Typography**: Kombinasi font sans-serif tebal untuk judul dan monospaced font untuk data numerik & angka nominal.

---

## 2. Color Palette & Tokens

### Primary & Accent Colors
| Design Token | Hex Code | Usage |
| :--- | :--- | :--- |
| `primary` | `#3B4CCA` | Branding utama, tombol aksi utama, header kartu total saldo |
| `primary-container` | `#3B4CCA` | Background container utama & highlight aktif |
| `secondary` | `#8B5CF6` | Aksen warna sekunder, header kartu, lencana status |
| `secondary-container` | `#8455EF` | Container sekunder, hover state sidebar |
| `tertiary` | `#463978` | Elemen tersier |
| `tertiary-fixed` | `#E7DEFF` | Background kontainer input & kartu aksen ringan |
| `tertiary-fixed-dim` | `#CCBEFF` | Background kartu laporan & preview chat |

### Functional & State Colors
| Design Token | Hex Code | Usage |
| :--- | :--- | :--- |
| `neo-green` / `income` | `#A7F3D0` / `#4ADE80` | Pemasukan, saldo positif, progress selesai |
| `neo-red` / `error` | `#BA1A1A` / `#FECACA` | Pengeluaran, saldo negatif, tombol konfirmasi berbahaya |
| `neo-yellow` | `#FDE047` | Peringatan, status "Belum Terhubung" |
| `error-container` | `#FFDAD6` | Background badge pengeluaran / error |

### Neutral & Background Colors
| Design Token | Hex Code | Usage |
| :--- | :--- | :--- |
| `background` | `#FDF8FF` | Background utama seluruh halaman |
| `surface` | `#FDF8FF` | Kartu dasar, permukaan input |
| `surface-container` | `#F1EBFE` | Sidebar desktop, header tabel, container bersusun |
| `surface-container-high` | `#EBE5F9` | State hover item navigasi |
| `surface-container-highest` | `#E5E0F3` | Container dengan elevasi tertinggi |
| `on-background` / `neo-border` | `#1C1A27` / `#14121F` | Teks utama, semua garis tepi (4px solid), bayangan keras (hard shadow) |
| `on-surface-variant` | `#454654` | Teks sekunder, label pembantu, placeholder |
| `on-primary` | `#FFFFFF` | Teks di atas warna primary |
| `on-secondary` | `#FFFFFF` | Teks di atas warna secondary |

---

## 3. Typography System

### Font Families
- **Display & Headlines**: `Space Grotesk`, sans-serif (Weights: 700, 900)
- **Monospace & Numbers**: `JetBrains Mono`, monospace (Weights: 700, 800)
- **Body & Content**: `Hanken Grotesk` / `Space Grotesk`, sans-serif (Weights: 500, 700)

### Type Scale
| Token Class | Size | Line Height | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `display-xl` | 72px (4.5rem) | 1.1 | 900 | Judul utama halaman (Header H1) |
| `headline-lg` | 48px (3.0rem) | 1.1 | 700 | Judul seksi besar |
| `headline-md` | 32px (2.0rem) | 1.2 | 700 | Judul kartu & modal |
| `number-xl` | 40px (2.5rem) | 1.0 | 800 | Nominal uang & angka statistik (Monospace) |
| `body-lg` | 18px (1.125rem) | 1.5 | 500/700 | Teks deskripsi & isi item utama |
| `body-md` | 16px (1.0rem) | 1.5 | 500/700 | Teks isi standar & opsi form |
| `label-mono` | 14px (0.875rem) | 1.0 | 700 | Label tombol, badge uppercase, tanggal (Monospace) |

---

## 4. Border, Shadows & Micro-Interactions

### Utility Classes

```css
/* Neo-Brutalist Border */
.neo-border {
  border: 4px solid #1c1a27;
}

/* Static Shadow */
.neo-shadow {
  box-shadow: 6px 6px 0px 0px #1c1a27;
}

.neo-shadow-sm {
  box-shadow: 4px 4px 0px 0px #1c1a27;
}

/* Hover State */
.neo-shadow-hover:hover {
  box-shadow: 8px 8px 0px 0px #1c1a27;
  transform: translate(-2px, -2px);
  transition: all 150ms ease-in-out;
}

/* Active / Click Press State */
.neo-shadow-active:active {
  box-shadow: 0px 0px 0px 0px #1c1a27 !important;
  transform: translate(6px, 6px) !important;
  transition: all 50ms ease-in-out;
}
```

---

## 5. Screen Components & Inventory

### 1. Main Dashboard (`/dashboard`)
- **Total Balance Banner**: Box warna `#8B5CF6` dengan nominal besar `$124,590.00` dan badge persentase.
- **Wallets Row**: Horizontal scrollable container berisi kartu wallet (`E-Wallet`, `Usaha Servis`, `Tabungan`, `Pribadi`).
- **Stats Grid**: Kartu Pemasukan (Hijau `#A7F3D0`) & Pengeluaran (Merah `#FECACA`).
- **Recent Transactions**: List transaksi terbaru dengan ikon kategori.

### 2. Wallets Main Index (`/wallets`)
- **Total Combined Balance Banner**: Banner biru `#3B4CCA` menampilkan agregat saldo gabungan seluruh wallet aktif.
- **Wallets Grid**: Grid 2 kolom kartu wallet dinamis dengan badge tipe (`Personal`, `Business`, `Savings`, `E-Wallet`), rincian pemasukan/pengeluaran, dan aksi cepat (`Mutasi & Detail`, `Transfer`).
- **Tambah Wallet Modal**: Modal interaktif gaya neo-brutalist untuk membuat wallet baru (nama, tipe, saldo awal).

### 3. Wallet Details (`/wallets/detail`)
- **Wallet Header**: Judul wallet besar dengan rotasi `-1deg` dan tombol transfer.
- **Bento Grid**: Saldo utama wallet, Pemasukan bulanan, Pengeluaran bulanan, Target bulanan progress (75%), dan Quick export link.
- **Filter Bar**: Chips filter (`Semua`, `Masuk`, `Keluar`, `Filter Lanjut`).
- **Mutasi List**: Transaksi dikelompokkan berdasarkan tanggal (`29 Agustus 2026`, `28 Agustus 2026`).

### 3. Savings Goals (`/goals`)
- **Goals Grid**: Kartu target tabungan 3 kolom (`Liburan Jepang` 65%, `MacBook Pro` Tercapai, `DP Mobil` 15%).
- **Striped Progress Bar**: Indikator progress bar dengan pola garis diagonal neo-brutalist.
- **Goal Actions**: Tombol `Nabung` dan `Tarik` pada tiap kartu.
- **Quick Add Card**: Tombol `Target Baru` dengan ikon plus besar.

### 4. Nabung ke Target (`/goals/deposit`)
- **Deposit Form**: Form input jumlah tabungan dengan prefix `Rp`, dropdown pilihan sumber dana wallet, dan catatan.
- **Primary Action**: Tombol `SIMPAN TABUNGAN` dengan gaya neo-brutalist.

### 5. Tarik Dana Tabungan (`/goals/withdraw`)
- **Withdraw Form**: Form input jumlah penarikan, tombol "Tarik Semua", pilihan tujuan dana, dan alasan.
- **Ringkasan Box**: Box ringkasan sisa saldo otomatis.
- **Danger Action**: Tombol `KONFIRMASI TARIK` (Merah `#BA1A1A` dengan pattern warning).

### 6. Add Transaction (`/transactions/create`)
- **Transaction Type Toggle**: Button toggle `Pemasukan` (Green `#4ADE80`) vs `Pengeluaran` (Red `#F87171`).
- **Centered Amount Input**: Input nominal angka ukuran besar di tengah.
- **Form Selectors**: Wallet dropdown, Date picker, Category chips (radio options: Jajan, Beli Kuota, Transportasi, Tagihan, Lainnya), Textarea catatan.

### 7. Financial Reports (`/reports`)
- **Category Filter Chips**: Filter kategori (`All`, `Pribadi`, `Bisnis`, `Investasi`).
- **Cashflow Bar Chart**: Grafik batang visualisasi pemasukan vs pengeluaran per bulan (JAN, FEB, MAR, APR).
- **Top Expenses**: Breakdown pengeluaran berdasarkan kategori dengan progress bar persentase.

### 8. WhatsApp Bot Settings (`/settings/whatsapp`)
- **Integration Card**: Form nomor handphone dengan prefix `+62` dan status pill `Belum Terhubung` (Yellow `#FDE047`).
- **Chat Preview Mockup**: Simulasi balon percakapan bot WhatsApp.
- **Instructions Steps**: 3 langkah mudah integrasi bot WA.

### 9. Login Screen (`/login`)
- **Centered NeoCard**: Card form login neo-brutalist dengan background grid dots.
- **Brand Header**: Header "RAW LOGIC / FINANCIAL CORE".
- **Inputs**: Email/Username input dengan icon mail, Password input dengan icon lock, dan Checkbox "INGAT SAYA DI PERANGKAT INI".
- **Primary Action**: Tombol `MASUK SEKARANG` (Primary Blue `#3B4CCA`).
- **Social Login**: Quick login via Google & GitHub.


