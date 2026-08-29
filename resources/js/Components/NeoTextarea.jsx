import React from 'react';

export default function NeoTextarea({
  value,
  onChange,
  placeholder = '',
  rows = 3,
  className = '',
  ...props
}) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`w-full neo-border p-3 font-body-md text-base bg-[#F1EBFE] text-[#1C1A27] focus:outline-none focus:ring-0 resize-none placeholder:text-[#454654]/60 ${className}`}
      {...props}
    />
  );
}

