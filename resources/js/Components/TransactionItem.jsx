import React from 'react';

export default function TransactionItem({
  title,
  subtitle,
  category,
  amount,
  isIncome = false,
  icon = 'shopping_cart',
  iconBg = 'bg-white',
  onClick,
  onEdit,
  onDelete,
}) {
  return (
    <div
      onClick={onClick}
      className="bg-[#FDF8FF] neo-border neo-shadow p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-3 md:gap-4 overflow-hidden w-full sm:w-auto">
        <div className={`w-12 h-12 ${iconBg} neo-border flex items-center justify-center shrink-0 transform rotate-1 group-hover:text-[#1C1A27]`}>
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <div className="overflow-hidden">
          <p className="font-bold text-base md:text-lg text-[#1C1A27] truncate">{title}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {category && (
              <span className="text-[11px] md:text-[12px] font-label-mono bg-[#F1EBFE] border-2 border-[#1C1A27] px-2 py-0.5 uppercase font-bold">
                {category}
              </span>
            )}
            {subtitle && (
              <span className="text-xs md:text-sm font-label-mono text-[#454654] font-bold">{subtitle}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 border-t-2 sm:border-t-0 border-[#1C1A27]/20 pt-2 sm:pt-0">
        <span
          className={`font-number-xl text-lg md:text-xl font-bold ${
            isIncome ? 'text-green-700' : 'text-[#BA1A1A]'
          }`}
        >
          {isIncome ? `+${amount}` : `-${amount}`}
        </span>

        {/* Optional Action Buttons (Edit / Delete) */}
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1.5 ml-2">
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="w-8 h-8 bg-[#E7DEFF] text-[#1C1A27] neo-border flex items-center justify-center hover:bg-[#8B5CF6] hover:text-white transition-all cursor-pointer shadow-[2px_2px_0px_0px_#1C1A27]"
                title="Edit Transaksi"
              >
                <span className="material-symbols-outlined text-sm font-bold">edit</span>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="w-8 h-8 bg-[#FFDAD6] text-[#93000A] neo-border flex items-center justify-center hover:bg-[#BA1A1A] hover:text-white transition-all cursor-pointer shadow-[2px_2px_0px_0px_#1C1A27]"
                title="Hapus Transaksi"
              >
                <span className="material-symbols-outlined text-sm font-bold">delete</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
