import React from 'react';

export default function NeoCard({
  children,
  className = '',
  bg = 'bg-[#FDF8FF]',
  rotate = '', // e.g. 'rotate-[-0.5deg]', 'rotate-[0.5deg]'
  shadow = true,
  hoverEffect = false,
  ...props
}) {
  return (
    <div
      className={`neo-border ${shadow ? 'neo-shadow' : ''} ${hoverEffect ? 'neo-shadow-hover' : ''} ${bg} ${rotate} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

