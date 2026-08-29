import React from 'react';

export default function TopNav({ pageTitle = '' }) {
  return (
    <header className="w-full bg-[#FDF8FF] border-b-4 border-[#1C1A27] neo-shadow sticky top-0 z-40 px-6 py-4 flex justify-between items-center">
      {/* Mobile Brand */}
      <h1 className="md:hidden text-2xl font-headline-md font-black text-[#1C1A27] uppercase tracking-tighter">
        RAW LOGIC
      </h1>

      {/* Desktop Search */}
      <div className="hidden md:flex flex-1 max-w-xl relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#1C1A27]">
          search
        </span>
        <input
          className="w-full neo-border py-3 pl-12 pr-4 bg-white font-label-mono text-xs uppercase focus:outline-none focus:ring-0 placeholder:text-[#454654]/50 neo-shadow-active neo-shadow-hover transition-all"
          placeholder="SEARCH TRANSACTIONS, WALLETS..."
          type="text"
        />
      </div>

      {/* Profile & Notifications */}
      <div className="flex items-center gap-4 ml-auto">
        <button className="w-12 h-12 neo-border bg-white flex items-center justify-center neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-100 cursor-pointer">
          <span className="material-symbols-outlined text-2xl text-[#1C1A27]">notifications</span>
        </button>
        <div className="w-12 h-12 neo-border bg-[#3B4CCA] rounded-full flex items-center justify-center neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-100 overflow-hidden cursor-pointer">
          <img
            alt="User profile photo"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9yZsBGgN8XacufvV-ntEUsK1HwpH1dJ03oKSzqnR7HcQtNjpQjN_lsCuQL6YjX2sj018Ux9YYODKoNtPJKHFBLIOnKFXMLZjf20lPVS_xr5jqWme7QV_uhavuWrIMXABqsT8yKs9eOmBiSBpKKzPWD5RTAhsEC-_sk1OFegpBu1GWPtTVl9OpjEoqWJCqJ_EWf-I9Vig8Zp0pjfqAsitG5AUNhR0odkQ3lCf9DNp2NmI6X-5KUdM"
          />
        </div>
      </div>
    </header>
  );
}

