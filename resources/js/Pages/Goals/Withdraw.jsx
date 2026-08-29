import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import NeoButton from '../../Components/NeoButton';
import NeoSelect from '../../Components/NeoSelect';
import NeoTextarea from '../../Components/NeoTextarea';
import MaterialIcon from '../../Components/MaterialIcon';

export default function Withdraw({
  goalTitle = 'MacBook Pro',
  availableBalance = 'Rp 15.000.000',
  targetAmount = 'Rp 30.000.000',
}) {
  const [amount, setAmount] = useState('5.000.000');
  const [destination, setDestination] = useState('Main Wallet (BCA)');
  const [reason, setReason] = useState('');

  const handleWithdrawAll = () => {
    setAmount('15.000.000');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Penarikan dana Rp ${amount} berhasil dari target ${goalTitle}`);
    router.visit('/goals');
  };

  return (
    <AuthenticatedLayout>
      <Head title="Tarik Dana Tabungan" />

      {/* Page Header */}
      <header className="flex items-center gap-4 mb-8 border-b-4 border-[#1C1A27] pb-6">
        <Link href="/goals">
          <button className="w-12 h-12 bg-white neo-border neo-shadow neo-shadow-hover neo-shadow-active flex items-center justify-center transition-all cursor-pointer">
            <MaterialIcon name="arrow_back" className="text-[#1C1A27] font-bold" />
          </button>
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-headline-lg text-[#1C1A27] uppercase tracking-tighter font-bold">
            Tarik Dana Tabungan
          </h1>
          <p className="text-base font-body-md text-[#454654] mt-1 font-bold">
            Target: <span className="text-[#3B4CCA]">{goalTitle}</span>
          </p>
        </div>
      </header>

      {/* Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Input Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Amount Input Card */}
          <div className="bg-[#FDF8FF] p-6 md:p-8 neo-border neo-shadow relative overflow-hidden transform rotate-[0.5deg]">
            <label className="block font-label-mono uppercase text-[#1C1A27] text-xs mb-2">
              Jumlah Penarikan (IDR)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-2xl md:text-3xl font-headline-md text-[#454654]">Rp</span>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                required
                className="w-full h-20 pl-16 pr-4 bg-white neo-border text-2xl md:text-4xl font-number-xl text-[#1C1A27] focus:outline-none focus:ring-0 focus:shadow-[6px_6px_0px_0px_#BA1A1A] transition-shadow font-bold"
              />
            </div>
            <div className="mt-4 flex justify-between items-center text-sm font-body-md">
              <span className="text-[#454654]">
                Saldo Tersedia: <span className="font-bold text-[#1C1A27]">{availableBalance}</span>
              </span>
              <button
                type="button"
                onClick={handleWithdrawAll}
                className="font-label-mono uppercase text-[#BA1A1A] hover:underline underline-offset-4 cursor-pointer font-bold"
              >
                Tarik Semua
              </button>
            </div>
          </div>

          {/* Destination & Reason Card */}
          <div className="bg-[#E7DEFF] p-6 md:p-8 neo-border neo-shadow transform rotate-[-0.5deg]">
            <div className="mb-6">
              <label className="block font-label-mono uppercase text-[#1C1A27] text-xs mb-2">
                Pilih Tujuan Dana
              </label>
              <NeoSelect
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                options={['Main Wallet (BCA)', 'Cash Reserve', 'Investment Account']}
                className="h-14 font-bold"
              />
            </div>
            <div>
              <label className="block font-label-mono uppercase text-[#1C1A27] text-xs mb-2">
                Alasan Penarikan (Opsional)
              </label>
              <NeoTextarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Tulis catatan penarikan..."
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Action Sidebar Column */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          {/* Summary Card */}
          <div className="bg-[#F7F1FF] p-6 neo-border neo-shadow">
            <h3 className="text-xl font-headline-md uppercase text-[#1C1A27] mb-6 border-b-4 border-[#1C1A27] pb-4 font-bold">
              Ringkasan
            </h3>
            <div className="space-y-4 text-sm font-body-md">
              <div className="flex justify-between">
                <span className="text-[#454654]">Target Saat Ini</span>
                <span className="font-bold">{targetAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#454654]">Terkumpul</span>
                <span className="font-bold text-[#3B4CCA]">{availableBalance}</span>
              </div>
              <div className="flex justify-between text-[#BA1A1A] font-bold">
                <span>Penarikan</span>
                <span>- Rp {amount || '0'}</span>
              </div>
              <div className="pt-4 border-t-4 border-[#1C1A27] flex justify-between mt-4">
                <span className="font-bold text-[#1C1A27]">Sisa Saldo</span>
                <span className="font-bold text-[#1C1A27] text-lg">Rp 10.000.000</span>
              </div>
            </div>
          </div>

          {/* Confirm Button (DANGER) */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full h-20 bg-[#BA1A1A] text-white neo-border neo-shadow neo-shadow-hover neo-shadow-active text-xl font-headline-md uppercase flex justify-center items-center gap-2 transition-all group relative overflow-hidden cursor-pointer"
          >
            <MaterialIcon name="warning" className="group-hover:animate-pulse text-2xl" />
            KONFIRMASI TARIK
          </button>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

