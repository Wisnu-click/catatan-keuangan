import React, { useState } from 'react';
import SideNav from '../Components/SideNav';
import TopNav from '../Components/TopNav';
import MaterialIcon from '../Components/MaterialIcon';
import { Link } from '@inertiajs/react';

export default function AuthenticatedLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="bg-[#FDF8FF] text-[#1C1A27] min-h-screen flex font-body-md">
      {/* Desktop SideNav */}
      <SideNav mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-80 w-full min-h-screen flex flex-col">
        <TopNav onMenuToggle={() => setMobileMenuOpen((open) => !open)} />
        <div className="p-4 sm:p-6 md:p-10 w-full space-y-6 flex-1">
          {children}
        </div>
      </main>

      {/* Mobile Floating Action Button */}
      <Link
        href="/transactions/create"
        className="md:hidden fixed bottom-6 right-6 w-16 h-16 bg-[#3B4CCA] text-white neo-border neo-shadow neo-shadow-active flex items-center justify-center rounded-full z-50 cursor-pointer"
      >
        <MaterialIcon name="add" className="text-3xl font-bold" />
      </Link>
    </div>
  );
}

