import React, { useState, useMemo } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import NeoButton from '../../Components/NeoButton';
import NeoCard from '../../Components/NeoCard';
import FilterChip from '../../Components/FilterChip';
import TransactionItem from '../../Components/TransactionItem';
import MaterialIcon from '../../Components/MaterialIcon';
import CurrencyInput from '../../Components/CurrencyInput';
import DanaSyncModal from '../../Components/DanaSyncModal';

export default function Show({
  wallet = null,
  walletId = null,
  walletName = 'Wallet',
  totalBalance = 'Rp 0',
  ownBalanceFormatted = 'Rp 0',
  linkedBalanceFormatted = 'Rp 0',
  monthlyIncome = '+Rp 0',
  monthlyExpense = '-Rp 0',
  budgetLimit = 'Rp 5.000.000',
  budgetLimitNum = 5000000,
  targetProgress = 0,
  transactionsGrouped = [],
  categories = [],
  allWallets = [],
  otherWallets = [],
}) {
  // Linked E-Wallets State (for live calculation and saving)
  const initialLinkedIds = useMemo(() => {
    return otherWallets.filter((w) => w.isLinked).map((w) => w.id);
  }, [otherWallets]);

  const [selectedLinkedIds, setSelectedLinkedIds] = useState(initialLinkedIds);
  const [showLinkPanel, setShowLinkPanel] = useState(false);
  const [isSavingLinks, setIsSavingLinks] = useState(false);
  const [showDanaSyncModal, setShowDanaSyncModal] = useState(false);

  // Live Combined Calculation
  const ownBalanceNum = wallet?.ownBalanceNum ?? 0;

  const currentSelectedEWalletsSum = useMemo(() => {
    return otherWallets
      .filter((w) => selectedLinkedIds.includes(w.id))
      .reduce((sum, w) => sum + (w.balanceNum || 0), 0);
  }, [otherWallets, selectedLinkedIds]);

  const liveTotalCombinedBalanceNum = ownBalanceNum + currentSelectedEWalletsSum;

  const liveTotalCombinedBalanceFormatted = useMemo(() => {
    return 'Rp ' + Number(liveTotalCombinedBalanceNum).toLocaleString('id-ID');
  }, [liveTotalCombinedBalanceNum]);

  const liveLinkedBalanceFormatted = useMemo(() => {
    return 'Rp ' + Number(currentSelectedEWalletsSum).toLocaleString('id-ID');
  }, [currentSelectedEWalletsSum]);

  const isPureNegative = ownBalanceNum < 0;
  const isCombinedSafe = liveTotalCombinedBalanceNum >= 0;

  // Has unsaved link changes
  const hasUnsavedLinkChanges = useMemo(() => {
    const current = [...selectedLinkedIds].sort().join(',');
    const initial = [...initialLinkedIds].sort().join(',');
    return current !== initial;
  }, [selectedLinkedIds, initialLinkedIds]);

  // Toggle Single Wallet Link
  const toggleWalletLink = (id) => {
    setSelectedLinkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select / Clear All
  const handleSelectAllEWallets = () => {
    setSelectedLinkedIds(otherWallets.map((w) => w.id));
  };

  const handleClearAllEWallets = () => {
    setSelectedLinkedIds([]);
  };

  // Save Linked Wallets to Database
  const handleSaveLinkedWallets = () => {
    setIsSavingLinks(true);
    router.post(`/wallets/${walletId}/link-wallets`, {
      linked_wallet_ids: selectedLinkedIds,
    }, {
      preserveScroll: true,
      onFinish: () => setIsSavingLinks(false),
    });
  };

  // Filter & Search States
  const [activeFilter, setActiveFilter] = useState('Semua'); // 'Semua', 'Masuk', 'Keluar'
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', '7days', 'month', 'last_month', 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date_desc'); // 'date_desc', 'date_asc', 'amount_desc', 'amount_asc', 'title_asc'

  // Modal States
  const [quickTrxType, setQuickTrxType] = useState(null); // 'income' | 'expense' | null
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);

  // Form for Creating Transaction
  const createForm = useForm({
    wallet_id: walletId,
    type: 'expense',
    amount: '',
    category_id: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
  });

  // Form for Editing Transaction
  const editForm = useForm({
    wallet_id: walletId,
    type: 'expense',
    amount: '',
    category_id: '',
    description: '',
    transaction_date: '',
  });

  // Form for Budget Limit Modal
  const budgetForm = useForm({
    limit_amount: budgetLimitNum || '',
  });

  // Open Create Modal
  const handleOpenCreateModal = (type) => {
    setQuickTrxType(type);
    const availableCategories = categories.filter((c) => c.type === type);
    createForm.setData({
      wallet_id: walletId,
      type: type,
      amount: '',
      category_id: availableCategories.length > 0 ? availableCategories[0].id : '',
      description: '',
      transaction_date: new Date().toISOString().split('T')[0],
    });
  };

  // Submit Create Transaction
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    createForm.post('/transactions', {
      onSuccess: () => {
        setQuickTrxType(null);
        createForm.reset();
      },
    });
  };

  // Open Edit Modal
  const handleOpenEditModal = (tx) => {
    setEditingTransaction(tx);
    editForm.setData({
      wallet_id: tx.wallet_id || walletId,
      type: tx.type || (tx.isIncome ? 'income' : 'expense'),
      amount: String(tx.amount_raw || ''),
      category_id: tx.category_id || '',
      description: tx.description || '',
      transaction_date: tx.transaction_date || new Date().toISOString().split('T')[0],
    });
  };

  // Submit Edit Transaction
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingTransaction) return;

    editForm.put(`/transactions/${editingTransaction.id}`, {
      onSuccess: () => {
        setEditingTransaction(null);
        editForm.reset();
      },
    });
  };

  // Confirm Delete Transaction
  const handleDeleteConfirm = () => {
    if (!deletingTransaction) return;

    router.delete(`/transactions/${deletingTransaction.id}`, {
      onSuccess: () => {
        setDeletingTransaction(null);
      },
    });
  };

  // Submit Budget Limit
  const handleBudgetSubmit = (e) => {
    e.preventDefault();
    budgetForm.post(`/wallets/${walletId}/budget`, {
      onSuccess: () => {
        setShowBudgetModal(false);
      },
    });
  };

  // Helper date calculations
  const dateRanges = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const monthPrefix = `${currentYear}-${currentMonth}`;

    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = String(prevMonthDate.getMonth() + 1).padStart(2, '0');
    const prevMonthPrefix = `${prevYear}-${prevMonth}`;

    return {
      todayStr,
      sevenDaysAgoStr,
      monthPrefix,
      prevMonthPrefix,
    };
  }, []);

  // Flatten all transactions and apply Search, Filter, Date, and Sorting
  const processedTransactions = useMemo(() => {
    const allItems = [];
    transactionsGrouped.forEach((group) => {
      group.items.forEach((item) => {
        const itemTitle = item.title || item.description || item.name || (item.isIncome ? 'Pemasukan' : 'Pengeluaran');
        const itemCategory = item.category || item.category_name || '';

        allItems.push({
          ...item,
          title: itemTitle,
          category: itemCategory,
          rawDate: item.transaction_date || '',
          groupDate: group.date,
        });
      });
    });

    // 1. Type Filter (Semua / Masuk / Keluar)
    let filtered = allItems.filter((tx) => {
      if (activeFilter === 'Masuk') return tx.isIncome;
      if (activeFilter === 'Keluar') return !tx.isIncome;
      return true;
    });

    // 2. Search Query (Title, Description, Category, Amount)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((tx) => {
        const titleMatch = (tx.title || tx.description || tx.name || '').toLowerCase().includes(q);
        const descMatch = (tx.description || '').toLowerCase().includes(q);
        const catMatch = (tx.category || tx.category_name || '').toLowerCase().includes(q);
        const amountMatch = String(tx.amount_raw || tx.amountNum || '').includes(q) || (tx.amount || '').toLowerCase().includes(q);
        return titleMatch || descMatch || catMatch || amountMatch;
      });
    }

    // 3. Date Filter
    if (dateFilter !== 'all') {
      filtered = filtered.filter((tx) => {
        if (!tx.rawDate) return true;
        if (dateFilter === 'today') {
          return tx.rawDate === dateRanges.todayStr;
        }
        if (dateFilter === '7days') {
          return tx.rawDate >= dateRanges.sevenDaysAgoStr && tx.rawDate <= dateRanges.todayStr;
        }
        if (dateFilter === 'month') {
          return tx.rawDate.startsWith(dateRanges.monthPrefix);
        }
        if (dateFilter === 'last_month') {
          return tx.rawDate.startsWith(dateRanges.prevMonthPrefix);
        }
        if (dateFilter === 'custom') {
          const afterStart = customStartDate ? tx.rawDate >= customStartDate : true;
          const beforeEnd = customEndDate ? tx.rawDate <= customEndDate : true;
          return afterStart && beforeEnd;
        }
        return true;
      });
    }

    // 4. Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date_desc') {
        const dateDiff = new Date(b.rawDate || 0) - new Date(a.rawDate || 0);
        return dateDiff !== 0 ? dateDiff : b.id - a.id;
      }
      if (sortBy === 'date_asc') {
        const dateDiff = new Date(a.rawDate || 0) - new Date(b.rawDate || 0);
        return dateDiff !== 0 ? dateDiff : a.id - b.id;
      }
      if (sortBy === 'amount_desc') {
        return (b.amount_raw || 0) - (a.amount_raw || 0);
      }
      if (sortBy === 'amount_asc') {
        return (a.amount_raw || 0) - (b.amount_raw || 0);
      }
      if (sortBy === 'title_asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });

    return filtered;
  }, [transactionsGrouped, activeFilter, searchQuery, dateFilter, customStartDate, customEndDate, sortBy, dateRanges]);

  // Group the processed transactions back by date for clean display
  const displayGroups = useMemo(() => {
    if (processedTransactions.length === 0) return [];

    // If sorting by amount or title, show in a single unified list
    if (sortBy === 'amount_desc' || sortBy === 'amount_asc' || sortBy === 'title_asc') {
      return [
        {
          date:
            sortBy === 'amount_desc'
              ? 'Urutan Nominal Terbesar'
              : sortBy === 'amount_asc'
              ? 'Urutan Nominal Terkecil'
              : 'Urutan Abjad (A-Z)',
          items: processedTransactions,
        },
      ];
    }

    // Group by formatted date
    const groupsMap = new Map();
    processedTransactions.forEach((tx) => {
      const dateKey = tx.groupDate || tx.rawDate || 'Lainnya';
      if (!groupsMap.has(dateKey)) {
        groupsMap.set(dateKey, []);
      }
      groupsMap.get(dateKey).push(tx);
    });

    return Array.from(groupsMap.entries()).map(([date, items]) => ({
      date,
      items,
    }));
  }, [processedTransactions, sortBy]);

  // Summary calculation for filtered items
  const filteredSummary = useMemo(() => {
    let incomeSum = 0;
    let expenseSum = 0;
    processedTransactions.forEach((tx) => {
      if (tx.isIncome) {
        incomeSum += tx.amount_raw || 0;
      } else {
        expenseSum += tx.amount_raw || 0;
      }
    });
    return {
      count: processedTransactions.length,
      incomeSum: 'Rp ' + Number(incomeSum).toLocaleString('id-ID'),
      expenseSum: 'Rp ' + Number(expenseSum).toLocaleString('id-ID'),
    };
  }, [processedTransactions]);

  // Check if any filter is active
  const isFilterActive =
    activeFilter !== 'Semua' ||
    searchQuery.trim() !== '' ||
    dateFilter !== 'all' ||
    customStartDate !== '' ||
    customEndDate !== '' ||
    sortBy !== 'date_desc';

  // Reset all filters
  const handleResetFilters = () => {
    setActiveFilter('Semua');
    setSearchQuery('');
    setDateFilter('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setSortBy('date_desc');
  };

  return (
    <AuthenticatedLayout>
      <Head title={`Wallet - ${walletName}`} />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          {/* Back to Wallets Square Button */}
          <Link href="/wallets">
            <button
              className="w-12 h-12 bg-white neo-border neo-shadow neo-shadow-hover neo-shadow-active flex items-center justify-center transition-all cursor-pointer"
              title="Back to Wallets"
            >
              <MaterialIcon name="arrow_back" className="text-[#1C1A27] font-bold" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl md:text-5xl font-display-xl text-[#1C1A27] uppercase break-words max-w-3xl transform rotate-[-0.5deg] inline-block bg-[#E7DEFF] px-4 py-1.5 neo-border neo-shadow font-black mt-1">
              {walletName}
            </h1>
          </div>
        </div>

        {/* Quick Transaction Shortcuts specifically for this Wallet */}
        <div className="flex flex-wrap gap-3 shrink-0 self-start md:self-end">
          <button
            type="button"
            onClick={() => handleOpenCreateModal('income')}
            className="bg-[#4ADE80] text-[#1C1A27] neo-border neo-shadow neo-shadow-hover neo-shadow-active px-4 py-3 font-label-mono text-xs uppercase font-bold flex items-center gap-2 cursor-pointer transition-all"
          >
            <MaterialIcon name="add" className="text-lg font-bold" />
            + INPUT PEMASUKAN
          </button>
          <button
            type="button"
            onClick={() => handleOpenCreateModal('expense')}
            className="bg-[#F87171] text-[#1C1A27] neo-border neo-shadow neo-shadow-hover neo-shadow-active px-4 py-3 font-label-mono text-xs uppercase font-bold flex items-center gap-2 cursor-pointer transition-all"
          >
            <MaterialIcon name="remove" className="text-lg font-bold" />
            - INPUT PENGELUARAN
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 w-full">
        {/* Main Combined Balance Card */}
        <div className={`lg:col-span-8 ${isCombinedSafe ? 'bg-[#3B4CCA]' : 'bg-[#991B1B]'} text-white neo-border neo-shadow p-6 md:p-8 transform rotate-[0.5deg] relative overflow-hidden group transition-colors`}>
          <div className="absolute -right-10 -top-10 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[200px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              account_balance_wallet
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-label-mono text-xs uppercase opacity-90 font-black tracking-wider">
                TOTAL SALDO TERSEDIA (GABUNGAN)
              </p>
              {wallet?.isDanaSynced && (
                <span className="font-label-mono text-[10px] uppercase bg-[#118EEA] text-white px-2 py-0.5 border border-white font-black flex items-center gap-1 shadow-[2px_2px_0px_0px_#000]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-ping" />
                  DANA LIVE SYNCED 🟢
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {wallet?.isDanaSynced && (
                <button
                  type="button"
                  onClick={() => setShowDanaSyncModal(true)}
                  className="bg-white text-[#118EEA] px-2.5 py-1 font-label-mono text-[11px] font-black uppercase border-2 border-black hover:bg-gray-100 cursor-pointer shadow-[2px_2px_0px_0px_#000] flex items-center gap-1"
                >
                  <MaterialIcon name="sync" className="text-xs" />
                  SINKRONKAN 🔄
                </button>
              )}

              {/* Status Anti-Minus Chip */}
              {isPureNegative && isCombinedSafe ? (
                <span className="font-label-mono text-[11px] uppercase bg-[#4ADE80] text-[#14532D] px-2.5 py-1 border-2 border-black font-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1">
                  <MaterialIcon name="verified" className="text-sm font-bold" />
                  🟢 AMAN DITOPANG E-WALLET (HASIL TIDAK MINUS)
                </span>
              ) : selectedLinkedIds.length > 0 ? (
                <span className="font-label-mono text-[11px] uppercase bg-[#FEF08A] text-[#854D0E] px-2.5 py-1 border-2 border-black font-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1">
                  <MaterialIcon name="hub" className="text-sm font-bold" />
                  ⚡ SALDO GABUNGAN ({selectedLinkedIds.length + 1} WALLET)
                </span>
              ) : isPureNegative ? (
                <span className="font-label-mono text-[11px] uppercase bg-[#FCA5A5] text-[#7F1D1D] px-2.5 py-1 border-2 border-black font-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1">
                  <MaterialIcon name="warning" className="text-sm font-bold" />
                  ⚠️ SALDO MINUS: GABUNGKAN E-WALLET DI BAWAH
                </span>
              ) : null}
            </div>
          </div>

          <h2 className="text-4xl md:text-6xl font-number-xl font-bold tracking-tight mb-6">
            {liveTotalCombinedBalanceFormatted}
          </h2>

          {/* Sub-Balance Breakdown Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Saldo Asli */}
            <div className={`p-3 neo-border neo-shadow ${isPureNegative ? 'bg-[#FFDAD6] text-[#93000A]' : 'bg-[#FDF8FF] text-[#1C1A27]'}`}>
              <p className="font-label-mono text-[10px] uppercase font-bold opacity-80 mb-0.5">Saldo Murni Wallet</p>
              <p className="font-number-xl text-sm md:text-base font-bold">
                {wallet?.ownBalance || 'Rp 0'}
              </p>
            </div>

            {/* Topangan E-Wallet */}
            <div className="bg-[#FEF08A] text-[#854D0E] p-3 neo-border neo-shadow">
              <p className="font-label-mono text-[10px] uppercase font-bold opacity-80 mb-0.5">
                Topangan ({selectedLinkedIds.length} E-Wallet)
              </p>
              <p className="font-number-xl text-sm md:text-base font-black">
                +{liveLinkedBalanceFormatted}
              </p>
            </div>

            {/* Pemasukan */}
            <div className="bg-[#FDF8FF] text-[#1C1A27] p-3 neo-border neo-shadow">
              <p className="font-label-mono text-[10px] text-[#454654] uppercase font-bold mb-0.5">Pemasukan (Bulan Ini)</p>
              <p className="font-headline-md text-sm md:text-base font-bold text-[#16A34A]">{monthlyIncome}</p>
            </div>

            {/* Pengeluaran */}
            <div className="bg-[#FDF8FF] text-[#1C1A27] p-3 neo-border neo-shadow">
              <p className="font-label-mono text-[10px] text-[#454654] uppercase font-bold mb-0.5">Pengeluaran (Bulan Ini)</p>
              <p className="font-headline-md text-sm md:text-base font-bold text-[#BA1A1A]">{monthlyExpense}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions / Mini Stats */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Dynamic Budget Limit Card */}
          <div className="bg-[#8B5CF6] text-white neo-border neo-shadow p-6 transform rotate-[-1deg] flex-1 flex flex-col justify-center relative">
            <div className="flex justify-between items-center mb-1">
              <p className="font-label-mono text-xs uppercase font-bold">Batas Budget Bulanan</p>
              <button
                type="button"
                onClick={() => setShowBudgetModal(true)}
                className="text-[10px] font-label-mono bg-white text-[#1C1A27] px-2 py-0.5 border border-[#1C1A27] font-bold hover:bg-[#F1EBFE] transition-colors cursor-pointer"
                title="Atur Limit Budget"
              >
                EDIT LIMIT ⚙️
              </button>
            </div>
            <p className="text-xs font-body-md text-white/90 mb-2 font-bold">
              Limit: <span className="text-[#A7F3D0]">{budgetLimit}</span>
            </p>
            <div className="w-full bg-[#F1EBFE] h-8 neo-border mb-2 relative overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full border-r-4 border-[#1C1A27] transition-all ${
                  targetProgress > 90 ? 'bg-[#F87171]' : 'bg-[#4ADE80]'
                }`}
                style={{ width: `${targetProgress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs font-label-mono font-bold">
              <span>{monthlyExpense} Terpakai</span>
              <span>{targetProgress}%</span>
            </div>
          </div>

          {/* Dynamic Reports Link */}
          <Link href={`/reports?wallet_id=${walletId}`} className="flex-1">
            <div className="bg-[#E5E0F3] text-[#1C1A27] neo-border neo-shadow p-6 h-full flex items-center justify-between group cursor-pointer hover:bg-[#E9DDFF] transition-colors">
              <div>
                <p className="font-label-mono text-xs uppercase font-bold">Laporan Detail Wallet</p>
                <p className="font-body-md text-sm text-[#454654] mt-1 font-bold">Analisis Keuangan & Export PDF / CSV</p>
              </div>
              <MaterialIcon name="arrow_forward" className="text-3xl group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          ⚡ PANEL INTERAKTIF: GABUNGKAN SALDO DENGAN E-WALLET LAIN (ANTI-MINUS)
          ========================================================================= */}
      {otherWallets.length > 0 && (
        <section className="mb-8 bg-[#FEF08A] border-4 border-[#1C1A27] neo-shadow p-6 md:p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b-4 border-[#1C1A27] pb-4 mb-6">
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <div className="w-12 h-12 bg-[#1C1A27] text-white flex items-center justify-center border-2 border-black shrink-0">
                <MaterialIcon name="hub" className="text-2xl font-bold" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-headline-md font-black text-[#1C1A27] uppercase">
                  GABUNGKAN DENGAN E-WALLET LAIN (ANTI-MINUS)
                </h3>
                <p className="font-body-md text-xs text-[#454654] font-bold">
                  Centang e-wallet di bawah ini agar saldonya otomatis digabungkan ke <strong>{walletName}</strong> sehingga hasil akhirnya tidak minus dan dana total langsung siap pakai.
                </p>
              </div>
            </div>

            {/* Action Buttons di Ujung Kanan */}
            <div className="flex flex-wrap items-center justify-start lg:justify-end gap-2 shrink-0 lg:ml-auto w-full lg:w-auto">
              <button
                type="button"
                onClick={handleSelectAllEWallets}
                className="bg-white text-[#1C1A27] px-3 py-1.5 font-label-mono text-xs font-black uppercase border-2 border-[#1C1A27] hover:bg-gray-100 cursor-pointer shadow-[2px_2px_0px_0px_#1C1A27] transition-transform active:translate-y-0.5"
              >
                PILIH SEMUA
              </button>
              <button
                type="button"
                onClick={handleClearAllEWallets}
                className="bg-white text-[#1C1A27] px-3 py-1.5 font-label-mono text-xs font-black uppercase border-2 border-[#1C1A27] hover:bg-gray-100 cursor-pointer shadow-[2px_2px_0px_0px_#1C1A27] transition-transform active:translate-y-0.5"
              >
                LEPASKAN SEMUA
              </button>
              <button
                type="button"
                onClick={handleSaveLinkedWallets}
                disabled={isSavingLinks}
                className={`px-4 py-2 font-label-mono text-xs font-black uppercase border-2 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] flex items-center gap-1.5 cursor-pointer transition-all active:translate-y-0.5 ${
                  hasUnsavedLinkChanges
                    ? 'bg-[#4ADE80] text-[#14532D] hover:bg-[#22C55E] animate-pulse'
                    : 'bg-[#1C1A27] text-white hover:bg-[#3B4CCA]'
                }`}
              >
                <MaterialIcon name="save" className="text-base font-bold" />
                {isSavingLinks ? 'MENYIMPAN...' : hasUnsavedLinkChanges ? 'SIMPAN PERUBAHAN GABUNGAN 💾' : 'PENGGABUNGAN TERSIMPAN ✓'}
              </button>
            </div>
          </div>

          {/* List of Other E-Wallets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {otherWallets.map((ow) => {
              const isChecked = selectedLinkedIds.includes(ow.id);
              return (
                <div
                  key={ow.id}
                  onClick={() => toggleWalletLink(ow.id)}
                  className={`border-4 border-[#1C1A27] p-4 cursor-pointer transition-all neo-shadow select-none ${
                    isChecked
                      ? 'bg-[#DCFCE7] shadow-[4px_4px_0px_0px_#1C1A27] transform -translate-y-1'
                      : 'bg-white hover:bg-gray-50 opacity-90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 border-2 border-[#1C1A27] flex items-center justify-center text-sm font-bold shrink-0"
                        style={{ backgroundColor: ow.color_hex || '#C4B5FD' }}
                      >
                        <MaterialIcon name={ow.icon} className="text-base text-[#1C1A27]" />
                      </div>
                      <div>
                        <span className="font-headline-md font-bold text-sm text-[#1C1A27] uppercase truncate max-w-[130px] block" title={ow.name}>
                          {ow.name}
                        </span>
                        {ow.isDanaSynced && (
                          <span className="text-[9px] font-label-mono text-[#0369A1] font-black uppercase flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-ping" />
                            DANA LIVE
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Checkbox Icon */}
                    <div
                      className={`w-6 h-6 border-2 border-[#1C1A27] flex items-center justify-center font-bold text-xs ${
                        isChecked ? 'bg-[#16A34A] text-white' : 'bg-white'
                      }`}
                    >
                      {isChecked && '✓'}
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t-2 border-[#1C1A27]/20 flex justify-between items-center">
                    <span className="font-label-mono text-[10px] text-[#454654] uppercase font-bold">Saldo:</span>
                    <strong className="font-number-xl text-sm font-bold text-[#1C1A27]">{ow.balance}</strong>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Footer */}
          <div className="mt-4 pt-4 border-t-2 border-[#1C1A27]/20 flex flex-wrap justify-between items-center text-xs font-label-mono font-bold text-[#454654]">
            <span>
              Terpilih: <strong>{selectedLinkedIds.length} E-Wallet</strong> • Total Dana Tambahan: <strong>+{liveLinkedBalanceFormatted}</strong>
            </span>
            <span className="text-[#1C1A27]">
              Total Saldo Bersih Gabungan: <strong>{liveTotalCombinedBalanceFormatted}</strong>
            </span>
          </div>
        </section>
      )}

      {/* ADVANCED SEARCH, FILTER & SORT CONTROLS BAR */}
      <div className="bg-white neo-border neo-shadow p-5 mb-6 space-y-4">
        {/* Top Row: Search Input & Type Filter Chips */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <MaterialIcon
              name="search"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1C1A27] font-bold text-xl pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="CARI TRANSAKSI (CATATAN, KATEGORI, NOMINAL)..."
              className="w-full neo-border py-2.5 pl-11 pr-10 font-label-mono text-xs uppercase font-bold bg-[#FDF8FF] text-[#1C1A27] placeholder:text-[#888] focus:outline-none focus:bg-white transition-all shadow-[2px_2px_0px_0px_#1C1A27]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#FFDAD6] text-[#93000A] border border-[#1C1A27] flex items-center justify-center font-bold text-xs cursor-pointer hover:bg-[#BA1A1A] hover:text-white transition-colors"
                title="Hapus Pencarian"
              >
                ✕
              </button>
            )}
          </div>

          {/* Type Filter Chips (Semua / Masuk / Keluar) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            {['Semua', 'Masuk', 'Keluar'].map((filter) => (
              <FilterChip
                key={filter}
                label={filter}
                active={activeFilter === filter}
                onClick={() => setActiveFilter(filter)}
              />
            ))}
          </div>
        </div>

        {/* Second Row: Date Filter & Sorting Options */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-3 border-t-2 border-[#1C1A27]/20">
          {/* Date Filter Dropdown & Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-label-mono text-xs uppercase font-bold text-[#454654] flex items-center gap-1">
              <MaterialIcon name="calendar_today" className="text-sm" />
              Periode:
            </span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="neo-border px-3 py-1.5 font-label-mono text-xs uppercase font-bold bg-white text-[#1C1A27] cursor-pointer focus:outline-none shadow-[2px_2px_0px_0px_#1C1A27]"
            >
              <option value="all">SEMUA TANGGAL</option>
              <option value="today">HARI INI</option>
              <option value="7days">7 HARI TERAKHIR</option>
              <option value="month">BULAN INI</option>
              <option value="last_month">BULAN LALU</option>
              <option value="custom">KUSTOM TANGGAL 📅</option>
            </select>

            {/* Custom Date Pickers */}
            {dateFilter === 'custom' && (
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="neo-border px-2.5 py-1 font-label-mono text-xs font-bold bg-white cursor-pointer shadow-[2px_2px_0px_0px_#1C1A27]"
                  title="Tanggal Mulai"
                />
                <span className="font-bold text-xs">s/d</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="neo-border px-2.5 py-1 font-label-mono text-xs font-bold bg-white cursor-pointer shadow-[2px_2px_0px_0px_#1C1A27]"
                  title="Tanggal Akhir"
                />
              </div>
            )}
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="font-label-mono text-xs uppercase font-bold text-[#454654] flex items-center gap-1">
              <MaterialIcon name="sort" className="text-sm" />
              Urutkan:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="neo-border px-3 py-1.5 font-label-mono text-xs uppercase font-bold bg-[#F1EBFE] text-[#1C1A27] cursor-pointer focus:outline-none shadow-[2px_2px_0px_0px_#1C1A27]"
            >
              <option value="date_desc">📅 TERBARU (TANGGAL)</option>
              <option value="date_asc">📅 TERLAMA (TANGGAL)</option>
              <option value="amount_desc">💰 NOMINAL TERBESAR</option>
              <option value="amount_asc">📉 NOMINAL TERKECIL</option>
              <option value="title_asc">🔤 CATATAN (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Results Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-[#1C1A27]/20 text-xs font-label-mono font-bold">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#E7DEFF] border-2 border-[#1C1A27] px-2.5 py-1 uppercase text-[#1C1A27]">
              📊 Ditemukan: {filteredSummary.count} Transaksi
            </span>
            {activeFilter !== 'Keluar' && (
              <span className="bg-[#DCFCE7] text-[#166534] border-2 border-[#1C1A27] px-2.5 py-1">
                Masuk: +{filteredSummary.incomeSum}
              </span>
            )}
            {activeFilter !== 'Masuk' && (
              <span className="bg-[#FEE2E2] text-[#991B1B] border-2 border-[#1C1A27] px-2.5 py-1">
                Keluar: -{filteredSummary.expenseSum}
              </span>
            )}
          </div>

          {isFilterActive && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="bg-[#FFDAD6] text-[#93000A] neo-border px-3 py-1 text-xs uppercase font-black hover:bg-[#BA1A1A] hover:text-white transition-all cursor-pointer shadow-[2px_2px_0px_0px_#1C1A27] flex items-center gap-1"
            >
              <MaterialIcon name="refresh" className="text-sm" />
              RESET FILTER
            </button>
          )}
        </div>
      </div>

      {/* Mutasi List Section */}
      <div className="flex flex-col gap-6 w-full">
        {displayGroups.length > 0 ? (
          displayGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-3">
              <h3 className="text-sm md:text-base font-headline-md text-[#1C1A27] bg-[#F1EBFE] inline-block px-4 py-1 neo-border neo-shadow transform rotate-[0.5deg] font-bold uppercase">
                {group.date}
              </h3>
              <div className="flex flex-col gap-3">
                {group.items.map((tx) => (
                  <TransactionItem
                    key={tx.id}
                    title={tx.title || tx.description || tx.name || (tx.isIncome ? 'Pemasukan' : 'Pengeluaran')}
                    category={tx.category || tx.category_name}
                    subtitle={tx.subtitle || tx.transaction_date}
                    amount={tx.amount}
                    isIncome={tx.isIncome}
                    icon={tx.icon}
                    iconBg={tx.iconBg}
                    onClick={() => handleOpenEditModal(tx)}
                    onEdit={() => handleOpenEditModal(tx)}
                    onDelete={() => setDeletingTransaction(tx)}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white neo-border neo-shadow p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-[#F1EBFE] neo-border mx-auto flex items-center justify-center">
              <MaterialIcon name="search_off" className="text-3xl text-[#454654]" />
            </div>
            <h4 className="text-xl font-headline-md font-bold text-[#1C1A27] uppercase">
              Tidak Ada Transaksi Yang Sesuai
            </h4>
            <p className="text-sm font-body-md text-[#454654] font-bold max-w-md mx-auto">
              Tidak ditemukan data transaksi yang sesuai dengan kriteria pencarian atau filter yang dipilih.
            </p>
            {isFilterActive && (
              <NeoButton variant="primary" size="sm" onClick={handleResetFilters}>
                RESET SEMUA FILTER
              </NeoButton>
            )}
          </div>
        )}
      </div>

      {/* CREATE TRANSACTION MODAL */}
      {quickTrxType && (
        <div className="fixed inset-0 z-50 bg-[#1C1A27]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <NeoCard
            bg={quickTrxType === 'income' ? 'bg-[#A7F3D0]' : 'bg-[#FFDAD6]'}
            className="w-full max-w-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b-4 border-[#1C1A27] pb-4">
              <div>
                <span className="font-label-mono text-xs uppercase text-[#454654] font-bold">
                  TRANSAKSI BARU: {walletName}
                </span>
                <h3 className="text-2xl font-display-xl font-bold uppercase text-[#1C1A27]">
                  {quickTrxType === 'income' ? '+ INPUT PEMASUKAN' : '- INPUT PENGELUARAN'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickTrxType(null)}
                className="w-10 h-10 neo-border bg-white flex items-center justify-center hover:bg-white/80 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Type Switcher inside Modal */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setQuickTrxType('income');
                    createForm.setData('type', 'income');
                  }}
                  className={`flex-1 py-2 font-label-mono text-xs uppercase font-bold neo-border cursor-pointer transition-all ${
                    quickTrxType === 'income' ? 'bg-[#4ADE80] text-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27]' : 'bg-white text-gray-500'
                  }`}
                >
                  + PEMASUKAN
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuickTrxType('expense');
                    createForm.setData('type', 'expense');
                  }}
                  className={`flex-1 py-2 font-label-mono text-xs uppercase font-bold neo-border cursor-pointer transition-all ${
                    quickTrxType === 'expense' ? 'bg-[#F87171] text-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27]' : 'bg-white text-gray-500'
                  }`}
                >
                  - PENGELUARAN
                </button>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
                  NOMINAL TRANSAKSI (IDR)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-2xl font-number-xl font-bold text-[#454654]">Rp</span>
                  <CurrencyInput
                    value={createForm.data.amount}
                    onChange={(raw) => createForm.setData('amount', raw)}
                    placeholder="0"
                    size="lg"
                    required
                    className="w-full neo-border py-4 pl-16 pr-4 bg-white font-number-xl text-[#1C1A27] font-bold"
                  />
                </div>
                {createForm.errors.amount && (
                  <p className="font-label-mono text-xs text-[#BA1A1A] font-bold mt-1">
                    {createForm.errors.amount}
                  </p>
                )}
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
                  KATEGORI
                </label>
                <select
                  value={createForm.data.category_id}
                  onChange={(e) => createForm.setData('category_id', e.target.value)}
                  className="w-full neo-border p-3 font-body-md bg-white text-[#1C1A27] font-bold cursor-pointer uppercase"
                >
                  <option value="">-- PILIH KATEGORI --</option>
                  {categories
                    .filter((c) => c.type === quickTrxType)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
                {createForm.errors.category_id && (
                  <p className="font-label-mono text-xs text-[#BA1A1A] font-bold mt-1">
                    {createForm.errors.category_id}
                  </p>
                )}
              </div>

              {/* Description Input */}
              <div>
                <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
                  CATATAN / KETERANGAN
                </label>
                <input
                  type="text"
                  value={createForm.data.description}
                  onChange={(e) => createForm.setData('description', e.target.value)}
                  placeholder="Misal: Makan Siang / Servis Laptop / Gaji"
                  className="w-full neo-border p-3 font-body-md bg-white text-[#1C1A27] font-bold"
                />
                {createForm.errors.description && (
                  <p className="font-label-mono text-xs text-[#BA1A1A] font-bold mt-1">
                    {createForm.errors.description}
                  </p>
                )}
              </div>

              {/* Transaction Date Input */}
              <div>
                <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
                  TANGGAL TRANSAKSI
                </label>
                <input
                  type="date"
                  value={createForm.data.transaction_date}
                  onChange={(e) => createForm.setData('transaction_date', e.target.value)}
                  required
                  className="w-full neo-border p-3 font-body-md bg-white text-[#1C1A27] font-bold cursor-pointer"
                />
                {createForm.errors.transaction_date && (
                  <p className="font-label-mono text-xs text-[#BA1A1A] font-bold mt-1">
                    {createForm.errors.transaction_date}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t-4 border-[#1C1A27]">
                <NeoButton
                  variant="outline"
                  size="md"
                  onClick={() => setQuickTrxType(null)}
                >
                  BATAL
                </NeoButton>
                <NeoButton
                  type="submit"
                  variant={quickTrxType === 'income' ? 'primary' : 'danger'}
                  size="md"
                  disabled={createForm.processing}
                >
                  {createForm.processing ? 'SIMPAN...' : 'SIMPAN TRANSAKSI'}
                </NeoButton>
              </div>
            </form>
          </NeoCard>
        </div>
      )}

      {/* EDIT TRANSACTION MODAL */}
      {editingTransaction && (
        <div className="fixed inset-0 z-50 bg-[#1C1A27]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <NeoCard
            bg={editForm.data.type === 'income' ? 'bg-[#A7F3D0]' : 'bg-[#FFDAD6]'}
            className="w-full max-w-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b-4 border-[#1C1A27] pb-4">
              <div>
                <span className="font-label-mono text-xs uppercase text-[#454654] font-bold">
                  EDIT TRANSAKSI #{editingTransaction.id}
                </span>
                <h3 className="text-2xl font-display-xl font-bold uppercase text-[#1C1A27]">
                  PERBARUI TRANSAKSI
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingTransaction(null)}
                className="w-10 h-10 neo-border bg-white flex items-center justify-center hover:bg-white/80 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Type Switcher */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => editForm.setData('type', 'income')}
                  className={`flex-1 py-2 font-label-mono text-xs uppercase font-bold neo-border cursor-pointer transition-all ${
                    editForm.data.type === 'income' ? 'bg-[#4ADE80] text-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27]' : 'bg-white text-gray-500'
                  }`}
                >
                  + PEMASUKAN
                </button>
                <button
                  type="button"
                  onClick={() => editForm.setData('type', 'expense')}
                  className={`flex-1 py-2 font-label-mono text-xs uppercase font-bold neo-border cursor-pointer transition-all ${
                    editForm.data.type === 'expense' ? 'bg-[#F87171] text-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27]' : 'bg-white text-gray-500'
                  }`}
                >
                  - PENGELUARAN
                </button>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
                  NOMINAL TRANSAKSI (IDR)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-2xl font-number-xl font-bold text-[#454654]">Rp</span>
                  <CurrencyInput
                    value={editForm.data.amount}
                    onChange={(raw) => editForm.setData('amount', raw)}
                    placeholder="0"
                    size="lg"
                    required
                    className="w-full neo-border py-4 pl-16 pr-4 bg-white font-number-xl text-[#1C1A27] font-bold"
                  />
                </div>
                {editForm.errors.amount && (
                  <p className="font-label-mono text-xs text-[#BA1A1A] font-bold mt-1">
                    {editForm.errors.amount}
                  </p>
                )}
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
                  KATEGORI
                </label>
                <select
                  value={editForm.data.category_id}
                  onChange={(e) => editForm.setData('category_id', e.target.value)}
                  className="w-full neo-border p-3 font-body-md bg-white text-[#1C1A27] font-bold cursor-pointer uppercase"
                >
                  <option value="">-- PILIH KATEGORI --</option>
                  {categories
                    .filter((c) => c.type === editForm.data.type)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
                {editForm.errors.category_id && (
                  <p className="font-label-mono text-xs text-[#BA1A1A] font-bold mt-1">
                    {editForm.errors.category_id}
                  </p>
                )}
              </div>

              {/* Description Input */}
              <div>
                <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
                  CATATAN / KETERANGAN
                </label>
                <input
                  type="text"
                  value={editForm.data.description}
                  onChange={(e) => editForm.setData('description', e.target.value)}
                  placeholder="Misal: Makan Siang / Servis Laptop / Gaji"
                  className="w-full neo-border p-3 font-body-md bg-white text-[#1C1A27] font-bold"
                />
                {editForm.errors.description && (
                  <p className="font-label-mono text-xs text-[#BA1A1A] font-bold mt-1">
                    {editForm.errors.description}
                  </p>
                )}
              </div>

              {/* Transaction Date Input */}
              <div>
                <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
                  TANGGAL TRANSAKSI
                </label>
                <input
                  type="date"
                  value={editForm.data.transaction_date}
                  onChange={(e) => editForm.setData('transaction_date', e.target.value)}
                  required
                  className="w-full neo-border p-3 font-body-md bg-white text-[#1C1A27] font-bold cursor-pointer"
                />
                {editForm.errors.transaction_date && (
                  <p className="font-label-mono text-xs text-[#BA1A1A] font-bold mt-1">
                    {editForm.errors.transaction_date}
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center gap-3 pt-4 border-t-4 border-[#1C1A27]">
                <button
                  type="button"
                  onClick={() => {
                    const txToDelete = editingTransaction;
                    setEditingTransaction(null);
                    setDeletingTransaction(txToDelete);
                  }}
                  className="bg-[#FFDAD6] text-[#93000A] neo-border px-3 py-2 font-label-mono text-xs uppercase font-bold hover:bg-[#BA1A1A] hover:text-white transition-colors cursor-pointer flex items-center gap-1 shadow-[2px_2px_0px_0px_#1C1A27]"
                >
                  <MaterialIcon name="delete" className="text-base" />
                  HAPUS
                </button>
                <div className="flex gap-2">
                  <NeoButton
                    variant="outline"
                    size="md"
                    onClick={() => setEditingTransaction(null)}
                  >
                    BATAL
                  </NeoButton>
                  <NeoButton
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={editForm.processing}
                  >
                    {editForm.processing ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
                  </NeoButton>
                </div>
              </div>
            </form>
          </NeoCard>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingTransaction && (
        <div className="fixed inset-0 z-50 bg-[#1C1A27]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <NeoCard bg="bg-[#FFDAD6]" className="w-full max-w-lg p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b-4 border-[#1C1A27] pb-4">
              <div className="w-12 h-12 bg-[#BA1A1A] text-white neo-border flex items-center justify-center shrink-0">
                <MaterialIcon name="warning" className="text-2xl font-bold" />
              </div>
              <div>
                <span className="font-label-mono text-xs uppercase text-[#93000A] font-black">
                  KONFIRMASI HAPUS
                </span>
                <h3 className="text-xl font-display-xl font-bold uppercase text-[#1C1A27]">
                  HAPUS TRANSAKSI?
                </h3>
              </div>
            </div>

            <div className="bg-white neo-border p-4 space-y-2">
              <p className="font-body-md text-sm text-[#1C1A27] font-bold">
                Apakah Anda yakin ingin menghapus transaksi ini?
              </p>
              <div className="font-label-mono text-xs bg-[#FDF8FF] p-2.5 neo-border space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#454654]">Judul:</span>
                  <span className="font-bold text-[#1C1A27]">{deletingTransaction.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#454654]">Nominal:</span>
                  <span className={`font-bold ${deletingTransaction.isIncome ? 'text-green-700' : 'text-[#BA1A1A]'}`}>
                    {deletingTransaction.isIncome ? '+' : '-'}{deletingTransaction.amount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#454654]">Tanggal:</span>
                  <span className="font-bold text-[#1C1A27]">{deletingTransaction.subtitle || deletingTransaction.transaction_date}</span>
                </div>
              </div>
              <p className="font-label-mono text-[11px] text-[#93000A] font-bold">
                *Saldo wallet akan otomatis disesuaikan kembali setelah dihapus.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t-4 border-[#1C1A27]">
              <NeoButton
                variant="outline"
                size="md"
                onClick={() => setDeletingTransaction(null)}
              >
                BATAL
              </NeoButton>
              <NeoButton
                variant="danger"
                size="md"
                onClick={handleDeleteConfirm}
              >
                YA, HAPUS SEKARANG
              </NeoButton>
            </div>
          </NeoCard>
        </div>
      )}

      {/* EDIT BUDGET LIMIT MODAL */}
      {showBudgetModal && (
        <div className="fixed inset-0 z-50 bg-[#1C1A27]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <NeoCard bg="bg-[#F1EBFE]" className="w-full max-w-lg p-8 space-y-6">
            <div className="flex justify-between items-center border-b-4 border-[#1C1A27] pb-4">
              <div>
                <span className="font-label-mono text-xs uppercase text-[#454654] font-bold">
                  {walletName}
                </span>
                <h3 className="text-2xl font-display-xl font-bold uppercase text-[#1C1A27]">
                  ATUR BATAS BUDGET
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBudgetModal(false)}
                className="w-10 h-10 neo-border bg-white flex items-center justify-center hover:bg-[#FFDAD6] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBudgetSubmit} className="space-y-4">
              <div>
                <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
                  BATAS MAKSIMAL PENGELUARAN BULANAN (IDR)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-2xl font-number-xl font-bold text-[#454654]">Rp</span>
                  <CurrencyInput
                    value={budgetForm.data.limit_amount}
                    onChange={(raw) => budgetForm.setData('limit_amount', raw)}
                    placeholder="5.000.000"
                    size="lg"
                    required
                    className="w-full neo-border py-4 pl-16 pr-4 bg-white font-number-xl text-[#1C1A27] font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t-4 border-[#1C1A27]">
                <NeoButton
                  variant="outline"
                  size="md"
                  onClick={() => setShowBudgetModal(false)}
                >
                  BATAL
                </NeoButton>
                <NeoButton
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={budgetForm.processing}
                >
                  {budgetForm.processing ? 'SIMPAN...' : 'SIMPAN BUDGET'}
                </NeoButton>
              </div>
            </form>
          </NeoCard>
        </div>
      )}

      {/* DANA Sync Modal */}
      <DanaSyncModal
        isOpen={showDanaSyncModal}
        onClose={() => setShowDanaSyncModal(false)}
        wallet={wallet}
      />
    </AuthenticatedLayout>
  );
}
