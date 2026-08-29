import React from 'react';

export default function FilterChip({ label, active = false, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`neo-border px-6 py-2 font-label-mono text-sm uppercase shrink-0 transition-all ${
        active
          ? 'bg-[#1C1A27] text-[#FDF8FF] neo-shadow'
          : 'bg-[#FDF8FF] text-[#1C1A27] neo-shadow-hover hover:bg-[#F1EBFE]'
      } ${className}`}
    >
      {label}
    </button>
  );
}

