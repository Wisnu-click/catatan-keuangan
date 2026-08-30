import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import NeoButton from '../../Components/NeoButton';
import MaterialIcon from '../../Components/MaterialIcon';

export default function WhatsApp({ isConnected = false }) {
  const [phone, setPhone] = useState('812 3456 7890');
  const [connected, setConnected] = useState(isConnected);

  const handleSendCode = () => {
    alert(`Kode verifikasi dikirim ke +62 ${phone}`);
    setConnected(true);
  };

  return (
    <AuthenticatedLayout>
      <Head title="WhatsApp Bot Settings" />

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display-xl text-[#1C1A27] mb-2 font-bold">
          Hubungkan WhatsApp
        </h1>
        <p className="text-lg font-body-md text-[#454654] max-w-2xl font-bold">
          Integrasikan asisten keuangan bot langsung ke nomor WhatsApp Anda untuk mencatat pengeluaran secara real-time.
        </p>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Main Connection Card (Span 8) */}
        <div className="lg:col-span-8 bg-[#F1EBFE] neo-border neo-shadow p-8 flex flex-col md:flex-row gap-8 relative z-10 w-full">
          {/* Illustration Side */}
          <div className="w-full md:w-1/3 flex flex-col items-center justify-center bg-[#BCC2FF] neo-border p-6 transform rotate-[-1deg]">
            <div className="w-28 h-28 bg-[#3B4CCA] neo-border flex items-center justify-center neo-shadow mb-6">
              <MaterialIcon name="chat_bubble" filled={true} className="text-5xl text-white" />
            </div>

            {/* Status Pill */}
            {connected ? (
              <div className="bg-[#86EFAC] border-4 border-[#1C1A27] px-4 py-2 flex items-center gap-2 neo-shadow">
                <span className="w-3 h-3 bg-[#1C1A27] rounded-full" />
                <span className="font-label-mono text-xs text-[#1C1A27] uppercase font-bold">
                  Terhubung
                </span>
              </div>
            ) : (
              <div className="bg-[#FDE047] border-4 border-[#1C1A27] px-4 py-2 flex items-center gap-2 neo-shadow">
                <span className="w-3 h-3 bg-[#1C1A27] rounded-full animate-pulse" />
                <span className="font-label-mono text-xs text-[#1C1A27] uppercase font-bold">
                  Belum Terhubung
                </span>
              </div>
            )}
          </div>

          {/* Form Side */}
          <div className="w-full md:w-2/3 flex flex-col justify-center">
            <h3 className="text-2xl font-headline-md mb-6 font-bold text-[#1C1A27]">
              Setup Nomor Handphone
            </h3>
            <form className="flex flex-col gap-4 w-full" onSubmit={(e) => e.preventDefault()}>
              <div className="flex flex-col gap-2 w-full">
                <label className="font-label-mono text-xs uppercase tracking-wide font-bold text-[#1C1A27]">
                  Nomor WhatsApp Aktif
                </label>
                <div className="flex w-full">
                  <div className="bg-[#E9DDFF] border-4 border-r-0 border-[#1C1A27] px-4 py-4 flex items-center justify-center">
                    <span className="font-label-mono text-base font-bold">+62</span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="812 3456 7890"
                    className="flex-1 bg-white border-4 border-[#1C1A27] px-4 py-4 font-body-md text-base focus:outline-none focus:ring-0 font-bold"
                  />
                </div>
                <p className="text-xs font-body-md text-[#757685] font-bold">
                  Pastikan nomor ini aktif di WhatsApp.
                </p>
              </div>

              <NeoButton
                variant="secondary"
                size="lg"
                onClick={handleSendCode}
                className="mt-4 self-start"
              >
                {connected ? 'Verifikasi Ulang' : 'Kirim Kode Verifikasi'}
              </NeoButton>
            </form>
          </div>
        </div>

        {/* Preview Card (Span 4) */}
        <div className="lg:col-span-4 bg-[#CCBEFF] neo-border neo-shadow p-6 flex flex-col relative transform rotate-[1deg] z-0 w-full">
          <div className="flex items-center gap-3 mb-6 border-b-4 border-[#1C1A27] pb-4">
            <MaterialIcon name="smart_toy" className="text-3xl text-[#1C1A27]" />
            <h4 className="font-headline-md text-xl font-bold">Preview Chat</h4>
          </div>

          {/* Mockup Chat Bubbles */}
          <div className="flex flex-col gap-4 flex-1">
            <div className="bg-white neo-border p-4 self-start max-w-[85%] relative">
              <p className="font-body-md text-sm font-bold text-[#1C1A27]">
                Halo! Saya bot VIRA. Silakan masukkan kode verifikasi Anda.
              </p>
            </div>

            <div className="bg-[#3B4CCA] text-white neo-border p-4 self-end max-w-[85%] relative">
              <p className="font-body-md text-sm font-bold">123456</p>
            </div>
          </div>
        </div>

        {/* Instructions (Span 12) */}
        <div className="lg:col-span-12 mt-6 w-full">
          <h3 className="text-2xl font-headline-md mb-6 flex items-center gap-2 font-bold text-[#1C1A27]">
            <MaterialIcon name="integration_instructions" className="text-2xl" />
            Cara Kerja Integrasi
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {[
              {
                step: '1',
                title: 'Input Nomor',
                desc: 'Masukkan nomor WhatsApp aktif Anda dengan kode negara +62.',
                bg: 'bg-[#8455EF]',
              },
              {
                step: '2',
                title: 'Terima Kode',
                desc: 'Bot kami akan mengirimkan pesan berisi 6 digit kode OTP.',
                bg: 'bg-[#3B4CCA]',
              },
              {
                step: '3',
                title: 'Catat Transaksi',
                desc: 'Kirim format singkat via WA, sistem akan otomatis mencatatnya.',
                bg: 'bg-[#8455EF]',
              },
            ].map((st, idx) => (
              <div
                key={idx}
                className="bg-white neo-border neo-shadow p-6 flex gap-4 hover:-translate-y-2 transition-transform duration-200"
              >
                <div
                  className={`w-12 h-12 ${st.bg} text-white neo-border flex items-center justify-center shrink-0 font-number-xl text-xl font-bold`}
                >
                  {st.step}
                </div>
                <div>
                  <h4 className="font-label-mono text-sm uppercase mb-2 font-bold">{st.title}</h4>
                  <p className="font-body-md text-sm text-[#454654] font-bold">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

