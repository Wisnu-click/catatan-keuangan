import React, { useState, useEffect, useRef } from 'react';

/**
 * CurrencyInput — Input nominal uang dengan format IDR otomatis
 *
 * Props:
 * - value: number (raw numeric value, e.g. 1500000)
 * - onChange: (rawNumber: number) => void
 * - placeholder: string (default: "0")
 * - className: string — class tambahan untuk <input>
 * - prefix: string (default: "") — biasanya "" karena prefix Rp ditaruh di luar
 * - size: "sm" | "md" | "lg" | "xl" (default: "md") — ukuran font
 * - required: bool
 * - disabled: bool
 * - min: number
 * - max: number
 * - id: string
 * - name: string
 */

const SIZE_MAP = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-2xl md:text-4xl',
};

// Hapus semua non-digit, kembalikan integer string
const stripNonDigits = (str) => str.replace(/\D/g, '');

// Format angka pakai titik sebagai pemisah ribuan: 1500000 → "1.500.000"
const formatNumber = (num) => {
  if (!num && num !== 0) return '';
  return new Intl.NumberFormat('id-ID').format(num);
};

export default function CurrencyInput({
  value,
  onChange,
  placeholder = '0',
  className = '',
  size = 'md',
  required = false,
  disabled = false,
  min,
  max,
  id,
  name,
}) {
  // displayValue: string yang ditampilkan di input (formatted)
  const [displayValue, setDisplayValue] = useState('');
  const inputRef = useRef(null);

  // Sync dari luar ketika value prop berubah (misalnya saat form di-reset atau pre-filled)
  useEffect(() => {
    const raw = Number(value);
    if (raw > 0) {
      setDisplayValue(formatNumber(raw));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e) => {
    const raw = stripNonDigits(e.target.value);
    const rawNumber = raw === '' ? 0 : parseInt(raw, 10);

    // Format untuk tampilan
    setDisplayValue(raw === '' ? '' : formatNumber(rawNumber));

    // Kirim raw number ke parent
    onChange(rawNumber);
  };

  // Saat focus: tampilkan tanpa format agar mudah edit (optional, uncomment jika diinginkan)
  // const handleFocus = () => {
  //   if (value > 0) setDisplayValue(String(value));
  // };

  const fontClass = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <input
      ref={inputRef}
      id={id}
      name={name}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      aria-label="currency input"
      className={`${fontClass} ${className}`}
    />
  );
}

