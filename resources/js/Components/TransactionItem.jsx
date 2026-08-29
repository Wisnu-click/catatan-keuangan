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
}) {
  return (
    <div
      onClick={onClick}
      className="bg-[#FDF8FF] neo-border neo-shadow p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:translate-x-1 hover:-translate-y-1 hover:shadow-none transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${iconBg} neo-border flex items-center justify-center shrink-0 transform rotate-1 group-hover:text-[#1C1A27]`}>
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <div>
          <p className="font-bold text-lg text-[#1C1A27]">{title}</p>
          <div className="flex items-center gap-2 mt-1">
            {category && (
              <span className="text-[12px] font-label-mono bg-[#F1EBFE] border-2 border-[#1C1A27] px-2 py-0.5 uppercase">
                {category}
              </span>
            )}
            {subtitle && (
              <span className="text-sm font-label-mono text-[#454654]">{subtitle}</span>
            )}
          </div>
        </div>
      </div>
      <span
        className={`font-number-xl text-xl font-bold ${
          isIncome ? 'text-green-700 group-hover:text-[#A7F3D0]' : 'text-[#BA1A1A] group-hover:text-[#FECACA]'
        }`}
      >
        {isIncome ? `+${amount}` : `-${amount}`}
      </span>
    </div>
  );
}

