import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import MaterialIcon from '../Components/MaterialIcon';

export default function Welcome({ auth = {} }) {
  const user = auth?.user;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ai');
  const [openFaq, setOpenFaq] = useState(null);

  // Scroll & Animated Fixed Navbar State
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 25);

      // Scroll progress percentage calculation
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      setScrollProgress(scrolled);

      // Section highlight based on scroll position
      const sections = ['fitur', 'demo', 'cara-kerja', 'faq'];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 150) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Interactive AI Simulator State
  const [simulatedPrompt, setSimulatedPrompt] = useState('');
  const [simulatedResponse, setSimulatedResponse] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleRunSimulation = (promptText) => {
    setSimulatedPrompt(promptText);
    setIsSimulating(true);
    setSimulatedResponse(null);

    setTimeout(() => {
      setIsSimulating(false);
      const lower = promptText.toLowerCase();

      if (lower.includes('!saldo') || lower.includes('saldo')) {
        setSimulatedResponse({
          type: 'text',
          title: '💰 RINGKASAN SALDO SELURUH DOMPET',
          lines: [
            '• Rekening Utama (BCA) : Rp 14.500.000',
            '• DANA E-Wallet : Rp 850.000',
            '• Dompet Tunai (Cash) : Rp 420.000',
            '• Tabungan Darurat : Rp 8.000.000',
            '----------------------------------------',
            '💵 Total Saldo Gabungan : Rp 23.770.000',
            'Semua data tersinkronisasi otomatis.',
          ],
        });
      } else if (lower.includes('!target') || lower.includes('target') || lower.includes('nabung')) {
        setSimulatedResponse({
          type: 'text',
          title: '🎯 STATUS TARGET TABUNGAN (SAVINGS GOALS)',
          lines: [
            '🎯 Beli Motor Honda Vario 160',
            '  Progres : 70.0%',
            '  Terkumpul : Rp 21.000.000 dari Rp 30.000.000',
            '  Sisa yang dibutuhkan : Rp 9.000.000',
            '  Target Selesai : 31 Des 2026',
            '',
            '🎯 Liburan ke Bali Akhir Tahun',
            '  Progres : 45.0%',
            '  Terkumpul : Rp 4.500.000 dari Rp 10.000.000',
            '  Sisa yang dibutuhkan : Rp 5.500.000',
          ],
        });
      } else if (lower.includes('!rekap') || lower.includes('rekap') || lower.includes('bulan')) {
        setSimulatedResponse({
          type: 'text',
          title: '📊 REKAP KEUANGAN BULAN INI',
          lines: [
            '• Total Pemasukan : Rp 12.500.000',
            '• Total Pengeluaran : Rp 4.350.000',
            '• Arus Kas Bersih (Net) : Rp 8.150.000 (Surplus +)',
            '----------------------------------------',
            '💡 Tips: Arus kas Anda sehat! Alokasikan Rp 2.000.000 ke Target Tabungan Anda.',
          ],
        });
      } else {
        setSimulatedResponse({
          type: 'receipt',
          title: '📋 KONFIRMASI TRANSAKSI OTOMATIS',
          merchant: lower.includes('makan') ? 'Warung Nasi Padang' : lower.includes('bensin') ? 'SPBU Pertamina' : 'Indomaret Point',
          category: lower.includes('makan') ? 'Makanan & Minuman' : lower.includes('bensin') ? 'Transportasi & BBM' : 'Belanja Harian',
          amount: 'Rp 35.000',
          wallet: 'Dompet Utama',
          note: promptText,
          status: 'Siap Dicatat ke Database Real-time',
        });
      }
    }, 450);
  };

  const featureTabs = [
    {
      id: 'ai',
      label: 'AI ASSISTANT & SCAN STRUK',
      icon: 'smart_toy',
      color: '#FEF08A',
      title: 'Pencatatan Otomatis dengan Multi-Model AI & OCR Visual',
      desc: 'Cukup ketik kalimat sehari-hari atau foto struk fisik belanja Anda. AI Assistant akan mengekstrak nominal, toko, kategori, dan dompet secara instan dalam hitungan detik.',
      points: [
        'Multi-Model AI: OpenAI GPT-4o, Gemini 1.5, Claude 3.5, & DeepSeek V3.',
        'OCR Vision Scanner: Foto struk fisik langsung jadi transaksi rapi.',
        'Shortcut Perintah Cepat: Ketik !saldo, !target, !rekap, !transaksi.',
        'Engine Lokal Terintegrasi: Tetap berfungsi cepat tanpa ketergantungan API eksternal.',
      ],
      badge: 'FITUR UNGGULAN #1',
    },
    {
      id: 'wallet',
      label: 'MULTI-WALLET & DANA SYNC',
      icon: 'account_balance_wallet',
      color: '#DCFCE7',
      title: 'Semua Rekening, E-Wallet, dan Kas Tunai dalam Satu Layar',
      desc: 'Pisahkan uang kebutuhan, tabungan, dan usaha tanpa ribet. Pantau total saldo gabungan secara real-time dengan mutasi terperinci.',
      points: [
        'Kelola rekening bank (BCA, Mandiri, BRI, BNI), DANA, GoPay, OVO, dan Tunai.',
        'Fitur Budgeting & Rekonsiliasi saldo per dompet.',
        'Pengelompokan Wallet Group untuk alokasi dana yang lebih tertata.',
        'Riwayat transfer antar-dompet tercatat otomatis tanpa selisih.',
      ],
      badge: 'FINANCIAL HUB',
    },
    {
      id: 'goals',
      label: 'TARGET MENABUNG & KONSISTENSI',
      icon: 'savings',
      color: '#E7DEFF',
      title: 'Wujudkan Impian Finansial dengan Progres Visual yang Nyata',
      desc: 'Tetapkan impian Anda—mulai dari beli kendaraan, gadget impian, dana darurat, hingga liburan. Pantau persentase ketercapaian secara visual.',
      points: [
        'Progress bar interaktif dengan persentase ketercapaian real-time.',
        'Program Menabung Konsisten: Jadwal reminder harian, mingguan, bulanan.',
        'Kalkulator sisa dana otomatis berdasarkan target tanggal selesai.',
        'Deposit & Tarik dana tabungan fleksibel kapan saja.',
      ],
      badge: 'GOAL TRACKER',
    },
    {
      id: 'wa',
      label: 'WHATSAPP BOT INTEGRATION',
      icon: 'chat',
      color: '#DCFCE7',
      title: 'Catat Pengeluaran Langsung dari Chat WhatsApp',
      desc: 'Tak sempat buka aplikasi? Cukup kirim pesan singkat via WhatsApp seperti "Makan siang 25rb" ke Bot VIRA dan transaksi langsung tersimpan rapi.',
      points: [
        'Terhubung via WhatsApp Gateway resmi.',
        'Notifikasi pengingat menabung otomatis masuk ke nomor WA Anda.',
        'Laporan ringkasan harian & mingguan dikirim langsung ke WhatsApp.',
        'Sangat mudah digunakan saat bepergian atau transaksi di kasir.',
      ],
      badge: 'CHAT INTEGRATION',
    },
    {
      id: 'reports',
      label: 'LAPORAN & EMAS LIVE RATE',
      icon: 'analytics',
      color: '#FFDAD6',
      title: 'Visualisasi Cashflow Presisi & Tracking Aset Emas Logam Mulia',
      desc: 'Ketahui ke mana perginya setiap rupiah Anda dengan grafik interaktif, analisis kategori pengeluaran, serta grafik harga emas live Antam.',
      points: [
        'Grafik pemasukan vs pengeluaran bulanan & tahunan.',
        'Breakdown kategori pengeluaran terbesar untuk deteksi pemborosan.',
        'Pantau portofolio tabungan emas Antam dengan update harga per gram real-time.',
        'Ekspor laporan mutasi ke berbagai format.',
      ],
      badge: 'ANALYTICS & ASSET',
    },
  ];

  const faqs = [
    {
      q: 'Apakah VIRA gratis untuk digunakan?',
      a: 'Ya! VIRA dapat digunakan 100% gratis. Anda mendapatkan akses penuh ke fitur pencatatan multi-wallet, target tabungan, laporan keuangan, dan asisten AI pintar.',
    },
    {
      q: 'Bagaimana cara AI Assistant membaca foto struk belanja?',
      a: 'VIRA dilengkapi teknologi Vision AI OCR. Anda cukup mengunggah foto struk belanja dari kamera HP atau galeri. AI akan otomatis memindai teks struk, mengenali nama merchant/toko, mendeteksi kategori, dan mengambil total nominal pembayaran.',
    },
    {
      q: 'Apakah aplikasi ini bisa diakses di smartphone (HP)?',
      a: 'Tentu saja! VIRA dirancang dengan teknologi PWA (Progressive Web App) yang sangat responsif. Anda dapat memasang VIRA di layar utama (homescreen) Android maupun iOS layaknya aplikasi native tanpa perlu mendownload dari Play Store / App Store.',
    },
    {
      q: 'Bagaimana keamanan data keuangan saya?',
      a: 'Keamanan adalah prioritas utama kami. VIRA menggunakan autentikasi terenkripsi Google OAuth 2.0 berstandar industri serta enkripsi data tingkat lanjut. Data Anda bersifat pribadi dan hanya dapat diakses oleh akun Anda.',
    },
    {
      q: 'Apa itu perintah shortcut tanda seru (!) pada AI?',
      a: 'Perintah shortcut adalah cara instan berinteraksi dengan AI tanpa perlu mengetik panjang. Contohnya: ketik !saldo untuk melihat seluruh saldo dompet, !target untuk cek tabungan, !rekap untuk ringkasan bulan ini, atau !help untuk melihat panduan lengkap.',
    },
  ];

  const currentTab = featureTabs.find((t) => t.id === activeTab) || featureTabs[0];

  return (
    <div className="min-h-screen bg-[#FDF8FF] text-[#1C1A27] font-body-md selection:bg-[#3B4CCA] selection:text-white antialiased overflow-x-hidden">
      <Head title="VIRA - Catat Keuangan Cerdas Berbasis AI, Multi-Wallet & Target Tabungan" />

      {/* =========================================================================
          1. ANIMATED FIXED FLOATING NAVBAR (SCROLL-AWARE NEO-BRUTALISM)
          ========================================================================= */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none transition-all duration-300 ease-out">
        {/* Top Scroll Progress Line */}
        <div
          className="h-1 bg-[#8B5CF6] transition-all duration-100 ease-out pointer-events-auto"
          style={{ width: `${scrollProgress}%` }}
        />

        {/* Floating Navbar Container */}
        <header
          className={`pointer-events-auto transition-all duration-300 ease-out ${
            isScrolled
              ? 'w-[94%] sm:w-[90%] max-w-6xl mx-auto mt-2 sm:mt-3.5 px-3.5 sm:px-6 py-2 sm:py-2.5 bg-white/95 backdrop-blur-xl border-3 sm:border-4 border-[#1C1A27] shadow-[5px_5px_0px_0px_#1C1A27] rounded-xl'
              : 'w-full bg-white/95 backdrop-blur-md border-b-4 border-[#1C1A27] px-4 sm:px-8 py-3.5 sm:py-4 shadow-[0_3px_0_0_#1C1A27]'
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo Brand with Hover Bounce */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div
                className={`bg-[#FEF08A] border-3 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] flex items-center justify-center font-black text-[#1C1A27] group-hover:-translate-y-0.5 group-hover:rotate-6 transition-all ${
                  isScrolled ? 'w-8 h-8 sm:w-9 sm:h-9 text-lg' : 'w-10 h-10 sm:w-11 sm:h-11 text-xl'
                }`}
              >
                <MaterialIcon name="savings" className={isScrolled ? 'text-xl' : 'text-2xl'} />
              </div>
              <div>
                <span
                  className={`font-headline-md font-black tracking-tighter text-[#1C1A27] uppercase block leading-none transition-all ${
                    isScrolled ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
                  }`}
                >
                  VIRA
                </span>
                <span className="font-label-mono text-[8px] sm:text-[9px] uppercase font-black tracking-widest text-[#8B5CF6] block">
                  FINANCIAL AI ASSISTANT
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links with Active Indicator */}
            <nav className="hidden lg:flex items-center gap-1 sm:gap-2 font-label-mono text-xs font-black uppercase text-[#1C1A27]">
              <a
                href="#fitur"
                className={`px-3 py-1.5 border-2 transition-all ${
                  activeSection === 'fitur'
                    ? 'bg-[#FEF08A] border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] text-[#1C1A27]'
                    : 'border-transparent hover:border-[#1C1A27] hover:bg-[#F1EBFE]'
                }`}
              >
                Fitur Utama
              </a>
              <a
                href="#demo"
                className={`px-3 py-1.5 border-2 transition-all ${
                  activeSection === 'demo'
                    ? 'bg-[#FEF08A] border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] text-[#1C1A27]'
                    : 'border-transparent hover:border-[#1C1A27] hover:bg-[#F1EBFE]'
                }`}
              >
                Coba AI Live
              </a>
              <a
                href="#cara-kerja"
                className={`px-3 py-1.5 border-2 transition-all ${
                  activeSection === 'cara-kerja'
                    ? 'bg-[#FEF08A] border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] text-[#1C1A27]'
                    : 'border-transparent hover:border-[#1C1A27] hover:bg-[#F1EBFE]'
                }`}
              >
                Cara Kerja
              </a>
              <a
                href="#faq"
                className={`px-3 py-1.5 border-2 transition-all ${
                  activeSection === 'faq'
                    ? 'bg-[#FEF08A] border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] text-[#1C1A27]'
                    : 'border-transparent hover:border-[#1C1A27] hover:bg-[#F1EBFE]'
                }`}
              >
                FAQ
              </a>
            </nav>

            {/* Action Buttons */}
            <div className="hidden sm:flex items-center gap-2.5">
              {user ? (
                <Link
                  href="/dashboard"
                  className="bg-[#3B4CCA] hover:bg-[#2A379D] text-white border-3 border-[#1C1A27] shadow-[3px_3px_0px_0px_#1C1A27] px-3.5 sm:px-4 py-1.5 sm:py-2 font-label-mono text-xs uppercase font-black flex items-center gap-1.5 transition-all active:translate-y-0.5"
                >
                  <span>Dashboard</span>
                  <MaterialIcon name="arrow_forward" className="text-sm" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="bg-white hover:bg-[#F1EBFE] text-[#1C1A27] border-3 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] px-3 py-1.5 sm:py-2 font-label-mono text-xs uppercase font-black transition-all active:translate-y-0.5"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="bg-[#FEF08A] hover:bg-[#FACC15] text-[#1C1A27] border-3 border-[#1C1A27] shadow-[3px_3px_0px_0px_#1C1A27] px-3.5 sm:px-4 py-1.5 sm:py-2 font-label-mono text-xs uppercase font-black flex items-center gap-1 transition-all active:translate-y-0.5"
                  >
                    <span>Mulai Gratis</span>
                    <MaterialIcon name="bolt" className="text-sm text-[#854D0E]" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden w-9 h-9 bg-white border-2 sm:border-3 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] flex items-center justify-center cursor-pointer active:translate-y-0.5"
              aria-label="Menu"
            >
              <MaterialIcon name={mobileMenuOpen ? 'close' : 'menu'} className="text-xl font-bold" />
            </button>
          </div>

          {/* Mobile Dropdown Menu with Animation */}
          {mobileMenuOpen && (
            <div className="sm:hidden border-t-3 border-[#1C1A27] mt-2.5 pt-2.5 pb-1.5 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <nav className="flex flex-col gap-1.5 font-label-mono text-xs font-black uppercase">
                <a
                  href="#fitur"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2 border-2 border-[#1C1A27] ${
                    activeSection === 'fitur' ? 'bg-[#FEF08A]' : 'bg-[#FDF8FF] hover:bg-[#FEF08A]'
                  }`}
                >
                  ✨ Fitur Utama
                </a>
                <a
                  href="#demo"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2 border-2 border-[#1C1A27] ${
                    activeSection === 'demo' ? 'bg-[#FEF08A]' : 'bg-[#FDF8FF] hover:bg-[#FEF08A]'
                  }`}
                >
                  ⚡ Coba AI Live
                </a>
                <a
                  href="#cara-kerja"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2 border-2 border-[#1C1A27] ${
                    activeSection === 'cara-kerja' ? 'bg-[#FEF08A]' : 'bg-[#FDF8FF] hover:bg-[#FEF08A]'
                  }`}
                >
                  🛠️ Cara Kerja
                </a>
                <a
                  href="#faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2 border-2 border-[#1C1A27] ${
                    activeSection === 'faq' ? 'bg-[#FEF08A]' : 'bg-[#FDF8FF] hover:bg-[#FEF08A]'
                  }`}
                >
                  ❓ FAQ
                </a>
              </nav>
              <div className="pt-1.5 flex flex-col gap-1.5">
                {user ? (
                  <Link
                    href="/dashboard"
                    className="w-full text-center bg-[#3B4CCA] text-white border-2 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] py-2 font-label-mono text-xs uppercase font-black"
                  >
                    Buka Dashboard ({user.name})
                  </Link>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/login"
                      className="text-center bg-white text-[#1C1A27] border-2 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] py-1.5 font-label-mono text-xs uppercase font-black"
                    >
                      Masuk
                    </Link>
                    <Link
                      href="/register"
                      className="text-center bg-[#FEF08A] text-[#1C1A27] border-2 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] py-1.5 font-label-mono text-xs uppercase font-black"
                    >
                      Daftar ⚡
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </header>
      </div>

      {/* =========================================================================
          2. HERO SECTION (BOLD NEO-BRUTALISM WITH LIVE INTERACTIVE PREVIEW)
          ========================================================================= */}
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-8 bg-[radial-gradient(#D5D4E6_1px,transparent_1px)] [background-size:24px_24px] border-b-4 border-[#1C1A27]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Top Badges */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="bg-[#FEF08A] text-[#1C1A27] border-3 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] px-3 py-1 font-label-mono text-[10px] sm:text-xs uppercase font-black flex items-center gap-1.5">
                <MaterialIcon name="bolt" className="text-sm text-[#854D0E]" />
                GENERASI BARU PENCATAT KEUANGAN
              </span>
              <span className="bg-[#DCFCE7] text-[#166534] border-3 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] px-2.5 py-1 font-label-mono text-[10px] sm:text-xs uppercase font-black flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping mr-1" />
                100% GRATIS & AMAN
              </span>
            </div>

            {/* Massive Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-headline-md font-black text-[#1C1A27] uppercase tracking-tight leading-[1.08]">
              CATAT KEUANGAN <span className="bg-[#8B5CF6] text-white px-2 py-0.5 inline-block -rotate-1 border-3 border-[#1C1A27] shadow-[4px_4px_0px_0px_#1C1A27]">OTOMATIS</span> DENGAN KEKUATAN AI.
            </h1>

            {/* Subtitle */}
            <p className="font-body-md text-sm sm:text-base md:text-lg text-[#374151] font-bold leading-relaxed max-w-2xl">
              Kelola seluruh rekening bank, e-wallet, dan kas tunai dalam satu platform. Cukup ketik kalimat sehari-hari atau foto struk belanja—AI Assistant VIRA akan mencatat semuanya secara presisi.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-wrap gap-3 sm:gap-4 pt-2">
              <Link
                href={user ? '/dashboard' : '/register'}
                className="bg-[#FEF08A] hover:bg-[#FACC15] text-[#1C1A27] border-4 border-[#1C1A27] shadow-[5px_5px_0px_0px_#1C1A27] px-6 sm:px-8 py-3.5 sm:py-4 font-label-mono text-sm sm:text-base uppercase font-black flex items-center gap-2 hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
              >
                <span>{user ? 'Buka Dashboard Saya' : 'Mulai Sekarang Gratis'}</span>
                <MaterialIcon name="arrow_forward" className="text-xl" />
              </Link>
              <a
                href="#demo"
                className="bg-white hover:bg-[#F1EBFE] text-[#1C1A27] border-4 border-[#1C1A27] shadow-[5px_5px_0px_0px_#1C1A27] px-5 sm:px-7 py-3.5 sm:py-4 font-label-mono text-sm sm:text-base uppercase font-black flex items-center gap-2 hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
              >
                <MaterialIcon name="play_circle" className="text-xl text-[#8B5CF6]" />
                <span>Coba Demo AI</span>
              </a>
            </div>

            {/* Social Trust Metrics */}
            <div className="pt-4 border-t-3 border-[#1C1A27]/20 flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-label-mono font-black text-[#454654]">
              <div className="flex items-center gap-1.5">
                <MaterialIcon name="verified_user" className="text-base text-[#16A34A]" />
                <span>Google OAuth 2.0 Ready</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MaterialIcon name="phone_iphone" className="text-base text-[#3B4CCA]" />
                <span>Install PWA di Android / iOS</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MaterialIcon name="security" className="text-base text-[#8B5CF6]" />
                <span>Enkripsi Database Aman</span>
              </div>
            </div>
          </div>

          {/* Hero Right Visual Mockup Showcase */}
          <div className="lg:col-span-5 relative">
            {/* Background Accent Card */}
            <div className="absolute inset-0 bg-[#8B5CF6] border-4 border-[#1C1A27] translate-x-3 translate-y-3 shadow-[6px_6px_0px_0px_#1C1A27]" />

            {/* Main Interactive Card */}
            <div className="relative bg-white border-4 border-[#1C1A27] p-5 sm:p-6 space-y-4">
              {/* Header Mockup */}
              <div className="flex items-center justify-between border-b-3 border-[#1C1A27] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#3B4CCA] text-white border-2 border-[#1C1A27] flex items-center justify-center font-bold">
                    <MaterialIcon name="smart_toy" className="text-lg" />
                  </div>
                  <div>
                    <span className="font-headline-md text-xs sm:text-sm font-black text-[#1C1A27] uppercase block leading-none">
                      VIRA AI LIVE PREVIEW
                    </span>
                    <span className="text-[9px] font-label-mono text-[#16A34A] font-black uppercase">
                      ● ONLINE • GPT-4o & GEMINI
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-label-mono bg-[#FEF08A] border border-[#1C1A27] px-2 py-0.5 font-black uppercase">
                  SIMULASI
                </span>
              </div>

              {/* Chat Simulation Bubble */}
              <div className="space-y-3 font-body-md text-xs">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-[#8B5CF6] text-white border-2 border-[#1C1A27] p-2.5 max-w-[85%] font-bold shadow-[2px_2px_0px_0px_#1C1A27]">
                    <p>Makan siang sate ayam 35rb dari Dompet Utama</p>
                  </div>
                </div>

                {/* AI Response Card */}
                <div className="bg-[#FDF8FF] border-3 border-[#1C1A27] p-3 shadow-[3px_3px_0px_0px_#1C1A27] space-y-2">
                  <div className="flex items-center justify-between border-b border-dashed border-[#1C1A27]/40 pb-1.5">
                    <span className="font-label-mono text-[10px] font-black uppercase text-[#1C1A27] flex items-center gap-1">
                      <MaterialIcon name="check_circle" className="text-sm text-[#16A34A]" />
                      STRUK TRANSAKSI TERDETEKSI
                    </span>
                    <span className="text-[9px] font-label-mono bg-[#FFDAD6] text-[#93000A] px-1.5 py-0.2 border border-[#1C1A27] font-black">
                      - PENGELUARAN
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                    <div>
                      <span className="text-[#6B7280] block text-[9px] font-label-mono">KATEGORI</span>
                      <span>Makanan & Minuman</span>
                    </div>
                    <div>
                      <span className="text-[#6B7280] block text-[9px] font-label-mono">NOMINAL</span>
                      <span className="text-[#DC2626] font-black font-number-xl">Rp 35.000</span>
                    </div>
                    <div>
                      <span className="text-[#6B7280] block text-[9px] font-label-mono">DOMPET</span>
                      <span>Dompet Utama</span>
                    </div>
                    <div>
                      <span className="text-[#6B7280] block text-[9px] font-label-mono">STATUS</span>
                      <span className="text-[#16A34A]">Tersimpan Otomatis</span>
                    </div>
                  </div>
                </div>

                {/* Mini Wallet Status Bar */}
                <div className="bg-[#DCFCE7] border-2 border-[#1C1A27] p-2.5 flex items-center justify-between shadow-[2px_2px_0px_0px_#1C1A27]">
                  <div className="flex items-center gap-1.5">
                    <MaterialIcon name="savings" className="text-base text-[#166534]" />
                    <span className="font-label-mono text-[10px] font-black text-[#166534] uppercase">
                      TARGET: MOTOR BARU (70%)
                    </span>
                  </div>
                  <span className="font-label-mono text-[10px] font-black text-[#166534]">
                    Rp 21jt / Rp 30jt
                  </span>
                </div>
              </div>

              {/* Action Banner */}
              <div className="pt-2 text-center">
                <Link
                  href="/register"
                  className="w-full block bg-[#3B4CCA] hover:bg-[#2A379D] text-white border-2 border-[#1C1A27] py-2 font-label-mono text-xs uppercase font-black shadow-[2px_2px_0px_0px_#1C1A27] active:translate-y-0.5 transition-all"
                >
                  Coba Gratis Sekarang ➔
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. MARQUEE / TICKER BANNER (HIGH-CONTRAST NEO BRUTALISM)
          ========================================================================= */}
      <div className="bg-[#1C1A27] text-[#FEF08A] border-b-4 border-[#1C1A27] py-3 overflow-hidden select-none">
        <div className="flex whitespace-nowrap gap-8 animate-none sm:justify-around font-label-mono text-xs sm:text-sm font-black tracking-wider uppercase">
          <span>⚡ MULTI-MODEL AI (GPT-4o / GEMINI / CLAUDE)</span>
          <span>•</span>
          <span>📷 SCAN FOTO STRUK BELANJA OCR</span>
          <span>•</span>
          <span>💰 MULTI-WALLET & DANA SYNC</span>
          <span>•</span>
          <span>🎯 SAVINGS GOAL & KONSISTENSI</span>
          <span>•</span>
          <span>📲 INTEGRASI WHATSAPP BOT</span>
          <span>•</span>
          <span>📊 LAPORAN CASHFLOW & EMAS</span>
        </div>
      </div>

      {/* =========================================================================
          4. FEATURE SHOWCASE TABS SECTION (#fitur)
          ========================================================================= */}
      <section id="fitur" className="py-16 sm:py-24 px-4 sm:px-8 bg-white border-b-4 border-[#1C1A27]">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Section Heading */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="bg-[#E7DEFF] text-[#6D28D9] border-2 border-[#1C1A27] px-3 py-1 font-label-mono text-xs uppercase font-black shadow-[2px_2px_0px_0px_#1C1A27]">
              FITUR UTAMA & KEMAMPUAN
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl mt-5 font-headline-md font-black text-[#1C1A27] uppercase tracking-tight">
              SEMUA YANG ANDA BUTUHKAN UNTUK KEUANGAN RAPI.
            </h2>
            <p className="font-body-md text-sm sm:text-base text-[#4B5563] font-bold">
              Dirancang untuk kemudahan maksimal tanpa proses pencatatan manual yang membosankan.
            </p>
          </div>

          {/* Feature Tab Buttons */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {featureTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 sm:px-5 py-2.5 sm:py-3 border-3 border-[#1C1A27] font-label-mono text-xs sm:text-sm uppercase font-black transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-[#3B4CCA] text-white shadow-[4px_4px_0px_0px_#1C1A27] -translate-y-0.5'
                      : 'bg-[#FDF8FF] text-[#1C1A27] hover:bg-[#F1EBFE] shadow-[2px_2px_0px_0px_#1C1A27]'
                  }`}
                >
                  <MaterialIcon name={tab.icon} className="text-base sm:text-lg" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Showcase Card */}
          <div className="bg-[#FDF8FF] border-4 border-[#1C1A27] shadow-[6px_6px_0px_0px_#1C1A27] p-6 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Details */}
              <div className="lg:col-span-7 space-y-5">
                <span
                  className="inline-block border-2 border-[#1C1A27] px-3 py-1 font-label-mono text-xs font-black uppercase shadow-[2px_2px_0px_0px_#1C1A27]"
                  style={{ backgroundColor: currentTab.color }}
                >
                  {currentTab.badge}
                </span>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-headline-md font-black text-[#1C1A27] uppercase tracking-tight">
                  {currentTab.title}
                </h3>
                <p className="font-body-md text-sm sm:text-base text-[#374151] font-bold leading-relaxed">
                  {currentTab.desc}
                </p>

                {/* Bullet Points */}
                <div className="space-y-2.5 pt-2">
                  {currentTab.points.map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-[#FEF08A] border-2 border-[#1C1A27] flex items-center justify-center shrink-0 mt-0.5 shadow-[1px_1px_0px_0px_#1C1A27]">
                        <MaterialIcon name="check" className="text-sm font-black text-[#1C1A27]" />
                      </div>
                      <span className="font-body-md text-xs sm:text-sm font-bold text-[#1C1A27]">{pt}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 bg-[#1C1A27] hover:bg-[#3B4CCA] text-white border-3 border-[#1C1A27] px-5 py-3 font-label-mono text-xs uppercase font-black shadow-[3px_3px_0px_0px_#8B5CF6] transition-all"
                  >
                    <span>Mulai Gunakan Fitur Ini</span>
                    <MaterialIcon name="arrow_forward" className="text-sm" />
                  </Link>
                </div>
              </div>

              {/* Right Decorative Feature Card */}
              <div className="lg:col-span-5 bg-white border-4 border-[#1C1A27] shadow-[4px_4px_0px_0px_#1C1A27] p-6 space-y-4">
                <div className="w-12 h-12 bg-[#FEF08A] border-3 border-[#1C1A27] flex items-center justify-center shadow-[3px_3px_0px_0px_#1C1A27]">
                  <MaterialIcon name={currentTab.icon} className="text-2xl text-[#1C1A27]" />
                </div>
                <h4 className="font-headline-md text-lg font-black uppercase text-[#1C1A27]">
                  {currentTab.label}
                </h4>
                <div className="bg-[#F1EBFE] border-2 border-[#1C1A27] p-4 text-xs font-label-mono font-bold leading-relaxed">
                  <p className="text-[#6D28D9] mb-1 font-black">⚡ HIGHLIGHT TEKNIS:</p>
                  <p className="text-[#1C1A27]">
                    Sistem dirancang dengan arsitektur reaktif (Laravel + Inertia + React) yang menjamin performa cepat, tanpa reload halaman, dan responsif di semua ukuran layar.
                  </p>
                </div>
                <div className="flex items-center justify-between text-[11px] font-label-mono font-black pt-2 border-t-2 border-[#1C1A27]">
                  <span>STATUS FITUR:</span>
                  <span className="bg-[#DCFCE7] text-[#166534] px-2 py-0.5 border border-[#1C1A27]">
                    AKTIF & TERUJI
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. LIVE INTERACTIVE AI SIMULATOR PLAYGROUND (#demo)
          ========================================================================= */}
      <section id="demo" className="py-16 sm:py-24 px-4 sm:px-8 bg-[#F1EBFE] border-b-4 border-[#1C1A27]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <span className="bg-[#FEF08A] text-[#854D0E] border-2 border-[#1C1A27] px-3 py-1 font-label-mono text-xs uppercase font-black shadow-[2px_2px_0px_0px_#1C1A27]">
              SIMULATOR INTERAKTIF
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl mt-5 font-headline-md font-black text-[#1C1A27] uppercase tracking-tight">
              COBA KECERDASAN AI ASSISTANT SEKARANG
            </h2>
            <p className="font-body-md text-sm sm:text-base text-[#4B5563] font-bold max-w-2xl mx-auto">
              Klik salah satu contoh perintah di bawah ini untuk melihat bagaimana AI VIRA memproses permintaan Anda secara instan:
            </p>
          </div>

          {/* Quick Clickable Buttons */}
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => handleRunSimulation('!saldo')}
              className="bg-white hover:bg-[#FEF08A] border-3 border-[#1C1A27] px-3.5 py-2 font-label-mono text-xs uppercase font-black shadow-[2px_2px_0px_0px_#1C1A27] flex items-center gap-1.5 cursor-pointer active:translate-y-0.5 transition-all"
            >
              <span>💰 !saldo</span>
              <span className="text-[10px] text-[#6B7280] font-normal">(Cek Semua Dompet)</span>
            </button>
            <button
              type="button"
              onClick={() => handleRunSimulation('!target')}
              className="bg-white hover:bg-[#E7DEFF] border-3 border-[#1C1A27] px-3.5 py-2 font-label-mono text-xs uppercase font-black shadow-[2px_2px_0px_0px_#1C1A27] flex items-center gap-1.5 cursor-pointer active:translate-y-0.5 transition-all"
            >
              <span>🎯 !target</span>
              <span className="text-[10px] text-[#6B7280] font-normal">(Cek Progres Tabungan)</span>
            </button>
            <button
              type="button"
              onClick={() => handleRunSimulation('!rekap')}
              className="bg-white hover:bg-[#DCFCE7] border-3 border-[#1C1A27] px-3.5 py-2 font-label-mono text-xs uppercase font-black shadow-[2px_2px_0px_0px_#1C1A27] flex items-center gap-1.5 cursor-pointer active:translate-y-0.5 transition-all"
            >
              <span>📊 !rekap</span>
              <span className="text-[10px] text-[#6B7280] font-normal">(Cashflow Bulan Ini)</span>
            </button>
            <button
              type="button"
              onClick={() => handleRunSimulation('Makan siang nasi padang 35rb')}
              className="bg-white hover:bg-[#FFDAD6] border-3 border-[#1C1A27] px-3.5 py-2 font-label-mono text-xs uppercase font-black shadow-[2px_2px_0px_0px_#1C1A27] flex items-center gap-1.5 cursor-pointer active:translate-y-0.5 transition-all"
            >
              <span>🍔 Makan siang 35rb</span>
              <span className="text-[10px] text-[#6B7280] font-normal">(Catat Pengeluaran)</span>
            </button>
          </div>

          {/* Interactive Playground Card */}
          <div className="bg-white border-4 border-[#1C1A27] shadow-[6px_6px_0px_0px_#1C1A27] p-5 sm:p-8 space-y-4">
            {/* Input Bar inside Playground */}
            <div className="flex gap-2">
              <input
                type="text"
                value={simulatedPrompt}
                onChange={(e) => setSimulatedPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && simulatedPrompt.trim()) {
                    handleRunSimulation(simulatedPrompt);
                  }
                }}
                placeholder="Ketik misalnya: !saldo, !target, atau Beli bensin 50rb..."
                className="flex-1 border-3 border-[#1C1A27] px-4 py-3 font-body-md font-bold text-sm text-[#1C1A27] focus:outline-none shadow-[2px_2px_0px_0px_#1C1A27]"
              />
              <button
                type="button"
                onClick={() => {
                  if (simulatedPrompt.trim()) {
                    handleRunSimulation(simulatedPrompt);
                  }
                }}
                className="bg-[#3B4CCA] hover:bg-[#2A379D] text-white border-3 border-[#1C1A27] px-5 py-3 font-label-mono text-xs uppercase font-black shadow-[2px_2px_0px_0px_#1C1A27] active:translate-y-0.5 transition-all cursor-pointer"
              >
                Kirim ↵
              </button>
            </div>

            {/* Output Display Area */}
            <div className="min-h-[160px] bg-[#FDF8FF] border-3 border-[#1C1A27] p-4 flex flex-col justify-center">
              {isSimulating && (
                <div className="flex flex-col items-center justify-center py-6 gap-2">
                  <div className="w-8 h-8 border-3 border-[#1C1A27] border-t-[#8B5CF6] rounded-full animate-spin" />
                  <span className="font-label-mono text-xs font-black uppercase text-[#454654] animate-pulse">
                    AI sedang memproses data...
                  </span>
                </div>
              )}

              {!isSimulating && !simulatedResponse && (
                <div className="text-center text-[#6B7280] font-body-md text-xs sm:text-sm font-bold py-4">
                  💡 Klik salah satu tombol prompt di atas atau ketik pesan Anda untuk mencoba simulasi AI.
                </div>
              )}

              {!isSimulating && simulatedResponse && (
                <div className="animate-in fade-in zoom-in-95 space-y-3">
                  <div className="flex items-center justify-between border-b-2 border-[#1C1A27] pb-2">
                    <span className="font-headline-md text-xs sm:text-sm font-black text-[#1C1A27] uppercase">
                      {simulatedResponse.title}
                    </span>
                    <span className="text-[9px] font-label-mono bg-[#DCFCE7] text-[#166534] px-1.5 py-0.5 border border-[#1C1A27] font-black uppercase">
                      HASIL REALTIME
                    </span>
                  </div>

                  {simulatedResponse.type === 'text' && (
                    <div className="font-label-mono text-xs text-[#1C1A27] font-bold space-y-1 bg-white p-3 border-2 border-[#1C1A27]">
                      {simulatedResponse.lines.map((line, i) => (
                        <p key={i} className="leading-relaxed">{line}</p>
                      ))}
                    </div>
                  )}

                  {simulatedResponse.type === 'receipt' && (
                    <div className="bg-white border-2 border-[#1C1A27] p-3 space-y-2 font-body-md text-xs font-bold">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[#6B7280] block text-[9px] font-label-mono">MERCHANT</span>
                          <span className="text-[#1C1A27]">{simulatedResponse.merchant}</span>
                        </div>
                        <div>
                          <span className="text-[#6B7280] block text-[9px] font-label-mono">NOMINAL</span>
                          <span className="text-[#DC2626] font-number-xl text-sm font-black">{simulatedResponse.amount}</span>
                        </div>
                        <div>
                          <span className="text-[#6B7280] block text-[9px] font-label-mono">KATEGORI</span>
                          <span className="text-[#8B5CF6]">{simulatedResponse.category}</span>
                        </div>
                        <div>
                          <span className="text-[#6B7280] block text-[9px] font-label-mono">DOMPET</span>
                          <span className="text-[#3B4CCA]">{simulatedResponse.wallet}</span>
                        </div>
                      </div>
                      <div className="text-[10px] font-label-mono text-[#16A34A] pt-1 border-t border-dashed border-[#1C1A27]/30">
                        ✓ {simulatedResponse.status}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. HOW IT WORKS / 3 LANGKAH MUDAH (#cara-kerja)
          ========================================================================= */}
      <section id="cara-kerja" className="py-16 sm:py-24 px-4 sm:px-8 bg-white border-b-4 border-[#1C1A27]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="bg-[#DCFCE7] text-[#166534] border-2 border-[#1C1A27] px-3 py-1 font-label-mono text-xs uppercase font-black shadow-[2px_2px_0px_0px_#1C1A27]">
              LANGKAH SEDERHANA
            </span>
            <h2 className="text-3xl sm:text-4xl mt-5 md:text-5xl font-headline-md font-black text-[#1C1A27] uppercase tracking-tight">
              3 LANGKAH MUDAH MEMULAI
            </h2>
            <p className="font-body-md text-sm sm:text-base text-[#4B5563] font-bold">
              Tanpa konfigurasi rumit. Mulai catat keuangan dalam kurang dari 1 menit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Step 1 */}
            <div className="bg-[#FDF8FF] border-4 border-[#1C1A27] shadow-[5px_5px_0px_0px_#1C1A27] p-6 sm:p-8 space-y-4 relative">
              <div className="w-12 h-12 bg-[#FEF08A] border-3 border-[#1C1A27] flex items-center justify-center font-headline-md font-black text-2xl shadow-[3px_3px_0px_0px_#1C1A27]">
                1
              </div>
              <h3 className="text-xl font-headline-md font-black text-[#1C1A27] uppercase">
                DAFTAR AKUN 1-KLIK
              </h3>
              <p className="font-body-md text-xs sm:text-sm text-[#4B5563] font-bold leading-relaxed">
                Gunakan akun Google Anda untuk registrasi instan tanpa repot verifikasi manual atau masukkan email secara mandiri.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#FDF8FF] border-4 border-[#1C1A27] shadow-[5px_5px_0px_0px_#1C1A27] p-6 sm:p-8 space-y-4 relative">
              <div className="w-12 h-12 bg-[#E7DEFF] border-3 border-[#1C1A27] flex items-center justify-center font-headline-md font-black text-2xl shadow-[3px_3px_0px_0px_#1C1A27]">
                2
              </div>
              <h3 className="text-xl font-headline-md font-black text-[#1C1A27] uppercase">
                ATUR DOMPET & TARGET
              </h3>
              <p className="font-body-md text-xs sm:text-sm text-[#4B5563] font-bold leading-relaxed">
                Tambahkan rekening bank, DANA e-wallet, atau kas tunai Anda, serta buat target tabungan impian yang ingin Anda capai.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#FDF8FF] border-4 border-[#1C1A27] shadow-[5px_5px_0px_0px_#1C1A27] p-6 sm:p-8 space-y-4 relative">
              <div className="w-12 h-12 bg-[#DCFCE7] border-3 border-[#1C1A27] flex items-center justify-center font-headline-md font-black text-2xl shadow-[3px_3px_0px_0px_#1C1A27]">
                3
              </div>
              <h3 className="text-xl font-headline-md font-black text-[#1C1A27] uppercase">
                CATAT VIA CHAT & FOTO
              </h3>
              <p className="font-body-md text-xs sm:text-sm text-[#4B5563] font-bold leading-relaxed">
                Ketik pengeluaran santai ke AI Assistant atau upload foto struk kasir—keuangan Anda langsung rapi otomatis!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. FAQ ACCORDION SECTION (#faq)
          ========================================================================= */}
      <section id="faq" className="py-16 sm:py-24 px-4 sm:px-8 bg-[#FDF8FF] border-b-4 border-[#1C1A27]">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span className="bg-[#FEF08A] text-[#854D0E] border-2 border-[#1C1A27] px-3 py-1 font-label-mono text-xs uppercase font-black shadow-[2px_2px_0px_0px_#1C1A27]">
              PERTANYAAN POPULER
            </span>
            <h2 className="text-3xl sm:text-4xl  mt-5 md:text-5xl font-headline-md font-black text-[#1C1A27] uppercase tracking-tight">
              FREQUENTLY ASKED QUESTIONS
            </h2>
            <p className="font-body-md text-sm sm:text-base text-[#4B5563] font-bold">
              Jawaban atas pertanyaan umum seputar fitur, AI, dan keamanan VIRA.
            </p>
          </div>

          {/* Accordion Items */}
          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border-3 border-[#1C1A27] shadow-[4px_4px_0px_0px_#1C1A27] transition-all overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-headline-md text-sm sm:text-base font-black text-[#1C1A27] uppercase cursor-pointer hover:bg-[#F1EBFE]"
                  >
                    <span>{faq.q}</span>
                    <MaterialIcon
                      name={isOpen ? 'expand_less' : 'expand_more'}
                      className="text-2xl font-black shrink-0 text-[#3B4CCA]"
                    />
                  </button>
                  {isOpen && (
                    <div className="p-4 sm:p-5 pt-0 border-t-2 border-dashed border-[#1C1A27]/30 font-body-md text-xs sm:text-sm text-[#374151] font-bold leading-relaxed animate-in fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. CALL TO ACTION BOTTOM BANNER
          ========================================================================= */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 bg-[#8B5CF6] text-white border-b-4 border-[#1C1A27] relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <span className="bg-[#FEF08A] text-[#1C1A27] border-3 border-[#1C1A27] px-4 py-1.5 font-label-mono text-xs uppercase font-black shadow-[3px_3px_0px_0px_#1C1A27] inline-block">
            🚀 MULAI LANGKAH CERDAS SEKARANG
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-headline-md font-black uppercase tracking-tight text-white leading-tight">
            KENDALIKAN KEUANGAN ANDA HARI INI DENGAN VIRA.
          </h2>
          <p className="font-body-md text-sm sm:text-base md:text-lg text-white/90 font-bold max-w-2xl mx-auto leading-relaxed">
            Bergabunglah sekarang dan rasakan betapa menyenangkannya mencatat keuangan dengan bantuan AI asisten pribadi.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              href={user ? '/dashboard' : '/register'}
              className="bg-[#FEF08A] hover:bg-[#FACC15] text-[#1C1A27] border-4 border-[#1C1A27] shadow-[6px_6px_0px_0px_#1C1A27] px-8 py-4 font-label-mono text-base uppercase font-black flex items-center gap-2 hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <span>{user ? 'Masuk ke Dashboard' : 'Daftar Sekarang - Gratis'}</span>
              <MaterialIcon name="arrow_forward" className="text-xl" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. FOOTER
          ========================================================================= */}
      <footer className="bg-white px-4 sm:px-8 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 border-b-3 border-[#1C1A27] pb-8">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FEF08A] border-3 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] flex items-center justify-center font-black text-xl text-[#1C1A27]">
              <MaterialIcon name="savings" className="text-2xl" />
            </div>
            <div>
              <span className="font-headline-md font-black text-xl text-[#1C1A27] uppercase tracking-tight block leading-none">
                VIRA
              </span>
              <span className="font-label-mono text-[9px] uppercase font-bold text-[#454654]">
                VIRTUAL INCOME & RECORD ASSISTANT
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 font-label-mono text-xs font-black uppercase text-[#1C1A27]">
            <a href="#fitur" className="hover:text-[#3B4CCA]">Fitur</a>
            <a href="#demo" className="hover:text-[#3B4CCA]">Demo AI</a>
            <a href="#cara-kerja" className="hover:text-[#3B4CCA]">Cara Kerja</a>
            <a href="#faq" className="hover:text-[#3B4CCA]">FAQ</a>
            <Link href="/login" className="hover:text-[#3B4CCA]">Masuk</Link>
            <Link href="/register" className="hover:text-[#3B4CCA]">Daftar</Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center font-label-mono text-xs font-bold text-[#454654]">
          <p>© {new Date().getFullYear()} VIRA Financial AI Assistant. Seluruh Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
            <span>SISTEM BERJALAN NORMAL (STATUS ONLINE)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

