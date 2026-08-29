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

const ROTATIONS = ['rotate-[-0.5deg]', 'rotate-[0.5deg]', 'rotate-[0deg]', 'rotate-[-1deg]', 'rotate-[1deg]'];

/* ============================
   MODAL OVERLAY
   ============================ */
function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50" />
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
   CREATE / EDIT FORM
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

      {/* Wallet */}
      <div className="space-y-2">
        <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
          WALLET TERKAIT
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
          <span className="absolute left-4 text-xl font-headline-md text-[#454654] font-bold">Rp</span>
          <CurrencyInput
            value={form.data.target_amount}
            onChange={(raw) => form.setData('target_amount', raw)}
            placeholder="20.000.000"
            size="lg"
            className="w-full h-14 pl-14 pr-4 bg-white border-4 border-[#1C1A27] font-number-xl text-[#1C1A27] focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_#1C1A27]"
            required
          />
        </div>
        {form.errors.target_amount && <p className="text-[#BA1A1A] font-label-mono text-xs font-bold">{form.errors.target_amount}</p>}
      </div>

      {/* Target Date */}
      <div className="space-y-2">
        <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
          TANGGAL TARGET (OPSIONAL)
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
            onClick={() => form.setData('amount', amt)}
            className="bg-white border-4 border-[#1C1A27] px-4 py-2 font-label-mono text-xs font-bold cursor-pointer hover:bg-[#E7DEFF] transition-colors"
          >
            {formatCurrency(amt)}
          </button>
        ))}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
          CATATAN (OPSIONAL)
        </label>
        <textarea
          value={form.data.description}
          onChange={(e) => form.setData('description', e.target.value)}
          placeholder="Nabung dari gaji bulan ini..."
          rows={2}
          className="w-full px-4 py-3 bg-white border-4 border-[#1C1A27] text-base font-body-md text-[#1C1A27] focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_#1C1A27] resize-none"
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
        {form.processing ? 'MENYIMPAN...' : 'SIMPAN TABUNGAN'}
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
    form.setData('amount', goal.current_amount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Goal Info */}
      <div className="bg-[#FDE8E8] border-4 border-[#1C1A27] p-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-white border-4 border-[#1C1A27] flex items-center justify-center">
          <MaterialIcon name={goal.icon} className="text-2xl text-[#BA1A1A]" />
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
   MAIN PAGE
   ============================ */
export default function Index({ goals = [], wallets = [] }) {
  const [modal, setModal] = useState(null);       // 'create' | 'edit' | 'deposit' | 'withdraw' | 'delete'
  const [activeGoal, setActiveGoal] = useState(null);

  const openModal = (type, goal = null) => {
    setModal(type);
    setActiveGoal(goal);
  };
  const closeModal = () => {
    setModal(null);
    setActiveGoal(null);
  };

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');
  const cancelledGoals = goals.filter((g) => g.status === 'cancelled');

  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);

  return (
    <AuthenticatedLayout>
      <Head title="Target Tabungan" />

      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-[#1C1A27] pb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display-xl text-[#1C1A27] uppercase tracking-tighter mb-2">
            Target Tabungan
          </h1>
          <p className="text-lg font-body-md text-[#1C1A27] opacity-80 max-w-2xl font-bold">
            Pantau dan kelola tujuan finansial Anda. {goals.length} target terdaftar.
          </p>
        </div>
        <NeoButton variant="primary" size="lg" onClick={() => openModal('create')}>
          <MaterialIcon name="add_circle" className="text-xl" />
          BUAT TARGET BARU
        </NeoButton>
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
            Aktif ({activeGoals.length})
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
    </AuthenticatedLayout>
  );
}
