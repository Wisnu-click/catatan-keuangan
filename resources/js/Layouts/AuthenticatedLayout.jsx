import React from 'react';
import SideNav from '../Components/SideNav';
import TopNav from '../Components/TopNav';
import BottomNav from '../Components/BottomNav';

export default function AuthenticatedLayout({ children, noPadding = false }) {
  return (
    <div className="bg-[#FDF8FF] text-[#1C1A27] min-h-screen flex font-body-md">
      {/* Desktop SideNav (Visible only on md: screens and above) */}
      <SideNav />

      {/* Main Content Area */}
      <main className={`flex-1 md:ml-80 w-full min-h-screen flex flex-col ${noPadding ? 'pb-16 md:pb-0 h-screen' : 'pb-24 md:pb-10'}`}>
        <TopNav />
        {noPadding ? (
          <div className="w-full flex-1 flex flex-col overflow-hidden relative">
            {children}
          </div>
        ) : (
          <div className="p-4 sm:p-6 md:p-10 w-full space-y-6 flex-1">
            {children}
          </div>
        )}
      </main>

      {/* Mobile PWA Bottom Navigation Bar (Visible only on mobile screens) */}
      <BottomNav />
    </div>
  );
}
