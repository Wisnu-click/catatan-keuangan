import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import MaterialIcon from '../Components/MaterialIcon';

export default function AdminLayout({ children, title = 'Admin Panel' }) {
  const { url, props } = usePage();
  const { auth, flash } = props || {};
  const user = auth?.user;
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.pathname : '');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const adminNavItems = [
    {
      name: 'Dashboard Overview',
      href: '/admin/dashboard',
      icon: 'dashboard',
      badge: 'UTAMA',
      badgeColor: '#FEF08A',
      active: currentUrl === '/admin' || currentUrl.startsWith('/admin/dashboard'),
    },
    {
      name: 'Manajemen User',
      href: '/admin/users',
      icon: 'group',
      badge: 'CRUD',
      badgeColor: '#DCFCE7',
      active: currentUrl.startsWith('/admin/users'),
    },
    {
      name: 'Semua Transaksi',
      href: '/admin/transactions',
      icon: 'receipt_long',
      badge: 'GLOBAL',
      badgeColor: '#FFDAD6',
      active: currentUrl.startsWith('/admin/transactions'),
    },
    {
      name: 'Monitoring Wallet',
      href: '/admin/wallets',
      icon: 'account_balance_wallet',
      badge: 'DATA',
      badgeColor: '#E7DEFF',
      active: currentUrl.startsWith('/admin/wallets'),
    },
    {
      name: 'Target Tabungan',
      href: '/admin/goals',
      icon: 'savings',
      badge: 'GOALS',
      badgeColor: '#DCFCE7',
      active: currentUrl.startsWith('/admin/goals'),
    },
    {
      name: 'AI Interactions Log',
      href: '/admin/ai-logs',
      icon: 'smart_toy',
      badge: 'AI LIVE',
      badgeColor: '#FEF08A',
      active: currentUrl.startsWith('/admin/ai-logs'),
    },
    {
      name: 'Pengaturan Sistem',
      href: '/admin/settings',
      icon: 'settings_suggest',
      badge: 'SYSTEM',
      badgeColor: '#F1EBFE',
      active: currentUrl.startsWith('/admin/settings'),
    },
  ];

  return (
    <div className="bg-[#FDF8FF] text-[#1C1A27] min-h-screen flex font-body-md selection:bg-[#3B4CCA] selection:text-white">
      {/* =========================================================================
          1. DESKTOP ADMIN SIDEBAR (FIXED W-72)
          ========================================================================= */}
      <aside className="hidden lg:flex w-72 h-screen fixed top-0 left-0 bg-white border-r-4 border-[#1C1A27] flex-col justify-between z-30 shadow-[4px_0px_0px_0px_#1C1A27]">
        {/* Sidebar Header */}
        <div className="p-5 border-b-4 border-[#1C1A27] bg-[#FDF8FF]">
          <div className="flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-[#EF4444] text-white border-3 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] flex items-center justify-center font-black text-xl">
                <MaterialIcon name="admin_panel_settings" className="text-2xl" />
              </div>
              <div>
                <span className="font-headline-md font-black text-xl tracking-tight text-[#1C1A27] uppercase block leading-none">
                  VIRA ADMIN
                </span>
                <span className="font-label-mono text-[9px] uppercase font-black tracking-widest text-[#EF4444] block mt-0.5">
                  SUPER ADMINISTRATOR
                </span>
              </div>
            </Link>
          </div>

          <div className="mt-3 flex items-center gap-2 bg-[#FEF08A] border-2 border-[#1C1A27] p-2 text-xs font-label-mono font-black shadow-[2px_2px_0px_0px_#1C1A27]">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping" />
            <span className="text-[#1C1A27] truncate">Login: {user?.name || 'Admin'}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="text-[10px] font-label-mono uppercase font-black text-[#454654] px-2 py-1">
            MENU ADMINISTRATOR
          </div>
          {adminNavItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`w-full flex items-center justify-between px-3 py-2.5 border-3 border-[#1C1A27] font-headline-md text-xs uppercase font-black transition-all ${
                item.active
                  ? 'bg-[#3B4CCA] text-white shadow-[3px_3px_0px_0px_#1C1A27] translate-x-1'
                  : 'bg-white hover:bg-[#F1EBFE] text-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] active:translate-y-0.5'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <MaterialIcon name={item.icon} className="text-lg shrink-0" />
                <span className="truncate">{item.name}</span>
              </div>
              <span
                className="text-[8px] font-label-mono uppercase px-1.5 py-0.2 border border-[#1C1A27] font-black shrink-0 text-[#1C1A27]"
                style={{ backgroundColor: item.badgeColor }}
              >
                {item.badge}
              </span>
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer (Switch back to User Dashboard & Logout) */}
        <div className="p-4 border-t-4 border-[#1C1A27] bg-[#FDF8FF] space-y-2">
          <Link
            href="/dashboard"
            className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white border-2 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] py-2 px-3 font-label-mono text-xs uppercase font-black flex items-center justify-center gap-2 transition-all active:translate-y-0.5"
          >
            <MaterialIcon name="swap_horiz" className="text-base" />
            <span>Beralih ke App Pengguna</span>
          </Link>

          <Link
            href="/logout"
            method="post"
            as="button"
            className="w-full bg-white hover:bg-[#FFDAD6] text-[#93000A] border-2 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] py-1.5 px-3 font-label-mono text-xs uppercase font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <MaterialIcon name="logout" className="text-sm" />
            <span>Keluar Sesi</span>
          </Link>
        </div>
      </aside>

      {/* =========================================================================
          2. MAIN CONTENT AREA WITH TOPBAR
          ========================================================================= */}
      <div className="flex-1 lg:ml-72 w-full min-h-screen flex flex-col">
        {/* Admin Topbar */}
        <header className="sticky top-0 z-20 bg-white border-b-4 border-[#1C1A27] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-[0_3px_0_0_#1C1A27]">
          {/* Left: Mobile Toggle & Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden w-9 h-9 bg-white border-2 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] flex items-center justify-center cursor-pointer"
            >
              <MaterialIcon name="menu" className="text-xl" />
            </button>

            <div>
              <div className="flex items-center gap-1.5 font-label-mono text-[10px] text-[#454654] font-black uppercase">
                <Link href="/admin/dashboard" className="hover:text-[#3B4CCA]">ADMIN</Link>
                <span>/</span>
                <span className="text-[#EF4444]">{title}</span>
              </div>
              <h1 className="font-headline-md text-lg sm:text-xl font-black text-[#1C1A27] uppercase tracking-tight leading-none mt-0.5">
                {title}
              </h1>
            </div>
          </div>

          {/* Right: Quick App Switcher & Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-1.5 bg-[#FEF08A] text-[#1C1A27] border-2 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] px-3 py-1 font-label-mono text-xs uppercase font-black hover:bg-[#FACC15] transition-all"
            >
              <MaterialIcon name="arrow_back" className="text-sm" />
              <span>App Pengguna</span>
            </Link>

            <div className="flex items-center gap-2 bg-[#F1EBFE] border-2 border-[#1C1A27] px-2.5 py-1 text-xs font-label-mono font-bold">
              <img
                src={user?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin'}
                alt="Avatar"
                className="w-5 h-5 rounded-full border border-[#1C1A27] bg-white"
              />
              <span className="font-black text-[#1C1A27] hidden md:inline">{user?.name}</span>
              <span className="bg-[#EF4444] text-white text-[8px] font-black px-1 uppercase">ADMIN</span>
            </div>
          </div>
        </header>

        {/* Global Flash Alerts */}
        {flash?.success && (
          <div className="mx-4 sm:mx-8 mt-4 bg-[#DCFCE7] border-3 border-[#1C1A27] p-3 text-[#166534] font-label-mono text-xs font-black shadow-[3px_3px_0px_0px_#1C1A27] flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <MaterialIcon name="check_circle" className="text-lg text-[#16A34A]" />
              <span>{flash.success}</span>
            </div>
          </div>
        )}

        {flash?.error && (
          <div className="mx-4 sm:mx-8 mt-4 bg-[#FFDAD6] border-3 border-[#1C1A27] p-3 text-[#93000A] font-label-mono text-xs font-black shadow-[3px_3px_0px_0px_#1C1A27] flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <MaterialIcon name="error" className="text-lg text-[#DC2626]" />
              <span>{flash.error}</span>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="p-4 sm:p-6 md:p-8 flex-1 space-y-6">
          {children}
        </main>
      </div>

      {/* =========================================================================
          3. MOBILE ADMIN DRAWER
          ========================================================================= */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#1C1A27]/60 backdrop-blur-xs flex lg:hidden animate-in fade-in duration-150"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            className="w-72 bg-white border-r-4 border-[#1C1A27] h-full flex flex-col justify-between p-4 shadow-[6px_0px_0px_0px_#1C1A27] animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-3 border-[#1C1A27] pb-3">
                <span className="font-headline-md font-black text-lg uppercase text-[#1C1A27]">
                  VIRA ADMIN PANEL
                </span>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="w-8 h-8 bg-white border-2 border-[#1C1A27] flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              <nav className="space-y-1.5">
                {adminNavItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={`w-full flex items-center justify-between px-3 py-2 border-2 border-[#1C1A27] font-headline-md text-xs uppercase font-black ${
                      item.active
                        ? 'bg-[#3B4CCA] text-white shadow-[2px_2px_0px_0px_#1C1A27]'
                        : 'bg-white hover:bg-[#FEF08A] text-[#1C1A27]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MaterialIcon name={item.icon} className="text-base" />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="pt-3 border-t-3 border-[#1C1A27] space-y-2">
              <Link
                href="/dashboard"
                className="w-full text-center block bg-[#8B5CF6] text-white border-2 border-[#1C1A27] py-2 font-label-mono text-xs uppercase font-black shadow-[2px_2px_0px_0px_#1C1A27]"
              >
                ↩ Ke App Pengguna
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

