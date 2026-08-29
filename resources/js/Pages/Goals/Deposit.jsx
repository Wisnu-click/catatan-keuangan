import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import NeoButton from '../../Components/NeoButton';
import NeoSelect from '../../Components/NeoSelect';
import NeoTextarea from '../../Components/NeoTextarea';
import MaterialIcon from '../../Components/MaterialIcon';

export default function Deposit({ goalTitle = 'Liburan Jepang' }) {
  const [amount, setAmount] = useState('');
  const [sourceWallet, setSourceWallet] = useState('Dompet Utama (Rp 5.000.000)');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Tabungan Rp ${amount} berhasil ditambahkan ke ${goalTitle}`);
    router.visit('/goals');
  };

  return (
    <AuthenticatedLayout>
      <Head title="Nabung ke Target" />

      {/* Header Section */}
      <header className="mb-6 flex items-center gap-4">
        <Link href="/goals">
          <button className="w-12 h-12 flex items-center justify-center bg-white neo-border neo-shadow neo-shadow-hover neo-shadow-active transition-all cursor-pointer">
            <MaterialIcon name="arrow_back" className="text-[#1C1A27] font-bold" />
          </button>
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-headline-lg text-[#1C1A27] font-bold">Nabung ke Target</h1>
          <p className="text-lg font-body-md text-[#454654] font-bold">{goalTitle}</p>
        </div>
      </header>

      {/* Main Form Container */}
      <div className="w-full bg-[#F7F1FF] neo-border neo-shadow p-6 md:p-10 transform rotate-[0.5deg]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 transform rotate-[-0.5deg]">
          {/* Amount Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xl font-headline-md text-[#1C1A27] font-bold">Jumlah Tabungan</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-3xl font-number-xl text-[#454654] font-bold">Rp</span>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                required
                className="w-full h-24 pl-20 pr-4 bg-white neo-border text-3xl md:text-4xl font-number-xl text-[#1C1A27] focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_#1C1A27]"
              />
            </div>
          </div>

          {/* Source Wallet Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-xl font-headline-md text-[#1C1A27] font-bold">Pilih Sumber Dana</label>
            <NeoSelect
              value={sourceWallet}
              onChange={(e) => setSourceWallet(e.target.value)}
              options={[
                'Dompet Utama (Rp 5.000.000)',
                'Gaji Bulan Ini (Rp 8.500.000)',
                'Dana Darurat (Rp 1.200.000)',
              ]}
              className="h-16 text-lg font-bold"
            />
          </div>

          {/* Notes Text Area */}
          <div className="flex flex-col gap-2">
            <label className="text-xl font-headline-md text-[#1C1A27] font-bold">Catatan</label>
            <NeoTextarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Opsional: Tambahkan catatan..."
              rows={3}
            />
          </div>

          {/* Action Button */}
          <NeoButton type="submit" variant="primary" size="xl" className="w-full mt-4">
            SIMPAN TABUNGAN
          </NeoButton>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}

