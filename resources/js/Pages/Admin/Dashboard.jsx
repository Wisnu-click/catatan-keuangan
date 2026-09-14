import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import MaterialIcon from '../../Components/MaterialIcon';

export default function Dashboard({ stats = {}, recent_users = [], recent_transactions = [], chart_data = [], system_info = {} }) {
  return (
    <AdminLayout title="Admin Dashboard Overview">
      <Head title="Admin Dashboard - VIRA" />

      {/* =========================================================================
          1. TOP OVERVIEW METRIC CARDS (NEO-BRUTALISM GRID)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Total Users */}
        <div className="bg-[#FEF08A] border-4 border-[#1C1A27] shadow-[4px_4px_0px_0px_#1C1A27] p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-label-mono text-[10px] uppercase font-black tracking-wider text-[#854D0E]">
              TOTAL PENGGUNA
            </span>
            <div className="w-8 h-8 bg-white border-2 border-[#1C1A27] flex items-center justify-center font-bold">
              <MaterialIcon name="group" className="text-lg text-[#1C1A27]" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-headline-md font-black text-[#1C1A27]">
            {stats.total_users || 0}
          </div>
          <div className="flex items-center justify-between text-[11px] font-label-mono font-bold text-[#1C1A27] pt-2 border-t-2 border-[#1C1A27]/20">
            <span>{stats.active_users || 0} Aktif</span>
            <span>{stats.admin_count || 0} Admin</span>
          </div>
        </div>

        {/* Metric 2: Total Saldo Beredar */}
        <div className="bg-[#DCFCE7] border-4 border-[#1C1A27] shadow-[4px_4px_0px_0px_#1C1A27] p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-label-mono text-[10px] uppercase font-black tracking-wider text-[#166534]">
              TOTAL SALDO SISTEM
            </span>
            <div className="w-8 h-8 bg-white border-2 border-[#1C1A27] flex items-center justify-center font-bold">
              <MaterialIcon name="account_balance_wallet" className="text-lg text-[#166534]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-headline-md font-black text-[#166534] truncate">
            {stats.total_system_balance_formatted || 'Rp 0'}
          </div>
          <div className="flex items-center justify-between text-[11px] font-label-mono font-bold text-[#166534] pt-2 border-t-2 border-[#1C1A27]/20">
            <span>{stats.total_wallets || 0} Dompet Aktif</span>
            <span>MySQL Realtime</span>
          </div>
        </div>

        {/* Metric 3: Total Transaksi */}
        <div className="bg-[#E7DEFF] border-4 border-[#1C1A27] shadow-[4px_4px_0px_0px_#1C1A27] p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-label-mono text-[10px] uppercase font-black tracking-wider text-[#6D28D9]">
              TOTAL TRANSAKSI
            </span>
            <div className="w-8 h-8 bg-white border-2 border-[#1C1A27] flex items-center justify-center font-bold">
              <MaterialIcon name="receipt_long" className="text-lg text-[#6D28D9]" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-headline-md font-black text-[#1C1A27]">
            {stats.total_transactions || 0}
          </div>
          <div className="flex items-center justify-between text-[11px] font-label-mono font-bold text-[#6D28D9] pt-2 border-t-2 border-[#1C1A27]/20">
            <span>Bulan Ini: +{stats.monthly_income_formatted}</span>
          </div>
        </div>

        {/* Metric 4: AI Assistant Calls */}
        <div className="bg-[#FFDAD6] border-4 border-[#1C1A27] shadow-[4px_4px_0px_0px_#1C1A27] p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-label-mono text-[10px] uppercase font-black tracking-wider text-[#93000A]">
              LOG AKTIVITAS AI
            </span>
            <div className="w-8 h-8 bg-white border-2 border-[#1C1A27] flex items-center justify-center font-bold">
              <MaterialIcon name="smart_toy" className="text-lg text-[#93000A]" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-headline-md font-black text-[#1C1A27]">
            {stats.total_ai_messages || 0}
          </div>
          <div className="flex items-center justify-between text-[11px] font-label-mono font-bold text-[#93000A] pt-2 border-t-2 border-[#1C1A27]/20">
            <span>{stats.total_user_prompts || 0} Prompt User</span>
            <span>OpenRouter Ready</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. MONTHLY VOLUME CHART & SYSTEM STATUS BAR
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Volume 6 Bulan Terakhir */}
        <div className="lg:col-span-8 bg-white border-4 border-[#1C1A27] shadow-[5px_5px_0px_0px_#1C1A27] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b-3 border-[#1C1A27] pb-3">
            <div>
              <h3 className="font-headline-md text-base sm:text-lg font-black text-[#1C1A27] uppercase">
                VOLUME KEUANGAN SISTEM (6 BULAN TERAKHIR)
              </h3>
              <p className="text-xs font-body-md text-[#454654] font-bold">
                Perbandingan total pemasukan dan pengeluaran seluruh pengguna
              </p>
            </div>
            <span className="text-[10px] font-label-mono bg-[#FEF08A] border border-[#1C1A27] px-2 py-0.5 font-black uppercase">
              LIVE DATA
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
            {chart_data.map((item, idx) => (
              <div key={idx} className="border-2 border-[#1C1A27] bg-[#FDF8FF] p-3 text-center space-y-1.5 shadow-[2px_2px_0px_0px_#1C1A27]">
                <span className="font-label-mono text-[10px] font-black uppercase text-[#1C1A27] block border-b border-[#1C1A27] pb-1">
                  {item.month}
                </span>
                <div className="text-[10px] font-label-mono text-[#166534] font-black">
                  +{Number(item.income / 1000000).toFixed(1)}jt
                </div>
                <div className="text-[10px] font-label-mono text-[#DC2626] font-black">
                  -{Number(item.expense / 1000000).toFixed(1)}jt
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t-2 border-[#1C1A27]/20 text-xs font-label-mono font-bold">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[#166534]">
                <span className="w-3 h-3 bg-[#4ADE80] border border-[#1C1A27] inline-block" />
                Pemasukan Sistem
              </span>
              <span className="flex items-center gap-1.5 text-[#DC2626]">
                <span className="w-3 h-3 bg-[#FFDAD6] border border-[#1C1A27] inline-block" />
                Pengeluaran Sistem
              </span>
            </div>
            <Link href="/admin/transactions" className="text-[#3B4CCA] font-black hover:underline">
              Kelola Semua Transaksi ➔
            </Link>
          </div>
        </div>

        {/* Right: Quick Action & System Health */}
        <div className="lg:col-span-4 bg-[#F1EBFE] border-4 border-[#1C1A27] shadow-[5px_5px_0px_0px_#1C1A27] p-5 sm:p-6 space-y-4">
          <div className="border-b-3 border-[#1C1A27] pb-3">
            <h3 className="font-headline-md text-base font-black text-[#1C1A27] uppercase">
              STATUS SERVER & SISTEM
            </h3>
            <span className="text-[10px] font-label-mono text-[#6D28D9] font-black">
              INFORMASI ENVIRONMENT
            </span>
          </div>

          <div className="space-y-2 text-xs font-label-mono font-bold">
            <div className="flex justify-between border-b border-dashed border-[#1C1A27]/30 pb-1.5">
              <span className="text-[#454654]">PHP Version:</span>
              <span className="font-black text-[#1C1A27]">{system_info.php_version}</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-[#1C1A27]/30 pb-1.5">
              <span className="text-[#454654]">Laravel Framework:</span>
              <span className="font-black text-[#1C1A27]">v{system_info.laravel_version}</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-[#1C1A27]/30 pb-1.5">
              <span className="text-[#454654]">Database:</span>
              <span className="font-black text-[#166534]">MySQL (Connected)</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-[#1C1A27]/30 pb-1.5">
              <span className="text-[#454654]">Environment:</span>
              <span className="font-black text-[#3B4CCA] uppercase">{system_info.app_env}</span>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <Link
              href="/admin/users"
              className="w-full bg-white hover:bg-[#FEF08A] text-[#1C1A27] border-2 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] py-2 px-3 font-label-mono text-xs uppercase font-black flex items-center justify-between transition-all"
            >
              <span>Kelola Pengguna ({stats.total_users})</span>
              <MaterialIcon name="arrow_forward" className="text-sm" />
            </Link>
            <Link
              href="/admin/settings"
              className="w-full bg-[#3B4CCA] hover:bg-[#2A379D] text-white border-2 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] py-2 px-3 font-label-mono text-xs uppercase font-black flex items-center justify-between transition-all"
            >
              <span>Diagnostik & Bersihkan Cache</span>
              <MaterialIcon name="settings" className="text-sm" />
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. RECENT USERS & TRANSACTIONS STREAM
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Transactions Table */}
        <div className="lg:col-span-7 bg-white border-4 border-[#1C1A27] shadow-[5px_5px_0px_0px_#1C1A27] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b-3 border-[#1C1A27] pb-3">
            <h3 className="font-headline-md text-base font-black text-[#1C1A27] uppercase">
              TRANSAKSI SISTEM TERBARU
            </h3>
            <Link href="/admin/transactions" className="text-xs font-label-mono font-black text-[#3B4CCA] hover:underline">
              Lihat Semua ({stats.total_transactions}) ➔
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-md text-xs">
              <thead>
                <tr className="border-b-2 border-[#1C1A27] bg-[#FDF8FF] font-label-mono text-[10px] uppercase text-[#1C1A27] font-black">
                  <th className="p-2">Pengguna</th>
                  <th className="p-2">Nominal</th>
                  <th className="p-2">Kategori</th>
                  <th className="p-2">Dompet</th>
                  <th className="p-2">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b border-[#1C1A27]">
                {recent_transactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-[#F1EBFE]">
                    <td className="p-2 font-bold text-[#1C1A27] truncate max-w-[120px]">
                      {trx.user_name}
                    </td>
                    <td className="p-2 font-black font-label-mono">
                      <span className={trx.type === 'income' ? 'text-[#166534]' : 'text-[#DC2626]'}>
                        {trx.type === 'income' ? '+' : '-'}{trx.amount_formatted}
                      </span>
                    </td>
                    <td className="p-2 font-bold text-[#8B5CF6] truncate max-w-[110px]">
                      {trx.category}
                    </td>
                    <td className="p-2 font-bold text-[#454654] truncate max-w-[100px]">
                      {trx.wallet}
                    </td>
                    <td className="p-2 font-label-mono text-[10px] text-[#454654]">
                      {trx.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Registered Users */}
        <div className="lg:col-span-5 bg-white border-4 border-[#1C1A27] shadow-[5px_5px_0px_0px_#1C1A27] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b-3 border-[#1C1A27] pb-3">
            <h3 className="font-headline-md text-base font-black text-[#1C1A27] uppercase">
              PENGGUNA TERBARU
            </h3>
            <Link href="/admin/users" className="text-xs font-label-mono font-black text-[#3B4CCA] hover:underline">
              Semua User ➔
            </Link>
          </div>

          <div className="space-y-2.5">
            {recent_users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-2.5 border-2 border-[#1C1A27] bg-[#FDF8FF] shadow-[2px_2px_0px_0px_#1C1A27]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={u.avatar_url}
                    alt={u.name}
                    className="w-8 h-8 rounded-full border border-[#1C1A27] bg-white shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="font-headline-md text-xs font-black text-[#1C1A27] truncate block">
                      {u.name}
                    </span>
                    <span className="text-[10px] font-label-mono text-[#454654] truncate block">
                      {u.email}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[8px] font-label-mono font-black uppercase px-1.5 py-0.5 border border-[#1C1A27] ${
                      u.role === 'admin' ? 'bg-[#EF4444] text-white' : 'bg-[#FEF08A] text-[#1C1A27]'
                    }`}
                  >
                    {u.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

