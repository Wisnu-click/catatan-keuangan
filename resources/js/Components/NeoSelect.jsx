import React from 'react';

export default function NeoSelect({
  options = [],
  value,
  onChange,
  className = '',
  ...props
}) {
  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={onChange}
        className={`w-full neo-border p-3 font-body-md text-base bg-[#F1EBFE] text-[#1C1A27] focus:outline-none focus:ring-0 cursor-pointer appearance-none pr-10 ${className}`}
        {...props}
      >
        {options.map((opt, idx) => (
          <option key={idx} value={typeof opt === 'object' ? opt.value : opt}>
            {typeof opt === 'object' ? opt.label : opt}
          </option>
        ))}
      </select>
      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#1C1A27]">
        expand_more
      </span>
    </div>
  );
}

