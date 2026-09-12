import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import MaterialIcon from './MaterialIcon';
import CurrencyInput from './CurrencyInput';
import NeoButton from './NeoButton';

export default function DanaSyncModal({ isOpen, onClose, wallet = null }) {
  if (!isOpen || !wallet) return null;

  const [isRefreshing, setIsRefreshing] = useState(false);

  const form = useForm({
    new_balance: wallet.balanceNum ? String(wallet.balanceNum) : '1500000',
  });

  const handleQuickSync = (e) => {
    e.preventDefault();
    setIsRefreshing(true);
    form.post(`/wallets/${wallet.id}/dana/sync`, {
      preserveScroll: true,
      onSuccess: () => {
        setIsRefreshing(false);
        onClose();
      },
      onFinish: () => setIsRefreshing(false),
    });
  };

  const handleDisconnect = () => {
    if (confirm(`Putuskan integrasi akun DANA dari "${wallet.name}"?`)) {
      router.post(`/wallets/${wallet.id}/dana/disconnect`, {}, {
        preserveScroll: true,
        onSuccess: onClose,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" onClick={onClose}>
      <div
        className="relative bg-[#FDF8FF] border-4 border-[#1C1A27] neo-shadow p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* DANA Header */}
        <div className="flex justify-between items-center mb-6 border-b-4 border-[#1C1A27] pb-4 bg-[#118EEA] -mx-6 -mt-6 md:-mx-8 md:-mt-8 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-[#118EEA] border-2 border-black flex items-center justify-center font-black text-xl shrink-0">
              D
            </div>
            <div>
              <h2 className="text-xl font-headline-md uppercase tracking-tight font-black">
                LIVE SINKRONISASI DANA
              </h2>
              <p className="font-label-mono text-[10px] opacity-90 font-bold uppercase">
                {wallet.danaPhoneNumber} • {wallet.danaAccountName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white text-[#1C1A27] border-2 border-[#1C1A27] flex items-center justify-center cursor-pointer hover:bg-[#FECACA]"
          >
            <MaterialIcon name="close" className="text-lg font-bold" />
          </button>
        </div>

        {/* Current Sync Info Box */}
        <div className="bg-[#E0F2FE] border-4 border-[#1C1A27] p-4 mb-5 shadow-[4px_4px_0px_0px_#1C1A27]">
          <div className="flex justify-between items-center mb-2">
            <span className="font-label-mono text-xs uppercase font-bold text-[#454654]">STATUS KONEKSI</span>
            <span className="bg-[#4ADE80] text-[#14532D] border-2 border-black font-label-mono text-[10px] font-black px-2 py-0.5 uppercase flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping" />
              LIVE CONNECTED 🟢
            </span>
          </div>
          <div className="flex justify-between items-center border-t-2 border-[#1C1A27]/20 pt-2">
            <span className="font-label-mono text-xs uppercase font-bold text-[#454654]">TERAKHIR DISINKRONKAN</span>
            <span className="font-label-mono text-xs font-bold text-[#1C1A27]">
              {wallet.danaLastSyncedAt || 'Barusan'}
            </span>
          </div>
        </div>

        {/* Form to update / sync live balance */}
        <form onSubmit={handleQuickSync} className="space-y-4">
          <div>
            <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-1">
              PERBARUI / SIMULASI SALDO DANA SAAT INI (IDR)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-lg font-headline-md text-[#118EEA] font-black">Rp</span>
              <CurrencyInput
                value={form.data.new_balance}
                onChange={(raw) => form.setData('new_balance', raw)}
                placeholder="1.500.000"
                size="md"
                className="w-full h-14 border-4 border-[#1C1A27] pl-14 pr-4 font-number-xl text-lg bg-white text-[#1C1A27] font-bold shadow-[2px_2px_0px_0px_#1C1A27]"
                required
              />
            </div>
            <p className="font-label-mono text-[10px] text-[#454654] mt-1 font-bold">
              Klik Sinkronkan untuk menarik dan menyesuaikan mutasi saldo DANA secara instan ke sistem.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isRefreshing || form.processing}
              className="flex-1 bg-[#118EEA] text-white border-4 border-[#1C1A27] p-3 font-label-mono text-xs font-black uppercase shadow-[4px_4px_0px_0px_#1C1A27] hover:bg-[#0C76C4] cursor-pointer flex items-center justify-center gap-2"
            >
              <MaterialIcon name="sync" className={`text-xl font-bold ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'MENYINKRONKAN...' : 'SINKRONKAN SEKARANG 🔄'}
            </button>
          </div>

          <div className="pt-4 border-t-2 border-[#1C1A27]/20 flex justify-between items-center">
            <button
              type="button"
              onClick={handleDisconnect}
              className="text-[#BA1A1A] font-label-mono text-xs font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <MaterialIcon name="link_off" className="text-base" />
              Putuskan Koneksi DANA
            </button>
            <NeoButton variant="outline" size="sm" onClick={onClose}>
              TUTUP
            </NeoButton>
          </div>
        </form>
      </div>
    </div>
  );
}

