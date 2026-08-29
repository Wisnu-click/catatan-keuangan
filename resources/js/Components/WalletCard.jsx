import React from 'react';

export default function WalletCard({
  name,
  balance,
  icon = 'account_balance_wallet',
  bg = 'bg-[#C4B5FD]',
  rotate = '',
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`w-full ${bg} neo-border neo-shadow p-6 flex flex-col justify-between gap-4 ${rotate} cursor-pointer hover:-translate-y-1 transition-all min-h-[160px]`}
    >
      <span className="material-symbols-outlined text-4xl text-[#1C1A27]">{icon}</span>
      <div>
        <p className="text-sm font-label-mono text-[#1C1A27] uppercase font-bold">{name}</p>
        <p className="text-2xl md:text-3xl font-headline-md font-bold mt-1 text-[#1C1A27]">{balance}</p>
      </div>
    </div>
  );
}
