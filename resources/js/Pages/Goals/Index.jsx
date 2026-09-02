import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import GoalCard from '../../Components/GoalCard';
import NeoButton from '../../Components/NeoButton';
import NeoCard from '../../Components/NeoCard';
import MaterialIcon from '../../Components/MaterialIcon';
import CurrencyInput from '../../Components/CurrencyInput';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

const ICON_OPTIONS = [
  { value: 'savings', label: 'Tabungan' },
  { value: 'flight_takeoff', label: 'Liburan' },
  { value: 'laptop_mac', label: 'Laptop' },
  { value: 'directions_car', label: 'Mobil' },
  { value: 'home', label: 'Rumah' },
  { value: 'school', label: 'Pendidikan' },
  { value: 'favorite', label: 'Favorit' },
  { value: 'diamond', label: 'Perhiasan' },
  { value: 'phone_iphone', label: 'Gadget' },
  { value: 'shopping_bag', label: 'Belanja' },
  { value: 'medical_services', label: 'Kesehatan' },
  { value: 'celebration', label: 'Event' },
];

const DAYS_OF_WEEK = [
  { value: 0, label: 'Hari Minggu' },
  { value: 1, label: 'Hari Senin' },
  { value: 2, label: 'Hari Selasa' },
  { value: 3, label: 'Hari Rabu' },
  { value: 4, label: 'Hari Kamis' },
  { value: 5, label: 'Hari Jumat' },
  { value: 6, label: 'Hari Sabtu' },
];

const ROTATIONS = ['rotate-[-0.5deg]', 'rotate-[0.5deg]', 'rotate-[0deg]', 'rotate-[-1deg]', 'rotate-[1deg]'];

/* ============================
   MODAL OVERLAY
   ============================ */
function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" />
      <div
        className={`relative bg-[#FDF8FF] border-4 border-[#1C1A27] neo-shadow p-6 md:p-8 w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b-4 border-[#1C1A27] pb-4">
          <h2 className="text-2xl font-headline-md text-[#1C1A27] uppercase tracking-tight font-bold">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white border-4 border-[#1C1A27] flex items-center justify-center cursor-pointer hover:bg-[#FECACA] transition-colors"
          >
            <MaterialIcon name="close" className="text-[#1C1A27]" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ============================
   GOAL CREATE / EDIT FORM
   ============================ */
function GoalForm({ wallets, goal = null, onClose }) {
  const isEditing = !!goal;

  const form = useForm({
    name: goal?.name ?? '',
    wallet_id: goal?.wallet_id ?? (wallets.length > 0 ? wallets[0].id : ''),
    target_amount: goal?.target_amount ?? '',
    target_date: goal?.target_date ?? '',
    icon: goal?.icon ?? 'savings',
    status: goal?.status ?? 'active',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      form.put(`/goals/${goal.id}`, { onSuccess: onClose });
    } else {
      form.post('/goals', { onSuccess: onClose });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nama Target */}
      <div className="space-y-2">
        <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
          NAMA TARGET
        </label>
        <input
          type="text"
          value={form.data.name}
          onChange={(e) => form.setData('name', e.target.value)}
          placeholder="Liburan Jepang, MacBook Pro, DP Rumah..."
          className="w-full h-14 px-4 bg-white border-4 border-[#1C1A27] text-lg font-body-md text-[#1C1A27] focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_#1C1A27]"
          required
        />
        {form.errors.name && <p className="text-[#BA1A1A] font-label-mono text-xs font-bold">{form.errors.name}</p>}
      </div>

      {/* Wallet Sumber */}
      <div className="space-y-2">
        <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
          WALLET SUMBER
        </label>
        <select
          value={form.data.wallet_id}
          onChange={(e) => form.setData('wallet_id', e.target.value)}
          className="w-full h-14 px-4 bg-white border-4 border-[#1C1A27] text-base font-body-md text-[#1C1A27] focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_#1C1A27] cursor-pointer"
          required
        >
          {wallets.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name} ({formatCurrency(w.current_balance)})
            </option>
          ))}
        </select>
        {form.errors.wallet_id && <p className="text-[#BA1A1A] font-label-mono text-xs font-bold">{form.errors.wallet_id}</p>}
      </div>

      {/* Target Amount */}
      <div className="space-y-2">
        <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
          TARGET JUMLAH (Rp)
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-4 text-2xl font-headline-md text-[#454654] font-bold">Rp</span>
          <CurrencyInput
            value={form.data.target_amount}
            onChange={(raw) => form.setData('target_amount', raw)}
            placeholder="10.000.000"
            size="xl"
            className="w-full h-20 pl-16 pr-4 bg-white border-4 border-[#1C1A27] font-number-xl text-[#1C1A27] focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_#1C1A27]"
            required
          />
        </div>
        {form.errors.target_amount && <p className="text-[#BA1A1A] font-label-mono text-xs font-bold">{form.errors.target_amount}</p>}
      </div>

      {/* Target Date */}
      <div className="space-y-2">
        <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
          TARGET TANGGAL (OPSIONAL)
        </label>
        <input
          type="date"
          value={form.data.target_date}
          onChange={(e) => form.setData('target_date', e.target.value)}
          className="w-full h-14 px-4 bg-white border-4 border-[#1C1A27] text-base font-body-md text-[#1C1A27] focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_#1C1A27]"
        />
        {form.errors.target_date && <p className="text-[#BA1A1A] font-label-mono text-xs font-bold">{form.errors.target_date}</p>}
      </div>

      {/* Icon Picker */}
      <div className="space-y-2">
        <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
          IKON
        </label>
        <div className="flex flex-wrap gap-2">
          {ICON_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => form.setData('icon', opt.value)}
              className={`w-12 h-12 border-4 border-[#1C1A27] flex items-center justify-center cursor-pointer transition-all ${
                form.data.icon === opt.value
                  ? 'bg-[#8B5CF6] text-white shadow-[4px_4px_0px_0px_#1C1A27]'
                  : 'bg-white text-[#1C1A27] hover:bg-[#E7DEFF]'
              }`}
              title={opt.label}
            >
              <MaterialIcon name={opt.value} className="text-xl" />
            </button>
          ))}
        </div>
      </div>

      {/* Status (only on edit) */}
      {isEditing && (
        <div className="space-y-2">
          <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
            STATUS
          </label>
          <select
            value={form.data.status}
            onChange={(e) => form.setData('status', e.target.value)}
            className="w-full h-14 px-4 bg-white border-4 border-[#1C1A27] text-base font-body-md text-[#1C1A27] focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_#1C1A27] cursor-pointer"
          >
            <option value="active">Aktif</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </div>
      )}

      {/* Submit */}
      <NeoButton
        type="submit"
        variant="primary"
        size="xl"
        className="w-full mt-4"
        disabled={form.processing}
      >
        <MaterialIcon name={isEditing ? 'save' : 'add_circle'} className="text-2xl" />
        {form.processing ? 'MENYIMPAN...' : isEditing ? 'SIMPAN PERUBAHAN' : 'BUAT TARGET BARU'}
      </NeoButton>
    </form>
  );
}

/* ============================
   DEPOSIT FORM
   ============================ */
function DepositForm({ goal, onClose }) {
  const form = useForm({
    amount: '',
    description: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    form.post(`/goals/${goal.id}/deposit`, { onSuccess: onClose });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Goal Info */}
      <div className="bg-[#E7DEFF] border-4 border-[#1C1A27] p-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-white border-4 border-[#1C1A27] flex items-center justify-center">
          <MaterialIcon name={goal.icon} className="text-2xl text-[#1C1A27]" />
        </div>
        <div>
          <p className="font-headline-md text-lg text-[#1C1A27] font-bold">{goal.name}</p>
          <p className="font-label-mono text-xs text-[#454654] uppercase">
            {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)} ({goal.percentage}%)
          </p>
        </div>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
          JUMLAH NABUNG (Rp)
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-4 text-2xl font-headline-md text-[#454654] font-bold">Rp</span>
          <CurrencyInput
            value={form.data.amount}
            onChange={(raw) => form.setData('amount', raw)}
            placeholder="500.000"
            size="xl"
            className="w-full h-20 pl-16 pr-4 bg-white border-4 border-[#1C1A27] font-number-xl text-[#1C1A27] focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_#1C1A27]"
            required
          />
        </div>
        {form.errors.amount && <p className="text-[#BA1A1A] font-label-mono text-xs font-bold">{form.errors.amount}</p>}
      </div>

      {/* Quick Amount Buttons */}
      <div className="flex flex-wrap gap-2">
        {[50000, 100000, 250000, 500000, 1000000].map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => form.setData('amount', String(amt))}
            className="px-3 py-2 bg-white border-2 border-[#1C1A27] font-label-mono text-xs font-bold hover:bg-[#E7DEFF] cursor-pointer shadow-[2px_2px_0px_0px_#1C1A27]"
          >
            +{formatCurrency(amt)}
          </button>
        ))}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
          CATATAN (OPSIONAL)
        </label>
        <input
          type="text"
          value={form.data.description}
          onChange={(e) => form.setData('description', e.target.value)}
          placeholder="Nabung dari sisa gaji, bonus..."
          className="w-full h-14 px-4 bg-white border-4 border-[#1C1A27] text-base font-body-md text-[#1C1A27] focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_#1C1A27]"
        />
      </div>

      <NeoButton
        type="submit"
        variant="primary"
        size="xl"
        className="w-full"
        disabled={form.processing}
      >
        <MaterialIcon name="savings" className="text-2xl" />
        {form.processing ? 'MEMPROSES...' : 'SETOR TABUNGAN'}
      </NeoButton>
    </form>
  );
}

/* ============================
   WITHDRAW FORM
   ============================ */
function WithdrawForm({ goal, onClose }) {
  const form = useForm({
    amount: '',
    description: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    form.post(`/goals/${goal.id}/withdraw`, { onSuccess: onClose });
  };

  const handleWithdrawAll = () => {
    form.setData('amount', String(goal.current_amount));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Goal Info */}
      <div className="bg-[#FEE2E2] border-4 border-[#1C1A27] p-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-white border-4 border-[#1C1A27] flex items-center justify-center">
          <MaterialIcon name="warning" className="text-2xl text-[#BA1A1A]" />
        </div>
        <div>
          <p className="font-headline-md text-lg text-[#1C1A27] font-bold">{goal.name}</p>
          <p className="font-label-mono text-xs text-[#454654] uppercase">
            Saldo tersedia: <span className="text-[#BA1A1A] font-bold">{formatCurrency(goal.current_amount)}</span>
          </p>
        </div>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
          JUMLAH PENARIKAN (Rp)
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-4 text-2xl font-headline-md text-[#BA1A1A] font-bold">Rp</span>
          <CurrencyInput
            value={form.data.amount}
            onChange={(raw) => form.setData('amount', raw)}
            placeholder="500.000"
            size="xl"
            className="w-full h-20 pl-16 pr-4 bg-white border-4 border-[#1C1A27] font-number-xl text-[#1C1A27] focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_#BA1A1A]"
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleWithdrawAll}
            className="font-label-mono text-xs uppercase text-[#BA1A1A] hover:underline underline-offset-4 cursor-pointer font-bold"
          >
            TARIK SEMUA ({formatCurrency(goal.current_amount)})
          </button>
        </div>
        {form.errors.amount && <p className="text-[#BA1A1A] font-label-mono text-xs font-bold">{form.errors.amount}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
          ALASAN PENARIKAN (OPSIONAL)
        </label>
        <textarea
          value={form.data.description}
          onChange={(e) => form.setData('description', e.target.value)}
          placeholder="Kebutuhan mendesak, pindah dana..."
          rows={2}
          className="w-full px-4 py-3 bg-white border-4 border-[#1C1A27] text-base font-body-md text-[#1C1A27] focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_#1C1A27] resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={form.processing}
        className="w-full h-16 bg-[#BA1A1A] text-white border-4 border-[#1C1A27] neo-shadow neo-shadow-hover font-headline-md text-lg uppercase flex justify-center items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
      >
        <MaterialIcon name="warning" className="text-2xl" />
        {form.processing ? 'MEMPROSES...' : 'KONFIRMASI TARIK'}
      </button>
    </form>
  );
}

/* ============================
   SAVING REMINDER FORM (MENABUNG KONSISTEN)
   ============================ */
function SavingReminderForm({ goals = [], wallets = [], reminder = null, onClose }) {
  const isEditing = !!reminder;

  const form = useForm({
    title: reminder?.title ?? '',
    goal_id: reminder?.goal_id ?? (goals.length > 0 ? goals[0].id : ''),
    wallet_id: reminder?.wallet_id ?? (wallets.length > 0 ? wallets[0].id : ''),
    amount: reminder?.amount ? String(reminder.amount) : '50000',
    frequency: reminder?.frequency ?? 'weekly',
    day_of_week: reminder?.day_of_week ?? 0, // 0 = Minggu
    day_of_month: reminder?.day_of_month ?? 1,
    is_active: reminder?.is_active ?? true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      form.put(`/saving-reminders/${reminder.id}`, { onSuccess: onClose });
    } else {
      form.post('/saving-reminders', { onSuccess: onClose });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div className="space-y-2">
        <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
          NAMA PROGRAM / JADWAL PENGINGAT
        </label>
        <input
          type="text"
          value={form.data.title}
          onChange={(e) => form.setData('title', e.target.value)}
          placeholder="Misal: Nabung Rutin Hari Minggu, Gaji Masuk, dll"
          className="w-full h-14 px-4 bg-white border-4 border-[#1C1A27] text-base font-body-md text-[#1C1A27] focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_#1C1A27]"
          required
        />
        {form.errors.title && <p className="text-[#BA1A1A] font-label-mono text-xs font-bold">{form.errors.title}</p>}
      </div>

      {/* Target Goal & Wallet in Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Goal */}
        <div className="space-y-2">
          <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
            TARGET TABUNGAN
          </label>
          <select
            value={form.data.goal_id}
            onChange={(e) => form.setData('goal_id', e.target.value)}
            className="w-full h-14 px-3 bg-white border-4 border-[#1C1A27] text-sm font-body-md text-[#1C1A27] focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_#1C1A27] cursor-pointer"
          >
            <option value="">-- TABUNGAN UMUM --</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Wallet Source */}
        <div className="space-y-2">
          <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
            WALLET SUMBER DANA
          </label>
          <select
            value={form.data.wallet_id}
            onChange={(e) => form.setData('wallet_id', e.target.value)}
            className="w-full h-14 px-3 bg-white border-4 border-[#1C1A27] text-sm font-body-md text-[#1C1A27] focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_#1C1A27] cursor-pointer"
            required
          >
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({formatCurrency(w.current_balance)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Amount Input */}
      <div className="space-y-2">
        <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
          NOMINAL TABUNGAN RUTIN (Rp)
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-4 text-2xl font-headline-md text-[#454654] font-bold">Rp</span>
          <CurrencyInput
            value={form.data.amount}
            onChange={(raw) => form.setData('amount', raw)}
            placeholder="50.000"
            size="xl"
            className="w-full h-20 pl-16 pr-4 bg-white border-4 border-[#1C1A27] font-number-xl text-[#1C1A27] focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_#1C1A27]"
            required
          />
        </div>
        {form.errors.amount && <p className="text-[#BA1A1A] font-label-mono text-xs font-bold">{form.errors.amount}</p>}
      </div>

      {/* Frequency Selector */}
      <div className="space-y-2">
        <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
          FREKUENSI PENGINGAT
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'weekly', label: 'MINGGUAN', icon: 'date_range' },
            { id: 'daily', label: 'HARIAN', icon: 'today' },
            { id: 'monthly', label: 'BULANAN', icon: 'calendar_month' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => form.setData('frequency', f.id)}
              className={`p-3 border-4 border-[#1C1A27] flex flex-col items-center justify-center gap-1 font-label-mono text-xs font-bold cursor-pointer transition-all ${
                form.data.frequency === f.id
                  ? 'bg-[#8B5CF6] text-white shadow-[4px_4px_0px_0px_#1C1A27]'
                  : 'bg-white text-[#1C1A27] hover:bg-[#E7DEFF]'
              }`}
            >
              <MaterialIcon name={f.icon} className="text-xl" />
              <span>{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Conditional Day of Week or Day of Month Selector */}
      {form.data.frequency === 'weekly' && (
        <div className="space-y-2 bg-[#E7DEFF] border-4 border-[#1C1A27] p-4">
          <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
            PILIH HARI PENGINGAT
          </label>
          <select
            value={form.data.day_of_week}
            onChange={(e) => form.setData('day_of_week', parseInt(e.target.value))}
            className="w-full h-12 px-3 bg-white border-2 border-[#1C1A27] text-sm font-bold font-label-mono cursor-pointer"
          >
            {DAYS_OF_WEEK.map((d) => (
              <option key={d.value} value={d.value}>
                Setiap {d.label}
              </option>
            ))}
          </select>
          <p className="font-label-mono text-[11px] text-[#454654] font-bold">
            *Website akan otomatis memberi notifikasi live setiap hari terpilih.
          </p>
        </div>
      )}

      {form.data.frequency === 'monthly' && (
        <div className="space-y-2 bg-[#E7DEFF] border-4 border-[#1C1A27] p-4">
          <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
            PILIH TANGGAL BULANAN (1 - 31)
          </label>
          <select
            value={form.data.day_of_month}
            onChange={(e) => form.setData('day_of_month', parseInt(e.target.value))}
            className="w-full h-12 px-3 bg-white border-2 border-[#1C1A27] text-sm font-bold font-label-mono cursor-pointer"
          >
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
              <option key={day} value={day}>
                Setiap Tanggal {day} Tiap Bulan
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Active Toggle */}
      <div className="flex items-center gap-3 bg-white border-4 border-[#1C1A27] p-3">
        <input
          type="checkbox"
          id="is_active_check"
          checked={form.data.is_active}
          onChange={(e) => form.setData('is_active', e.target.checked)}
          className="w-6 h-6 border-2 border-[#1C1A27] text-[#8B5CF6] focus:ring-0 cursor-pointer"
        />
        <label htmlFor="is_active_check" className="font-label-mono text-xs uppercase font-bold text-[#1C1A27] cursor-pointer select-none">
          Aktifkan Notifikasi & Pengingat Menabung Ini
        </label>
      </div>

      {/* Submit */}
      <NeoButton
        type="submit"
        variant="primary"
        size="xl"
        className="w-full"
        disabled={form.processing}
      >
        <MaterialIcon name={isEditing ? 'save' : 'alarm_on'} className="text-2xl" />
        {form.processing ? 'MENYIMPAN...' : isEditing ? 'SIMPAN PERUBAHAN' : 'PASANG PENGINGAT SEKARANG'}
      </NeoButton>
    </form>
  );
}

/* ============================
   DELETE CONFIRMATION
   ============================ */
function DeleteConfirm({ goal, onClose }) {
  const [processing, setProcessing] = useState(false);

  const handleDelete = () => {
    setProcessing(true);
    router.delete(`/goals/${goal.id}`, {
      onSuccess: onClose,
      onFinish: () => setProcessing(false),
    });
  };

  return (
    <div className="space-y-5">
      <div className="bg-[#FDE8E8] border-4 border-[#1C1A27] p-4 text-center">
        <MaterialIcon name="warning" className="text-5xl text-[#BA1A1A] mb-2" />
        <h3 className="text-xl font-headline-md text-[#1C1A27] font-bold">Yakin Hapus Target?</h3>
        <p className="text-sm font-body-md text-[#454654] mt-2">
          Target <strong>"{goal.name}"</strong> dan semua riwayat kontribusinya akan dihapus permanen.
        </p>
        {goal.current_amount > 0 && (
          <p className="text-sm font-body-md text-[#BA1A1A] mt-2 font-bold">
            ⚠ Saldo terkumpul {formatCurrency(goal.current_amount)} akan hilang!
          </p>
        )}
      </div>

      <div className="flex gap-4">
        <NeoButton variant="outline" size="lg" className="flex-1" onClick={onClose}>
          BATAL
        </NeoButton>
        <button
          onClick={handleDelete}
          disabled={processing}
          className="flex-1 h-14 bg-[#BA1A1A] text-white border-4 border-[#1C1A27] neo-shadow font-headline-md text-base uppercase flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
        >
          <MaterialIcon name="delete_forever" className="text-xl" />
          {processing ? 'MENGHAPUS...' : 'HAPUS'}
        </button>
      </div>
    </div>
  );
}

/* ============================
   DELETE REMINDER CONFIRMATION
   ============================ */
function DeleteReminderConfirm({ reminder, onClose }) {
  const [processing, setProcessing] = useState(false);

  const handleDelete = () => {
    setProcessing(true);
    router.delete(`/saving-reminders/${reminder.id}`, {
      onSuccess: onClose,
      onFinish: () => setProcessing(false),
    });
  };

  return (
    <div className="space-y-5">
      <div className="bg-[#FDE8E8] border-4 border-[#1C1A27] p-4 text-center">
        <MaterialIcon name="warning" className="text-5xl text-[#BA1A1A] mb-2" />
        <h3 className="text-xl font-headline-md text-[#1C1A27] font-bold">Hapus Jadwal Menabung?</h3>
        <p className="text-sm font-body-md text-[#454654] mt-2 font-bold">
          Program pengingat <strong>"{reminder.title}"</strong> ({reminder.amount_formatted} / {reminder.frequency_label}) akan dihapus.
        </p>
      </div>

      <div className="flex gap-4">
        <NeoButton variant="outline" size="lg" className="flex-1" onClick={onClose}>
          BATAL
        </NeoButton>
        <button
          onClick={handleDelete}
          disabled={processing}
          className="flex-1 h-14 bg-[#BA1A1A] text-white border-4 border-[#1C1A27] neo-shadow font-headline-md text-base uppercase flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
        >
          <MaterialIcon name="delete_forever" className="text-xl" />
          {processing ? 'MENGHAPUS...' : 'HAPUS'}
        </button>
      </div>
    </div>
  );
}

/* ============================
   MAIN PAGE
   ============================ */
export default function Index({ goals = [], wallets = [], reminders = [] }) {
  const [modal, setModal] = useState(null);       // 'create' | 'edit' | 'deposit' | 'withdraw' | 'delete' | 'reminder_create' | 'reminder_edit' | 'reminder_delete'
  const [activeGoal, setActiveGoal] = useState(null);
  const [activeReminder, setActiveReminder] = useState(null);

  const openModal = (type, data = null) => {
    setModal(type);
    if (type.startsWith('reminder_')) {
      setActiveReminder(data);
    } else {
      setActiveGoal(data);
    }
  };

  const closeModal = () => {
    setModal(null);
    setActiveGoal(null);
    setActiveReminder(null);
  };

  const handleToggleReminder = (reminder) => {
    router.patch(`/saving-reminders/${reminder.id}/toggle`, {}, {
      preserveScroll: true,
    });
  };

  const handleFastDeposit = (reminder) => {
    router.post(`/saving-reminders/${reminder.id}/deposit`, {}, {
      preserveScroll: true,
    });
  };

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');
  const cancelledGoals = goals.filter((g) => g.status === 'cancelled');

  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);

  return (
    <AuthenticatedLayout>
      <Head title="Target Tabungan & Menabung Konsisten" />

      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-[#1C1A27] pb-6">
        <div>
          <span className="font-label-mono text-xs uppercase text-[#8B5CF6] font-bold tracking-wider">
            FINANCIAL GOALS & SMART SAVING
          </span>
          <h1 className="text-4xl md:text-5xl font-display-xl text-[#1C1A27] uppercase tracking-tighter mb-2">
            Target Tabungan
          </h1>
          <p className="text-base md:text-lg font-body-md text-[#1C1A27] opacity-80 max-w-2xl font-bold">
            Bangun kebiasaan menabung konsisten dan capai impian finansial Anda.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <NeoButton variant="secondary" size="lg" onClick={() => openModal('reminder_create')}>
            <MaterialIcon name="alarm_on" className="text-xl" />
            + PENGINGAT MENABUNG
          </NeoButton>
          <NeoButton variant="primary" size="lg" onClick={() => openModal('create')}>
            <MaterialIcon name="add_circle" className="text-xl" />
            + BUAT TARGET
          </NeoButton>
        </div>
      </div>

      {/* Summary Stats */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <NeoCard bg="bg-[#E7DEFF]" className="p-5">
            <p className="font-label-mono text-xs uppercase text-[#454654] font-bold">Total Target</p>
            <p className="text-2xl font-number-xl text-[#1C1A27] font-bold mt-1">{formatCurrency(totalTarget)}</p>
          </NeoCard>
          <NeoCard bg="bg-[#D1FAE5]" className="p-5">
            <p className="font-label-mono text-xs uppercase text-[#454654] font-bold">Total Terkumpul</p>
            <p className="text-2xl font-number-xl text-[#166534] font-bold mt-1">{formatCurrency(totalSaved)}</p>
          </NeoCard>
          <NeoCard bg="bg-[#FEF3C7]" className="p-5">
            <p className="font-label-mono text-xs uppercase text-[#454654] font-bold">Sisa Kebutuhan</p>
            <p className="text-2xl font-number-xl text-[#92400E] font-bold mt-1">{formatCurrency(Math.max(0, totalTarget - totalSaved))}</p>
          </NeoCard>
        </div>
      )}

      {/* =========================================================
          🔥 PROGRAM MENABUNG KONSISTEN (SAVING REMINDERS SECTION)
          ========================================================= */}
      <section className="mb-12 bg-white neo-border neo-shadow p-6 md:p-8 relative overflow-hidden">
        {/* Decorative corner pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-[#1C1A27] pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#F59E0B] text-white neo-border flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#1C1A27]">
              <MaterialIcon name="alarm_on" className="text-2xl font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-headline-md text-[#1C1A27] uppercase font-black">
                  PROGRAM MENABUNG KONSISTEN
                </h2>
                <span className="bg-[#FEF08A] text-[#854D0E] font-label-mono text-[10px] font-black border border-[#1C1A27] px-2 py-0.5 uppercase hidden sm:inline-block">
                  FITUR UNGGULAN
                </span>
              </div>
              <p className="font-body-md text-xs md:text-sm text-[#454654] font-bold mt-0.5">
                Otomatiskan pengingat notifikasi live agar disiplin menabung rutin (Harian / Mingguan / Bulanan).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openModal('reminder_create')}
            className="bg-[#8B5CF6] text-white neo-border px-4 py-2.5 font-label-mono text-xs uppercase font-bold neo-shadow neo-shadow-hover neo-shadow-active flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <MaterialIcon name="add" className="text-lg font-bold" />
            TAMBAH PENGINGAT RUTIN
          </button>
        </div>

        {/* Reminders List */}
        {reminders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {reminders.map((reminder, idx) => (
              <div
                key={reminder.id}
                className={`bg-[#FDF8FF] border-4 border-[#1C1A27] p-5 neo-shadow flex flex-col justify-between gap-4 transition-all ${
                  ROTATIONS[idx % ROTATIONS.length]
                } ${!reminder.is_active ? 'opacity-70 grayscale-[30%]' : ''}`}
              >
                {/* Header Card */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-label-mono text-[11px] font-black bg-[#E7DEFF] text-[#1C1A27] border-2 border-[#1C1A27] px-2.5 py-0.5 uppercase">
                      📅 {reminder.frequency_label}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleReminder(reminder)}
                      className={`font-label-mono text-[10px] font-black px-2 py-0.5 border-2 border-[#1C1A27] uppercase cursor-pointer transition-colors ${
                        reminder.is_active
                          ? 'bg-[#DCFCE7] text-[#166534] hover:bg-[#BBF7D0]'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      title="Klik untuk ubah status aktif"
                    >
                      {reminder.is_active ? '🟢 AKTIF' : '⚪ NONAKTIF'}
                    </button>
                  </div>

                  <h3 className="text-lg font-headline-md font-bold text-[#1C1A27] truncate">
                    {reminder.title}
                  </h3>

                  {/* Target & Wallet info */}
                  <div className="mt-2 space-y-1 font-label-mono text-xs text-[#454654] font-bold">
                    <div className="flex items-center gap-1.5">
                      <MaterialIcon name="target" className="text-sm text-[#8B5CF6]" />
                      <span>Target: <strong className="text-[#1C1A27]">{reminder.goal_name}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MaterialIcon name="account_balance_wallet" className="text-sm text-[#3B4CCA]" />
                      <span>Dari: <strong className="text-[#1C1A27]">{reminder.wallet_name}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Amount and Actions */}
                <div className="pt-3 border-t-2 border-[#1C1A27]/20 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="font-label-mono text-[10px] uppercase text-[#454654] font-bold">Nominal Rutin</span>
                    <span className="font-number-xl text-2xl font-bold text-[#1C1A27]">
                      {reminder.amount_formatted}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Fast 1-Click Deposit */}
                    <button
                      type="button"
                      onClick={() => handleFastDeposit(reminder)}
                      className="flex-1 bg-[#4ADE80] text-[#1C1A27] border-2 border-[#1C1A27] py-2 px-3 font-label-mono text-xs uppercase font-black hover:bg-[#22C55E] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#1C1A27]"
                      title="Setor langsung nominal ini ke tabungan sekarang"
                    >
                      <MaterialIcon name="savings" className="text-base" />
                      NABUNG SEKARANG
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => openModal('reminder_edit', reminder)}
                      className="w-9 h-9 bg-[#E7DEFF] text-[#1C1A27] border-2 border-[#1C1A27] flex items-center justify-center hover:bg-[#8B5CF6] hover:text-white transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#1C1A27]"
                      title="Edit Pengingat"
                    >
                      <MaterialIcon name="edit" className="text-sm font-bold" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => openModal('reminder_delete', reminder)}
                      className="w-9 h-9 bg-[#FFDAD6] text-[#93000A] border-2 border-[#1C1A27] flex items-center justify-center hover:bg-[#BA1A1A] hover:text-white transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#1C1A27]"
                      title="Hapus Pengingat"
                    >
                      <MaterialIcon name="delete" className="text-sm font-bold" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#F1EBFE] border-3 border-[#1C1A27] p-6 text-center space-y-3">
            <MaterialIcon name="notifications_active" className="text-4xl text-[#8B5CF6] mx-auto" />
            <h4 className="text-lg font-headline-md font-bold text-[#1C1A27] uppercase">
              Belum Ada Jadwal Menabung Rutin
            </h4>
            <p className="font-body-md text-sm text-[#454654] font-bold max-w-lg mx-auto">
              Bangun konsistensi dengan memasang pengingat otomatis, seperti <em>"Setiap Hari Minggu nabung Rp 50.000"</em>. Sistem akan mengirim notifikasi live setiap jadwalnya tiba!
            </p>
            <button
              type="button"
              onClick={() => openModal('reminder_create')}
              className="bg-[#8B5CF6] text-white neo-border px-4 py-2 font-label-mono text-xs uppercase font-bold neo-shadow hover:bg-[#3B4CCA] cursor-pointer inline-flex items-center gap-2"
            >
              <MaterialIcon name="add" className="text-base" />
              BUAT PENGINGAT SEKARANG
            </button>
          </div>
        )}
      </section>

      {/* =========================================================
          DAFTAR TARGET TABUNGAN
          ========================================================= */}

      {/* Empty State */}
      {goals.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-[#E7DEFF] border-4 border-[#1C1A27] flex items-center justify-center mx-auto mb-6">
            <MaterialIcon name="savings" className="text-5xl text-[#8B5CF6]" />
          </div>
          <h2 className="text-3xl font-headline-md text-[#1C1A27] font-bold mb-2">Belum Ada Target</h2>
          <p className="text-lg font-body-md text-[#454654] font-bold mb-6">
            Mulai buat target tabungan pertama Anda!
          </p>
        </div>
      )}

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-headline-md text-[#1C1A27] uppercase tracking-tight mb-4 font-bold flex items-center gap-2">
            <MaterialIcon name="trending_up" className="text-[#8B5CF6]" />
            Target Aktif ({activeGoals.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeGoals.map((goal, idx) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                rotate={ROTATIONS[idx % ROTATIONS.length]}
                onDeposit={() => openModal('deposit', goal)}
                onWithdraw={() => openModal('withdraw', goal)}
                onEdit={() => openModal('edit', goal)}
                onDelete={() => openModal('delete', goal)}
              />
            ))}

            {/* Quick Add Card */}
            <article
              onClick={() => openModal('create')}
              className="bg-[#8455EF] border-4 border-[#1C1A27] neo-shadow p-6 flex flex-col justify-center items-center text-center gap-4 cursor-pointer hover:bg-[#3B4CCA] transition-colors group rotate-[-0.5deg] min-h-[300px]"
            >
              <div className="w-20 h-20 bg-[#FDF8FF] border-4 border-[#1C1A27] flex items-center justify-center group-hover:scale-110 transition-transform neo-shadow-sm">
                <MaterialIcon name="add" className="text-4xl text-[#1C1A27] font-bold" />
              </div>
              <div>
                <h3 className="text-2xl font-headline-md text-white font-bold">Target Baru</h3>
                <p className="text-sm font-body-md text-white opacity-90 font-bold mt-2">
                  Mulai rencana finansial berikutnya.
                </p>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-headline-md text-[#1C1A27] uppercase tracking-tight mb-4 font-bold flex items-center gap-2">
            <MaterialIcon name="check_circle" className="text-[#16A34A]" />
            Tercapai ({completedGoals.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {completedGoals.map((goal, idx) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                rotate={ROTATIONS[idx % ROTATIONS.length]}
                onEdit={() => openModal('edit', goal)}
                onDelete={() => openModal('delete', goal)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Cancelled Goals */}
      {cancelledGoals.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-headline-md text-[#1C1A27] uppercase tracking-tight mb-4 font-bold flex items-center gap-2">
            <MaterialIcon name="cancel" className="text-[#BA1A1A]" />
            Dibatalkan ({cancelledGoals.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {cancelledGoals.map((goal, idx) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                rotate={ROTATIONS[idx % ROTATIONS.length]}
                onEdit={() => openModal('edit', goal)}
                onDelete={() => openModal('delete', goal)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ===== MODALS ===== */}

      {/* Create Goal Modal */}
      <Modal isOpen={modal === 'create'} onClose={closeModal} title="Buat Target Baru">
        <GoalForm wallets={wallets} onClose={closeModal} />
      </Modal>

      {/* Edit Goal Modal */}
      <Modal isOpen={modal === 'edit'} onClose={closeModal} title="Edit Target">
        {activeGoal && <GoalForm wallets={wallets} goal={activeGoal} onClose={closeModal} />}
      </Modal>

      {/* Deposit Modal */}
      <Modal isOpen={modal === 'deposit'} onClose={closeModal} title="Nabung ke Target">
        {activeGoal && <DepositForm goal={activeGoal} onClose={closeModal} />}
      </Modal>

      {/* Withdraw Modal */}
      <Modal isOpen={modal === 'withdraw'} onClose={closeModal} title="Tarik Dana">
        {activeGoal && <WithdrawForm goal={activeGoal} onClose={closeModal} />}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={modal === 'delete'} onClose={closeModal} title="Hapus Target" maxWidth="max-w-md">
        {activeGoal && <DeleteConfirm goal={activeGoal} onClose={closeModal} />}
      </Modal>

      {/* Create Saving Reminder Modal */}
      <Modal isOpen={modal === 'reminder_create'} onClose={closeModal} title="Pasang Jadwal Menabung Konsisten">
        <SavingReminderForm goals={goals} wallets={wallets} onClose={closeModal} />
      </Modal>

      {/* Edit Saving Reminder Modal */}
      <Modal isOpen={modal === 'reminder_edit'} onClose={closeModal} title="Edit Jadwal Menabung">
        {activeReminder && <SavingReminderForm goals={goals} wallets={wallets} reminder={activeReminder} onClose={closeModal} />}
      </Modal>

      {/* Delete Reminder Modal */}
      <Modal isOpen={modal === 'reminder_delete'} onClose={closeModal} title="Hapus Jadwal Menabung" maxWidth="max-w-md">
        {activeReminder && <DeleteReminderConfirm reminder={activeReminder} onClose={closeModal} />}
      </Modal>
    </AuthenticatedLayout>
  );
}
