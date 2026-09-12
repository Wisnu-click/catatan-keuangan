import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import WalletCard from '../Components/WalletCard';
import StatCard from '../Components/StatCard';
import TransactionItem from '../Components/TransactionItem';
import MaterialIcon from '../Components/MaterialIcon';
import FinancialOverviewChart from '../Components/FinancialOverviewChart';

export default function Dashboard({
  totalBalance = 'Rp 0',
  monthlyIncrease = 'REAL TIME BALANCE',
  wallets = [],
  stats = { income: '+Rp 0', expense: '-Rp 0' },
  financialOverview = [],
  recentTransactions = [],
}) {
  return (
    <AuthenticatedLayout>
      <Head title="Dashboard" />

      {/* Total Balance Card */}
      <div className="bg-[#8B5CF6] text-white neo-border neo-shadow p-8 flex flex-col justify-between min-h-[220px] transform rotate-[0.5deg]">
        <h2 className="text-sm font-label-mono uppercase tracking-widest text-white/80 font-bold">
          Total Balance
        </h2>
        <div className="mt-4">
          <span className="text-4xl md:text-6xl font-number-xl font-bold block">
            {totalBalance}
          </span>
          <span className="inline-block mt-4 border-4 border-white px-3 py-1 text-xs font-label-mono uppercase bg-white/10 backdrop-blur-sm shadow-[4px_4px_0px_0px_white] font-bold">
            {monthlyIncrease}
          </span>
        </div>
      </div>

      {/* Wallet Row */}
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-headline-md font-bold text-[#1C1A27]">Wallets</h3>
          <Link
            href="/wallets"
            className="font-label-mono text-xs uppercase text-[#3B4CCA] hover:underline font-bold"
          >
            Lihat Semua â†’
          </Link>
        </div>

        {wallets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {wallets.map((wallet, idx) => (
              <Link key={wallet.id || idx} href={`/wallets/detail/${wallet.id}`} className="w-full">
                <WalletCard
                  name={wallet.name}
                  balance={wallet.balance}
                  icon={wallet.icon}
                  bg={wallet.bg}
                  rotate={wallet.rotate}
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white neo-border neo-shadow p-6 text-center space-y-3">
            <p className="font-label-mono text-xs uppercase font-bold text-[#454654]">
              Belum ada wallet aktif.
            </p>
            <Link href="/wallets">
              <button className="neo-border bg-[#3B4CCA] text-white px-4 py-2 font-label-mono text-xs uppercase font-bold neo-shadow">
                + Tambah Wallet Pertama
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Stats Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <StatCard label="Pemasukan" amount={stats.income} isIncome={true} bg="bg-[#A7F3D0]" />
        <StatCard label="Pengeluaran" amount={stats.expense} isIncome={false} bg="bg-[#FECACA]" />
      </div>

      <div className="w-full mt-6">
        <FinancialOverviewChart items={financialOverview} />
      </div>

      {/* Recent Transactions List */}
      <div className="neo-border bg-[#FDF8FF] neo-shadow w-full mt-6">
        <div className="border-b-4 border-[#1C1A27] p-6 flex justify-between items-center bg-[#F1EBFE]">
          <h3 className="text-2xl font-headline-md font-bold text-[#1C1A27]">Recent Transactions</h3>
          <Link
            href="/wallets"
            className="text-xs font-label-mono uppercase border-4 border-[#1C1A27] px-4 py-2 hover:bg-[#1C1A27] hover:text-white transition-colors bg-white shadow-[4px_4px_0px_0px_#1C1A27] font-bold"
          >
            View All
          </Link>
        </div>
        <div className="p-4 space-y-3">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx) => (
              <TransactionItem
                key={tx.id}
                title={tx.title}
                subtitle={tx.subtitle}
                category={tx.category}
                amount={tx.amount}
                isIncome={tx.isIncome}
                icon={tx.icon}
                iconBg={tx.iconBg}
              />
            ))
          ) : (
            <div className="p-8 text-center space-y-2">
              <MaterialIcon name="receipt_long" className="text-3xl text-[#454654] mx-auto" />
              <p className="font-label-mono text-xs uppercase text-[#454654] font-bold">
                Belum ada transaksi terbaru.
              </p>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

