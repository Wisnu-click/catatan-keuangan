import React from 'react';

export default function NeoButton({
  children,
  variant = 'primary', // primary, secondary, danger, outline, surface
  size = 'md', // sm, md, lg
  className = '',
  type = 'button',
  onClick,
  disabled = false,
  ...props
}) {
  const baseStyles = 'neo-border font-label-mono uppercase transition-all duration-100 flex items-center justify-center gap-2 cursor-pointer select-none';
  
  const variants = {
    primary: 'bg-[#3B4CCA] text-white neo-shadow neo-shadow-hover neo-shadow-active hover:bg-[#313EB7]',
    secondary: 'bg-[#8B5CF6] text-white neo-shadow neo-shadow-hover neo-shadow-active hover:bg-[#7C3AED]',
    danger: 'bg-[#BA1A1A] text-white neo-shadow neo-shadow-hover neo-shadow-active hover:bg-[#991B1B]',
    outline: 'bg-white text-[#1C1A27] neo-shadow neo-shadow-hover neo-shadow-active hover:bg-[#F1EBFE]',
    surface: 'bg-[#F1EBFE] text-[#1C1A27] neo-shadow neo-shadow-hover neo-shadow-active hover:bg-[#E5E0F3]',
    yellow: 'bg-[#FDE047] text-[#1C1A27] neo-shadow neo-shadow-hover neo-shadow-active hover:bg-[#FACC15]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-3 text-sm',
    lg: 'px-6 py-4 text-base font-bold',
    xl: 'px-8 py-5 text-lg font-bold',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

