import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import MaterialIcon from '../../../Components/MaterialIcon';

export default function TransactionsIndex({ transactions = {}, users = [], filters = {}, summary = {} }) {
  const [search, setSearch] = useState(filters.search || '');
  const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
  const [userFilter, setUserFilter] = useState(filters.user_id || 'all');
  const [startDate, setStartDate] = useState(filters.start_date || '');
  const [endDate, setEndDate] = useState(filters.end_date || '');

  const handleFilter = () => {
    router.get(
      '/admin/transactions',
      {
        search,
        type: typeFilter,
        user_id: userFilter,
        start_date: startDate,
        end_date: endDate,
      },
      { preserveState: true, replace: true }
    );
  };

  const handleResetFilter = () => {
    setSearch('');
    setTypeFilter('all');
    setUserFilter('all');
    setStartDate('');
    setEndDate('');
    router.get('/admin/transactions', {}, { preserveState: true, replace: true });
  };

  const handleDelete = (trx) => {
    if (confirm(`Yakin ingin menghapus transaksi #${trx.id} (${trx.amount_formatted} - ${trx.user_name})?`)) {
      router.delete(`/admin/transactions/${trx.id}`);
    }
  };

  return (
    <AdminLayout title="Semua Transaksi Sistem">
      <Head title="Monitoring Transaksi - VIRA Admin" />

      {/* =========================================================================
          1. SUMMARY BADGES
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white border-3 border-[#1C1A27] p-4 shadow-[3px_3px_0px_0px_#1C1A27]">
          <span className="font-label-mono text-[10px] text-[#454654] font-black uppercase block">TOTAL TRANSAKSI</span>
          <span className="font-headline-md text-2xl sm:text-3xl font-black text-[#1C1A27]">{summary.total_count || 0}</span>
        </div>
        <div className="bg-[#DCFCE7] border-3 border-[#1C1A27] p-4 shadow-[3px_3px_0px_0px_#1C1A27]">
          <span className="font-label-mono text-[10px] text-[#166534] font-black uppercase block">TOTAL PEMASUKAN SISTEM</span>
          <span className="font-headline-md text-2xl sm:text-3xl font-black text-[#166534] truncate">{summary.total_income_formatted || 'Rp 0'}</span>
        </div>
        <div className="bg-[#FFDAD6] border-3 border-[#1C1A27] p-4 shadow-[3px_3px_0px_0px_#1C1A27]">
          <span className="font-label-mono text-[10px] text-[#93000A] font-black uppercase block">TOTAL PENGELUARAN SISTEM</span>
          <span className="font-headline-md text-2xl sm:text-3xl font-black text-[#93000A] truncate">{summary.total_expense_formatted || 'Rp 0'}</span>
        </div>
      </div>

      {/* =========================================================================
          2. FILTERS PANEL
          ========================================================================= */}
      <div className="bg-white border-4 border-[#1C1A27] shadow-[5px_5px_0px_0px_#1C1A27] p-4 sm:p-5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block font-label-mono text-[10px] font-black uppercase text-[#1C1A27] mb-1">
              Cari Deskripsi / User / Kategori
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFilter();
              }}
              placeholder="Ketik kata kunci..."
              className="w-full border-3 border-[#1C1A27] px-3 py-1.5 font-body-md text-xs font-bold shadow-[2px_2px_0px_0px_#1C1A27]"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="block font-label-mono text-[10px] font-black uppercase text-[#1C1A27] mb-1">
              Tipe Transaksi
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full border-3 border-[#1C1A27] px-2.5 py-1.5 font-label-mono text-xs uppercase font-bold bg-white shadow-[2px_2px_0px_0px_#1C1A27]"
            >
              <option value="all">Semua Tipe</option>
              <option value="income">Pemasukan (+)</option>
              <option value="expense">Pengeluaran (-)</option>
            </select>
          </div>

          {/* User Filter */}
          <div>
            <label className="block font-label-mono text-[10px] font-black uppercase text-[#1C1A27] mb-1">
              Filter Pengguna
            </label>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full border-3 border-[#1C1A27] px-2.5 py-1.5 font-label-mono text-xs font-bold bg-white shadow-[2px_2px_0px_0px_#1C1A27]"
            >
              <option value="all">Semua Pengguna</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          {/* Filter Action Buttons */}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={handleFilter}
              className="flex-1 bg-[#3B4CCA] hover:bg-[#2A379D] text-white border-3 border-[#1C1A27] py-1.5 px-3 font-label-mono text-xs uppercase font-black shadow-[2px_2px_0px_0px_#1C1A27] cursor-pointer"
            >
              Terapkan
            </button>
            <button
              type="button"
              onClick={handleResetFilter}
              className="bg-white hover:bg-gray-100 text-[#1C1A27] border-3 border-[#1C1A27] py-1.5 px-3 font-label-mono text-xs uppercase font-black shadow-[2px_2px_0px_0px_#1C1A27] cursor-pointer"
              title="Reset Filter"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. TRANSACTIONS TABLE
          ========================================================================= */}
      <div className="bg-white border-4 border-[#1C1A27] shadow-[5px_5px_0px_0px_#1C1A27] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-md text-xs sm:text-sm">
            <thead>
              <tr className="border-b-4 border-[#1C1A27] bg-[#FDF8FF] font-label-mono text-xs uppercase font-black text-[#1C1A27]">
                <th className="p-3 sm:p-4">ID</th>
                <th className="p-3 sm:p-4">Pengguna</th>
                <th className="p-3 sm:p-4">Tipe & Nominal</th>
                <th className="p-3 sm:p-4">Kategori</th>
                <th className="p-3 sm:p-4">Dompet</th>
                <th className="p-3 sm:p-4">Keterangan</th>
                <th className="p-3 sm:p-4">Tanggal</th>
                <th className="p-3 sm:p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#1C1A27]">
              {transactions.data && transactions.data.length > 0 ? (
                transactions.data.map((trx) => (
                  <tr key={trx.id} className="hover:bg-[#F1EBFE] transition-colors">
                    <td className="p-3 sm:p-4 font-label-mono font-black text-[#454654]">
                      #{trx.id}
                    </td>

                    <td className="p-3 sm:p-4">
                      <span className="font-headline-md font-black text-[#1C1A27] block truncate max-w-[140px]">
                        {trx.user_name}
                      </span>
                      <span className="font-label-mono text-[10px] text-[#454654] block truncate max-w-[140px]">
                        {trx.user_email}
                      </span>
                    </td>

                    <td className="p-3 sm:p-4 font-label-mono">
                      <span
                        className={`text-xs sm:text-sm font-black block ${
                          trx.type === 'income' ? 'text-[#166534]' : 'text-[#DC2626]'
                        }`}
                      >
                        {trx.type === 'income' ? '+' : '-'}{trx.amount_formatted}
                      </span>
                      <span
                        className={`inline-block text-[9px] font-black uppercase px-1 border ${
                          trx.type === 'income'
                            ? 'bg-[#DCFCE7] text-[#166534] border-[#166534]'
                            : 'bg-[#FFDAD6] text-[#93000A] border-[#93000A]'
                        }`}
                      >
                        {trx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </td>

                    <td className="p-3 sm:p-4 font-bold text-[#8B5CF6] truncate max-w-[120px]">
                      {trx.category}
                    </td>

                    <td className="p-3 sm:p-4 font-bold text-[#3B4CCA] truncate max-w-[120px]">
                      {trx.wallet}
                    </td>

                    <td className="p-3 sm:p-4 font-body-md text-xs text-[#1C1A27] max-w-[200px] truncate">
                      {trx.description}
                    </td>

                    <td className="p-3 sm:p-4 font-label-mono text-xs text-[#454654]">
                      <div>{trx.date}</div>
                      <span className="text-[10px] text-[#6B7280]">{trx.created_at}</span>
                    </td>

                    <td className="p-3 sm:p-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(trx)}
                        className="w-8 h-8 bg-white hover:bg-[#FFDAD6] border-2 border-[#1C1A27] shadow-[1px_1px_0px_0px_#1C1A27] inline-flex items-center justify-center cursor-pointer"
                        title="Hapus Transaksi"
                      >
                        <MaterialIcon name="delete" className="text-sm text-[#DC2626]" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-[#454654] font-label-mono font-bold">
                    Tidak ada transaksi yang sesuai dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {transactions.links && transactions.links.length > 3 && (
          <div className="p-4 border-t-3 border-[#1C1A27] flex flex-wrap items-center justify-between gap-2 bg-[#FDF8FF]">
            <span className="font-label-mono text-xs font-bold text-[#454654]">
              Menampilkan {transactions.from || 0} - {transactions.to || 0} dari {transactions.total || 0} Transaksi
            </span>
            <div className="flex gap-1">
              {transactions.links.map((link, idx) => (
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

