import React from 'react';
import ProgressBar from './ProgressBar';
import NeoButton from './NeoButton';
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
      className={`border-4 border-[#1C1A27] neo-shadow p-6 flex flex-col gap-6 transition-transform hover:rotate-0 ${
        is_completed ? 'bg-[#DDD7EA]' : isCancelled ? 'bg-[#FDE8E8]' : 'bg-[#FDF8FF]'
      } ${rotate}`}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#E7DEFF] border-4 border-[#1C1A27] flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-[#1C1A27]">{icon}</span>
          </div>
          <div>
            <h3 className="text-2xl font-headline-md text-[#1C1A27] leading-tight">{name}</h3>
            <p className="text-xs font-label-mono text-[#1C1A27]/70 uppercase mt-1">
              {is_completed ? 'Selesai ✓' : isCancelled ? 'Dibatalkan' : target_date_display ? `Target: ${target_date_display}` : 'Tanpa Batas Waktu'}
            </p>
          </div>
        </div>

        {is_completed ? (
          <span className="bg-[#A3E635] text-[#1C1A27] px-3 py-1 border-4 border-[#1C1A27] font-label-mono text-xs uppercase flex items-center gap-1 shadow-[4px_4px_0px_0px_#1C1A27]">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Tercapai
          </span>
        ) : isCancelled ? (
          <span className="bg-[#FECACA] text-[#991B1B] px-3 py-1 border-4 border-[#1C1A27] font-label-mono text-xs uppercase flex items-center gap-1 shadow-[4px_4px_0px_0px_#1C1A27]">
            <span className="material-symbols-outlined text-sm">cancel</span>
            Batal
          </span>
        ) : (
          <span className="bg-[#8B5CF6] text-white px-3 py-1 border-4 border-[#1C1A27] font-label-mono text-xs shadow-[4px_4px_0px_0px_#1C1A27]">
            {percentage}%
          </span>
        )}
      </div>

      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm font-body-md font-bold text-[#1C1A27]">
          <span>{formatCurrency(current_amount)}</span>
          <span className="opacity-70">/ {formatCurrency(target_amount)}</span>
        </div>
        <ProgressBar
          percentage={is_completed ? 100 : percentage}
          bgColor={is_completed ? 'bg-[#1C1A27]' : 'bg-[#8B5CF6]'}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-auto pt-4 border-t-4 border-[#1C1A27] border-dashed">
        {is_completed || isCancelled ? (
          <div className="flex gap-3 w-full">
            <button
              onClick={onEdit}
              className="flex-1 bg-[#E7DEFF] text-[#1C1A27] border-4 border-[#1C1A27] py-3 px-4 font-label-mono text-sm uppercase font-bold cursor-pointer hover:bg-[#D4C4F3] transition-colors flex items-center justify-center gap-2"
            >
              <MaterialIcon name="edit" className="text-lg" />
              Edit
            </button>
            <button
              onClick={onDelete}
              className="bg-[#FECACA] text-[#991B1B] border-4 border-[#1C1A27] py-3 px-4 font-label-mono text-sm uppercase font-bold cursor-pointer hover:bg-[#FCA5A5] transition-colors flex items-center justify-center"
            >
              <MaterialIcon name="delete" className="text-lg" />
            </button>
          </div>
        ) : (
          <div className="flex gap-3 w-full">
            <NeoButton variant="primary" size="md" className="flex-1" onClick={onDeposit}>
              <MaterialIcon name="savings" className="text-lg" />
              Nabung
            </NeoButton>
            <NeoButton variant="outline" size="md" className="flex-1" onClick={onWithdraw}>
              <MaterialIcon name="output" className="text-lg" />
              Tarik
            </NeoButton>
            <button
              onClick={onEdit}
              className="bg-[#E7DEFF] text-[#1C1A27] border-4 border-[#1C1A27] py-2 px-3 font-label-mono text-xs uppercase font-bold cursor-pointer hover:bg-[#D4C4F3] transition-colors flex items-center justify-center"
            >
              <MaterialIcon name="edit" className="text-lg" />
            </button>
            <button
              onClick={onDelete}
              className="bg-[#FECACA] text-[#991B1B] border-4 border-[#1C1A27] py-2 px-3 font-label-mono text-xs uppercase font-bold cursor-pointer hover:bg-[#FCA5A5] transition-colors flex items-center justify-center"
            >
              <MaterialIcon name="delete" className="text-lg" />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
