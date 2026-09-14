import React from 'react';
import ProgressBar from './ProgressBar';
import MaterialIcon from './MaterialIcon';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

export default function GoalCard({
  goal,
  rotate = 'rotate-[-0.5deg]',
  onDeposit,
  onWithdraw,
  onEdit,
  onDelete,
}) {
  const {
    name,
    current_amount = 0,
    target_amount = 0,
    percentage = 0,
    target_date_display,
    icon = 'savings',
    is_completed = false,
    status = 'active',
  } = goal;

  const isCancelled = status === 'cancelled';

  return (
    <article
      className={`border-4 border-[#1C1A27] neo-shadow p-5 md:p-6 flex flex-col justify-between gap-5 transition-transform hover:rotate-0 overflow-hidden ${
        is_completed ? 'bg-[#DDD7EA]' : isCancelled ? 'bg-[#FDE8E8]' : 'bg-[#FDF8FF]'
      } ${rotate}`}
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-13 h-13 md:w-15 md:h-15 bg-[#E7DEFF] border-3 border-[#1C1A27] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#1C1A27]">
            <span className="material-symbols-outlined text-2xl md:text-3xl text-[#1C1A27]">{icon}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xl md:text-2xl font-headline-md text-[#1C1A27] leading-tight truncate" title={name}>
              {name}
            </h3>
            <p className="text-xs font-label-mono text-[#1C1A27]/70 uppercase mt-1 truncate">
              {is_completed ? 'Selesai ✓' : isCancelled ? 'Dibatalkan' : target_date_display ? `Target: ${target_date_display}` : 'Tanpa Batas Waktu'}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          {is_completed ? (
            <span className="bg-[#A3E635] text-[#1C1A27] px-2.5 py-1 border-3 border-[#1C1A27] font-label-mono text-xs uppercase flex items-center gap-1 shadow-[2px_2px_0px_0px_#1C1A27]">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Tercapai
            </span>
          ) : isCancelled ? (
            <span className="bg-[#FECACA] text-[#991B1B] px-2.5 py-1 border-3 border-[#1C1A27] font-label-mono text-xs uppercase flex items-center gap-1 shadow-[2px_2px_0px_0px_#1C1A27]">
              <span className="material-symbols-outlined text-sm">cancel</span>
              Batal
            </span>
          ) : (
            <span className="bg-[#8B5CF6] text-white px-2.5 py-1 border-3 border-[#1C1A27] font-label-mono text-xs font-black shadow-[2px_2px_0px_0px_#1C1A27]">
              {percentage}%
            </span>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-baseline text-sm font-body-md font-bold text-[#1C1A27]">
          <span className="font-number-xl text-base md:text-lg">{formatCurrency(current_amount)}</span>
          <span className="opacity-70 text-xs md:text-sm font-label-mono">/ {formatCurrency(target_amount)}</span>
        </div>
        <ProgressBar
          percentage={is_completed ? 100 : percentage}
          bgColor={is_completed ? 'bg-[#1C1A27]' : 'bg-[#8B5CF6]'}
        />
      </div>

      {/* Actions (Responsive & Contained within Card) */}
      <div className="pt-4 border-t-3 border-[#1C1A27] border-dashed mt-auto">
        {is_completed || isCancelled ? (
          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              type="button"
              onClick={onEdit}
              className="bg-[#E7DEFF] text-[#1C1A27] border-3 border-[#1C1A27] py-2.5 px-3 font-label-mono text-xs uppercase font-bold cursor-pointer hover:bg-[#D4C4F3] transition-colors flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#1C1A27]"
            >
              <MaterialIcon name="edit" className="text-base" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="bg-[#FECACA] text-[#991B1B] border-3 border-[#1C1A27] py-2.5 px-3 font-label-mono text-xs uppercase font-bold cursor-pointer hover:bg-[#FCA5A5] transition-colors flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#1C1A27]"
            >
              <MaterialIcon name="delete" className="text-base" />
              <span>Hapus</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 w-full">
            {/* Primary Action Buttons: Nabung & Tarik */}
            <div className="grid grid-cols-2 gap-2 w-full">
              <button
                type="button"
                onClick={onDeposit}
                className="bg-[#3B4CCA] text-white border-3 border-[#1C1A27] py-2.5 px-2 font-label-mono text-xs uppercase font-black cursor-pointer hover:bg-[#2A379D] transition-all flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#1C1A27] active:translate-y-0.5"
              >
                <MaterialIcon name="savings" className="text-base font-bold" />
                <span>Nabung</span>
              </button>
              <button
                type="button"
                onClick={onWithdraw}
                className="bg-white text-[#1C1A27] border-3 border-[#1C1A27] py-2.5 px-2 font-label-mono text-xs uppercase font-black cursor-pointer hover:bg-[#F1EBFE] transition-all flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#1C1A27] active:translate-y-0.5"
              >
                <MaterialIcon name="output" className="text-base font-bold" />
                <span>Tarik</span>
              </button>
            </div>

            {/* Secondary Action Buttons: Edit & Hapus */}
            <div className="grid grid-cols-2 gap-2 w-full">
              <button
                type="button"
                onClick={onEdit}
                className="bg-[#E7DEFF] text-[#1C1A27] border-2 border-[#1C1A27] py-1.5 px-2 font-label-mono text-[11px] uppercase font-bold cursor-pointer hover:bg-[#D4C4F3] transition-colors flex items-center justify-center gap-1 shadow-[2px_2px_0px_0px_#1C1A27]"
                title="Edit Target"
              >
                <MaterialIcon name="edit" className="text-sm font-bold" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="bg-[#FFDAD6] text-[#93000A] border-2 border-[#1C1A27] py-1.5 px-2 font-label-mono text-[11px] uppercase font-bold cursor-pointer hover:bg-[#BA1A1A] hover:text-white transition-colors flex items-center justify-center gap-1 shadow-[2px_2px_0px_0px_#1C1A27]"
                title="Hapus Target"
              >
                <MaterialIcon name="delete" className="text-sm font-bold" />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
