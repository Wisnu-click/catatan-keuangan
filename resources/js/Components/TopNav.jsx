import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import axios from 'axios';
import MaterialIcon from './MaterialIcon';

export default function TopNav({ pageTitle = '', onMenuToggle = () => {} }) {
  const { auth, notifications: initialNotifications } = usePage().props;
  const user = auth?.user || {};
  
  // Profile Dropdown state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef(null);

  // Notifications State
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(initialNotifications?.unread_count || 0);

  // Search State & Refs
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'WALLETS', 'TRANSACTIONS', 'GOALS'
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState({
    wallets: [],
    transactions: [],
    goals: [],
    total_count: 0,
  });
  
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unread_count);
    } catch (error) {
      console.error("Gagal mengambil notifikasi:", error);
    }
  };

  // Setup Polling and Initialize
  useEffect(() => {
    if (user.id) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [user.id]);

  const handleMarkAsRead = async (id, link) => {
    try {
      await axios.put(`/notifications/${id}/read`);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setShowNotifications(false);
      if (link) {
        router.visit(link);
      }
    } catch (error) {
      console.error("Gagal menandai notifikasi:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Gagal menandai semua:", error);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced search query fetch
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults({ wallets: [], transactions: [], goals: [], total_count: 0 });
      setShowSearchResults(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    const timer = setTimeout(() => {
      fetch(`/search/query?q=${encodeURIComponent(query.trim())}`)
        .then((res) => res.json())
        .then((data) => {
          setSearchResults(data);
          setIsSearching(false);
        })
        .catch(() => {
          setIsSearching(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const defaultAvatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(user.name || 'User');
  const userAvatar = user.avatar_url || defaultAvatar;

  const handleClearQuery = () => {
    setQuery('');
    setShowSearchResults(false);
  };

  const handleAskAi = () => {
    setShowSearchResults(false);
    router.get(`/chat`);
  };

  // Filtered search count based on active tab
  const filteredWallets = activeTab === 'ALL' || activeTab === 'WALLETS' ? searchResults.wallets : [];
  const filteredTransactions = activeTab === 'ALL' || activeTab === 'TRANSACTIONS' ? searchResults.transactions : [];
  const filteredGoals = activeTab === 'ALL' || activeTab === 'GOALS' ? searchResults.goals : [];

  return (
    <header className="w-full bg-[#FDF8FF] border-b-4 border-[#1C1A27] neo-shadow sticky top-0 z-40 px-3 sm:px-4 md:px-8 py-3.5 flex justify-between items-center gap-2 relative">
      {/* Mobile Brand Logo & Name */}
      <div className="flex items-center gap-2 md:hidden shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#3B4CCA] text-white border-2 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] flex items-center justify-center font-black text-lg">
            V
          </div>
          <div>
            <h1 className="text-xl font-headline-md font-black text-[#1C1A27] tracking-tight uppercase leading-none">
              VIRA
            </h1>
            <p className="font-label-mono text-[8px] text-[#454654] font-bold tracking-widest uppercase">
              CATAT KEUANGAN
            </p>
          </div>
        </Link>
      </div>

      {/* DESKTOP SEARCH CONTAINER */}
      <div className="hidden md:flex flex-1 max-w-xl relative" ref={searchContainerRef}>
        <div className="w-full neo-border bg-white flex items-center px-4 py-2.5 neo-shadow-hover neo-shadow-active transition-all cursor-text" onClick={() => searchInputRef.current?.focus()}>
          <MaterialIcon name="search" className="text-[#1C1A27] text-xl font-bold shrink-0 mr-3 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim() && setShowSearchResults(true)}
            className="w-full bg-transparent border-none p-0 font-label-mono text-xs uppercase focus:outline-none focus:ring-0 placeholder:text-[#454654]/60 font-bold text-[#1C1A27]"
            placeholder="CARI TRANSAKSI, WALLET, ATAU TARGET TABUNGAN..."
          />

          {/* Clear Input Button */}
          {query && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClearQuery();
              }}
              className="w-5 h-5 bg-[#FFDAD6] text-[#93000A] border border-[#1C1A27] flex items-center justify-center font-bold text-[10px] hover:bg-[#BA1A1A] hover:text-white transition-colors shrink-0 ml-2 cursor-pointer"
              title="Hapus pencarian"
            >
              ✕
            </button>
          )}
        </div>

        {/* SEARCH RESULTS DROPDOWN OVERLAY (DESKTOP) */}
        {showSearchResults && (
          <div className="absolute left-0 right-0 top-14 bg-white border-4 border-[#1C1A27] neo-shadow z-50 p-4 space-y-4 max-h-[520px] overflow-y-auto transform rotate-[0.3deg]">
            
            {/* Header Tabs Filter */}
            <div className="flex items-center justify-between border-b-3 border-[#1C1A27] pb-3 gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { key: 'ALL', label: `SEMUA (${searchResults.total_count})` },
                  { key: 'WALLETS', label: `WALLETS (${searchResults.wallets.length})` },
                  { key: 'TRANSACTIONS', label: `TRANSAKSI (${searchResults.transactions.length})` },
                  { key: 'GOALS', label: `TARGET (${searchResults.goals.length})` },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-2.5 py-1 font-label-mono text-[10px] uppercase font-bold border-2 border-[#1C1A27] transition-all cursor-pointer ${
                      activeTab === tab.key
                        ? 'bg-[#3B4CCA] text-white shadow-[2px_2px_0px_0px_#1C1A27]'
                        : 'bg-[#F1EBFE] text-[#1C1A27] hover:bg-[#8B5CF6] hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {isSearching && (
                <span className="text-xs font-label-mono text-[#8B5CF6] font-bold animate-pulse flex items-center gap-1">
                  <MaterialIcon name="sync" className="animate-spin text-sm" /> Mencari...
                </span>
              )}
            </div>

            {/* RESULTS CONTENT */}
            {!isSearching && searchResults.total_count === 0 ? (
              <div className="p-6 text-center space-y-3 bg-[#FDF8FF] neo-border">
                <MaterialIcon name="search_off" className="text-4xl text-[#454654] mx-auto" />
                <p className="font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
                  Tidak ada hasil cocok untuk "{query}"
                </p>
                <button
                  type="button"
                  onClick={handleAskAi}
                  className="neo-border bg-[#8B5CF6] text-white px-4 py-2 font-label-mono text-xs uppercase font-bold neo-shadow hover:bg-[#3B4CCA]"
                >
                  🤖 Tanyakan AI Assistant tentang "{query}"
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* 1. WALLETS MATCHES */}
                {filteredWallets.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-label-mono uppercase font-black text-[#1C1A27] bg-[#E7DEFF] px-2.5 py-1 neo-border">
                      <MaterialIcon name="account_balance_wallet" className="text-base" />
                      <span>WALLETS ({filteredWallets.length})</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {filteredWallets.map((w) => (
                        <Link
                          key={w.id}
                          href={w.url}
                          onClick={() => setShowSearchResults(false)}
                          className="bg-white p-3 neo-border hover:bg-[#F1EBFE] transition-all flex items-center justify-between group cursor-pointer shadow-[2px_2px_0px_0px_#1C1A27]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#3B4CCA] text-white neo-border flex items-center justify-center font-bold shrink-0">
                              <MaterialIcon name={w.icon} className="text-lg" />
                            </div>
                            <div>
                              <p className="font-headline-md font-bold text-xs text-[#1C1A27] uppercase">
                                {w.name}
                              </p>
                              <span className="text-[10px] font-label-mono uppercase text-[#454654]">
                                {w.type}
                              </span>
                            </div>
                          </div>
                          <span className="font-number-xl font-bold text-xs text-[#3B4CCA]">
                            {w.balance}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. TRANSACTIONS MATCHES */}
                {filteredTransactions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-label-mono uppercase font-black text-[#1C1A27] bg-[#DCFCE7] px-2.5 py-1 neo-border">
                      <MaterialIcon name="receipt_long" className="text-base" />
                      <span>RIWAYAT TRANSAKSI ({filteredTransactions.length})</span>
                    </div>
                    <div className="space-y-1.5">
                      {filteredTransactions.map((t) => (
                        <Link
                          key={t.id}
                          href={t.url}
                          onClick={() => setShowSearchResults(false)}
                          className="bg-white p-3 neo-border hover:bg-[#F1EBFE] transition-all flex items-center justify-between group cursor-pointer shadow-[2px_2px_0px_0px_#1C1A27]"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 neo-border flex items-center justify-center font-bold text-white shrink-0 ${t.is_income ? 'bg-[#22C55E]' : 'bg-[#EF4444]'}`}>
                              <MaterialIcon name={t.is_income ? 'arrow_downward' : 'arrow_upward'} className="text-lg" />
                            </div>
                            <div>
                              <p className="font-body-md font-bold text-xs text-[#1C1A27]">
                                {t.title}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] font-label-mono text-[#454654] font-bold">
                                <span>{t.category}</span>
                                <span>•</span>
                                <span>{t.wallet_name}</span>
                                <span>•</span>
                                <span>{t.date}</span>
                              </div>
                            </div>
                          </div>
                          <span className={`font-number-xl font-bold text-xs ${t.is_income ? 'text-[#166534]' : 'text-[#BA1A1A]'}`}>
                            {t.amount}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. GOALS MATCHES */}
                {filteredGoals.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-label-mono uppercase font-black text-[#1C1A27] bg-[#FEF08A] px-2.5 py-1 neo-border">
                      <MaterialIcon name="target" className="text-base" />
                      <span>TARGET TABUNGAN ({filteredGoals.length})</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {filteredGoals.map((g) => (
                        <Link
                          key={g.id}
                          href={g.url}
                          onClick={() => setShowSearchResults(false)}
                          className="bg-white p-3 neo-border hover:bg-[#F1EBFE] transition-all flex flex-col justify-between group cursor-pointer shadow-[2px_2px_0px_0px_#1C1A27] space-y-2"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <MaterialIcon name={g.icon} className="text-lg text-[#3B4CCA]" />
                              <p className="font-headline-md font-bold text-xs text-[#1C1A27] uppercase">
                                {g.name}
                              </p>
                            </div>
                            <span className="text-[9px] font-label-mono uppercase bg-[#E7DEFF] border border-[#1C1A27] px-1.5 py-0.2 font-bold">
                              {g.status}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-label-mono font-bold">
                              <span>Terkumpul: {g.current_amount}</span>
                              <span>{g.progress_percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 h-2 neo-border overflow-hidden">
                              <div
                                className="bg-[#4ADE80] h-full transition-all"
                                style={{ width: `${g.progress_percentage}%` }}
                              />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* ASK AI BOTTOM BAR */}
                <div className="pt-2 border-t-3 border-[#1C1A27]">
                  <button
                    type="button"
                    onClick={handleAskAi}
                    className="w-full bg-[#8B5CF6] text-white neo-border p-2.5 font-label-mono text-xs uppercase font-bold neo-shadow hover:bg-[#3B4CCA] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MaterialIcon name="smart_toy" className="text-lg" />
                    TANYAKAN ANALISIS LEBIH LANJUT KE AI ASSISTANT
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Navigation & Profile Area */}
      <div className="flex items-center gap-2 md:gap-4 ml-auto relative shrink-0" ref={profileDropdownRef}>
        
        {/* Mobile Search Toggle Icon Button */}
        <button
          type="button"
          onClick={() => setShowMobileSearch(!showMobileSearch)}
          className="md:hidden w-11 h-11 neo-border bg-white text-[#1C1A27] flex items-center justify-center neo-shadow hover:bg-[#F1EBFE] cursor-pointer font-bold"
          title="Buka Pencarian"
        >
          <MaterialIcon name="search" className="text-xl" />
        </button>

        {/* AI Chat Shortcut Button */}
        <Link href="/chat" className="max-[380px]:hidden">
          <button
            className="h-11 px-3 bg-[#E7DEFF] text-[#1C1A27] neo-border flex items-center gap-2 neo-shadow hover:bg-[#8B5CF6] hover:text-white transition-all cursor-pointer font-bold font-label-mono text-xs uppercase"
            title="Tanya AI Assistant"
          >
            <MaterialIcon name="smart_toy" className="text-xl" />
            <span className="hidden sm:inline">AI CHAT</span>
          </button>
        </Link>

        {/* Notifications Area */}
        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) fetchNotifications();
            }}
            className="w-11 h-11 neo-border bg-white text-[#1C1A27] flex items-center justify-center neo-shadow hover:bg-[#F1EBFE] transition-all cursor-pointer font-bold relative"
            title="Notifikasi"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#FFDAD6] text-[#93000A] text-[10px] font-black border-2 border-[#1C1A27] flex items-center justify-center rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-14 w-[calc(100vw-1.5rem)] max-w-80 md:w-96 md:max-w-none bg-white border-4 border-[#1C1A27] neo-shadow z-50 transform -rotate-[0.5deg]">
              <div className="flex items-center justify-between p-3 border-b-4 border-[#1C1A27] bg-[#E7DEFF]">
                <h3 className="font-headline-md font-black text-sm uppercase">NOTIFIKASI</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[10px] font-label-mono font-bold text-[#3B4CCA] hover:underline cursor-pointer"
                  >
                    TANDAI SEMUA BACA
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 font-label-mono text-xs uppercase font-bold">
                    BELUM ADA NOTIFIKASI.
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleMarkAsRead(notif.id, notif.link)}
                        className={`p-3 border-b-2 border-[#1C1A27] flex items-start gap-3 cursor-pointer transition-colors ${notif.is_read ? 'bg-white hover:bg-gray-50' : 'bg-[#F4F4F5] hover:bg-[#E5E7EB]'}`}
                      >
                        <div
                          className="w-8 h-8 rounded-full border-2 border-[#1C1A27] flex items-center justify-center shrink-0 mt-0.5"
                          style={{ backgroundColor: notif.color || '#3B4CCA' }}
                        >
                          <MaterialIcon name={notif.icon || 'notifications'} className="text-white text-sm" />
                        </div>
                        <div className="flex-1">
                          <p className={`text-xs uppercase font-bold font-label-mono ${notif.is_read ? 'text-[#454654]' : 'text-[#1C1A27]'}`}>
                            {notif.title}
                          </p>
                          <p className="text-[11px] text-[#454654] mt-0.5 font-sans leading-tight">
                            {notif.message}
                          </p>
                        </div>
                        {!notif.is_read && (
                          <div className="w-2 h-2 rounded-full bg-[#8B5CF6] shrink-0 mt-2"></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* USER PROFILE TRIGGER BUTTON (Avatar + Name Pill + Arrow) */}
        <button
          type="button"
          onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          className="flex items-center gap-2.5 bg-white text-[#1C1A27] neo-border px-2.5 py-1.5 neo-shadow hover:bg-[#F1EBFE] transition-all cursor-pointer focus:outline-none group"
          title="Menu Profil & Pengaturan"
        >
          {/* Avatar Circle */}
          <div className="w-8 h-8 rounded-full border-2 border-[#1C1A27] bg-[#3B4CCA] flex items-center justify-center overflow-hidden shrink-0">
            <img
              alt={user.name || 'User'}
              className="w-full h-full object-cover bg-white"
              src={userAvatar}
            />
          </div>

          {/* User Name & Role (Desktop) */}
          <div className="hidden sm:flex flex-col text-left leading-tight">
            <span className="font-headline-md font-black text-xs uppercase text-[#1C1A27] truncate max-w-[120px]">
              {user.name || 'Pengguna'}
            </span>
            <span className="font-label-mono text-[9px] font-bold text-[#8B5CF6]">
              PRO ACCOUNT
            </span>
          </div>

          {/* Dropdown Chevron Icon */}
          <MaterialIcon
            name="expand_more"
            className={`text-lg text-[#1C1A27] transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`}
          />
        </button>

        {/* PROFILE DROPDOWN MENU (Neo-Brutalism Style) */}
        {showProfileDropdown && (
          <div className="absolute right-0 top-16 w-[calc(100vw-1.5rem)] max-w-72 md:w-80 md:max-w-none bg-white border-4 border-[#1C1A27] neo-shadow z-50 p-4 space-y-3 transform rotate-[0.5deg]">
            {/* Header User Info Card */}
            <div className="bg-[#F1EBFE] neo-border p-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-[#1C1A27] bg-[#3B4CCA] flex items-center justify-center overflow-hidden shrink-0 shadow-[2px_2px_0px_0px_#1C1A27]">
                <img src={userAvatar} alt={user.name} className="w-full h-full object-cover bg-white" />
              </div>
              <div className="overflow-hidden">
                <h4 className="font-headline-md font-black text-sm uppercase text-[#1C1A27] truncate">
                  {user.name || 'Pengguna'}
                </h4>
                <p className="font-label-mono text-[11px] text-[#454654] truncate font-bold">
                  {user.email || user.phone_number || 'Sistem Aktif'}
                </p>
                <span className="inline-block text-[9px] font-label-mono bg-[#DCFCE7] text-[#166534] border border-[#1C1A27] px-1.5 py-0.2 mt-1 font-bold">
                  ● AKUN VERIFIKASI
                </span>
              </div>
            </div>

            {/* Menu Links */}
            <div className="space-y-1.5 font-label-mono text-xs uppercase font-bold">
              <Link
                href="/profile"
                onClick={() => setShowProfileDropdown(false)}
                className="w-full px-3 py-2.5 flex items-center gap-3 bg-white text-[#1C1A27] neo-border hover:bg-[#8B5CF6] hover:text-white transition-all shadow-[2px_2px_0px_0px_#1C1A27]"
              >
                <MaterialIcon name="person" className="text-lg" />
                Profile Saya
              </Link>

              <Link
                href="/chat"
                onClick={() => setShowProfileDropdown(false)}
                className="w-full px-3 py-2.5 flex items-center gap-3 bg-white text-[#1C1A27] neo-border hover:bg-[#8B5CF6] hover:text-white transition-all shadow-[2px_2px_0px_0px_#1C1A27]"
              >
                <MaterialIcon name="smart_toy" className="text-lg" />
                AI Assistant (OCR)
              </Link>

              <Link
                href="/wallets"
                onClick={() => setShowProfileDropdown(false)}
                className="w-full px-3 py-2.5 flex items-center gap-3 bg-white text-[#1C1A27] neo-border hover:bg-[#8B5CF6] hover:text-white transition-all shadow-[2px_2px_0px_0px_#1C1A27]"
              >
                <MaterialIcon name="account_balance_wallet" className="text-lg" />
                Daftar Wallets
              </Link>

              <Link
                href="/settings/whatsapp"
                onClick={() => setShowProfileDropdown(false)}
                className="w-full px-3 py-2.5 flex items-center gap-3 bg-white text-[#1C1A27] neo-border hover:bg-[#8B5CF6] hover:text-white transition-all shadow-[2px_2px_0px_0px_#1C1A27]"
              >
                <MaterialIcon name="settings" className="text-lg" />
                Pengaturan WhatsApp
              </Link>
            </div>

            {/* Sign Out Button */}
            <div className="pt-2 border-t-4 border-[#1C1A27]">
              <Link
                href="/logout"
                method="post"
                as="button"
                className="w-full px-3 py-2.5 flex items-center justify-center gap-2 bg-[#FFDAD6] text-[#93000A] neo-border hover:bg-[#BA1A1A] hover:text-white transition-all font-label-mono text-xs uppercase font-black cursor-pointer shadow-[3px_3px_0px_0px_#1C1A27]"
              >
                <MaterialIcon name="logout" className="text-lg" />
                Sign Out
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE SEARCH EXPANDABLE BAR */}
      {showMobileSearch && (
        <div className="absolute left-0 right-0 top-16 bg-white border-b-4 border-[#1C1A27] p-3 z-50 md:hidden neo-shadow">
          <div className="relative flex items-center">
            <MaterialIcon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1C1A27] pointer-events-none z-10 text-xl font-bold" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="CARI TRANSAKSI, WALLET, ATAU TARGET..."
              className="w-full neo-border py-2.5 pl-12 pr-10 bg-white font-label-mono text-xs uppercase font-bold focus:outline-none"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={handleClearQuery}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#FFDAD6] text-[#93000A] border border-[#1C1A27] flex items-center justify-center font-bold text-xs z-10 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
