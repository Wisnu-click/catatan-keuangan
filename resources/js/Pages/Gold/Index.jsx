import React, { useState, useMemo } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import axios from 'axios';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import NeoCard from '../../Components/NeoCard';
import NeoButton from '../../Components/NeoButton';
import MaterialIcon from '../../Components/MaterialIcon';
import CurrencyInput from '../../Components/CurrencyInput';
import LiveGoldChart from '../../Components/LiveGoldChart';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

const formatNumber = (num, decimals = 4) =>
  new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(num);

const BRAND_OPTIONS = [
  'Antam LM (CertiEye)',
  'UBS Gold',
  'Galeri 24 (Pegadaian)',
  'Lotus Archi',
  'Emas Digital (Pegadaian / Pluang / Tokopedia)',
  'Perhiasan / Emas Fisik Toko',
  'Lainnya',
];

const PURITY_OPTIONS = [
  { value: '24K', label: '24 Karat (99.9%)' },
  { value: '22K', label: '22 Karat (91.6%)' },
  { value: '18K', label: '18 Karat (75.0%)' },
  { value: '14K', label: '14 Karat (58.5%)' },
];

/* ============================
   MODAL COMPONENT
   ============================ */
function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" />
      <div
        className={`relative bg-[#FDF8FF] border-4 border-[#1C1A27] neo-shadow p-6 md:p-8 w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 border-b-4 border-[#1C1A27] pb-4">
          <h2 className="text-2xl font-headline-md text-[#1C1A27] uppercase tracking-tight font-black">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white border-4 border-[#1C1A27] flex items-center justify-center cursor-pointer hover:bg-[#FECACA] transition-colors font-black"
          >
            <MaterialIcon name="close" className="text-xl text-[#1C1A27] font-bold" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ============================
   BUY GOLD FORM (BELI EMAS)
   ============================ */
function BuyGoldForm({ wallets = [], livePricePerGram = 2500000, onClose }) {
  const [inputMode, setInputMode] = useState('grams'); // 'grams' | 'amount'
  const form = useForm({
    type: 'buy',
    weight_grams: '1',
    price_per_gram: String(Math.round(livePricePerGram)),
    total_amount: String(Math.round(livePricePerGram)),
    fee: '0',
    brand: 'Antam LM (CertiEye)',
    purity: '24K',
    notes: '',
    transaction_date: new Date().toISOString().split('T')[0],
    wallet_id: wallets.length > 0 ? wallets[0].id : '',
  });

  const handleGramsChange = (gramsVal) => {
    const g = parseFloat(gramsVal) || 0;
    const p = parseFloat(form.data.price_per_gram) || 0;
    const fee = parseFloat(form.data.fee) || 0;
    form.setData((prev) => ({
      ...prev,
      weight_grams: gramsVal,
      total_amount: String(Math.round(g * p + fee)),
    }));
  };

  const handlePricePerGramChange = (priceVal) => {
    const p = parseFloat(priceVal) || 0;
    const g = parseFloat(form.data.weight_grams) || 0;
    const fee = parseFloat(form.data.fee) || 0;
    form.setData((prev) => ({
      ...prev,
      price_per_gram: priceVal,
      total_amount: String(Math.round(g * p + fee)),
    }));
  };

  const handleTotalAmountChange = (amountVal) => {
    const total = parseFloat(amountVal) || 0;
    const p = parseFloat(form.data.price_per_gram) || livePricePerGram || 1;
    const fee = parseFloat(form.data.fee) || 0;
    const netAmount = Math.max(0, total - fee);
    const calculatedGrams = p > 0 ? (netAmount / p).toFixed(4) : '0';
    form.setData((prev) => ({
      ...prev,
      total_amount: amountVal,
      weight_grams: calculatedGrams,
    }));
  };

  const handleFeeChange = (feeVal) => {
    const fee = parseFloat(feeVal) || 0;
    const g = parseFloat(form.data.weight_grams) || 0;
    const p = parseFloat(form.data.price_per_gram) || 0;
    form.setData((prev) => ({
      ...prev,
      fee: feeVal,
      total_amount: String(Math.round(g * p + fee)),
    }));
  };

  const handleUseLivePrice = () => {
    handlePricePerGramChange(String(Math.round(livePricePerGram)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    form.post('/gold/transactions', {
      onSuccess: onClose,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Input Mode Toggle */}
      <div className="flex gap-2 p-1 bg-white border-2 border-[#1C1A27]">
        <button
          type="button"
          onClick={() => setInputMode('grams')}
          className={`flex-1 py-2 font-label-mono text-xs font-bold uppercase transition-all ${
            inputMode === 'grams' ? 'bg-[#F59E0B] text-white border-2 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27]' : 'text-[#454654]'
          }`}
        >
          Input Berat (Gram)
        </button>
        <button
          type="button"
          onClick={() => setInputMode('amount')}
          className={`flex-1 py-2 font-label-mono text-xs font-bold uppercase transition-all ${
            inputMode === 'amount' ? 'bg-[#F59E0B] text-white border-2 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27]' : 'text-[#454654]'
          }`}
        >
          Input Nominal Rupiah
        </button>
      </div>

      {/* Grams & Price per Gram */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
            BERAT EMAS (GRAM)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.0001"
              min="0.0001"
              value={form.data.weight_grams}
              onChange={(e) => handleGramsChange(e.target.value)}
              placeholder="1.0000"
              required
              className="w-full h-14 pl-4 pr-12 bg-white border-4 border-[#1C1A27] text-lg font-number-xl text-[#1C1A27] font-bold shadow-[4px_4px_0px_0px_#1C1A27] focus:outline-none"
            />
            <span className="absolute right-4 top-4 font-label-mono text-sm font-bold text-[#454654]">
              gr
            </span>
          </div>
          {form.errors.weight_grams && (
            <p className="text-[#BA1A1A] font-label-mono text-xs font-bold mt-1">
              {form.errors.weight_grams}
            </p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
              HARGA / GRAM (Rp)
            </label>
            <button
              type="button"
              onClick={handleUseLivePrice}
              className="text-[10px] font-label-mono text-[#8B5CF6] font-bold underline hover:text-[#3B4CCA]"
              title="Gunakan harga live pasar hari ini"
            >
              Gunakan Harga Live
            </button>
          </div>
          <CurrencyInput
            value={form.data.price_per_gram}
            onChange={handlePricePerGramChange}
            size="md"
            className="w-full h-14 bg-white border-4 border-[#1C1A27] font-number-xl text-[#1C1A27] font-bold shadow-[4px_4px_0px_0px_#1C1A27] px-4 focus:outline-none"
          />
        </div>
      </div>

      {/* Total Amount & Biaya Cetak/Admin */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
            TOTAL BIAYA BELI (Rp)
          </label>
          <CurrencyInput
            value={form.data.total_amount}
            onChange={handleTotalAmountChange}
            size="lg"
            className="w-full h-14 bg-[#FEF08A] border-4 border-[#1C1A27] font-number-xl text-[#1C1A27] font-black shadow-[4px_4px_0px_0px_#1C1A27] px-4 focus:outline-none"
          />
          {form.errors.total_amount && (
            <p className="text-[#BA1A1A] font-label-mono text-xs font-bold mt-1">
              {form.errors.total_amount}
            </p>
          )}
        </div>

        <div>
          <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
            BIAYA CETAK / ADMIN (OPSIONAL)
          </label>
          <CurrencyInput
            value={form.data.fee}
            onChange={handleFeeChange}
            placeholder="0"
            size="md"
            className="w-full h-14 bg-white border-4 border-[#1C1A27] font-number-xl text-[#1C1A27] font-bold shadow-[4px_4px_0px_0px_#1C1A27] px-4 focus:outline-none"
          />
        </div>
      </div>

      {/* Brand & Karat */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
            MERK / BRAND EMAS
          </label>
          <select
            value={form.data.brand}
            onChange={(e) => form.setData('brand', e.target.value)}
            className="w-full h-14 px-3 bg-white border-4 border-[#1C1A27] text-sm font-body-md font-bold text-[#1C1A27] shadow-[4px_4px_0px_0px_#1C1A27] cursor-pointer"
          >
            {BRAND_OPTIONS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
            KADAR KEMURNIAN
          </label>
          <select
            value={form.data.purity}
            onChange={(e) => form.setData('purity', e.target.value)}
            className="w-full h-14 px-3 bg-white border-4 border-[#1C1A27] text-sm font-body-md font-bold text-[#1C1A27] shadow-[4px_4px_0px_0px_#1C1A27] cursor-pointer"
          >
            {PURITY_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Wallet Sumber Dana & Tanggal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
            POTONG DARI WALLET
          </label>
          <select
            value={form.data.wallet_id}
            onChange={(e) => form.setData('wallet_id', e.target.value)}
            className="w-full h-14 px-3 bg-white border-4 border-[#1C1A27] text-sm font-body-md font-bold text-[#1C1A27] shadow-[4px_4px_0px_0px_#1C1A27] cursor-pointer"
          >
            <option value="">-- Kas Luar / Tanpa Potong Wallet --</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.balance})
              </option>
            ))}
          </select>
          <p className="text-[10px] font-label-mono text-[#454654] font-bold mt-1">
            *Saldo wallet akan otomatis terpotong & tercatat di mutasi pengeluaran.
          </p>
        </div>

        <div>
          <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
            TANGGAL TRANSAKSI
          </label>
          <input
            type="date"
            value={form.data.transaction_date}
            onChange={(e) => form.setData('transaction_date', e.target.value)}
            required
            className="w-full h-14 px-4 bg-white border-4 border-[#1C1A27] text-sm font-body-md font-bold text-[#1C1A27] shadow-[4px_4px_0px_0px_#1C1A27]"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
          CATATAN / NOMOR SERI (OPSIONAL)
        </label>
        <input
          type="text"
          value={form.data.notes}
          onChange={(e) => form.setData('notes', e.target.value)}
          placeholder="Misal: Beli di Butik LM Pulo Gadung, No Seri A892..."
          className="w-full h-12 px-4 bg-white border-4 border-[#1C1A27] text-sm font-body-md text-[#1C1A27] font-bold shadow-[4px_4px_0px_0px_#1C1A27]"
        />
      </div>

      {/* Submit Button */}
      <NeoButton
        type="submit"
        variant="primary"
        size="xl"
        className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white"
        disabled={form.processing}
      >
        <MaterialIcon name="savings" className="text-2xl" />
        {form.processing ? 'MENYIMPAN...' : 'KONFIRMASI BELI / SIMPAN EMAS'}
      </NeoButton>
    </form>
  );
}

/* ============================
   SELL GOLD FORM (JUAL EMAS)
   ============================ */
function SellGoldForm({ wallets = [], activeGrams = 0, liveBidPrice = 2500000, onClose }) {
  const form = useForm({
    type: 'sell',
    weight_grams: activeGrams > 0 ? String(Math.min(1, activeGrams)) : '0',
    price_per_gram: String(Math.round(liveBidPrice)),
    total_amount: String(Math.round((activeGrams > 0 ? Math.min(1, activeGrams) : 0) * liveBidPrice)),
    fee: '0',
    brand: 'Antam LM (CertiEye)',
    purity: '24K',
    notes: '',
    transaction_date: new Date().toISOString().split('T')[0],
    wallet_id: wallets.length > 0 ? wallets[0].id : '',
  });

  const handleGramsChange = (gramsVal) => {
    const g = parseFloat(gramsVal) || 0;
    const p = parseFloat(form.data.price_per_gram) || 0;
    const fee = parseFloat(form.data.fee) || 0;
    form.setData((prev) => ({
      ...prev,
      weight_grams: gramsVal,
      total_amount: String(Math.round(Math.max(0, g * p - fee))),
    }));
  };

  const handlePricePerGramChange = (priceVal) => {
    const p = parseFloat(priceVal) || 0;
    const g = parseFloat(form.data.weight_grams) || 0;
    const fee = parseFloat(form.data.fee) || 0;
    form.setData((prev) => ({
      ...prev,
      price_per_gram: priceVal,
      total_amount: String(Math.round(Math.max(0, g * p - fee))),
    }));
  };

  const handleSellAll = () => {
    handleGramsChange(String(activeGrams));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    form.post('/gold/transactions', {
      onSuccess: onClose,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Available Balance Notice */}
      <div className="bg-[#FEF3C7] border-4 border-[#1C1A27] p-4 flex justify-between items-center shadow-[4px_4px_0px_0px_#1C1A27]">
        <div>
          <span className="font-label-mono text-xs uppercase font-bold text-[#854D0E] block">
            SALDO EMAS SAAT INI
          </span>
          <span className="font-number-xl text-2xl font-black text-[#1C1A27]">
            {formatNumber(activeGrams, 4)} gram
          </span>
        </div>
        <button
          type="button"
          onClick={handleSellAll}
          className="bg-[#1C1A27] text-white font-label-mono text-xs uppercase px-3 py-1.5 font-bold cursor-pointer hover:bg-[#8B5CF6]"
        >
          JUAL SEMUA
        </button>
      </div>

      {/* Grams & Price per Gram */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
            BERAT EMAS DIJUAL (GRAM)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.0001"
              min="0.0001"
              max={activeGrams}
              value={form.data.weight_grams}
              onChange={(e) => handleGramsChange(e.target.value)}
              required
              className="w-full h-14 pl-4 pr-12 bg-white border-4 border-[#1C1A27] text-lg font-number-xl text-[#1C1A27] font-bold shadow-[4px_4px_0px_0px_#1C1A27] focus:outline-none"
            />
            <span className="absolute right-4 top-4 font-label-mono text-sm font-bold text-[#454654]">
              gr
            </span>
          </div>
          {form.errors.weight_grams && (
            <p className="text-[#BA1A1A] font-label-mono text-xs font-bold mt-1">
              {form.errors.weight_grams}
            </p>
          )}
        </div>

        <div>
          <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
            HARGA BUYBACK / GRAM (Rp)
          </label>
          <CurrencyInput
            value={form.data.price_per_gram}
            onChange={handlePricePerGramChange}
            size="md"
            className="w-full h-14 bg-white border-4 border-[#1C1A27] font-number-xl text-[#1C1A27] font-bold shadow-[4px_4px_0px_0px_#1C1A27] px-4 focus:outline-none"
          />
        </div>
      </div>

      {/* Total Amount & Wallet Tujuan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
            HASIL PENJUALAN DITERIMA (Rp)
          </label>
          <CurrencyInput
            value={form.data.total_amount}
            onChange={(val) => form.setData('total_amount', val)}
            size="lg"
            className="w-full h-14 bg-[#DCFCE7] border-4 border-[#1C1A27] font-number-xl text-[#166534] font-black shadow-[4px_4px_0px_0px_#1C1A27] px-4 focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
            MASUKKAN UANG KE WALLET
          </label>
          <select
            value={form.data.wallet_id}
            onChange={(e) => form.setData('wallet_id', e.target.value)}
            className="w-full h-14 px-3 bg-white border-4 border-[#1C1A27] text-sm font-body-md font-bold text-[#1C1A27] shadow-[4px_4px_0px_0px_#1C1A27] cursor-pointer"
          >
            <option value="">-- Kas Luar / Tunai --</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.balance})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tanggal & Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
            TANGGAL PENJUALAN
          </label>
          <input
            type="date"
            value={form.data.transaction_date}
            onChange={(e) => form.setData('transaction_date', e.target.value)}
            required
            className="w-full h-14 px-4 bg-white border-4 border-[#1C1A27] text-sm font-body-md font-bold text-[#1C1A27] shadow-[4px_4px_0px_0px_#1C1A27]"
          />
        </div>
        <div>
          <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
            CATATAN / PEMBELI (OPSIONAL)
          </label>
          <input
            type="text"
            value={form.data.notes}
            onChange={(e) => form.setData('notes', e.target.value)}
            placeholder="Misal: Jual di Toko Mas Berkah..."
            className="w-full h-14 px-4 bg-white border-4 border-[#1C1A27] text-sm font-body-md text-[#1C1A27] font-bold shadow-[4px_4px_0px_0px_#1C1A27]"
          />
        </div>
      </div>

      <NeoButton
        type="submit"
        variant="primary"
        size="xl"
        className="w-full bg-[#10B981] hover:bg-[#059669] text-white"
        disabled={form.processing || activeGrams <= 0}
      >
        <MaterialIcon name="payments" className="text-2xl" />
        {form.processing ? 'MEMPROSES...' : 'KONFIRMASI JUAL / TERIMA UANG'}
      </NeoButton>
    </form>
  );
}

/* ============================
   TARGET FORM
   ============================ */
function GoldTargetForm({ currentTarget = null, activeGrams = 0, livePricePerGram = 2500000, onClose }) {
  const form = useForm({
    target_grams: currentTarget?.target_grams ? String(currentTarget.target_grams) : '25',
    target_date: currentTarget?.target_date ?? '',
    notes: currentTarget?.notes ?? '',
  });

  const targetNum = parseFloat(form.data.target_grams) || 0;
  const estimatedCost = targetNum * livePricePerGram;

  const handleSubmit = (e) => {
    e.preventDefault();
    form.post('/gold/target', {
      onSuccess: onClose,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
          TARGET KEPEMILIKAN EMAS (GRAM)
        </label>
        <div className="relative">
          <input
            type="number"
            step="0.1"
            min="0.1"
            value={form.data.target_grams}
            onChange={(e) => form.setData('target_grams', e.target.value)}
            required
            className="w-full h-16 pl-4 pr-16 bg-white border-4 border-[#1C1A27] text-2xl font-number-xl text-[#1C1A27] font-black shadow-[4px_4px_0px_0px_#1C1A27] focus:outline-none"
          />
          <span className="absolute right-4 top-4 font-label-mono text-base font-black text-[#454654]">
            GRAM
          </span>
        </div>
        {form.errors.target_grams && (
          <p className="text-[#BA1A1A] font-label-mono text-xs font-bold mt-1">
            {form.errors.target_grams}
          </p>
        )}
      </div>

      {/* Target Quick Select Chips */}
      <div className="flex flex-wrap gap-2">
        {['5', '10', '25', '50', '100', '250', '500'].map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => form.setData('target_grams', g)}
            className={`px-3 py-1.5 border-2 border-[#1C1A27] font-label-mono text-xs font-bold cursor-pointer transition-colors ${
              form.data.target_grams === g ? 'bg-[#F59E0B] text-white' : 'bg-white text-[#1C1A27] hover:bg-[#FEF3C7]'
            }`}
          >
            {g} Gram
          </button>
        ))}
      </div>

      {/* Estimated Value */}
      <div className="bg-[#E7DEFF] border-4 border-[#1C1A27] p-4 font-label-mono text-xs space-y-1">
        <span className="font-bold text-[#454654] uppercase block">Estimasi Nilai Target (Harga Saat Ini):</span>
        <span className="font-number-xl text-xl font-bold text-[#1C1A27] block">
          {formatCurrency(estimatedCost)}
        </span>
        <span className="text-[11px] text-[#454654]">
          Saat ini Anda sudah memiliki {formatNumber(activeGrams, 4)} gr ({targetNum > 0 ? Math.min(100, Math.round((activeGrams / targetNum) * 100)) : 0}%).
        </span>
      </div>

      <div>
        <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
          TARGET TERCAPAI PADA (OPSIONAL)
        </label>
        <input
          type="date"
          value={form.data.target_date}
          onChange={(e) => form.setData('target_date', e.target.value)}
          className="w-full h-14 px-4 bg-white border-4 border-[#1C1A27] text-sm font-body-md font-bold text-[#1C1A27] shadow-[4px_4px_0px_0px_#1C1A27]"
        />
      </div>

      <div>
        <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
          CATATAN / TUJUAN TABUNGAN (OPSIONAL)
        </label>
        <input
          type="text"
          value={form.data.notes}
          onChange={(e) => form.setData('notes', e.target.value)}
          placeholder="Misal: Dana Darurat Emas, Mahardika Emas..."
          className="w-full h-14 px-4 bg-white border-4 border-[#1C1A27] text-sm font-body-md font-bold text-[#1C1A27] shadow-[4px_4px_0px_0px_#1C1A27]"
        />
      </div>

      <NeoButton
        type="submit"
        variant="primary"
        size="xl"
        className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
        disabled={form.processing}
      >
        <MaterialIcon name="target" className="text-2xl" />
        {form.processing ? 'MENYIMPAN...' : 'SIMPAN TARGET EMAS'}
      </NeoButton>
    </form>
  );
}

/* ============================
   DELETE CONFIRMATION
   ============================ */
function DeleteGoldConfirm({ transaction, onClose }) {
  const [processing, setProcessing] = useState(false);

  const handleDelete = () => {
    setProcessing(true);
    router.delete(`/gold/transactions/${transaction.id}`, {
      onSuccess: onClose,
      onFinish: () => setProcessing(false),
    });
  };

  return (
    <div className="space-y-5">
      <div className="bg-[#FDE8E8] border-4 border-[#1C1A27] p-4 text-center">
        <MaterialIcon name="warning" className="text-5xl text-[#BA1A1A] mb-2" />
        <h3 className="text-xl font-headline-md text-[#1C1A27] font-bold">Hapus Transaksi Emas?</h3>
        <p className="text-sm font-body-md text-[#454654] mt-2 font-bold">
          Transaksi {transaction.type_label} <strong>"{transaction.weight_formatted}"</strong> senilai {transaction.total_amount_formatted} akan dihapus permanen.
        </p>
      </div>
      <div className="flex gap-4">
        <NeoButton variant="outline" size="lg" className="flex-1" onClick={onClose}>BATAL</NeoButton>
        <button
          onClick={handleDelete}
          disabled={processing}
          className="flex-1 h-14 bg-[#BA1A1A] text-white border-4 border-[#1C1A27] neo-shadow font-headline-md text-base uppercase flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <MaterialIcon name="delete_forever" className="text-xl" />
          HAPUS
        </button>
      </div>
    </div>
  );
}

/* ============================
   MAIN GOLD SAVINGS PAGE
   ============================ */
export default function Index({
  livePrice = {},
  portfolio = {},
  target = {},
  transactions = [],
  wallets = [],
}) {
  const [modal, setModal] = useState(null); // 'buy' | 'sell' | 'target' | 'delete'
  const [activeTx, setActiveTx] = useState(null);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'buy' | 'sell'
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentLivePrice, setCurrentLivePrice] = useState(livePrice);

  // Simulation Calculator State
  const [calcGrams, setCalcGrams] = useState(5);

  const openModal = (type, tx = null) => {
    setModal(type);
    setActiveTx(tx);
  };

  const closeModal = () => {
    setModal(null);
    setActiveTx(null);
  };

  // Refresh Live Gold Price
  const handleRefreshLivePrice = async () => {
    setIsRefreshing(true);
    try {
      const res = await axios.get('/gold/price/refresh');
      if (res.data?.status === 'success' && res.data?.data) {
        setCurrentLivePrice(res.data.data);
      }
      router.reload({ preserveScroll: true });
    } catch (e) {
      console.error('Failed to refresh gold price:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesType = filterType === 'ALL' || tx.type === filterType;
      const matchesSearch =
        searchQuery === '' ||
        tx.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.wallet_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [transactions, filterType, searchQuery]);

  const livePricePerGram = currentLivePrice?.price_per_gram || 2500000;
  const liveBidPrice = currentLivePrice?.bid || livePricePerGram;

  return (
    <AuthenticatedLayout>
      <Head title="Nabung di Emas & Live Tracker - VIRA" />

      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-[#1C1A27] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-label-mono text-xs uppercase px-2.5 py-0.5 bg-[#FEF08A] text-[#854D0E] border-2 border-[#1C1A27] font-black">
              ⭐ FITUR UNGGULAN & LIVE APISed.COM
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display-xl text-[#1C1A27] uppercase tracking-tighter mb-2 font-black">
            Nabung di Emas
          </h1>
          <p className="text-base font-body-md text-[#454654] font-bold max-w-2xl">
            Pantau pergerakan harga emas secara live, kelola tabungan fisik/digital, dan monitor keuntungan (ROI) portofolio Anda secara real-time.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          <NeoButton
            variant="outline"
            size="lg"
            onClick={() => openModal('target')}
            className="bg-white"
          >
            <MaterialIcon name="target" className="text-xl" />
            TARGET EMAS
          </NeoButton>

          <NeoButton
            variant="secondary"
            size="lg"
            onClick={() => openModal('sell')}
            disabled={portfolio.active_grams <= 0}
            className="bg-[#F87171] text-white hover:bg-[#EF4444]"
          >
            <MaterialIcon name="payments" className="text-xl" />
            JUAL EMAS
          </NeoButton>

          <NeoButton
            variant="primary"
            size="lg"
            onClick={() => openModal('buy')}
            className="bg-[#F59E0B] hover:bg-[#D97706] text-white"
          >
            <MaterialIcon name="add" className="text-xl" />
            + BELI / NABUNG EMAS
          </NeoButton>
        </div>
      </div>

      {/* =========================================================
          🔥 1. LIVE GOLD TICKER BANNER (apised.com API)
          ========================================================= */}
      <section className="mb-8 bg-[#FEF08A] border-4 border-[#1C1A27] neo-shadow p-6 md:p-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <span className="font-label-mono text-xs font-black uppercase tracking-widest text-[#1C1A27]">
                LIVE GOLD PRICE (XAU/IDR) • 24K PER GRAM
              </span>
            </div>

            <div className="flex flex-wrap items-baseline gap-4">
              <h2 className="text-4xl md:text-6xl font-number-xl font-black text-[#1C1A27] tracking-tight">
                {currentLivePrice?.price_per_gram_formatted || 'Rp 2.538.866'}
              </h2>
              <span
                className={`font-label-mono text-sm md:text-base font-black px-3 py-1 border-2 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] ${
                  currentLivePrice?.is_positive
                    ? 'bg-[#4ADE80] text-[#166534]'
                    : 'bg-[#F87171] text-[#991B1B]'
                }`}
              >
                {currentLivePrice?.change_formatted} ({currentLivePrice?.change_percentage_formatted})
              </span>
            </div>

            <p className="font-label-mono text-xs text-[#454654] font-bold">
              Terakhir diperbarui: {currentLivePrice?.updated_at_human || 'Baru saja'} • Sumber: <strong>apised.com</strong>
            </p>
          </div>

          {/* Quick Refresh Button & Stats */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              type="button"
              onClick={handleRefreshLivePrice}
              disabled={isRefreshing}
              className="bg-white text-[#1C1A27] border-4 border-[#1C1A27] px-4 py-3 font-label-mono text-xs uppercase font-black neo-shadow hover:bg-[#F1EBFE] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <MaterialIcon name="refresh" className={`text-xl ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'MEMPERBARUI...' : 'REFRESH HARGA'}
            </button>
          </div>
        </div>

        {/* Market Stats Mini Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t-4 border-[#1C1A27] border-dashed">
          <div className="bg-white p-3 border-2 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27]">
            <span className="font-label-mono text-[10px] text-[#454654] font-bold block uppercase">Tertinggi (High)</span>
            <span className="font-number-xl text-sm md:text-base font-bold text-[#1C1A27]">
              {currentLivePrice?.high_formatted || '-'}
            </span>
          </div>
          <div className="bg-white p-3 border-2 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27]">
            <span className="font-label-mono text-[10px] text-[#454654] font-bold block uppercase">Terendah (Low)</span>
            <span className="font-number-xl text-sm md:text-base font-bold text-[#1C1A27]">
              {currentLivePrice?.low_formatted || '-'}
            </span>
          </div>
          <div className="bg-white p-3 border-2 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27]">
            <span className="font-label-mono text-[10px] text-[#454654] font-bold block uppercase">Harga Beli Toko (Ask)</span>
            <span className="font-number-xl text-sm md:text-base font-bold text-[#3B4CCA]">
              {currentLivePrice?.ask_formatted || '-'}
            </span>
          </div>
          <div className="bg-white p-3 border-2 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27]">
            <span className="font-label-mono text-[10px] text-[#454654] font-bold block uppercase">Harga Buyback (Bid)</span>
            <span className="font-number-xl text-sm md:text-base font-bold text-[#16A34A]">
              {currentLivePrice?.bid_formatted || '-'}
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================
          🔥 1.5. LIVE INTERACTIVE GOLD CHART (GRAFIK EMAS LIVE)
          ========================================================= */}
      <section className="mb-8">
        <LiveGoldChart
          chartSeries={currentLivePrice?.chart_series || {}}
          currentPrice={livePricePerGram}
          openPrice={currentLivePrice?.open || livePricePerGram}
          highPrice={currentLivePrice?.high || livePricePerGram}
          lowPrice={currentLivePrice?.low || livePricePerGram}
          changeFormatted={currentLivePrice?.change_formatted || ''}
          changePercentageFormatted={currentLivePrice?.change_percentage_formatted || ''}
          isPositive={currentLivePrice?.is_positive ?? true}
          avgBuyPrice={portfolio?.avg_buy_price || 0}
          karatPrices={currentLivePrice?.karat_prices || {}}
          updatedAt={currentLivePrice?.updated_at_human || 'Baru saja'}
          onRefresh={handleRefreshLivePrice}
          isRefreshing={isRefreshing}
        />
      </section>

      {/* =========================================================
          🔥 2. PORTFOLIO & PROFIT / LOSS LIVE COMPARISON
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Grams Card */}
        <NeoCard bg="bg-[#E7DEFF]" rotate="rotate-[-0.5deg]" className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="font-label-mono text-xs uppercase text-[#454654] font-black">
                TOTAL KEPEMILIKAN EMAS
              </span>
              <div className="w-10 h-10 bg-white border-2 border-[#1C1A27] flex items-center justify-center shadow-[2px_2px_0px_0px_#1C1A27]">
                <MaterialIcon name="savings" className="text-xl text-[#8B5CF6]" />
              </div>
            </div>
            <h3 className="text-4xl md:text-5xl font-number-xl font-black text-[#1C1A27] tracking-tight">
              {portfolio.active_grams_formatted || '0,0000 gr'}
            </h3>
          </div>

          <div className="mt-4 pt-4 border-t-2 border-[#1C1A27]/20 flex justify-between font-label-mono text-xs font-bold text-[#454654]">
            <span>Total Beli: {formatNumber(portfolio.total_buy_grams || 0, 4)} gr</span>
            <span>Terjual: {formatNumber(portfolio.total_sell_grams || 0, 4)} gr</span>
          </div>
        </NeoCard>

        {/* Current Valuation & Cost Basis */}
        <NeoCard bg="bg-white" rotate="rotate-[0.5deg]" className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="font-label-mono text-xs uppercase text-[#454654] font-black">
                NILAI ASET SEKARANG (VALUATION)
              </span>
              <div className="w-10 h-10 bg-[#FEF08A] border-2 border-[#1C1A27] flex items-center justify-center shadow-[2px_2px_0px_0px_#1C1A27]">
                <MaterialIcon name="monetization_on" className="text-xl text-[#854D0E]" />
              </div>
            </div>
            <h3 className="text-3xl md:text-4xl font-number-xl font-black text-[#1C1A27] tracking-tight">
              {portfolio.current_valuation_formatted || 'Rp 0'}
            </h3>
          </div>

          <div className="mt-4 pt-4 border-t-2 border-[#1C1A27]/20 space-y-1 font-label-mono text-xs font-bold text-[#454654]">
            <div className="flex justify-between">
              <span>Total Modal Beli:</span>
              <strong className="text-[#1C1A27]">{portfolio.active_cost_basis_formatted || 'Rp 0'}</strong>
            </div>
            <div className="flex justify-between">
              <span>Rata-Rata Beli:</span>
              <strong className="text-[#1C1A27]">{portfolio.avg_buy_price_formatted || 'Rp 0'}/gr</strong>
            </div>
          </div>
        </NeoCard>

        {/* LIVE PROFIT / LOSS CARD */}
        <NeoCard
          bg={portfolio.is_profitable ? 'bg-[#DCFCE7]' : 'bg-[#FEE2E2]'}
          rotate="rotate-[-0.5deg]"
          className={`p-6 flex flex-col justify-between ${
            portfolio.is_profitable ? 'text-[#14532D]' : 'text-[#7F1D1D]'
          }`}
        >
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="font-label-mono text-xs uppercase font-black">
                KEUNTUNGAN / KERUGIAN (LIVE ROI)
              </span>
              <div className="w-10 h-10 bg-white border-2 border-[#1C1A27] flex items-center justify-center shadow-[2px_2px_0px_0px_#1C1A27]">
                <MaterialIcon
                  name={portfolio.is_profitable ? 'trending_up' : 'trending_down'}
                  className={`text-xl ${portfolio.is_profitable ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}
                />
              </div>
            </div>

            <h3 className="text-3xl md:text-4xl font-number-xl font-black tracking-tight">
              {portfolio.unrealized_profit_loss_formatted || 'Rp 0'}
            </h3>
            <p className="font-label-mono text-base font-black mt-1">
              ROI: {portfolio.unrealized_roi_pct_formatted || '0%'}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t-2 border-[#1C1A27]/20 font-label-mono text-xs font-bold flex justify-between">
            <span>Status Portofolio:</span>
            <span className="uppercase font-black">
              {portfolio.is_profitable ? '🚀 PROFIT' : '📉 SEDANG MINUS'}
            </span>
          </div>
        </NeoCard>
      </div>

      {/* =========================================================
          🔥 3. TARGET TABUNGAN EMAS SECTION
          ========================================================= */}
      <section className="mb-8 bg-white border-4 border-[#1C1A27] neo-shadow p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#8B5CF6] text-white border-2 border-[#1C1A27] flex items-center justify-center shadow-[2px_2px_0px_0px_#1C1A27]">
              <MaterialIcon name="target" className="text-2xl font-bold" />
            </div>
            <div>
              <h3 className="text-xl font-headline-md font-black text-[#1C1A27] uppercase">
                TARGET TABUNGAN EMAS
              </h3>
              <p className="font-body-md text-xs text-[#454654] font-bold">
                {target.notes ? `"${target.notes}"` : 'Tentukan target gram emas impian dan capai kemerdekaan finansial.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openModal('target')}
            className="bg-[#1C1A27] text-white px-4 py-2 font-label-mono text-xs font-black uppercase neo-shadow hover:bg-[#8B5CF6] cursor-pointer"
          >
            {target.target_grams > 0 ? 'EDIT TARGET' : '+ ATUR TARGET EMAS'}
          </button>
        </div>

        {target.target_grams > 0 ? (
          <div className="space-y-3 mt-4">
            <div className="flex justify-between font-label-mono text-xs font-black text-[#1C1A27]">
              <span>Terkumpul: {formatNumber(portfolio.active_grams || 0, 4)} gr</span>
              <span>Target: {target.target_grams_formatted} ({target.progress_pct}%)</span>
            </div>

            {/* Neo Progress Bar */}
            <div className="w-full h-8 bg-gray-200 border-4 border-[#1C1A27] p-1 shadow-[2px_2px_0px_0px_#1C1A27]">
              <div
                className="h-full bg-[#F59E0B] border-r-2 border-[#1C1A27] transition-all duration-500 flex items-center justify-end pr-2 text-white font-label-mono text-[10px] font-black"
                style={{ width: `${Math.max(5, Math.min(100, target.progress_pct))}%` }}
              >
                {target.progress_pct}%
              </div>
            </div>

            <div className="flex flex-wrap justify-between font-label-mono text-xs text-[#454654] font-bold pt-1">
              <span>Sisa yang dibutuhkan: <strong>{target.remaining_grams_formatted}</strong></span>
              {target.target_date_display && (
                <span>Batas Target: <strong>{target.target_date_display}</strong></span>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[#F1EBFE] border-2 border-[#1C1A27] p-4 text-center mt-2">
            <p className="font-body-md text-sm font-bold text-[#454654]">
              Anda belum mengatur target gram emas. Klik tombol <strong>+ ATUR TARGET EMAS</strong> untuk mulai!
            </p>
          </div>
        )}
      </section>

      {/* =========================================================
          🔥 4. SIMULATOR & KALKULATOR EMAS
          ========================================================= */}
      <section className="mb-8 bg-[#F1EBFE] border-4 border-[#1C1A27] neo-shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <MaterialIcon name="calculate" className="text-2xl text-[#8B5CF6]" />
          <h3 className="text-lg font-headline-md font-black text-[#1C1A27] uppercase">
            SIMULASI NILAI INVESTASI EMAS
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border-2 border-[#1C1A27] p-4">
            <label className="block font-label-mono text-[11px] uppercase font-bold text-[#454654] mb-1">
              Rencana Beli Emas:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0.1"
                step="0.5"
                value={calcGrams}
                onChange={(e) => setCalcGrams(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                className="w-full h-10 border-2 border-[#1C1A27] px-2 font-number-xl text-lg font-bold"
              />
              <span className="font-label-mono text-xs font-bold">gram</span>
            </div>
            <p className="font-label-mono text-[10px] text-[#454654] font-bold mt-2">
              Modal Hari Ini: <strong>{formatCurrency(calcGrams * livePricePerGram)}</strong>
            </p>
          </div>

          <div className="bg-white border-2 border-[#1C1A27] p-4">
            <span className="font-label-mono text-[11px] uppercase font-bold text-[#16A34A] block">
              Jika Naik +10%
            </span>
            <span className="font-number-xl text-lg font-bold text-[#1C1A27] block mt-1">
              {formatCurrency(calcGrams * livePricePerGram * 1.1)}
            </span>
            <span className="font-label-mono text-[10px] text-[#16A34A] font-bold">
              Potensi Untung: +{formatCurrency(calcGrams * livePricePerGram * 0.1)}
            </span>
          </div>

          <div className="bg-white border-2 border-[#1C1A27] p-4">
            <span className="font-label-mono text-[11px] uppercase font-bold text-[#16A34A] block">
              Jika Naik +25%
            </span>
            <span className="font-number-xl text-lg font-bold text-[#1C1A27] block mt-1">
              {formatCurrency(calcGrams * livePricePerGram * 1.25)}
            </span>
            <span className="font-label-mono text-[10px] text-[#16A34A] font-bold">
              Potensi Untung: +{formatCurrency(calcGrams * livePricePerGram * 0.25)}
            </span>
          </div>

          <div className="bg-white border-2 border-[#1C1A27] p-4">
            <span className="font-label-mono text-[11px] uppercase font-bold text-[#16A34A] block">
              Jika Naik +50%
            </span>
            <span className="font-number-xl text-lg font-bold text-[#1C1A27] block mt-1">
              {formatCurrency(calcGrams * livePricePerGram * 1.5)}
            </span>
            <span className="font-label-mono text-[10px] text-[#16A34A] font-bold">
              Potensi Untung: +{formatCurrency(calcGrams * livePricePerGram * 0.5)}
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================
          🔥 5. DAFTAR & RIWAYAT TRANSAKSI EMAS
          ========================================================= */}
      <section className="bg-white border-4 border-[#1C1A27] neo-shadow p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-4 border-[#1C1A27] pb-4 mb-6">
          <div>
            <h3 className="text-2xl font-headline-md font-black text-[#1C1A27] uppercase">
              RIWAYAT TRANSAKSI EMAS ({filteredTransactions.length})
            </h3>
            <p className="font-body-md text-xs text-[#454654] font-bold">
              Catatan mutasi pembelian dan penjualan emas Anda.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex border-2 border-[#1C1A27]">
              {['ALL', 'buy', 'sell'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 font-label-mono text-xs font-bold uppercase cursor-pointer transition-colors ${
                    filterType === type ? 'bg-[#1C1A27] text-white' : 'bg-white text-[#1C1A27] hover:bg-gray-100'
                  }`}
                >
                  {type === 'ALL' ? 'SEMUA' : type === 'buy' ? 'BELI' : 'JUAL'}
                </button>
              ))}
            </div>

            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari merk, catatan..."
                className="h-10 px-3 pl-8 bg-white border-2 border-[#1C1A27] font-body-md text-xs font-bold"
              />
              <MaterialIcon name="search" className="absolute left-2 top-2.5 text-sm text-[#454654]" />
            </div>
          </div>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length > 0 ? (
          <div className="space-y-4">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-[#FDF8FF] border-4 border-[#1C1A27] p-4 md:p-5 neo-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:bg-white"
              >
                {/* Left: Icon & Info */}
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 border-2 border-[#1C1A27] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#1C1A27] ${
                      tx.type === 'buy' ? 'bg-[#FEF08A] text-[#854D0E]' : 'bg-[#DCFCE7] text-[#166534]'
                    }`}
                  >
                    <MaterialIcon name={tx.type === 'buy' ? 'add' : 'remove'} className="text-2xl font-black" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-label-mono text-[10px] font-black px-2 py-0.5 border border-[#1C1A27] uppercase ${
                          tx.type === 'buy' ? 'bg-[#FEF08A] text-[#854D0E]' : 'bg-[#DCFCE7] text-[#166534]'
                        }`}
                      >
                        {tx.type_label}
                      </span>
                      <span className="font-label-mono text-xs text-[#454654] font-bold">
                        {tx.transaction_date_display}
                      </span>
                      <span className="font-label-mono text-xs font-black bg-[#E7DEFF] px-2 py-0.5 border border-[#1C1A27]">
                        {tx.purity}
                      </span>
                    </div>

                    <h4 className="text-lg font-headline-md font-bold text-[#1C1A27] mt-1">
                      {tx.brand} ({tx.weight_formatted})
                    </h4>

                    <p className="font-label-mono text-xs text-[#454654] font-bold mt-0.5">
                      Harga per gram: {tx.price_per_gram_formatted} • Wallet: <strong>{tx.wallet_name}</strong>
                      {tx.notes !== '-' && ` • Catatan: ${tx.notes}`}
                    </p>
                  </div>
                </div>

                {/* Right: Nominal & Profit badge & Delete */}
                <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t-2 md:border-t-0 border-[#1C1A27]/20 pt-3 md:pt-0">
                  <div className="text-left md:text-right">
                    <span className="font-number-xl text-xl md:text-2xl font-black text-[#1C1A27] block">
                      {tx.total_amount_formatted}
                    </span>

                    {/* Live P/L Indicator for Buy transactions */}
                    {tx.type === 'buy' && (
                      <span
                        className={`font-label-mono text-[11px] font-bold block ${
                          tx.is_profitable ? 'text-[#16A34A]' : 'text-[#DC2626]'
                        }`}
                      >
                        Nilai Live: {tx.diff_amount_formatted} ({tx.diff_percentage_formatted})
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => openModal('delete', tx)}
                    className="w-10 h-10 bg-[#FFDAD6] text-[#93000A] border-2 border-[#1C1A27] flex items-center justify-center hover:bg-[#BA1A1A] hover:text-white transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#1C1A27]"
                    title="Hapus Transaksi Emas"
                  >
                    <MaterialIcon name="delete" className="text-lg font-bold" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#F1EBFE] border-3 border-[#1C1A27] p-8 text-center space-y-3">
            <MaterialIcon name="savings" className="text-5xl text-[#F59E0B] mx-auto" />
            <h4 className="text-xl font-headline-md font-bold text-[#1C1A27] uppercase">
              Belum Ada Transaksi Emas
            </h4>
            <p className="font-body-md text-sm text-[#454654] font-bold max-w-md mx-auto">
              Mulai catat kepemilikan emas pertama Anda dan pantau kenaikan nilainya secara live!
            </p>
            <button
              type="button"
              onClick={() => openModal('buy')}
              className="bg-[#F59E0B] text-white neo-border px-5 py-2.5 font-label-mono text-xs uppercase font-bold neo-shadow hover:bg-[#D97706] cursor-pointer inline-flex items-center gap-2"
            >
              <MaterialIcon name="add" className="text-lg" />
              CATAT PEMBELIAN EMAS PERTAMA
            </button>
          </div>
        )}
      </section>

      {/* =========================================================
          MODALS
          ========================================================= */}
      {/* Modal Beli Emas */}
      <Modal isOpen={modal === 'buy'} onClose={closeModal} title="Beli / Nabung Emas Baru">
        <BuyGoldForm
          wallets={wallets}
          livePricePerGram={livePricePerGram}
          onClose={closeModal}
        />
      </Modal>

      {/* Modal Jual Emas */}
      <Modal isOpen={modal === 'sell'} onClose={closeModal} title="Jual / Tarik Emas">
        <SellGoldForm
          wallets={wallets}
          activeGrams={portfolio.active_grams || 0}
          liveBidPrice={liveBidPrice}
          onClose={closeModal}
        />
      </Modal>

      {/* Modal Target Emas */}
      <Modal isOpen={modal === 'target'} onClose={closeModal} title="Target Tabungan Emas">
        <GoldTargetForm
          currentTarget={target}
          activeGrams={portfolio.active_grams || 0}
          livePricePerGram={livePricePerGram}
          onClose={closeModal}
        />
      </Modal>

      {/* Modal Hapus Transaksi */}
      <Modal isOpen={modal === 'delete'} onClose={closeModal} title="Hapus Transaksi" maxWidth="max-w-lg">
        {activeTx && <DeleteGoldConfirm transaction={activeTx} onClose={closeModal} />}
      </Modal>
    </AuthenticatedLayout>
  );
}

