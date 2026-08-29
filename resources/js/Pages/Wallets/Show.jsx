import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import NeoButton from '../../Components/NeoButton';
import NeoCard from '../../Components/NeoCard';
import FilterChip from '../../Components/FilterChip';
import TransactionItem from '../../Components/TransactionItem';
import MaterialIcon from '../../Components/MaterialIcon';
import CurrencyInput from '../../Components/CurrencyInput';

export default function Show({
  wallet = null,
  walletId = null,
  walletName = 'Wallet',
  totalBalance = 'Rp 0',
  monthlyIncome = '+Rp 0',
  monthlyExpense = '-Rp 0',
  budgetLimit = 'Rp 5.000.000',
  budgetLimitNum = 5000000,
  targetProgress = 0,
  transactionsGrouped = [],
}) {
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [quickTrxType, setQuickTrxType] = useState(null); // 'income' or 'expense' or null
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  // Form for Quick Transaction Shortcut
  const quickForm = useForm({
    wallet_id: walletId,
    type: 'expense',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
  });

  // Form for Budget Limit Modal
  const budgetForm = useForm({
    limit_amount: budgetLimitNum || '',
  });

  const handleOpenQuickModal = (type) => {
    setQuickTrxType(type);
    quickForm.setData({
      wallet_id: walletId,
      type: type,
      amount: '',
      description: '',
      transaction_date: new Date().toISOString().split('T')[0],
    });
  };

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    quickForm.post('/transactions', {
      onSuccess: () => {
        setQuickTrxType(null);
        quickForm.reset();
      },
    });
  };

  const handleBudgetSubmit = (e) => {
    e.preventDefault();
    budgetForm.post(`/wallets/${walletId}/budget`, {
      onSuccess: () => {
        setShowBudgetModal(false);
      },
    });
  };

  // Filter transactions based on active filter chip
  const filteredGrouped = transactionsGrouped.map((group) => {
    const items = group.items.filter((item) => {
      if (activeFilter === 'Masuk') return item.isIncome;
      if (activeFilter === 'Keluar') return !item.isIncome;
      return true;
    });
    return { ...group, items };
  }).filter((group) => group.items.length > 0);

  return (
    <AuthenticatedLayout>
      <Head title={`Wallet - ${walletName}`} />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          {/* Back to Wallets Square Button */}
          <Link href="/wallets">
            <button
              className="w-12 h-12 bg-white neo-border neo-shadow neo-shadow-hover neo-shadow-active flex items-center justify-center transition-all cursor-pointer"
              title="Back to Wallets"
            >
              <MaterialIcon name="arrow_back" className="text-[#1C1A27] font-bold" />
            </button>
          </Link>
          <h1 className="text-3xl md:text-5xl font-display-xl text-[#1C1A27] uppercase break-words max-w-3xl transform rotate-[-1deg] inline-block bg-[#E7DEFF] px-4 py-2 neo-border neo-shadow font-black">
            {walletName}
          </h1>
        </div>

        {/* Quick Transaction Shortcuts specifically for this Wallet */}
        <div className="flex flex-wrap gap-3 shrink-0 self-start md:self-end">
          <button
            type="button"
            onClick={() => handleOpenQuickModal('income')}
            className="bg-[#4ADE80] text-[#1C1A27] neo-border neo-shadow neo-shadow-hover neo-shadow-active px-4 py-3 font-label-mono text-xs uppercase font-bold flex items-center gap-2 cursor-pointer"
          >
            <MaterialIcon name="add" className="text-lg font-bold" />
            + INPUT PEMASUKAN
          </button>
          <button
            type="button"
            onClick={() => handleOpenQuickModal('expense')}
            className="bg-[#F87171] text-[#1C1A27] neo-border neo-shadow neo-shadow-hover neo-shadow-active px-4 py-3 font-label-mono text-xs uppercase font-bold flex items-center gap-2 cursor-pointer"
          >
            <MaterialIcon name="remove" className="text-lg font-bold" />
            - INPUT PENGELUARAN
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 w-full">
        {/* Balance Card */}
        <div className="lg:col-span-8 bg-[#3B4CCA] text-white neo-border neo-shadow p-6 md:p-8 transform rotate-[0.5deg] relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[200px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              account_balance_wallet
            </span>
          </div>
          <p className="font-label-mono text-xs uppercase mb-2 opacity-80 font-bold">Total Saldo Wallet Ini</p>
          <h2 className="text-4xl md:text-6xl font-number-xl font-bold tracking-tight mb-8">
            {totalBalance}
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="bg-[#FDF8FF] text-[#1C1A27] p-4 neo-border neo-shadow flex-1">
              <p className="font-label-mono text-xs text-[#454654] uppercase mb-1 font-bold">Pemasukan (Bulan ini)</p>
              <p className="font-headline-md text-lg font-bold text-[#3B4CCA]">{monthlyIncome}</p>
            </div>
            <div className="bg-[#FDF8FF] text-[#1C1A27] p-4 neo-border neo-shadow flex-1">
              <p className="font-label-mono text-xs text-[#454654] uppercase mb-1 font-bold">Pengeluaran (Bulan ini)</p>
              <p className="font-headline-md text-lg font-bold text-[#BA1A1A]">{monthlyExpense}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions / Mini Stats */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Dynamic Budget Limit Card */}
          <div className="bg-[#8B5CF6] text-white neo-border neo-shadow p-6 transform rotate-[-1deg] flex-1 flex flex-col justify-center relative">
            <div className="flex justify-between items-center mb-1">
              <p className="font-label-mono text-xs uppercase font-bold">Batas Budget Bulanan</p>
              <button
                type="button"
                onClick={() => setShowBudgetModal(true)}
                className="text-[10px] font-label-mono bg-white text-[#1C1A27] px-2 py-0.5 border border-[#1C1A27] font-bold hover:bg-[#F1EBFE] transition-colors cursor-pointer"
                title="Atur Limit Budget"
              >
                EDIT LIMIT ⚙️
              </button>
            </div>
            <p className="text-xs font-body-md text-white/90 mb-2 font-bold">
              Limit: <span className="text-[#A7F3D0]">{budgetLimit}</span>
            </p>
            <div className="w-full bg-[#F1EBFE] h-8 neo-border mb-2 relative overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full border-r-4 border-[#1C1A27] transition-all ${
                  targetProgress > 90 ? 'bg-[#F87171]' : 'bg-[#4ADE80]'
                }`}
                style={{ width: `${targetProgress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs font-label-mono font-bold">
              <span>{monthlyExpense} Terpakai</span>
              <span>{targetProgress}%</span>
            </div>
          </div>

          {/* Dynamic Reports Link */}
          <Link href={`/reports?wallet_id=${walletId}`} className="flex-1">
            <div className="bg-[#E5E0F3] text-[#1C1A27] neo-border neo-shadow p-6 h-full flex items-center justify-between group cursor-pointer hover:bg-[#E9DDFF] transition-colors">
              <div>
                <p className="font-label-mono text-xs uppercase font-bold">Laporan Detail Wallet</p>
                <p className="font-body-md text-sm text-[#454654] mt-1 font-bold">Analisis Keuangan & Export PDF / CSV</p>
              </div>
              <MaterialIcon name="arrow_forward" className="text-3xl group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-4 mb-6 w-full">
        {['Semua', 'Masuk', 'Keluar'].map((filter) => (
          <FilterChip
            key={filter}
            label={filter}
            active={activeFilter === filter}
            onClick={() => setActiveFilter(filter)}
          />
        ))}
      </div>

      {/* Mutasi List Section */}
      <div className="flex flex-col gap-6 w-full">
        {filteredGrouped.length > 0 ? (
          filteredGrouped.map((group, gIdx) => (
            <div key={gIdx}>
              <h3 className="text-lg font-headline-md text-[#1C1A27] bg-[#F1EBFE] inline-block px-4 py-1 neo-border neo-shadow mb-3 transform rotate-[0.5deg] font-bold">
                {group.date}
              </h3>
              <div className="flex flex-col gap-3">
                {group.items.map((tx) => (
                  <TransactionItem
                    key={tx.id}
                    title={tx.title}
                    category={tx.category}
                    subtitle={tx.subtitle}
                    amount={tx.amount}
                    isIncome={tx.isIncome}
                    icon={tx.icon}
                    iconBg={tx.iconBg}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white neo-border neo-shadow p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-[#F1EBFE] neo-border mx-auto flex items-center justify-center">
              <MaterialIcon name="receipt_long" className="text-3xl text-[#454654]" />
            </div>
            <h4 className="text-xl font-headline-md font-bold text-[#1C1A27]">
              Belum Ada Riwayat Transaksi
            </h4>
            <p className="text-sm font-body-md text-[#454654] font-bold max-w-md mx-auto">
              Belum ada transaksi {activeFilter !== 'Semua' ? activeFilter.toLowerCase() : ''} yang dicatat pada wallet ini. Gunakan tombol + Input Pemasukan atau - Input Pengeluaran di atas untuk mencatat transaksi baru.
            </p>
          </div>
        )}
      </div>

      {/* QUICK TRANSACTION SHORTCUT MODAL */}
      {quickTrxType && (
        <div className="fixed inset-0 z-50 bg-[#1C1A27]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <NeoCard
            bg={quickTrxType === 'income' ? 'bg-[#A7F3D0]' : 'bg-[#FFDAD6]'}
            className="w-full max-w-lg p-8 space-y-6"
          >
            <div className="flex justify-between items-center border-b-4 border-[#1C1A27] pb-4">
              <div>
                <span className="font-label-mono text-xs uppercase text-[#454654] font-bold">
                  TRANSAKSI KHUSUS: {walletName}
                </span>
                <h3 className="text-2xl font-display-xl font-bold uppercase text-[#1C1A27]">
                  {quickTrxType === 'income' ? '+ INPUT PEMASUKAN' : '- INPUT PENGELUARAN'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickTrxType(null)}
                className="w-10 h-10 neo-border bg-white flex items-center justify-center hover:bg-white/80 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickSubmit} className="space-y-4">
              <div>
                <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
                  NOMINAL TRANSAKSI (IDR)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-2xl font-number-xl font-bold text-[#454654]">Rp</span>
                  <CurrencyInput
                    value={quickForm.data.amount}
                    onChange={(raw) => quickForm.setData('amount', raw)}
                    placeholder="0"
                    size="lg"
                    required
                    className="w-full neo-border py-4 pl-16 pr-4 bg-white font-number-xl text-[#1C1A27] font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
                  CATATAN / KETERANGAN
                </label>
                <input
                  type="text"
                  value={quickForm.data.description}
                  onChange={(e) => quickForm.setData('description', e.target.value)}
                  placeholder="Misal: Servis AC Budi / Beli Kuota"
                  className="w-full neo-border p-3 font-body-md bg-white text-[#1C1A27] font-bold"
                />
              </div>

              <div>
                <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
                  TANGGAL TRANSAKSI
                </label>
                <input
                  type="date"
                  value={quickForm.data.transaction_date}
                  onChange={(e) => quickForm.setData('transaction_date', e.target.value)}
                  required
                  className="w-full neo-border p-3 font-body-md bg-white text-[#1C1A27] font-bold cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t-4 border-[#1C1A27]">
                <NeoButton
                  variant="outline"
                  size="md"
                  onClick={() => setQuickTrxType(null)}
                >
                  BATAL
                </NeoButton>
                <NeoButton
                  type="submit"
                  variant={quickTrxType === 'income' ? 'primary' : 'danger'}
                  size="md"
                  disabled={quickForm.processing}
                >
                  {quickForm.processing ? 'SIMPAN...' : 'SIMPAN TRANSAKSI'}
                </NeoButton>
              </div>
            </form>
          </NeoCard>
        </div>
      )}

      {/* EDIT BUDGET LIMIT MODAL */}
      {showBudgetModal && (
        <div className="fixed inset-0 z-50 bg-[#1C1A27]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <NeoCard bg="bg-[#F1EBFE]" className="w-full max-w-md p-8 space-y-6">
            <div className="flex justify-between items-center border-b-4 border-[#1C1A27] pb-4">
              <div>
                <span className="font-label-mono text-xs uppercase text-[#454654] font-bold">
                  {walletName}
                </span>
                <h3 className="text-2xl font-display-xl font-bold uppercase text-[#1C1A27]">
                  ATUR BATAS BUDGET
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBudgetModal(false)}
                className="w-10 h-10 neo-border bg-white flex items-center justify-center hover:bg-[#FFDAD6] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBudgetSubmit} className="space-y-4">
              <div>
                <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
                  BATAS MAKSIMAL PENGELUARAN BULANAN (IDR)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-2xl font-number-xl font-bold text-[#454654]">Rp</span>
                  <CurrencyInput
                    value={budgetForm.data.limit_amount}
                    onChange={(raw) => budgetForm.setData('limit_amount', raw)}
                    placeholder="5.000.000"
                    size="lg"
                    required
                    className="w-full neo-border py-4 pl-16 pr-4 bg-white font-number-xl text-[#1C1A27] font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t-4 border-[#1C1A27]">
                <NeoButton
                  variant="outline"
                  size="md"
                  onClick={() => setShowBudgetModal(false)}
                >
                  BATAL
                </NeoButton>
                <NeoButton
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={budgetForm.processing}
                >
                  {budgetForm.processing ? 'SIMPAN...' : 'SIMPAN BUDGET'}
                </NeoButton>
              </div>
            </form>
          </NeoCard>
        </div>
      )}
    </AuthenticatedLayout>
  );
}
