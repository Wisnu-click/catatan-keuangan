import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import MaterialIcon from './MaterialIcon';
import NeoButton from './NeoButton';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: 'grid_view' },
  { name: 'Wallets', href: '/wallets', icon: 'account_balance_wallet' },
  { name: 'Nabung Emas', href: '/gold', icon: 'monetization_on' },
  { name: 'AI Chat', href: '/chat', icon: 'smart_toy' },
  { name: 'Reports', href: '/reports', icon: 'bar_chart' },
  { name: 'Goals', href: '/goals', icon: 'target' },
  { name: 'Profile', href: '/profile', icon: 'person' },
  { name: 'Settings', href: '/settings/whatsapp', icon: 'settings' },
];

export default function SideNav({ mobileOpen = false, onClose = () => {} }) {
  const { url, props } = usePage();
  const user = props?.auth?.user || {};
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.pathname : '');
  const isActive = (path) => (path === '/dashboard' ? currentUrl === '/' || currentUrl === '/dashboard' : currentUrl.startsWith(path));

  const navigation = (mobile = false) => (
    <>
      <div className="mb-5 p-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-headline-md font-black text-[#1C1A27] tracking-tighter uppercase">VIRA</h1>
          <p className="text-xs font-label-mono text-[#454654] mt-1 font-bold">VIRTUAL INCOME & RECORD ASSISTANT</p>
        </div>
        {mobile && <button type="button" onClick={onClose} className="md:hidden w-10 h-10 bg-white neo-border flex items-center justify-center shrink-0" aria-label="Tutup menu"><MaterialIcon name="close" className="text-xl" /></button>}
      </div>
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto px-1">
        {user.is_admin && (
          <Link
            href="/admin/dashboard"
            onClick={onClose}
            className="px-4 py-3 flex items-center gap-3 font-label-mono text-sm uppercase transition-all font-black bg-[#FFE4E6] text-[#9F1239] border-4 border-[#1C1A27] shadow-[3px_3px_0px_0px_#1C1A27] hover:bg-[#E11D48] hover:text-white transform hover:translate-x-1 mb-2"
          >
            <MaterialIcon name="admin_panel_settings" className="text-xl text-[#E11D48] group-hover:text-white" />
            <span>👑 ADMIN PANEL</span>
          </Link>
        )}

        {navItems.map((item) => {
          const active = isActive(item.href);
          return <Link key={item.name} href={item.href} onClick={onClose} className={`px-4 py-3 flex items-center gap-3 font-label-mono text-sm uppercase transition-all font-bold ${active ? 'bg-[#3B4CCA] text-white neo-border neo-shadow transform rotate-[-0.5deg]' : 'text-[#454654] hover:bg-[#8B5CF6] hover:text-white border-4 border-transparent hover:border-[#1C1A27]'}`}><MaterialIcon name={item.icon} filled={active} className="text-xl" />{item.name}</Link>;
        })}
      </div>
      <Link href="/transactions/create" onClick={onClose} className="block w-full my-4"><NeoButton variant="primary" size="lg" className="w-full"><MaterialIcon name="add" className="text-xl" />NEW TRANSACTION</NeoButton></Link>
      <div className="border-t-4 border-[#1C1A27] pt-4 flex flex-col gap-1">
        <Link href="/logout" method="post" as="button" className="w-full text-left text-[#454654] hover:bg-[#8B5CF6] hover:text-white transition-all px-4 py-2 flex items-center gap-3 font-label-mono text-xs uppercase border-4 border-transparent hover:border-[#1C1A27] font-bold cursor-pointer"><MaterialIcon name="logout" className="text-lg" />Sign Out</Link>
      </div>
    </>
  );

  return <>
    <nav className="hidden md:flex fixed left-0 top-0 h-screen w-80 flex-col p-3 neo-border border-r-4 border-y-0 border-l-0 bg-[#F1EBFE] z-50">{navigation()}</nav>
    {mobileOpen && <div className="md:hidden fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Menu navigasi">
      <button type="button" onClick={onClose} className="absolute inset-0 bg-[#1C1A27]/60" aria-label="Tutup menu" />
      <nav className="relative h-full w-[min(20rem,calc(100vw-2.5rem))] bg-[#F1EBFE] neo-border border-l-0 border-y-0 p-3 flex flex-col shadow-[8px_0_0_0_#1C1A27]">{navigation(true)}</nav>
    </div>}
  </>;
}