import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import MaterialIcon from './MaterialIcon';
import NeoButton from './NeoButton';

export default function ConnectDanaModal({ isOpen, onClose, wallets = [], defaultWallet = null }) {
  if (!isOpen) return null;

  const [mode, setMode] = useState('quick'); // 'quick' (Buat Baru) | 'existing' (Hubungkan Wallet Ada)
  const [step, setStep] = useState(1); // 1: Input Data, 2: Verifikasi OTP, 3: Info API

  // Quick Create Form (tanpa input saldo manual — saldo ditarik otomatis dari DANA)
  const quickForm = useForm({
    name: 'DANA',
    phone_number: '',
    account_name: '',
    sync_mode: 'simulation', // 'simulation' | 'snap_openapi'
  });

  // Existing Wallet Form
  const existingForm = useForm({
    wallet_id: defaultWallet?.id ?? (wallets.length > 0 ? wallets[0].id : ''),
    phone_number: '',
    account_name: '',
    sync_mode: 'simulation',
    api_key: '',
  });

  const activeForm = mode === 'quick' ? quickForm : existingForm;

  const handleNextStep = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (mode === 'quick') {
      quickForm.post('/wallets/quick-dana', {
        onSuccess: () => {
          handleClose();
        },
      });
    } else {
      existingForm.post(`/wallets/${existingForm.data.wallet_id}/dana/connect`, {
        onSuccess: () => {
          handleClose();
        },
      });
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleClose = () => {
    setStep(1);
    quickForm.reset();
    existingForm.reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" onClick={handleClose}>
      <div
        className="relative bg-[#FDF8FF] border-4 border-[#1C1A27] neo-shadow w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========== HEADER DANA ========== */}
        <div className="flex justify-between items-center bg-[#118EEA] p-5 md:p-6 text-white border-b-4 border-[#1C1A27]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white text-[#118EEA] border-4 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] flex items-center justify-center shrink-0">
              <span className="font-headline-md text-2xl font-black">D</span>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-headline-md uppercase tracking-tight font-black">
                HUBUNGKAN AKUN DANA
              </h2>
              <p className="font-label-mono text-[10px] opacity-90 font-bold uppercase">
                {step === 1 && 'Langkah 1/2 — Data Akun'}
                {step === 2 && 'Langkah 2/2 — Verifikasi & Otorisasi'}
                {step === 3 && 'Panduan Setup API (Opsional)'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 bg-white text-[#1C1A27] border-4 border-[#1C1A27] flex items-center justify-center cursor-pointer hover:bg-[#FECACA] transition-colors shadow-[2px_2px_0px_0px_#1C1A27]"
          >
            <MaterialIcon name="close" className="text-xl font-bold" />
          </button>
        </div>

        <div className="p-6 md:p-8">
          {/* ========== STEP 1: INPUT DATA AKUN ========== */}
          {step === 1 && (
            <>
              {/* Tab Switcher */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setMode('quick')}
                  className={`p-3 border-4 border-[#1C1A27] font-label-mono text-xs font-black uppercase flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    mode === 'quick'
                      ? 'bg-[#118EEA] text-white shadow-[4px_4px_0px_0px_#1C1A27]'
                      : 'bg-white text-[#1C1A27] hover:bg-blue-50'
                  }`}
                >
                  <MaterialIcon name="add_circle" className="text-lg" />
                  BUAT WALLET DANA BARU
                </button>
                <button
                  type="button"
                  onClick={() => setMode('existing')}
                  className={`p-3 border-4 border-[#1C1A27] font-label-mono text-xs font-black uppercase flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    mode === 'existing'
                      ? 'bg-[#118EEA] text-white shadow-[4px_4px_0px_0px_#1C1A27]'
                      : 'bg-white text-[#1C1A27] hover:bg-blue-50'
                  }`}
                >
                  <MaterialIcon name="link" className="text-lg" />
                  HUBUNGKAN KE WALLET ADA
                </button>
              </div>

              <form onSubmit={handleNextStep} className="space-y-4">
                {mode === 'quick' ? (
                  <div>
                    <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-1">
                      NAMA LABEL DOMPET DI WEBSITE
                    </label>
                    <input
                      type="text"
                      value={quickForm.data.name}
                      onChange={(e) => quickForm.setData('name', e.target.value)}
                      placeholder="Misal: DANA Utama, DANA Bisnis"
                      required
                      className="w-full h-12 border-4 border-[#1C1A27] px-4 font-body-md bg-white text-[#1C1A27] font-bold shadow-[2px_2px_0px_0px_#1C1A27]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-1">
                      PILIH WALLET YANG AKAN DIHUBUNGKAN
                    </label>
                    <select
                      value={existingForm.data.wallet_id}
                      onChange={(e) => existingForm.setData('wallet_id', e.target.value)}
                      required
                      className="w-full h-12 border-4 border-[#1C1A27] px-4 font-body-md bg-white text-[#1C1A27] font-bold shadow-[2px_2px_0px_0px_#1C1A27] cursor-pointer"
                    >
                      {wallets.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.balance}) {w.isDanaSynced ? '• SUDAH TERHUBUNG' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-1">
                      NOMOR HP TERDAFTAR DI DANA
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-xs font-label-mono font-bold text-[#118EEA]">🇮🇩 +62</span>
                      <input
                        type="tel"
                        value={activeForm.data.phone_number}
                        onChange={(e) => activeForm.setData('phone_number', e.target.value)}
                        placeholder="081234567890"
                        required
                        className="w-full h-12 border-4 border-[#1C1A27] pl-16 pr-3 font-label-mono font-bold bg-white text-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-1">
                      NAMA PEMILIK AKUN DANA
                    </label>
                    <input
                      type="text"
                      value={activeForm.data.account_name}
                      onChange={(e) => activeForm.setData('account_name', e.target.value)}
                      placeholder="Nama sesuai akun DANA Anda"
                      required
                      className="w-full h-12 border-4 border-[#1C1A27] px-4 font-body-md bg-white text-[#1C1A27] font-bold shadow-[2px_2px_0px_0px_#1C1A27]"
                    />
                  </div>
                </div>

                {/* Mode Sinkronisasi */}
                <div>
                  <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
                    MODE KONEKSI
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => activeForm.setData('sync_mode', 'simulation')}
                      className={`p-3 border-4 border-[#1C1A27] font-label-mono text-[11px] font-black uppercase cursor-pointer transition-all text-center ${
                        activeForm.data.sync_mode === 'simulation'
                          ? 'bg-[#FEF08A] text-[#854D0E] shadow-[4px_4px_0px_0px_#1C1A27]'
                          : 'bg-white text-[#1C1A27] hover:bg-yellow-50'
                      }`}
                    >
                      <MaterialIcon name="science" className="text-2xl mb-1" />
                      <br />
                      SIMULASI LIVE
                      <br />
                      <span className="text-[9px] font-bold opacity-70">(Tanpa API key, langsung pakai)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => activeForm.setData('sync_mode', 'snap_openapi')}
                      className={`p-3 border-4 border-[#1C1A27] font-label-mono text-[11px] font-black uppercase cursor-pointer transition-all text-center ${
                        activeForm.data.sync_mode === 'snap_openapi'
                          ? 'bg-[#118EEA] text-white shadow-[4px_4px_0px_0px_#1C1A27]'
                          : 'bg-white text-[#1C1A27] hover:bg-blue-50'
                      }`}
                    >
                      <MaterialIcon name="api" className="text-2xl mb-1" />
                      <br />
                      SNAP OPEN API
                      <br />
                      <span className="text-[9px] font-bold opacity-70">(Perlu CLIENT_ID dari DANA)</span>
                    </button>
                  </div>
                </div>

                {/* API Key field (only for SNAP mode) */}
                {activeForm.data.sync_mode === 'snap_openapi' && (
                  <div className="bg-[#E0F2FE] border-4 border-[#1C1A27] p-4 space-y-3 shadow-[2px_2px_0px_0px_#1C1A27]">
                    <label className="block font-label-mono text-xs uppercase font-bold text-[#0C4A6E]">
                      DANA CLIENT SECRET / API KEY
                    </label>
                    <input
                      type="password"
                      value={existingForm.data.api_key}
                      onChange={(e) => existingForm.setData('api_key', e.target.value)}
                      placeholder="Masukkan Client Secret dari Dashboard DANA"
                      className="w-full h-12 border-2 border-[#1C1A27] px-4 font-label-mono bg-white text-[#1C1A27] font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="text-[#118EEA] font-label-mono text-xs font-bold underline cursor-pointer hover:text-[#0C76C4]"
                    >
                      📖 Bagaimana cara mendapatkan API Key DANA? →
                    </button>
                  </div>
                )}

                {/* Info box */}
                <div className="bg-[#DCFCE7] border-4 border-[#1C1A27] p-3 text-xs font-label-mono text-[#14532D] font-bold flex items-start gap-2 shadow-[2px_2px_0px_0px_#1C1A27]">
                  <MaterialIcon name="info" className="text-xl shrink-0" />
                  <span>
                    {activeForm.data.sync_mode === 'simulation'
                      ? 'Mode Simulasi: Saldo DANA ditarik dan disinkronkan otomatis. Tidak perlu input saldo manual. Saldo bisa di-refresh berkala lewat tombol Sinkronisasi 🔄.'
                      : 'Mode SNAP Open API: Saldo ditarik langsung dari akun resmi DANA via API SNAP Bank Indonesia.'}
                  </span>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t-4 border-[#1C1A27]">
                  <NeoButton variant="outline" size="md" onClick={handleClose}>
                    BATAL
                  </NeoButton>
                  <button
                    type="submit"
                    className="bg-[#118EEA] text-white border-4 border-[#1C1A27] px-6 py-3 font-label-mono text-xs font-black uppercase shadow-[4px_4px_0px_0px_#1C1A27] hover:bg-[#0C76C4] cursor-pointer flex items-center gap-2"
                  >
                    LANJUTKAN VERIFIKASI
                    <MaterialIcon name="arrow_forward" className="text-base font-bold" />
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ========== STEP 2: VERIFIKASI OTP & OTORISASI ========== */}
          {step === 2 && (
            <form onSubmit={handleFinalSubmit} className="space-y-5">
              <div className="bg-[#E0F2FE] border-4 border-[#1C1A27] p-5 text-center shadow-[4px_4px_0px_0px_#1C1A27]">
                <div className="w-16 h-16 bg-[#118EEA] text-white border-4 border-[#1C1A27] mx-auto flex items-center justify-center mb-3 shadow-[2px_2px_0px_0px_#1C1A27]">
                  <MaterialIcon name="phonelink_lock" className="text-3xl font-bold" />
                </div>
                <h3 className="text-xl font-headline-md text-[#1C1A27] uppercase font-black">
                  OTORISASI AKUN DANA
                </h3>
                <p className="font-body-md text-xs text-[#454654] font-bold mt-1">
                  Verifikasi untuk menghubungkan akun DANA{' '}
                  <strong className="text-[#118EEA]">{activeForm.data.phone_number}</strong>{' '}
                  atas nama <strong className="text-[#118EEA]">{activeForm.data.account_name}</strong>
                </p>
              </div>

              {/* Detail Konfirmasi */}
              <div className="bg-white border-4 border-[#1C1A27] p-4 space-y-2 shadow-[2px_2px_0px_0px_#1C1A27]">
                <div className="flex justify-between items-center py-1.5 border-b border-[#1C1A27]/20">
                  <span className="font-label-mono text-xs uppercase font-bold text-[#454654]">Nomor HP</span>
                  <span className="font-label-mono text-xs font-black text-[#1C1A27]">{activeForm.data.phone_number}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-[#1C1A27]/20">
                  <span className="font-label-mono text-xs uppercase font-bold text-[#454654]">Nama Akun</span>
                  <span className="font-label-mono text-xs font-black text-[#1C1A27]">{activeForm.data.account_name}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-[#1C1A27]/20">
                  <span className="font-label-mono text-xs uppercase font-bold text-[#454654]">Mode</span>
                  <span className={`font-label-mono text-[10px] font-black px-2 py-0.5 border-2 border-[#1C1A27] uppercase ${
                    activeForm.data.sync_mode === 'simulation'
                      ? 'bg-[#FEF08A] text-[#854D0E]'
                      : 'bg-[#118EEA] text-white'
                  }`}>
                    {activeForm.data.sync_mode === 'simulation' ? '🔬 SIMULASI LIVE' : '🔌 SNAP OPEN API'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="font-label-mono text-xs uppercase font-bold text-[#454654]">Saldo</span>
                  <span className="font-label-mono text-xs font-black text-[#16A34A]">
                    {activeForm.data.sync_mode === 'simulation' ? '⚡ Ditarik Otomatis dari DANA' : '⚡ Ditarik Langsung dari DANA API'}
                  </span>
                </div>
              </div>

              {/* Checkbox Persetujuan */}
              <label className="flex items-start gap-3 bg-[#FEF08A] border-4 border-[#1C1A27] p-3 cursor-pointer shadow-[2px_2px_0px_0px_#1C1A27]">
                <input type="checkbox" required className="w-5 h-5 border-2 border-[#1C1A27] mt-0.5 shrink-0 cursor-pointer" />
                <span className="font-label-mono text-xs text-[#854D0E] font-bold">
                  Saya mengizinkan website ini mengakses dan menampilkan saldo akun DANA saya secara live untuk keperluan pencatatan keuangan pribadi. Data hanya disimpan di database lokal.
                </span>
              </label>

              <div className="flex justify-between gap-3 pt-4 border-t-4 border-[#1C1A27]">
                <button
                  type="button"
                  onClick={handleBack}
                  className="bg-white text-[#1C1A27] border-4 border-[#1C1A27] px-4 py-3 font-label-mono text-xs font-black uppercase shadow-[2px_2px_0px_0px_#1C1A27] hover:bg-gray-100 cursor-pointer flex items-center gap-1"
                >
                  <MaterialIcon name="arrow_back" className="text-base" />
                  KEMBALI
                </button>
                <button
                  type="submit"
                  disabled={quickForm.processing || existingForm.processing}
                  className="bg-[#4ADE80] text-[#14532D] border-4 border-[#1C1A27] px-6 py-3 font-label-mono text-xs font-black uppercase shadow-[4px_4px_0px_0px_#1C1A27] hover:bg-[#22C55E] cursor-pointer flex items-center gap-2"
                >
                  <MaterialIcon name="verified" className="text-lg font-bold" />
                  {quickForm.processing || existingForm.processing ? 'MENGHUBUNGKAN...' : 'KONFIRMASI & AKTIFKAN LIVE SYNC'}
                </button>
              </div>
            </form>
          )}

          {/* ========== STEP 3: PANDUAN API DANA (HELP PAGE) ========== */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="bg-[#118EEA] text-white border-4 border-[#1C1A27] p-4 shadow-[4px_4px_0px_0px_#1C1A27]">
                <h3 className="text-lg font-headline-md font-black uppercase flex items-center gap-2">
                  <MaterialIcon name="menu_book" className="text-2xl" />
                  PANDUAN SETUP DANA OPEN API (SNAP)
                </h3>
              </div>

              <div className="space-y-4">
                {/* Step 1 */}
                <div className="bg-white border-4 border-[#1C1A27] p-4 shadow-[2px_2px_0px_0px_#1C1A27]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-8 h-8 bg-[#118EEA] text-white font-black border-2 border-[#1C1A27] flex items-center justify-center text-sm shrink-0">1</span>
                    <h4 className="font-headline-md text-sm font-black uppercase text-[#1C1A27]">Daftar Sebagai Merchant / Partner DANA</h4>
                  </div>
                  <p className="font-body-md text-xs text-[#454654] font-bold ml-10">
                    Buka <strong className="text-[#118EEA]">dashboard.dana.id</strong> → Klik "Daftar" → Pilih "Merchant" atau "Partner" → Lengkapi data bisnis Anda → Tunggu approval (biasanya 1-3 hari kerja).
                  </p>
                </div>

                {/* Step 2 */}
                <div className="bg-white border-4 border-[#1C1A27] p-4 shadow-[2px_2px_0px_0px_#1C1A27]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-8 h-8 bg-[#118EEA] text-white font-black border-2 border-[#1C1A27] flex items-center justify-center text-sm shrink-0">2</span>
                    <h4 className="font-headline-md text-sm font-black uppercase text-[#1C1A27]">Dapatkan Credentials API</h4>
                  </div>
                  <p className="font-body-md text-xs text-[#454654] font-bold ml-10">
                    Setelah disetujui, buka Dashboard DANA → Menu "Developer / API Settings" → Anda akan mendapatkan:
                  </p>
                  <div className="ml-10 mt-2 space-y-1">
                    <code className="block bg-[#1C1A27] text-[#4ADE80] px-3 py-1 font-mono text-xs">CLIENT_ID=dana_xxxxxxxxxxxxxxxx</code>
                    <code className="block bg-[#1C1A27] text-[#4ADE80] px-3 py-1 font-mono text-xs">CLIENT_SECRET=sk_xxxxxxxxxxxxxxxx</code>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-white border-4 border-[#1C1A27] p-4 shadow-[2px_2px_0px_0px_#1C1A27]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-8 h-8 bg-[#118EEA] text-white font-black border-2 border-[#1C1A27] flex items-center justify-center text-sm shrink-0">3</span>
                    <h4 className="font-headline-md text-sm font-black uppercase text-[#1C1A27]">Generate RSA Key Pair</h4>
                  </div>
                  <p className="font-body-md text-xs text-[#454654] font-bold ml-10 mb-2">
                    DANA menggunakan <strong>RSA-SHA256</strong> untuk signature. Generate key pair dan upload public key ke dashboard DANA:
                  </p>
                  <div className="ml-10">
                    <code className="block bg-[#1C1A27] text-[#FEF08A] px-3 py-1 font-mono text-[11px]">openssl genrsa -out private_key.pem 2048</code>
                    <code className="block bg-[#1C1A27] text-[#FEF08A] px-3 py-1 font-mono text-[11px] mt-1">openssl rsa -in private_key.pem -pubout -out public_key.pem</code>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-white border-4 border-[#1C1A27] p-4 shadow-[2px_2px_0px_0px_#1C1A27]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-8 h-8 bg-[#118EEA] text-white font-black border-2 border-[#1C1A27] flex items-center justify-center text-sm shrink-0">4</span>
                    <h4 className="font-headline-md text-sm font-black uppercase text-[#1C1A27]">Endpoint yang Digunakan</h4>
                  </div>
                  <div className="ml-10 space-y-2">
                    <div className="bg-[#F1EBFE] border-2 border-[#1C1A27] p-2">
                      <p className="font-label-mono text-[10px] font-black text-[#8B5CF6] uppercase">ACCESS TOKEN</p>
                      <code className="font-mono text-xs text-[#1C1A27] font-bold">POST /v1.0/access-token/b2b</code>
                    </div>
                    <div className="bg-[#DCFCE7] border-2 border-[#1C1A27] p-2">
                      <p className="font-label-mono text-[10px] font-black text-[#16A34A] uppercase">CEK SALDO REAL-TIME</p>
                      <code className="font-mono text-xs text-[#1C1A27] font-bold">POST /v1.0/balance-inquiry</code>
                    </div>
                    <div className="bg-[#FEF08A] border-2 border-[#1C1A27] p-2">
                      <p className="font-label-mono text-[10px] font-black text-[#854D0E] uppercase">RIWAYAT TRANSAKSI</p>
                      <code className="font-mono text-xs text-[#1C1A27] font-bold">POST /v1.0/transaction-history-list</code>
                    </div>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="bg-white border-4 border-[#1C1A27] p-4 shadow-[2px_2px_0px_0px_#1C1A27]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-8 h-8 bg-[#118EEA] text-white font-black border-2 border-[#1C1A27] flex items-center justify-center text-sm shrink-0">5</span>
                    <h4 className="font-headline-md text-sm font-black uppercase text-[#1C1A27]">Masukkan CLIENT_SECRET di Form Koneksi</h4>
                  </div>
                  <p className="font-body-md text-xs text-[#454654] font-bold ml-10">
                    Kembali ke form sebelumnya, pilih mode <strong>"SNAP OPEN API"</strong>, lalu tempelkan <strong>CLIENT_SECRET</strong> dari DANA di kolom API Key. Selesai!
                  </p>
                </div>
              </div>

              {/* Info box */}
              <div className="bg-[#FEF08A] border-4 border-[#1C1A27] p-3 text-xs font-label-mono text-[#854D0E] font-bold flex items-start gap-2 shadow-[2px_2px_0px_0px_#1C1A27]">
                <MaterialIcon name="lightbulb" className="text-xl shrink-0" />
                <span>
                  <strong>Belum punya akses DANA Open API?</strong> Tidak masalah! Anda bisa langsung memakai mode "Simulasi Live" tanpa perlu API Key. Saldo akan disimulasikan secara real-time dan bisa di-refresh kapan saja via tombol Sinkronisasi.
                </span>
              </div>

              <div className="flex justify-end pt-4 border-t-4 border-[#1C1A27]">
                <button
                  type="button"
                  onClick={handleBack}
                  className="bg-[#118EEA] text-white border-4 border-[#1C1A27] px-5 py-3 font-label-mono text-xs font-black uppercase shadow-[4px_4px_0px_0px_#1C1A27] hover:bg-[#0C76C4] cursor-pointer flex items-center gap-2"
                >
                  <MaterialIcon name="arrow_back" className="text-base" />
                  KEMBALI KE FORM KONEKSI
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
