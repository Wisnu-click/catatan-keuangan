import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import MaterialIcon from '../../../Components/MaterialIcon';

export default function AiLogsIndex({ logs = {}, filters = {}, summary = {} }) {
  const [search, setSearch] = useState(filters.search || '');
  const [senderFilter, setSenderFilter] = useState(filters.sender || 'all');

  const handleFilter = () => {
    router.get(
      '/admin/ai-logs',
      { search, sender: senderFilter },
      { preserveState: true, replace: true }
    );
  };

  return (
    <AdminLayout title="AI Assistant Logs & Interaksi">
      <Head title="AI Logs - VIRA Admin" />

      {/* Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border-3 border-[#1C1A27] p-4 shadow-[3px_3px_0px_0px_#1C1A27]">
          <span className="font-label-mono text-[10px] text-[#454654] font-black uppercase block">TOTAL PESAN</span>
          <span className="font-headline-md text-2xl font-black text-[#1C1A27]">{summary.total_messages || 0}</span>
        </div>
        <div className="bg-[#FEF08A] border-3 border-[#1C1A27] p-4 shadow-[3px_3px_0px_0px_#1C1A27]">
          <span className="font-label-mono text-[10px] text-[#854D0E] font-black uppercase block">PROMPT USER</span>
          <span className="font-headline-md text-2xl font-black text-[#854D0E]">{summary.user_prompts || 0}</span>
        </div>
        <div className="bg-[#E7DEFF] border-3 border-[#1C1A27] p-4 shadow-[3px_3px_0px_0px_#1C1A27]">
          <span className="font-label-mono text-[10px] text-[#6D28D9] font-black uppercase block">RESPON AI</span>
          <span className="font-headline-md text-2xl font-black text-[#6D28D9]">{summary.ai_responses || 0}</span>
        </div>
        <div className="bg-[#DCFCE7] border-3 border-[#1C1A27] p-4 shadow-[3px_3px_0px_0px_#1C1A27]">
          <span className="font-label-mono text-[10px] text-[#166534] font-black uppercase block">OPENROUTER STATUS</span>
          <span className="font-headline-md text-lg font-black text-[#166534] flex items-center gap-1 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-ping" />
            {summary.openrouter_active ? 'TERHUBUNG' : 'LOKAL ENGINE'}
          </span>
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
            placeholder="Cari isi pesan atau pengguna..."
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
          value={senderFilter}
          onChange={(e) => {
            setSenderFilter(e.target.value);
            router.get('/admin/ai-logs', { search, sender: e.target.value }, { preserveState: true, replace: true });
          }}
          className="w-full sm:w-auto border-3 border-[#1C1A27] px-3 py-1.5 font-label-mono text-xs font-bold bg-white shadow-[2px_2px_0px_0px_#1C1A27]"
        >
          <option value="all">Semua Pengirim</option>
          <option value="user">User Saja</option>
          <option value="ai">AI Saja</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white border-4 border-[#1C1A27] shadow-[5px_5px_0px_0px_#1C1A27] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-md text-xs sm:text-sm">
            <thead>
              <tr className="border-b-4 border-[#1C1A27] bg-[#FDF8FF] font-label-mono text-xs uppercase font-black text-[#1C1A27]">
                <th className="p-3 sm:p-4">Pengirim</th>
                <th className="p-3 sm:p-4">Pengguna</th>
                <th className="p-3 sm:p-4">Model</th>
                <th className="p-3 sm:p-4">Isi Pesan / Prompt</th>
                <th className="p-3 sm:p-4">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#1C1A27]">
              {logs.data && logs.data.length > 0 ? (
                logs.data.map((l) => (
                  <tr key={l.id} className="hover:bg-[#F1EBFE] transition-colors">
                    <td className="p-3 sm:p-4 font-label-mono">
                      <span
                        className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 border ${
                          l.sender === 'user'
                            ? 'bg-[#FEF08A] text-[#854D0E] border-[#854D0E]'
                            : 'bg-[#3B4CCA] text-white border-[#1C1A27]'
                        }`}
                      >
                        {l.sender === 'user' ? '👤 USER' : '🤖 BOT AI'}
                      </span>
                    </td>

                    <td className="p-3 sm:p-4">
                      <span className="font-headline-md font-black text-[#1C1A27] block truncate max-w-[140px]">
                        {l.user_name}
                      </span>
                    </td>

                    <td className="p-3 sm:p-4 font-label-mono text-xs text-[#8B5CF6] font-bold">
                      {l.ai_model}
                    </td>

                    <td className="p-3 sm:p-4 font-body-md text-xs text-[#1C1A27] max-w-md">
                      <div className="line-clamp-2">{l.content}</div>
                      {l.has_image && (
                        <span className="inline-block mt-1 text-[9px] font-label-mono font-bold bg-[#FEF08A] border border-[#1C1A27] px-1">
                          📷 Lampiran Struk
                        </span>
                      )}
                    </td>

                    <td className="p-3 sm:p-4 font-label-mono text-xs text-[#454654] whitespace-nowrap">
                      {l.created_at}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-[#454654] font-label-mono font-bold">
                    Tidak ada riwayat log percakapan AI.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {logs.links && logs.links.length > 3 && (
          <div className="p-4 border-t-3 border-[#1C1A27] flex flex-wrap items-center justify-between gap-2 bg-[#FDF8FF]">
            <span className="font-label-mono text-xs font-bold text-[#454654]">
              Menampilkan {logs.from || 0} - {logs.to || 0} dari {logs.total || 0} Log
            </span>
            <div className="flex gap-1">
              {logs.links.map((link, idx) => (
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

