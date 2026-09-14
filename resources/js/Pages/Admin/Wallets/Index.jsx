import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import MaterialIcon from '../../../Components/MaterialIcon';

export default function WalletsIndex({ wallets = {}, users = [], filters = {}, summary = {} }) {
  const [search, setSearch] = useState(filters.search || '');
  const [userFilter, setUserFilter] = useState(filters.user_id || 'all');

  const handleFilter = () => {
    router.get(
      '/admin/wallets',
      { search, user_id: userFilter },
      { preserveState: true, replace: true }
    );
  };

  return (
    <AdminLayout title="Monitoring Seluruh Wallet">
      <Head title="Monitoring Wallet - VIRA Admin" />

      {/* Summary Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white border-3 border-[#1C1A27] p-4 shadow-[3px_3px_0px_0px_#1C1A27]">
          <span className="font-label-mono text-[10px] text-[#454654] font-black uppercase block">TOTAL DOMPET SISTEM</span>
          <span className="font-headline-md text-2xl sm:text-3xl font-black text-[#1C1A27]">{summary.total_wallets || 0}</span>
        </div>
        <div className="bg-[#DCFCE7] border-3 border-[#1C1A27] p-4 shadow-[3px_3px_0px_0px_#1C1A27]">
          <span className="font-label-mono text-[10px] text-[#166534] font-black uppercase block">TOTAL SALDO SISTEM</span>
          <span className="font-headline-md text-2xl sm:text-3xl font-black text-[#166534]">{summary.total_balance_formatted || 'Rp 0'}</span>
        </div>
        <div className="bg-[#FEF08A] border-3 border-[#1C1A27] p-4 shadow-[3px_3px_0px_0px_#1C1A27]">
          <span className="font-label-mono text-[10px] text-[#854D0E] font-black uppercase block">DOMPET AKTIF</span>
          <span className="font-headline-md text-2xl sm:text-3xl font-black text-[#854D0E]">{summary.active_wallets || 0}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-4 border-[#1C1A27] shadow-[5px_5px_0px_0px_#1C1A27] p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:flex-1 flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleFilter();
            }}
            placeholder="Cari nama dompet atau pemilik..."
            className="flex-1 border-3 border-[#1C1A27] px-3 py-1.5 font-body-md text-xs sm:text-sm font-bold shadow-[2px_2px_0px_0px_#1C1A27]"
          />
          <button
            type="button"
            onClick={handleFilter}
            className="bg-[#3B4CCA] text-white border-3 border-[#1C1A27] px-4 py-1.5 font-label-mono text-xs uppercase font-black shadow-[2px_2px_0px_0px_#1C1A27]"
          >
            Cari
          </button>
        </div>

        <select
          value={userFilter}
          onChange={(e) => {
            setUserFilter(e.target.value);
            router.get('/admin/wallets', { search, user_id: e.target.value }, { preserveState: true, replace: true });
          }}
          className="w-full sm:w-auto border-3 border-[#1C1A27] px-3 py-1.5 font-label-mono text-xs font-bold bg-white shadow-[2px_2px_0px_0px_#1C1A27]"
        >
          <option value="all">Semua Pemilik</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      {/* Wallets Table */}
      <div className="bg-white border-4 border-[#1C1A27] shadow-[5px_5px_0px_0px_#1C1A27] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-md text-xs sm:text-sm">
            <thead>
              <tr className="border-b-4 border-[#1C1A27] bg-[#FDF8FF] font-label-mono text-xs uppercase font-black text-[#1C1A27]">
                <th className="p-3 sm:p-4">Nama Dompet</th>
                <th className="p-3 sm:p-4">Pemilik Akun</th>
                <th className="p-3 sm:p-4">Tipe</th>
                <th className="p-3 sm:p-4">Saldo Terkini</th>
                <th className="p-3 sm:p-4 text-center">Mutasi</th>
                <th className="p-3 sm:p-4 text-center">Status</th>
                <th className="p-3 sm:p-4">Dibuat</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#1C1A27]">
              {wallets.data && wallets.data.length > 0 ? (
                wallets.data.map((w) => (
                  <tr key={w.id} className="hover:bg-[#F1EBFE] transition-colors">
                    <td className="p-3 sm:p-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 border-2 border-[#1C1A27] flex items-center justify-center shrink-0 shadow-[1px_1px_0px_0px_#1C1A27]"
                          style={{ backgroundColor: w.color_hex }}
                        >
                          <MaterialIcon name={w.icon} className="text-base text-[#1C1A27]" />
                        </div>
                        <span className="font-headline-md font-black text-[#1C1A27]">
                          {w.name}
                        </span>
                      </div>
                    </td>

                    <td className="p-3 sm:p-4">
                      <span className="font-headline-md font-black text-[#1C1A27] block truncate">
                        {w.user_name}
                      </span>
                      <span className="font-label-mono text-[10px] text-[#454654] block truncate">
                        {w.user_email}
                      </span>
                    </td>

                    <td className="p-3 sm:p-4 font-label-mono">
                      <span className="bg-[#F1EBFE] border border-[#1C1A27] px-2 py-0.5 text-[10px] uppercase font-black">
                        {w.type}
                      </span>
                    </td>

                    <td className="p-3 sm:p-4 font-number-xl text-xs sm:text-sm font-black text-[#166534]">
                      {w.current_balance_formatted}
                    </td>

                    <td className="p-3 sm:p-4 text-center font-label-mono text-xs font-bold">
                      {w.transactions_count} Transaksi
                    </td>

                    <td className="p-3 sm:p-4 text-center">
                      <span
                        className={`text-[9px] font-label-mono font-black uppercase px-2 py-0.5 border ${
                          w.is_active
                            ? 'bg-[#DCFCE7] text-[#166534] border-[#166534]'
                            : 'bg-[#FFDAD6] text-[#93000A] border-[#93000A]'
                        }`}
                      >
                        {w.is_active ? 'AKTIF' : 'NONAKTIF'}
                      </span>
                    </td>

                    <td className="p-3 sm:p-4 font-label-mono text-xs text-[#454654]">
                      {w.created_at}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-[#454654] font-label-mono font-bold">
                    Tidak ada data dompet yang sesuai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {wallets.links && wallets.links.length > 3 && (
          <div className="p-4 border-t-3 border-[#1C1A27] flex flex-wrap items-center justify-between gap-2 bg-[#FDF8FF]">
            <span className="font-label-mono text-xs font-bold text-[#454654]">
              Menampilkan {wallets.from || 0} - {wallets.to || 0} dari {wallets.total || 0} Dompet
            </span>
            <div className="flex gap-1">
              {wallets.links.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.url || '#'}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                  className={`px-2.5 py-1 font-label-mono text-xs uppercase font-black border-2 border-[#1C1A27] ${
                    link.active
                      ? 'bg-[#3B4CCA] text-white shadow-[2px_2px_0px_0px_#1C1A27]'
                      : 'bg-white text-[#1C1A27] hover:bg-[#FEF08A]'
                  } ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

