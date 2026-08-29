import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import NeoButton from '../../Components/NeoButton';
import FilterChip from '../../Components/FilterChip';
import MaterialIcon from '../../Components/MaterialIcon';

export default function Index({
  wallets = [],
  selectedWalletId = null,
  selectedPeriod = 'All',
  totalIncome = 'Rp 0',
  totalExpense = 'Rp 0',
  netCashflow = 'Rp 0',
  topExpenses = [],
  monthlyTrend = [],
}) {
  const [activeFilter, setActiveFilter] = useState(selectedPeriod || 'All');

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    router.get('/reports', { period: filter }, { preserveState: true });
  };

  const handleExport = () => {
    window.print();
  };

  const defaultTrend = monthlyTrend.length > 0 ? monthlyTrend : [
    { month: 'BLN INI', inc: 0, exp: 0, incomeFormatted: 'Rp 0', expenseFormatted: 'Rp 0' }
  ];

  return (
    <AuthenticatedLayout>
      <Head title="Financial Reports" />

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-display-xl text-[#1C1A27] mb-2 font-black uppercase">
            Financial Reports
          </h1>
          <p className="text-base font-body-md text-[#454654] font-bold">
            Analisis trajektori keuangan, arus kas, dan pengeluaran secara real-time.
          </p>
        </div>
        <NeoButton
          variant="outline"
          size="md"
          onClick={handleExport}
          className="flex items-center gap-2 cursor-pointer font-bold shrink-0"
        >
          <MaterialIcon name="download" className="text-xl" />
          EXPORT & PRINT LAPORAN
        </NeoButton>
      </header>

      {/* Summary Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 w-full">
        <div className="bg-[#A7F3D0] text-[#1C1A27] p-6 neo-border neo-shadow transform rotate-[0.5deg]">
          <p className="font-label-mono text-xs uppercase font-bold text-[#1C1A27]/80">TOTAL PEMASUKAN</p>
          <p className="text-3xl md:text-4xl font-number-xl font-bold mt-2">{totalIncome}</p>
        </div>
        <div className="bg-[#FFDAD6] text-[#93000A] p-6 neo-border neo-shadow transform rotate-[-0.5deg]">
          <p className="font-label-mono text-xs uppercase font-bold text-[#93000A]/80">TOTAL PENGELUARAN</p>
          <p className="text-3xl md:text-4xl font-number-xl font-bold mt-2">{totalExpense}</p>
        </div>
        <div className="bg-[#3B4CCA] text-white p-6 neo-border neo-shadow transform rotate-[0.5deg]">
          <p className="font-label-mono text-xs uppercase font-bold opacity-80">NET CASHFLOW (ARUS KAS)</p>
          <p className="text-3xl md:text-4xl font-number-xl font-bold mt-2">{netCashflow}</p>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-3 mb-8">
        {['All', 'Pribadi', 'Bisnis', 'Tabungan'].map((filter) => (
          <FilterChip
            key={filter}
            label={filter}
            active={activeFilter === filter}
            onClick={() => handleFilterChange(filter)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
        {/* Income vs Expense Bar Chart Card */}
        <div className="xl:col-span-2 bg-white neo-border neo-shadow p-6 md:p-8 transform rotate-[0.5deg]">
          <h3 className="text-2xl font-headline-md mb-8 font-bold text-[#1C1A27]">
            Cashflow Overview (Pemasukan vs Pengeluaran)
          </h3>

          {/* Dynamic Bar Chart */}
          <div className="flex items-end h-64 gap-4 md:gap-8 border-b-4 border-l-4 border-[#1C1A27] pb-2 pl-4">
            {defaultTrend.map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col justify-end gap-1 group relative h-full">
                <div
                  className="w-full bg-[#8B5CF6] neo-border hover:opacity-90 transition-colors cursor-pointer"
                  style={{ height: `${Math.max(bar.inc, 4)}%` }}
                  title={`Pemasukan: ${bar.incomeFormatted}`}
                />
                <div
                  className="w-full bg-[#BA1A1A] neo-border hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ height: `${Math.max(bar.exp, 4)}%` }}
                  title={`Pengeluaran: ${bar.expenseFormatted}`}
                />
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 font-label-mono text-xs font-bold text-center">
                  {bar.month}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-8 mt-12 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#8B5CF6] neo-border" />
              <span className="font-label-mono text-sm font-bold">Income (Pemasukan)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#BA1A1A] neo-border" />
              <span className="font-label-mono text-sm font-bold">Expense (Pengeluaran)</span>
            </div>
          </div>
        </div>

        {/* Dynamic Category Breakdown List */}
        <div className="bg-[#CCBEFF] neo-border neo-shadow p-6 md:p-8 transform rotate-[-1deg]">
          <h3 className="text-2xl font-headline-md mb-8 font-bold text-[#1C1A27]">
            Top Expenses (Pengeluaran per Kategori)
          </h3>
          <div className="flex flex-col gap-6">
            {topExpenses.length > 0 ? (
              topExpenses.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-2">
                    <span className="font-body-md text-base font-bold text-[#1C1A27]">{exp.name}</span>
                    <span className="font-label-mono text-sm font-bold text-[#1C1A27]">{exp.pct}% ({exp.amount})</span>
                  </div>
                  <div className="w-full h-6 bg-white neo-border relative overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-[#BA1A1A] border-r-4 border-[#1C1A27]"
                      style={{ width: `${Math.max(exp.pct, 3)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white neo-border p-6 text-center space-y-2">
                <MaterialIcon name="pie_chart" className="text-3xl text-[#454654] mx-auto" />
                <p className="font-label-mono text-xs uppercase font-bold text-[#454654]">
                  Belum ada pengeluaran pada periode ini.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
