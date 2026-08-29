import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import NeoSelect from '../../Components/NeoSelect';
import NeoTextarea from '../../Components/NeoTextarea';
import NeoButton from '../../Components/NeoButton';
import MaterialIcon from '../../Components/MaterialIcon';
import CurrencyInput from '../../Components/CurrencyInput';

export default function Create({
  wallets = [],
  categories = [],
  selectedWalletId = null,
  selectedType = 'expense',
}) {
  const initialWalletId = selectedWalletId ? String(selectedWalletId) : (wallets[0]?.id ? String(wallets[0].id) : '');

  const { data, setData, post, processing, errors } = useForm({
    wallet_id: initialWalletId,
    type: selectedType || 'expense',
    amount: '',
    category_id: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/transactions');
  };

  // Filter categories dynamically by transaction type ('income' vs 'expense')
  const filteredCategories = categories.filter((cat) => cat.type === data.type);

  // Formatting wallet options for NeoSelect
  const walletOptions = wallets.map((w) => ({
    value: String(w.id),
    label: `${w.name} (${w.balance})`,
  }));

  return (
    <AuthenticatedLayout>
      <Head title="New Transaction" />

      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-display-xl uppercase tracking-tighter mb-2 font-black">
            New Transaction
          </h1>
          <p className="text-base font-body-md text-[#454654] font-bold">
            Catat arus kas pemasukan atau pengeluaran secara manual ke wallet terpilih.
          </p>
        </div>

        <Link href="/wallets">
          <button className="w-12 h-12 bg-white neo-border neo-shadow neo-shadow-hover flex items-center justify-center cursor-pointer font-bold">
            <MaterialIcon name="arrow_back" className="text-xl" />
          </button>
        </Link>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-[#F1EBFE] p-6 md:p-10 neo-border neo-shadow transform rotate-[0.5deg]"
      >
        {/* Type Toggle */}
        <div className="flex gap-4 mb-6">
          <button
            type="button"
            onClick={() => setData('type', 'income')}
            className={`flex-1 py-4 neo-border font-label-mono text-sm uppercase neo-shadow transition-all cursor-pointer flex items-center justify-center gap-2 font-bold ${
              data.type === 'income' ? 'bg-[#4ADE80] text-[#1C1A27]' : 'bg-white text-[#1C1A27] opacity-80'
            }`}
          >
            <MaterialIcon name="arrow_downward" className="text-xl" />
            Pemasukan
          </button>
          <button
            type="button"
            onClick={() => setData('type', 'expense')}
            className={`flex-1 py-4 neo-border font-label-mono text-sm uppercase neo-shadow transition-all cursor-pointer flex items-center justify-center gap-2 font-bold ${
              data.type === 'expense' ? 'bg-[#F87171] text-[#1C1A27]' : 'bg-[#FFDAD6] text-[#93000A] opacity-80'
            }`}
          >
            <MaterialIcon name="arrow_upward" className="text-xl" />
            Pengeluaran
          </button>
        </div>

        {/* Amount Input */}
        <div className="bg-white p-6 neo-border neo-shadow text-center transform rotate-[-0.5deg]">
          <label className="block font-headline-md text-xl mb-2 text-[#454654] font-bold">
            Jumlah Nominal (IDR)
          </label>
          <div className="flex items-center justify-center gap-2">
            <span className="font-number-xl text-3xl md:text-4xl text-[#3B4CCA] font-bold">Rp</span>
            <CurrencyInput
              value={data.amount}
              onChange={(raw) => setData('amount', raw)}
              placeholder="0"
              size="xl"
              required
              className="w-full text-center font-number-xl bg-transparent border-none focus:ring-0 p-0 text-[#1C1A27] font-bold"
            />
          </div>
          {errors.amount && (
            <p className="text-[#93000A] font-label-mono text-xs font-bold mt-2">
              {errors.amount}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Select Wallet (Dynamic from DB) */}
          <div className="bg-white p-4 neo-border neo-shadow">
            <label className="block font-label-mono text-xs uppercase mb-2 text-[#8B5CF6] font-bold">
              Pilih Wallet Sumber / Tujuan
            </label>
            {walletOptions.length > 0 ? (
              <NeoSelect
                value={data.wallet_id}
                onChange={(e) => setData('wallet_id', e.target.value)}
                options={walletOptions}
              />
            ) : (
              <p className="text-xs font-label-mono text-[#93000A] font-bold">
                Belum ada wallet aktif. Buat wallet terlebih dahulu!
              </p>
            )}
            {errors.wallet_id && (
              <p className="text-[#93000A] font-label-mono text-xs font-bold mt-1">
                {errors.wallet_id}
              </p>
            )}
          </div>

          {/* Date Picker */}
          <div className="bg-white p-4 neo-border neo-shadow">
            <label className="block font-label-mono text-xs uppercase mb-2 text-[#8B5CF6] font-bold">
              Tanggal Transaksi
            </label>
            <input
              type="date"
              value={data.transaction_date}
              onChange={(e) => setData('transaction_date', e.target.value)}
              required
              className="w-full neo-border p-3 font-body-md text-base bg-[#F1EBFE] focus:outline-none focus:ring-0 cursor-pointer font-bold"
            />
            {errors.transaction_date && (
              <p className="text-[#93000A] font-label-mono text-xs font-bold mt-1">
                {errors.transaction_date}
              </p>
            )}
          </div>
        </div>

        {/* Select Category (Dynamic Filtered Chips) */}
        <div className="bg-white p-6 neo-border neo-shadow">
          <label className="block font-label-mono text-xs uppercase mb-4 text-[#8B5CF6] font-bold">
            Pilih Kategori ({data.type === 'income' ? 'Pemasukan' : 'Pengeluaran'})
          </label>

          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setData('category_id', String(cat.id))}
                  className={`w-full text-center px-4 py-3 border-4 border-[#1C1A27] font-label-mono text-xs uppercase transition-colors cursor-pointer font-bold flex items-center justify-center gap-2 ${
                    String(data.category_id) === String(cat.id)
                      ? 'bg-[#8455EF] text-white neo-shadow-sm'
                      : 'bg-white text-[#1C1A27] hover:bg-[#F1EBFE]'
                  }`}
                >
                  {cat.icon && <MaterialIcon name={cat.icon} className="text-base" />}
                  {cat.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs font-label-mono text-[#454654] font-bold">
              Tidak ada kategori spesifik. Kategori opsional.
            </p>
          )}
        </div>

        {/* Description */}
        <div className="bg-white p-4 neo-border neo-shadow">
          <label className="block font-label-mono text-xs uppercase mb-2 text-[#8B5CF6] font-bold">
            Catatan / Deskripsi Transaksi
          </label>
          <NeoTextarea
            value={data.description}
            onChange={(e) => setData('description', e.target.value)}
            placeholder="Buat beli kopi sama donat / Ongkos servis AC..."
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <NeoButton
          type="submit"
          variant="primary"
          size="xl"
          disabled={processing}
          className="w-full mt-6"
        >
          <MaterialIcon name="save" className="text-2xl" />
          {processing ? 'MEMPROSES...' : 'SIMPAN TRANSAKSI'}
        </NeoButton>
      </form>
    </AuthenticatedLayout>
  );
}
