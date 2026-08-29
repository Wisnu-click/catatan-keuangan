import React from 'react';

export default function ProgressBar({
  percentage = 0,
  height = 'h-8',
  bgColor = 'bg-[#8B5CF6]',
  striped = true,
  className = '',
}) {
  const clampPct = Math.min(100, Math.max(0, percentage));

  return (
    <div className={`w-full ${height} bg-[#E7DEFF] neo-border relative overflow-hidden ${className}`}>
      <div
        className={`absolute top-0 left-0 h-full ${bgColor} border-r-4 border-[#1C1A27] transition-all duration-300`}
        style={{ width: `${clampPct}%` }}
      >
        {striped && (
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent, transparent 10px, #1C1A27 10px, #1C1A27 20px)',
            }}
          />
        )}
      </div>
    </div>
  );
}

