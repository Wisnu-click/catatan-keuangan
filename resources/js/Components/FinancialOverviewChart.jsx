import React, { useMemo } from 'react';
import MaterialIcon from './MaterialIcon';

export default function FinancialOverviewChart({ items = [] }) {
  const maxAmount = useMemo(() => Math.max(...items.map((item) => Number(item.amount) || 0), 1), [items]);

  return (
    <section className="bg-[#1C1A27] text-white border-4 border-[#1C1A27] neo-shadow p-6 md:p-8 relative overflow-hidden">
      <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-[#F59E0B]/10 border-4 border-[#F59E0B]/20" />
      <div className="relative flex flex-col sm:flex-row justify-between gap-4 border-b-2 border-white/20 pb-5">
        <div>
          <p className="text-[#FEF08A] font-label-mono text-xs font-black tracking-widest uppercase">LIVE RINGKASAN KEUANGAN</p>
          <h3 className="text-2xl md:text-3xl font-headline-md font-black mt-2">SEMUA ASET & ARUS KAS</h3>
        </div>
        <span className="h-fit bg-white/10 border border-white/30 px-3 py-1.5 font-label-mono text-[10px] font-bold uppercase text-white/75">Data real-time</span>
      </div>
      <div className="relative mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          const height = Math.max((Number(item.amount) / maxAmount) * 100, item.amount > 0 ? 8 : 2);
          return (
            <div key={item.key} className="min-h-52 bg-white/5 border-2 border-white/20 hover:border-[#FEF08A] p-4 transition-colors">
              <div className="flex justify-between gap-2 items-start"><span className="font-label-mono text-[10px] uppercase font-black text-white/60">{item.label}</span><span className={`w-8 h-8 flex items-center justify-center border-2 border-black ${item.iconBg}`}><MaterialIcon name={item.icon} className="text-base text-[#1C1A27]" /></span></div>
              <div className="h-24 mt-3 flex items-end border-b-2 border-white/30"><div className={`w-full border-2 border-black transition-all duration-500 ${item.color}`} style={{ height: `${height}%` }} /></div>
              <p className="mt-3 font-number-xl text-xl font-black tracking-tight">{item.formatted}</p>
              <p className="mt-1 font-label-mono text-[10px] uppercase font-bold text-white/55">{item.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
