import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import MaterialIcon from '../../../Components/MaterialIcon';

export default function GoalsIndex({ goals = {}, filters = {}, summary = {} }) {
  const [search, setSearch] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

  const handleFilter = () => {
    router.get(
      '/admin/goals',
      { search, status: statusFilter },
      { preserveState: true, replace: true }
    );
  };

  return (
    <AdminLayout title="Monitoring Target Tabungan (Goals)">
      <Head title="Monitoring Target - VIRA Admin" />

      {/* Summary Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white border-3 border-[#1C1A27] p-4 shadow-[3px_3px_0px_0px_#1C1A27]">
          <span className="font-label-mono text-[10px] text-[#454654] font-black uppercase block">TOTAL TARGET</span>
          <span className="font-headline-md text-2xl sm:text-3xl font-black text-[#1C1A27]">{summary.total_goals || 0}</span>
        </div>
        <div className="bg-[#DCFCE7] border-3 border-[#1C1A27] p-4 shadow-[3px_3px_0px_0px_#1C1A27]">
          <span className="font-label-mono text-[10px] text-[#166534] font-black uppercase block">TARGET TERCAPAI</span>
          <span className="font-headline-md text-2xl sm:text-3xl font-black text-[#166534]">{summary.completed_goals || 0}</span>
        </div>
        <div className="bg-[#FEF08A] border-3 border-[#1C1A27] p-4 shadow-[3px_3px_0px_0px_#1C1A27]">
          <span className="font-label-mono text-[10px] text-[#854D0E] font-black uppercase block">TOTAL VOLUME TARGET</span>
          <span className="font-headline-md text-2xl sm:text-3xl font-black text-[#854D0E]">{summary.total_target_volume_formatted || 'Rp 0'}</span>
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
            placeholder="Cari nama target atau pemilik..."
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
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            router.get('/admin/goals', { search, status: e.target.value }, { preserveState: true, replace: true });
          }}
          className="w-full sm:w-auto border-3 border-[#1C1A27] px-3 py-1.5 font-label-mono text-xs font-bold bg-white shadow-[2px_2px_0px_0px_#1C1A27]"
        >
          <option value="all">Semua Status</option>
          <option value="active">Sedang Berjalan</option>
          <option value="completed">Tercapai (Selesai)</option>
        </select>
      </div>

      {/* Goals Table */}
      <div className="bg-white border-4 border-[#1C1A27] shadow-[5px_5px_0px_0px_#1C1A27] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-md text-xs sm:text-sm">
            <thead>
              <tr className="border-b-4 border-[#1C1A27] bg-[#FDF8FF] font-label-mono text-xs uppercase font-black text-[#1C1A27]">
                <th className="p-3 sm:p-4">Target Impian</th>
                <th className="p-3 sm:p-4">Pemilik Akun</th>
                <th className="p-3 sm:p-4">Target Dana</th>
                <th className="p-3 sm:p-4">Terkumpul</th>
                <th className="p-3 sm:p-4">Progres Bar</th>
                <th className="p-3 sm:p-4">Deadline</th>
                <th className="p-3 sm:p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#1C1A27]">
              {goals.data && goals.data.length > 0 ? (
                goals.data.map((g) => (
                  <tr key={g.id} className="hover:bg-[#F1EBFE] transition-colors">
                    <td className="p-3 sm:p-4 font-headline-md font-black text-[#1C1A27]">
                      🎯 {g.name}
                    </td>

                    <td className="p-3 sm:p-4">
                      <span className="font-headline-md font-black text-[#1C1A27] block truncate">
                        {g.user_name}
                      </span>
                      <span className="font-label-mono text-[10px] text-[#454654] block truncate">
                        {g.user_email}
                      </span>
                    </td>

                    <td className="p-3 sm:p-4 font-number-xl text-xs sm:text-sm font-black text-[#1C1A27]">
                      {g.target_amount_formatted}
                    </td>

                    <td className="p-3 sm:p-4 font-number-xl text-xs sm:text-sm font-black text-[#166534]">
                      {g.current_amount_formatted}
                    </td>

                    <td className="p-3 sm:p-4 w-48">
                      <div className="flex items-center justify-between text-[10px] font-label-mono font-black mb-1">
                        <span>{g.progress_percent}%</span>
                        <span className="text-[#454654]">Sisa: {g.remaining_formatted}</span>
                      </div>
                      <div className="w-full bg-[#E5E7EB] border border-[#1C1A27] h-2.5 overflow-hidden">
                        <div
                          className="bg-[#8B5CF6] h-full transition-all duration-300"
                          style={{ width: `${Math.min(100, g.progress_percent)}%` }}
                        />
                      </div>
                    </td>

                    <td className="p-3 sm:p-4 font-label-mono text-xs text-[#454654]">
                      {g.target_date}
                    </td>

                    <td className="p-3 sm:p-4 text-center">
                      <span
                        className={`text-[9px] font-label-mono font-black uppercase px-2 py-0.5 border ${
                          g.status === 'completed'
                            ? 'bg-[#DCFCE7] text-[#166534] border-[#166534]'
                            : 'bg-[#FEF08A] text-[#854D0E] border-[#854D0E]'
                        }`}
                      >
                        {g.status === 'completed' ? 'TERCAPAI' : 'BERJALAN'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-[#454654] font-label-mono font-bold">
                    Tidak ada data target yang sesuai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {goals.links && goals.links.length > 3 && (
          <div className="p-4 border-t-3 border-[#1C1A27] flex flex-wrap items-center justify-between gap-2 bg-[#FDF8FF]">
            <span className="font-label-mono text-xs font-bold text-[#454654]">
              Menampilkan {goals.from || 0} - {goals.to || 0} dari {goals.total || 0} Target
            </span>
            <div className="flex gap-1">
              {goals.links.map((link, idx) => (
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

