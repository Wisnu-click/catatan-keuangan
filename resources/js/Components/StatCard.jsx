import React from 'react';

export default function StatCard({
  label,
  amount,
  isIncome = true,
  bg = 'bg-[#A7F3D0]',
}) {
  return (
    <div className={`${bg} neo-border neo-shadow p-6 flex flex-col justify-between w-full`}>
      <div className="flex justify-between items-start">
        <span className="text-sm font-label-mono uppercase text-[#1C1A27]">{label}</span>
        <span className="material-symbols-outlined text-[#1C1A27] bg-white border-4 border-[#1C1A27] rounded-full p-1 shadow-[4px_4px_0px_0px_#1C1A27]">
          {isIncome ? 'arrow_upward' : 'arrow_downward'}
        </span>
      </div>
      <p className="text-2xl md:text-3xl font-headline-md font-bold mt-4 text-[#1C1A27]">{amount}</p>
    </div>
  );
}

