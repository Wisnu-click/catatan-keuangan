import React from 'react';

export default function NeoInput({
  type = 'text',
  className = '',
  placeholder = '',
  value,
  onChange,
  required = false,
  icon,
  ...props
}) {
  return (
    <div className="relative w-full">
      {icon && (
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#454654] z-10 pointer-events-none">
          {icon}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full neo-border py-3 bg-white font-label-mono text-sm uppercase focus:outline-none focus:ring-0 placeholder:text-[#454654]/60 neo-shadow-sm focus:neo-shadow transition-all ${
          icon ? 'pl-12 pr-4' : 'px-4'
        } ${className}`}
        {...props}
      />
    </div>
  );
}

