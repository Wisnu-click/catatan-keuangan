import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import MaterialIcon from './MaterialIcon';
import TestNotificationModal from './TestNotificationModal';

export default function BottomNav() {
  const { url } = usePage();
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  const isActive = (path) => {
    if (path === '/dashboard') return url === '/' || url === '/dashboard';
    return url.startsWith(path);
  };

  const moreMenuItems = [
    { name: 'AI Chat Assistant', href: '/chat', icon: 'smart_toy', bg: 'bg-[#E7DEFF]', color: 'text-[#8B5CF6]' },
    { name: 'Laporan Keuangan', href: '/reports', icon: 'bar_chart', bg: 'bg-[#DCFCE7]', color: 'text-[#16A34A]' },
    { name: 'Target Tabungan (Goals)', href: '/goals', icon: 'target', bg: 'bg-[#FEF08A]', color: 'text-[#854D0E]' },
    { name: 'Profil Akun', href: '/profile', icon: 'person', bg: 'bg-[#F1EBFE]', color: 'text-[#3B4CCA]' },
    { name: 'Pengaturan WhatsApp Bot', href: '/settings/whatsapp', icon: 'settings', bg: 'bg-[#E0F2FE]', color: 'text-[#0284C7]' },
  ];

  return (
    <>
      {/* =========================================================================
          📱 BOTTOM NAVIGATION BAR (KHUSUS MOBILE / PWA SCREEN)
          ========================================================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FDF8FF] border-t-4 border-[#1C1A27] shadow-[0px_-4px_0px_0px_#1C1A27] px-2 py-1.5 flex items-center justify-around select-none">
        {/* 1. Home / Dashboard */}
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-none transition-transform active:scale-95 ${
            isActive('/dashboard')
              ? 'text-[#3B4CCA] font-black'
              : 'text-[#454654] hover:text-[#1C1A27]'
          }`}
        >
          <div
            className={`w-10 h-7 flex items-center justify-center border-2 border-transparent ${
              isActive('/dashboard') ? 'bg-[#3B4CCA] text-white border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27]' : ''
            }`}
          >
            <MaterialIcon name="grid_view" filled={isActive('/dashboard')} className="text-xl" />
          </div>
          <span className="font-label-mono text-[10px] uppercase font-bold mt-0.5 tracking-tighter">
            Home
          </span>
        </Link>

        {/* 2. Wallets */}
        <Link
          href="/wallets"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-none transition-transform active:scale-95 ${
            isActive('/wallets')
              ? 'text-[#3B4CCA] font-black'
              : 'text-[#454654] hover:text-[#1C1A27]'
          }`}
        >
          <div
            className={`w-10 h-7 flex items-center justify-center border-2 border-transparent ${
              isActive('/wallets') ? 'bg-[#3B4CCA] text-white border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27]' : ''
            }`}
          >
            <MaterialIcon name="account_balance_wallet" filled={isActive('/wallets')} className="text-xl" />
          </div>
          <span className="font-label-mono text-[10px] uppercase font-bold mt-0.5 tracking-tighter">
            Wallets
          </span>
        </Link>

        {/* 3. CENTER FLOATING BUTTON: TAMBAH TRANSAKSI (+) */}
        <Link
          href="/transactions/create"
          className="flex flex-col items-center justify-center -mt-6 group transition-transform active:scale-90"
        >
          <div className="w-14 h-14 bg-[#3B4CCA] text-white border-4 border-[#1C1A27] shadow-[3px_3px_0px_0px_#1C1A27] flex items-center justify-center hover:bg-[#2A379D]">
            <MaterialIcon name="add" className="text-3xl font-black" />
          </div>
          <span className="font-label-mono text-[9px] uppercase font-black text-[#1C1A27] mt-0.5 bg-[#FEF08A] px-1.5 border border-[#1C1A27] shadow-[1px_1px_0px_0px_#000]">
            + TRANSAKSI
          </span>
        </Link>

        {/* 4. Nabung Emas */}
        <Link
          href="/gold"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-none transition-transform active:scale-95 ${
            isActive('/gold')
              ? 'text-[#3B4CCA] font-black'
              : 'text-[#454654] hover:text-[#1C1A27]'
          }`}
        >
          <div
            className={`w-10 h-7 flex items-center justify-center border-2 border-transparent ${
              isActive('/gold') ? 'bg-[#F59E0B] text-black border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27]' : ''
            }`}
          >
            <MaterialIcon name="monetization_on" filled={isActive('/gold')} className="text-xl" />
          </div>
          <span className="font-label-mono text-[10px] uppercase font-bold mt-0.5 tracking-tighter">
            Emas
          </span>
        </Link>

        {/* 5. Menu / Lainnya Drawer Toggle */}
        <button
          type="button"
          onClick={() => setShowMoreDrawer(true)}
          className={`flex flex-col items-center justify-center py-1 px-3 cursor-pointer transition-transform active:scale-95 ${
            showMoreDrawer
              ? 'text-[#3B4CCA] font-black'
              : 'text-[#454654] hover:text-[#1C1A27]'
          }`}
        >
          <div
            className={`w-10 h-7 flex items-center justify-center border-2 border-transparent ${
              showMoreDrawer ? 'bg-[#8B5CF6] text-white border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27]' : ''
            }`}
          >
            <MaterialIcon name="apps" className="text-xl" />
          </div>
          <span className="font-label-mono text-[10px] uppercase font-bold mt-0.5 tracking-tighter">
            Menu
          </span>
        </button>
      </nav>

      {/* =========================================================================
          📑 DRAWER MENU LEBIH BANYAK (BOTTOM SHEET MOBILE)
          ========================================================================= */}
      {showMoreDrawer && (
        <div className="md:hidden fixed inset-0 z-[60] flex flex-col justify-end" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#1C1A27]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowMoreDrawer(false)}
          />

          {/* Bottom Sheet Container */}
          <div className="relative bg-[#FDF8FF] border-t-4 border-x-4 border-[#1C1A27] shadow-[0px_-8px_0px_0px_#1C1A27] p-5 pb-24 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            {/* Drawer Handle & Header */}
            <div className="flex justify-between items-center pb-4 mb-4 border-b-4 border-[#1C1A27]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-[#3B4CCA] text-white border-2 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] flex items-center justify-center">
                  <MaterialIcon name="widgets" className="text-xl" />
                </div>
                <div>
                  <h3 className="font-headline-md text-lg font-black uppercase text-[#1C1A27]">
                    Menu Fitur Lainnya
                  </h3>
                  <p className="font-label-mono text-[10px] text-[#454654] font-bold">
                    VIRA PWA Application
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMoreDrawer(false)}
                className="w-9 h-9 bg-white border-2 border-[#1C1A27] flex items-center justify-center shadow-[2px_2px_0px_0px_#1C1A27] hover:bg-[#FECACA] cursor-pointer"
              >
                <MaterialIcon name="close" className="text-xl font-bold" />
              </button>
            </div>

            {/* Test Notification Button in Drawer */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => {
                  setShowMoreDrawer(false);
                  setShowTestModal(true);
                }}
                className="w-full p-3.5 bg-[#FEF08A] text-[#854D0E] border-4 border-[#1C1A27] shadow-[3px_3px_0px_0px_#1C1A27] flex items-center justify-between cursor-pointer hover:bg-yellow-300 transition-transform active:translate-y-0.5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#854D0E] text-white border-2 border-[#1C1A27] flex items-center justify-center shrink-0">
                    <MaterialIcon name="notifications_active" className="text-xl font-bold" />
                  </div>
                  <div className="text-left">
                    <p className="font-headline-md text-sm font-black uppercase text-[#854D0E]">
                      Test Notifikasi HP (PWA)
                    </p>
                    <p className="font-label-mono text-[10px] opacity-80 font-bold">
                      Uji Notifikasi Layar & Status Bar HP
                    </p>
                  </div>
                </div>
                <span className="font-label-mono text-xs font-black bg-white text-[#1C1A27] px-2.5 py-1 border border-[#1C1A27] shadow-[1px_1px_0px_0px_#000]">
                  TEST 🔔
                </span>
              </button>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {moreMenuItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setShowMoreDrawer(false)}
                    className={`p-3.5 border-4 border-[#1C1A27] shadow-[3px_3px_0px_0px_#1C1A27] flex items-center gap-3 transition-transform active:translate-y-0.5 ${
                      active
                        ? 'bg-[#3B4CCA] text-white'
                        : 'bg-white text-[#1C1A27] hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 border-2 border-[#1C1A27] flex items-center justify-center shrink-0 ${
                        active ? 'bg-white text-[#3B4CCA]' : `${item.bg} ${item.color}`
                      }`}
                    >
                      <MaterialIcon name={item.icon} className="text-xl font-bold" />
                    </div>
                    <span className="font-headline-md text-sm font-bold uppercase truncate">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Logout Button */}
            <div className="pt-3 border-t-2 border-[#1C1A27]/20">
              <Link
                href="/logout"
                method="post"
                as="button"
                onClick={() => setShowMoreDrawer(false)}
                className="w-full bg-[#FFDAD6] text-[#93000A] border-4 border-[#1C1A27] p-3 font-label-mono text-xs font-black uppercase shadow-[3px_3px_0px_0px_#1C1A27] flex items-center justify-center gap-2 hover:bg-[#BA1A1A] hover:text-white cursor-pointer transition-colors"
              >
                <MaterialIcon name="logout" className="text-lg font-bold" />
                KELUAR DARI APLIKASI (LOGOUT)
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Test Notification Modal */}
      <TestNotificationModal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
      />
    </>
  );
}
