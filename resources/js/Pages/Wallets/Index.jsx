import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import NeoCard from '../../Components/NeoCard';
import NeoButton from '../../Components/NeoButton';
import MaterialIcon from '../../Components/MaterialIcon';
import CurrencyInput from '../../Components/CurrencyInput';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

const DAYS_OF_WEEK = [
  { value: 0, label: 'Hari Minggu' },
  { value: 1, label: 'Hari Senin' },
  { value: 2, label: 'Hari Selasa' },
  { value: 3, label: 'Hari Rabu' },
  { value: 4, label: 'Hari Kamis' },
  { value: 5, label: 'Hari Jumat' },
  { value: 6, label: 'Hari Sabtu' },
];

const ROTATIONS = ['rotate-[-0.5deg]', 'rotate-[0.5deg]', 'rotate-[0deg]', 'rotate-[-1deg]', 'rotate-[1deg]'];

/* ============================
   MODAL OVERLAY
   ============================ */
function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" />
      <div
        className={`relative bg-[#FDF8FF] border-4 border-[#1C1A27] neo-shadow p-6 md:p-8 w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 border-b-4 border-[#1C1A27] pb-4">
          <h2 className="text-2xl font-headline-md text-[#1C1A27] uppercase tracking-tight font-bold">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white border-4 border-[#1C1A27] flex items-center justify-center cursor-pointer hover:bg-[#FECACA] transition-colors"
          >
            <MaterialIcon name="close" className="text-xl text-[#1C1A27] font-bold" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ============================
   WALLET REMINDER FORM
   ============================ */
function WalletReminderForm({ wallets = [], categories = [], reminder = null, onClose }) {
  const isEditing = !!reminder;

  const form = useForm({
    title: reminder?.title ?? '',
    wallet_id: reminder?.wallet_id ?? (wallets.length > 0 ? wallets[0].id : ''),
    category_id: reminder?.category_id ?? '',
    type: reminder?.type ?? 'expense',
    amount: reminder?.amount ? String(reminder.amount) : '100000',
    frequency: reminder?.frequency ?? 'monthly',
    day_of_week: reminder?.day_of_week ?? 0,
    day_of_month: reminder?.day_of_month ?? 1,
    is_active: reminder?.is_active ?? true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      form.put(`/saving-reminders/${reminder.id}`, { onSuccess: onClose });
    } else {
      form.post('/saving-reminders', { onSuccess: onClose });
    }
  };

  const filteredCategories = categories.filter((c) => c.type === form.data.type);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
          NAMA PENGINGAT (DESKRIPSI)
        </label>
        <input
          type="text"
          value={form.data.title}
          onChange={(e) => form.setData('title', e.target.value)}
          placeholder="Misal: Gaji Bulanan, Tagihan Listrik, Internet..."
          className="w-full h-14 px-4 bg-white border-4 border-[#1C1A27] text-base font-body-md text-[#1C1A27] focus:outline-none shadow-[4px_4px_0px_0px_#1C1A27]"
          required
        />
        {form.errors.title && <p className="text-[#BA1A1A] font-label-mono text-xs font-bold">{form.errors.title}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => form.setData('type', 'income')}
          className={`p-3 border-4 border-[#1C1A27] flex items-center justify-center gap-2 font-label-mono text-xs font-bold cursor-pointer transition-all ${
            form.data.type === 'income' ? 'bg-[#4ADE80] shadow-[4px_4px_0px_0px_#1C1A27]' : 'bg-white hover:bg-[#DCFCE7]'
          }`}
        >
          <MaterialIcon name="arrow_downward" className="text-xl" />
          PEMASUKAN
        </button>
        <button
          type="button"
          onClick={() => form.setData('type', 'expense')}
          className={`p-3 border-4 border-[#1C1A27] flex items-center justify-center gap-2 font-label-mono text-xs font-bold cursor-pointer transition-all ${
            form.data.type === 'expense' ? 'bg-[#F87171] text-white shadow-[4px_4px_0px_0px_#1C1A27]' : 'bg-white hover:bg-[#FEE2E2]'
          }`}
        >
          <MaterialIcon name="arrow_upward" className="text-xl" />
          PENGELUARAN
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
            WALLET
          </label>
          <select
            value={form.data.wallet_id}
            onChange={(e) => form.setData('wallet_id', e.target.value)}
            className="w-full h-14 px-3 bg-white border-4 border-[#1C1A27] text-sm font-body-md cursor-pointer shadow-[4px_4px_0px_0px_#1C1A27]"
            required
          >
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
            KATEGORI
          </label>
          <select
            value={form.data.category_id}
            onChange={(e) => form.setData('category_id', e.target.value)}
            className="w-full h-14 px-3 bg-white border-4 border-[#1C1A27] text-sm font-body-md cursor-pointer shadow-[4px_4px_0px_0px_#1C1A27]"
          >
            <option value="">-- Tanpa Kategori --</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
          NOMINAL (Rp)
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-4 text-2xl font-headline-md text-[#454654] font-bold">Rp</span>
          <CurrencyInput
            value={form.data.amount}
            onChange={(raw) => form.setData('amount', raw)}
            placeholder="100.000"
            size="xl"
            className="w-full h-16 pl-16 pr-4 bg-white border-4 border-[#1C1A27] font-number-xl text-[#1C1A27] shadow-[4px_4px_0px_0px_#1C1A27]"
            required
          />
        </div>
        {form.errors.amount && <p className="text-[#BA1A1A] font-label-mono text-xs font-bold">{form.errors.amount}</p>}
      </div>

      <div className="space-y-2">
        <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
          FREKUENSI PENGINGAT
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'weekly', label: 'MINGGUAN', icon: 'date_range' },
            { id: 'daily', label: 'HARIAN', icon: 'today' },
            { id: 'monthly', label: 'BULANAN', icon: 'calendar_month' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => form.setData('frequency', f.id)}
              className={`p-3 border-4 border-[#1C1A27] flex flex-col items-center justify-center gap-1 font-label-mono text-xs font-bold cursor-pointer transition-all ${
                form.data.frequency === f.id
                  ? 'bg-[#8B5CF6] text-white shadow-[4px_4px_0px_0px_#1C1A27]'
                  : 'bg-white text-[#1C1A27] hover:bg-[#E7DEFF]'
              }`}
            >
              <MaterialIcon name={f.icon} className="text-xl" />
              <span>{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {form.data.frequency === 'weekly' && (
        <div className="space-y-2 bg-[#E7DEFF] border-4 border-[#1C1A27] p-4">
          <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
            PILIH HARI PENGINGAT
          </label>
          <select
            value={form.data.day_of_week}
            onChange={(e) => form.setData('day_of_week', parseInt(e.target.value))}
            className="w-full h-12 px-3 bg-white border-2 border-[#1C1A27] text-sm font-bold font-label-mono cursor-pointer"
          >
            {DAYS_OF_WEEK.map((d) => (
              <option key={d.value} value={d.value}>Setiap {d.label}</option>
            ))}
          </select>
        </div>
      )}

      {form.data.frequency === 'monthly' && (
        <div className="space-y-2 bg-[#E7DEFF] border-4 border-[#1C1A27] p-4">
          <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
            PILIH TANGGAL BULANAN (1 - 31)
          </label>
          <select
            value={form.data.day_of_month}
            onChange={(e) => form.setData('day_of_month', parseInt(e.target.value))}
            className="w-full h-12 px-3 bg-white border-2 border-[#1C1A27] text-sm font-bold font-label-mono cursor-pointer"
          >
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
              <option key={day} value={day}>Setiap Tanggal {day}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-3 bg-white border-4 border-[#1C1A27] p-3">
        <input
          type="checkbox"
          id="is_active_check"
          checked={form.data.is_active}
          onChange={(e) => form.setData('is_active', e.target.checked)}
          className="w-6 h-6 border-2 border-[#1C1A27] text-[#8B5CF6] cursor-pointer"
        />
        <label htmlFor="is_active_check" className="font-label-mono text-xs uppercase font-bold cursor-pointer">
          Aktifkan Notifikasi Pengingat Ini
        </label>
      </div>

      <NeoButton type="submit" variant="primary" size="xl" className="w-full" disabled={form.processing}>
        <MaterialIcon name={isEditing ? 'save' : 'alarm_on'} className="text-2xl" />
        {form.processing ? 'MENYIMPAN...' : isEditing ? 'SIMPAN PERUBAHAN' : 'PASANG PENGINGAT SEKARANG'}
      </NeoButton>
    </form>
  );
}

/* ============================
   DELETE REMINDER CONFIRMATION
   ============================ */
function DeleteReminderConfirm({ reminder, onClose }) {
  const [processing, setProcessing] = useState(false);

  const handleDelete = () => {
    setProcessing(true);
    router.delete(`/saving-reminders/${reminder.id}`, {
      onSuccess: onClose,
      onFinish: () => setProcessing(false),
    });
  };

  return (
    <div className="space-y-5">
      <div className="bg-[#FDE8E8] border-4 border-[#1C1A27] p-4 text-center">
        <MaterialIcon name="warning" className="text-5xl text-[#BA1A1A] mb-2" />
        <h3 className="text-xl font-headline-md text-[#1C1A27] font-bold">Hapus Jadwal?</h3>
        <p className="text-sm font-body-md text-[#454654] mt-2 font-bold">
          Program pengingat <strong>"{reminder.title}"</strong> akan dihapus.
        </p>
      </div>
      <div className="flex gap-4">
        <NeoButton variant="outline" size="lg" className="flex-1" onClick={onClose}>BATAL</NeoButton>
        <button
          onClick={handleDelete}
          disabled={processing}
          className="flex-1 h-14 bg-[#BA1A1A] text-white border-4 border-[#1C1A27] neo-shadow font-headline-md text-base uppercase flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <MaterialIcon name="delete_forever" className="text-xl" />
          HAPUS
        </button>
      </div>
    </div>
  );
}

export default function Index({ wallets = [], reminders = [], categories = [], totalCombinedBalance = 'Rp 0' }) {
  const [modal, setModal] = useState(null); // 'wallet_create' | 'wallet_edit' | 'reminder_create' | 'reminder_edit' | 'reminder_delete'
  const [activeWallet, setActiveWallet] = useState(null);
  const [activeReminder, setActiveReminder] = useState(null);

  const openModal = (type, data = null) => {
    setModal(type);
    if (type.startsWith('wallet_')) setActiveWallet(data);
    else if (type.startsWith('reminder_')) setActiveReminder(data);
  };
  const closeModal = () => {
    setModal(null);
    setActiveWallet(null);
    setActiveReminder(null);
    walletForm.reset();
  };

  const walletForm = useForm({
    name: '',
    type: 'personal',
    initial_balance: '',
    icon: 'account_balance_wallet',
    color_hex: '#C4B5FD',
  });

  const handleWalletSubmit = (e) => {
    e.preventDefault();
    if (activeWallet) {
      walletForm.put(`/wallets/${activeWallet.id}`, { onSuccess: closeModal });
    } else {
      walletForm.post('/wallets', { onSuccess: closeModal });
    }
  };

  const handleEditWallet = (wallet) => {
    walletForm.setData({
      name: wallet.name,
      type: wallet.type,
      initial_balance: wallet.balanceNum || 0,
      icon: wallet.icon || 'account_balance_wallet',
      color_hex: wallet.colorHex || '#C4B5FD',
    });
    openModal('wallet_edit', wallet);
  };

  const handleDeleteWallet = (wallet) => {
    if (confirm(`Apakah Anda yakin ingin menghapus wallet "${wallet.name}"?`)) {
      router.delete(`/wallets/${wallet.id}`);
    }
  };

  const handleToggleReminder = (reminder) => {
    router.patch(`/saving-reminders/${reminder.id}/toggle`, {}, { preserveScroll: true });
  };

  const handleFastTransaction = (reminder) => {
    router.post(`/saving-reminders/${reminder.id}/transaction`, {}, { preserveScroll: true });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Wallets - VIRA" />

      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-[#1C1A27] pb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display-xl text-[#1C1A27] uppercase tracking-tighter mb-2 font-black">
            Daftar Wallets
          </h1>
          <p className="text-base font-body-md text-[#454654] font-bold max-w-2xl">
            Kelola seluruh sumber dana, e-wallet, kas bisnis, dan rekening tabungan Anda secara terpisah dan transparan.
          </p>
        </div>
        <NeoButton variant="primary" size="lg" onClick={() => openModal('wallet_create')} className="shrink-0">
          <MaterialIcon name="add_card" className="text-xl" />
          TAMBAH WALLET BARU
        </NeoButton>
      </div>

      {/* Combined Balance Banner */}
      <NeoCard bg="bg-[#3B4CCA]" rotate="rotate-[0.5deg]" className="text-white p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="font-label-mono text-xs uppercase tracking-widest text-white/80 font-bold mb-1">
              TOTAL SALDO TERGABUNG (ALL WALLETS)
            </p>
            <h2 className="text-4xl md:text-6xl font-number-xl font-bold tracking-tight">
              {totalCombinedBalance}
            </h2>
          </div>
          <div className="bg-white/10 backdrop-blur-md border-4 border-white p-4 font-label-mono text-xs uppercase font-bold shadow-[4px_4px_0px_0px_white]">
            <p>AKTIF: {wallets.length} WALLETS</p>
            <p className="mt-1 text-[#A7F3D0]">TERKONEKSI DATABASE</p>
          </div>
        </div>
      </NeoCard>

      {/* PROGRAM KEUANGAN RUTIN SECTION */}
      <section className="mb-12 bg-white neo-border neo-shadow p-6 md:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-[#1C1A27] pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#8B5CF6] text-white neo-border flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#1C1A27]">
              <MaterialIcon name="event_repeat" className="text-2xl font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-headline-md text-[#1C1A27] uppercase font-black">
                  PROGRAM KEUANGAN RUTIN
                </h2>
                <span className="bg-[#FEF08A] text-[#854D0E] font-label-mono text-[10px] font-black border border-[#1C1A27] px-2 py-0.5 uppercase hidden sm:inline-block">
                  FITUR UNGGULAN
                </span>
              </div>
              <p className="font-body-md text-xs md:text-sm text-[#454654] font-bold mt-0.5">
                Pengingat otomatis untuk tagihan, cicilan, langganan bulanan, atau pemasukan rutin (seperti Gaji).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openModal('reminder_create')}
            className="bg-[#1C1A27] text-white neo-border px-4 py-2.5 font-label-mono text-xs uppercase font-bold neo-shadow neo-shadow-hover neo-shadow-active flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <MaterialIcon name="add" className="text-lg font-bold" />
            BUAT PENGINGAT BARU
          </button>
        </div>

        {reminders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {reminders.map((reminder, idx) => (
              <div
                key={reminder.id}
                className={`bg-[#FDF8FF] border-4 border-[#1C1A27] p-5 neo-shadow flex flex-col justify-between gap-4 transition-all ${
                  ROTATIONS[idx % ROTATIONS.length]
                } ${!reminder.is_active ? 'opacity-70 grayscale-[30%]' : ''}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-label-mono text-[11px] font-black bg-[#E7DEFF] text-[#1C1A27] border-2 border-[#1C1A27] px-2.5 py-0.5 uppercase">
                      📅 {reminder.frequency_label}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleReminder(reminder)}
                      className={`font-label-mono text-[10px] font-black px-2 py-0.5 border-2 border-[#1C1A27] uppercase cursor-pointer ${
                        reminder.is_active ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {reminder.is_active ? '🟢 AKTIF' : '⚪ NONAKTIF'}
                    </button>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-headline-md font-bold text-[#1C1A27] truncate">
                      {reminder.title}
                    </h3>
                    {reminder.type === 'income' ? (
                      <span className="shrink-0 bg-[#4ADE80] border border-[#1C1A27] text-[#1C1A27] px-2 py-0.5 font-label-mono text-[10px] font-black">PEMASUKAN</span>
                    ) : (
                      <span className="shrink-0 bg-[#F87171] border border-[#1C1A27] text-white px-2 py-0.5 font-label-mono text-[10px] font-black">PENGELUARAN</span>
                    )}
                  </div>

                  <div className="mt-2 space-y-1 font-label-mono text-xs text-[#454654] font-bold">
                    <div className="flex items-center gap-1.5">
                      <MaterialIcon name="account_balance_wallet" className="text-sm text-[#3B4CCA]" />
                      <span>Wallet: <strong className="text-[#1C1A27]">{reminder.wallet_name}</strong></span>
                    </div>
                    {reminder.category_name !== '-' && (
                      <div className="flex items-center gap-1.5">
                        <MaterialIcon name="category" className="text-sm text-[#8B5CF6]" />
                        <span>Kategori: <strong className="text-[#1C1A27]">{reminder.category_name}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-[#1C1A27]/20 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="font-label-mono text-[10px] uppercase text-[#454654] font-bold">Nominal</span>
                    <span className={`font-number-xl text-2xl font-bold ${reminder.type === 'income' ? 'text-[#16A34A]' : 'text-[#BA1A1A]'}`}>
                      {reminder.amount_formatted}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleFastTransaction(reminder)}
                      className={`flex-1 border-2 border-[#1C1A27] py-2 px-3 font-label-mono text-[11px] md:text-xs uppercase font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#1C1A27] transition-colors ${
                        reminder.type === 'income' 
                          ? 'bg-[#4ADE80] hover:bg-[#22C55E] text-[#1C1A27]' 
                          : 'bg-[#F87171] hover:bg-[#EF4444] text-white'
                      }`}
                    >
                      <MaterialIcon name={reminder.type === 'income' ? 'arrow_downward' : 'payment'} className="text-base" />
                      CATAT SEKARANG
                    </button>
                    <button
                      type="button"
                      onClick={() => openModal('reminder_edit', reminder)}
                      className="w-9 h-9 bg-[#E7DEFF] text-[#1C1A27] border-2 border-[#1C1A27] flex items-center justify-center hover:bg-[#8B5CF6] hover:text-white transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#1C1A27]"
                    >
                      <MaterialIcon name="edit" className="text-sm font-bold" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openModal('reminder_delete', reminder)}
                      className="w-9 h-9 bg-[#FFDAD6] text-[#93000A] border-2 border-[#1C1A27] flex items-center justify-center hover:bg-[#BA1A1A] hover:text-white transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#1C1A27]"
                    >
                      <MaterialIcon name="delete" className="text-sm font-bold" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#F1EBFE] border-3 border-[#1C1A27] p-6 text-center space-y-3">
            <MaterialIcon name="event_repeat" className="text-4xl text-[#8B5CF6] mx-auto" />
            <h4 className="text-lg font-headline-md font-bold text-[#1C1A27] uppercase">
              Belum Ada Pengingat Rutin
            </h4>
            <p className="font-body-md text-sm text-[#454654] font-bold max-w-lg mx-auto">
              Pasang jadwal otomatis untuk gaji bulanan, tagihan internet, listrik, atau cicilan. Sistem akan memberi notifikasi live!
            </p>
            <button
              type="button"
              onClick={() => openModal('reminder_create')}
              className="bg-[#1C1A27] text-white neo-border px-4 py-2 font-label-mono text-xs uppercase font-bold neo-shadow hover:bg-[#3B4CCA] cursor-pointer inline-flex items-center gap-2"
            >
              <MaterialIcon name="add" className="text-base" />
              BUAT PENGINGAT PERTAMA
            </button>
          </div>
        )}
      </section>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {wallets.map((wallet) => (
          <NeoCard
            key={wallet.id}
            bg={wallet.bg}
            rotate={wallet.rotate}
            className={`p-6 md:p-8 flex flex-col justify-between space-y-6 ${
              wallet.bg === 'bg-[#8455EF]' ? 'text-white' : 'text-[#1C1A27]'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white neo-border flex items-center justify-center shrink-0">
                  <MaterialIcon name={wallet.icon} className="text-3xl text-[#1C1A27]" />
                </div>
                <div>
                  <span className="text-xs font-label-mono uppercase px-2 py-0.5 border-2 border-[#1C1A27] bg-white text-[#1C1A27] font-bold">
                    {wallet.typeLabel}
                  </span>
                  <h3 className="text-2xl font-headline-md font-bold mt-1 uppercase">
                    {wallet.name}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleEditWallet(wallet)}
                  className="w-9 h-9 bg-white text-[#1C1A27] neo-border flex items-center justify-center hover:bg-[#F1EBFE] transition-colors cursor-pointer font-bold neo-shadow-sm"
                  title="Edit Wallet"
                >
                  <MaterialIcon name="edit" className="text-lg" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteWallet(wallet)}
                  className="w-9 h-9 bg-[#FFDAD6] text-[#93000A] neo-border flex items-center justify-center hover:bg-[#BA1A1A] hover:text-white transition-colors cursor-pointer font-bold neo-shadow-sm"
                  title="Hapus Wallet"
                >
                  <MaterialIcon name="delete" className="text-lg" />
                </button>
              </div>
            </div>

            <div>
              <p className="font-label-mono text-xs uppercase opacity-80 font-bold mb-1">
                SALDO SAAT INI
              </p>
              <p className="text-3xl md:text-4xl font-number-xl font-bold tracking-tight">
                {wallet.balance}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t-4 border-[#1C1A27] border-dashed">
              <div className="bg-white/80 text-[#1C1A27] p-3 neo-border text-xs font-label-mono font-bold">
                <span className="text-[#454654] block">PEMASUKAN</span>
                <span className="text-[#3B4CCA] text-sm font-bold">{wallet.income}</span>
              </div>
              <div className="bg-white/80 text-[#1C1A27] p-3 neo-border text-xs font-label-mono font-bold">
                <span className="text-[#454654] block">PENGELUARAN</span>
                <span className="text-[#BA1A1A] text-sm font-bold">{wallet.expense}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Link href={`/wallets/detail/${wallet.id}`} className="flex-1">
                <NeoButton variant="outline" size="md" className="w-full">
                  <MaterialIcon name="visibility" className="text-lg" />
                  MUTASI & DETAIL
                </NeoButton>
              </Link>
              <Link href={`/transactions/create?wallet_id=${wallet.id}`} className="shrink-0">
                <NeoButton variant="secondary" size="md">
                  <MaterialIcon name="add" className="text-lg" />
                  + TRANSAKSI
                </NeoButton>
              </Link>
            </div>
          </NeoCard>
        ))}
      </div>

      {/* MODALS */}
      <Modal isOpen={modal === 'wallet_create' || modal === 'wallet_edit'} onClose={closeModal} title={modal === 'wallet_create' ? 'TAMBAH WALLET BARU' : 'EDIT WALLET'}>
        <form onSubmit={handleWalletSubmit} className="space-y-4">
          <div>
            <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
              NAMA WALLET
            </label>
            <input
              type="text"
              value={walletForm.data.name}
              onChange={(e) => walletForm.setData('name', e.target.value)}
              placeholder="Misal: Dompet BCA Utama, Dana Darurat"
              required
              className="w-full h-14 neo-border px-4 font-body-md bg-white text-[#1C1A27] font-bold"
            />
          </div>
          <div>
            <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
              TIPE WALLET
            </label>
            <select
              value={walletForm.data.type}
              onChange={(e) => walletForm.setData('type', e.target.value)}
              className="w-full h-14 neo-border px-4 font-body-md bg-white text-[#1C1A27] font-bold cursor-pointer"
            >
              <option value="personal">Personal / Kas Pribadi</option>
              <option value="business">Business / Usaha</option>
              <option value="savings">Savings / Tabungan</option>
              <option value="other">Other / E-Wallet</option>
            </select>
          </div>
          <div>
            <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
              SALDO AWAL (IDR)
            </label>
            <CurrencyInput
              value={walletForm.data.initial_balance}
              onChange={(raw) => walletForm.setData('initial_balance', raw)}
              placeholder="0"
              size="md"
              className="w-full h-14 neo-border px-4 font-body-md bg-white text-[#1C1A27] font-bold"
            />
          </div>
          <div>
            <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
              WARNA KARTU
            </label>
            <select
              value={walletForm.data.color_hex}
              onChange={(e) => walletForm.setData('color_hex', e.target.value)}
              className="w-full h-14 neo-border px-4 font-body-md bg-white text-[#1C1A27] font-bold cursor-pointer"
            >
              <option value="#C4B5FD">Purple / Ungu (#C4B5FD)</option>
              <option value="#8455EF">Vibrant Purple (#8455EF)</option>
              <option value="#FFFFFF">White / Putih (#FFFFFF)</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t-4 border-[#1C1A27]">
            <NeoButton variant="outline" size="md" onClick={closeModal}>BATAL</NeoButton>
            <NeoButton type="submit" variant="primary" size="md" disabled={walletForm.processing}>
              {walletForm.processing ? 'MEMPROSES...' : 'SIMPAN WALLET'}
            </NeoButton>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modal === 'reminder_create'} onClose={closeModal} title="Buat Pengingat Keuangan Rutin">
        <WalletReminderForm wallets={wallets} categories={categories} onClose={closeModal} />
      </Modal>

      <Modal isOpen={modal === 'reminder_edit'} onClose={closeModal} title="Edit Pengingat Keuangan Rutin">
        {activeReminder && <WalletReminderForm wallets={wallets} categories={categories} reminder={activeReminder} onClose={closeModal} />}
      </Modal>

      <Modal isOpen={modal === 'reminder_delete'} onClose={closeModal} title="Hapus Jadwal" maxWidth="max-w-md">
        {activeReminder && <DeleteReminderConfirm reminder={activeReminder} onClose={closeModal} />}
      </Modal>
    </AuthenticatedLayout>
  );
}
