import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import NeoCard from '../../Components/NeoCard';
import NeoButton from '../../Components/NeoButton';
import MaterialIcon from '../../Components/MaterialIcon';
import CurrencyInput from '../../Components/CurrencyInput';

export default function Index({ wallets = [], totalCombinedBalance = 'Rp 0' }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);

  // Form for Creating Wallet
  const createForm = useForm({
    name: '',
    type: 'personal',
    initial_balance: '',
    icon: 'account_balance_wallet',
    color_hex: '#C4B5FD',
  });

  // Form for Editing Wallet
  const editForm = useForm({
    name: '',
    type: 'personal',
    initial_balance: '',
    icon: 'account_balance_wallet',
    color_hex: '#C4B5FD',
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    createForm.post('/wallets', {
      onSuccess: () => {
        setShowAddModal(false);
        createForm.reset();
      },
    });
  };

  const handleStartEdit = (wallet) => {
    setEditingWallet(wallet);
    editForm.setData({
      name: wallet.name,
      type: wallet.type,
      initial_balance: wallet.balanceNum || 0,
      icon: wallet.icon || 'account_balance_wallet',
      color_hex: wallet.colorHex || '#C4B5FD',
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    editForm.put(`/wallets/${editingWallet.id}`, {
      onSuccess: () => {
        setEditingWallet(null);
        editForm.reset();
      },
    });
  };

  const handleDelete = (wallet) => {
    if (confirm(`Apakah Anda yakin ingin menghapus wallet "${wallet.name}"?`)) {
      router.delete(`/wallets/${wallet.id}`);
    }
  };

  return (
    <AuthenticatedLayout>
      <Head title="Wallets - RAW LOGIC" />

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

        <NeoButton
          variant="primary"
          size="lg"
          onClick={() => setShowAddModal(true)}
          className="shrink-0"
        >
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

              {/* Action Dropdown / Edit & Delete buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStartEdit(wallet)}
                  className="w-9 h-9 bg-white text-[#1C1A27] neo-border flex items-center justify-center hover:bg-[#F1EBFE] transition-colors cursor-pointer font-bold neo-shadow-sm"
                  title="Edit Wallet"
                >
                  <MaterialIcon name="edit" className="text-lg" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(wallet)}
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

      {/* CREATE WALLET MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#1C1A27]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <NeoCard bg="bg-[#F1EBFE]" className="w-full max-w-lg p-8 space-y-6">
            <div className="flex justify-between items-center border-b-4 border-[#1C1A27] pb-4">
              <h3 className="text-2xl font-display-xl font-bold uppercase">TAMBAH WALLET BARU</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-10 h-10 neo-border bg-white flex items-center justify-center hover:bg-[#FFDAD6] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {createForm.errors.name && (
              <p className="text-[#93000A] font-label-mono text-xs font-bold">
                {createForm.errors.name}
              </p>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
                  NAMA WALLET
                </label>
                <input
                  type="text"
                  value={createForm.data.name}
                  onChange={(e) => createForm.setData('name', e.target.value)}
                  placeholder="Misal: Dompet BCA Utama, Dana Darurat"
                  required
                  className="w-full neo-border p-3 font-body-md bg-white text-[#1C1A27] font-bold"
                />
              </div>

              <div>
                <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
                  TIPE WALLET
                </label>
                <select
                  value={createForm.data.type}
                  onChange={(e) => createForm.setData('type', e.target.value)}
                  className="w-full neo-border p-3 font-body-md bg-white text-[#1C1A27] font-bold cursor-pointer"
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
                  value={createForm.data.initial_balance}
                  onChange={(raw) => createForm.setData('initial_balance', raw)}
                  placeholder="0"
                  size="md"
                  className="w-full neo-border p-3 font-body-md bg-white text-[#1C1A27] font-bold"
                />
              </div>

              <div>
                <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
                  WARNA KARTU
                </label>
                <select
                  value={createForm.data.color_hex}
                  onChange={(e) => createForm.setData('color_hex', e.target.value)}
                  className="w-full neo-border p-3 font-body-md bg-white text-[#1C1A27] font-bold cursor-pointer"
                >
                  <option value="#C4B5FD">Purple / Ungu (#C4B5FD)</option>
                  <option value="#8455EF">Vibrant Purple (#8455EF)</option>
                  <option value="#FFFFFF">White / Putih (#FFFFFF)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t-4 border-[#1C1A27]">
                <NeoButton
                  variant="outline"
                  size="md"
                  onClick={() => setShowAddModal(false)}
                >
                  BATAL
                </NeoButton>
                <NeoButton
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={createForm.processing}
                >
                  {createForm.processing ? 'MEMPROSES...' : 'SIMPAN WALLET'}
                </NeoButton>
              </div>
            </form>
          </NeoCard>
        </div>
      )}

      {/* EDIT WALLET MODAL */}
      {editingWallet && (
        <div className="fixed inset-0 z-50 bg-[#1C1A27]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <NeoCard bg="bg-[#F1EBFE]" className="w-full max-w-lg p-8 space-y-6">
            <div className="flex justify-between items-center border-b-4 border-[#1C1A27] pb-4">
              <h3 className="text-2xl font-display-xl font-bold uppercase">EDIT WALLET</h3>
              <button
                type="button"
                onClick={() => setEditingWallet(null)}
                className="w-10 h-10 neo-border bg-white flex items-center justify-center hover:bg-[#FFDAD6] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
                  NAMA WALLET
                </label>
                <input
                  type="text"
                  value={editForm.data.name}
                  onChange={(e) => editForm.setData('name', e.target.value)}
                  required
                  className="w-full neo-border p-3 font-body-md bg-white text-[#1C1A27] font-bold"
                />
              </div>

              <div>
                <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
                  TIPE WALLET
                </label>
                <select
                  value={editForm.data.type}
                  onChange={(e) => editForm.setData('type', e.target.value)}
                  className="w-full neo-border p-3 font-body-md bg-white text-[#1C1A27] font-bold cursor-pointer"
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
                  value={editForm.data.initial_balance}
                  onChange={(raw) => editForm.setData('initial_balance', raw)}
                  size="md"
                  className="w-full neo-border p-3 font-body-md bg-white text-[#1C1A27] font-bold"
                />
              </div>

              <div>
                <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
                  WARNA KARTU
                </label>
                <select
                  value={editForm.data.color_hex}
                  onChange={(e) => editForm.setData('color_hex', e.target.value)}
                  className="w-full neo-border p-3 font-body-md bg-white text-[#1C1A27] font-bold cursor-pointer"
                >
                  <option value="#C4B5FD">Purple / Ungu (#C4B5FD)</option>
                  <option value="#8455EF">Vibrant Purple (#8455EF)</option>
                  <option value="#FFFFFF">White / Putih (#FFFFFF)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t-4 border-[#1C1A27]">
                <NeoButton
                  variant="outline"
                  size="md"
                  onClick={() => setEditingWallet(null)}
                >
                  BATAL
                </NeoButton>
                <NeoButton
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={editForm.processing}
                >
                  {editForm.processing ? 'MEMPROSES...' : 'SIMPAN PERUBAHAN'}
                </NeoButton>
              </div>
            </form>
          </NeoCard>
        </div>
      )}
    </AuthenticatedLayout>
  );
}
