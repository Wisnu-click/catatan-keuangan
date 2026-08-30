import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import MaterialIcon from './MaterialIcon';
import NeoButton from './NeoButton';

export default function SideNav() {
  const { url } = usePage();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: 'grid_view' },
    { name: 'Wallets', href: '/wallets', icon: 'account_balance_wallet' },
    { name: 'AI Chat', href: '/chat', icon: 'smart_toy' },
    { name: 'Reports', href: '/reports', icon: 'bar_chart' },
    { name: 'Goals', href: '/goals', icon: 'target' },
    { name: 'Profile', href: '/profile', icon: 'person' },
    { name: 'Settings', href: '/settings/whatsapp', icon: 'settings' },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') return url === '/' || url === '/dashboard';
    return url.startsWith(path);
  };

  return (
    <nav className="hidden md:flex fixed left-0 top-0 h-screen w-80 flex-col p-3 neo-border border-r-4 border-y-0 border-l-0 bg-[#F1EBFE] z-50">
      <div className="mb-6 p-4">
        <h1 className="text-3xl font-headline-md font-black text-[#1C1A27] tracking-tighter uppercase">
          VIRA
        </h1>
        <p className="text-xs font-label-mono text-[#454654] mt-1 font-bold">VIRTUAL INCOME & RECORD ASSISTANT</p>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`px-4 py-3 flex items-center gap-3 font-label-mono text-sm uppercase transition-all font-bold ${
                active
                  ? 'bg-[#3B4CCA] text-white neo-border neo-shadow transform rotate-[-0.5deg]'
                  : 'text-[#454654] hover:bg-[#8B5CF6] hover:text-white hover:neo-border border-4 border-transparent hover:border-[#1C1A27]'
              }`}
            >
              <MaterialIcon name={item.icon} filled={active} className="text-xl" />
              {item.name}
            </Link>
          );
        })}
      </div>

      <Link href="/transactions/create" className="block w-full mb-4">
        <NeoButton variant="primary" size="lg" className="w-full">
          <MaterialIcon name="add" className="text-xl" />
          NEW TRANSACTION
        </NeoButton>
      </Link>

      <div className="mt-auto border-t-4 border-[#1C1A27] pt-4 flex flex-col gap-1">
        <a
          href="#"
          className="text-[#454654] hover:bg-[#8B5CF6] hover:text-white hover:neo-border transition-all px-4 py-2 flex items-center gap-3 font-label-mono text-xs uppercase border-4 border-transparent hover:border-[#1C1A27] font-bold"
        >
          <MaterialIcon name="help" className="text-lg" />
          Help Center
        </a>
        <Link
          href="/logout"
          method="post"
          as="button"
          className="w-full text-left text-[#454654] hover:bg-[#8B5CF6] hover:text-white hover:neo-border transition-all px-4 py-2 flex items-center gap-3 font-label-mono text-xs uppercase border-4 border-transparent hover:border-[#1C1A27] font-bold cursor-pointer"
        >
          <MaterialIcon name="logout" className="text-lg" />
          Sign Out
        </Link>
      </div>
    </nav>
  );
}
