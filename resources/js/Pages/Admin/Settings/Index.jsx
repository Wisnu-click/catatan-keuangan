import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import MaterialIcon from '../../../Components/MaterialIcon';

export default function SettingsIndex({ system = {} }) {
  const [clearingCache, setClearingCache] = useState(false);

  const handleClearCache = () => {
    setClearingCache(true);
    router.post('/admin/settings/clear-cache', {}, {
      onFinish: () => setClearingCache(false),
    });
  };

  return (
    <AdminLayout title="Pengaturan & Diagnostik Sistem">
      <Head title="Pengaturan Sistem - VIRA Admin" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Environment & Configuration Overview */}
        <div className="lg:col-span-8 bg-white border-4 border-[#1C1A27] shadow-[5px_5px_0px_0px_#1C1A27] p-5 sm:p-6 space-y-4">
          <div className="border-b-3 border-[#1C1A27] pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-headline-md text-base sm:text-lg font-black text-[#1C1A27] uppercase">
                DIAGNOSTIK ENVIRONMENT & SERVER
              </h3>
              <p className="text-xs font-body-md text-[#454654] font-bold">
                Spesifikasi teknis, driver database, dan konfigurasi runtime aplikasi.
              </p>
            </div>
            <span className="bg-[#DCFCE7] text-[#166534] border border-[#1C1A27] px-2 py-0.5 font-label-mono text-[10px] font-black uppercase">
              STATUS OK
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-label-mono font-bold">
            <div className="border-2 border-[#1C1A27] p-3 bg-[#FDF8FF] space-y-1">
              <span className="text-[#454654] block text-[10px]">APLIKASI & ENVIRONMENT</span>
              <div className="font-black text-sm text-[#1C1A27]">{system.app_name}</div>
              <div className="text-[11px] text-[#3B4CCA]">Env: {system.app_env} (Debug: {system.app_debug ? 'ON' : 'OFF'})</div>
            </div>

            <div className="border-2 border-[#1C1A27] p-3 bg-[#FDF8FF] space-y-1">
              <span className="text-[#454654] block text-[10px]">PHP & LARAVEL RUNTIME</span>
              <div className="font-black text-sm text-[#1C1A27]">PHP {system.php_version}</div>
              <div className="text-[11px] text-[#8B5CF6]">Laravel v{system.laravel_version} ({system.server_os})</div>
            </div>

            <div className="border-2 border-[#1C1A27] p-3 bg-[#FDF8FF] space-y-1">
              <span className="text-[#454654] block text-[10px]">DATABASE ENGINE</span>
              <div className="font-black text-sm text-[#166534] uppercase">{system.database_driver} (Connected)</div>
              <div className="text-[11px] text-[#454654]">DB: {system.database_name} @ {system.database_host}</div>
            </div>

            <div className="border-2 border-[#1C1A27] p-3 bg-[#FDF8FF] space-y-1">
              <span className="text-[#454654] block text-[10px]">OPENROUTER AI API</span>
              <div className="font-black text-sm text-[#1C1A27]">{system.openrouter_preview}</div>
              <div className="text-[11px] text-[#854D0E]">Default Model: {system.default_ai_model}</div>
            </div>
          </div>

          <div className="pt-2 border-t-2 border-[#1C1A27]/20 text-xs font-label-mono text-[#454654]">
            Timezone Sistem: <span className="font-black text-[#1C1A27]">{system.timezone}</span> • App URL: <span className="font-black text-[#1C1A27]">{system.app_url}</span>
          </div>
        </div>

        {/* Right: Cache Maintenance Panel */}
        <div className="lg:col-span-4 bg-[#F1EBFE] border-4 border-[#1C1A27] shadow-[5px_5px_0px_0px_#1C1A27] p-5 sm:p-6 space-y-4">
          <div className="border-b-3 border-[#1C1A27] pb-3">
            <h3 className="font-headline-md text-base font-black text-[#1C1A27] uppercase">
              PEMELIHARAAN CACHE
            </h3>
            <p className="text-[11px] font-body-md text-[#454654] font-bold">
              Bersihkan cache konfigurasi, route, dan view setelah mengubah file .env atau template.
            </p>
          </div>

          <div className="bg-white border-2 border-[#1C1A27] p-3 font-label-mono text-xs space-y-1.5 font-bold">
            <div className="flex items-center gap-1.5 text-[#166534]">
              <MaterialIcon name="check_circle" className="text-sm" />
              <span>Config Cache</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#166534]">
              <MaterialIcon name="check_circle" className="text-sm" />
              <span>Route Cache</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#166534]">
              <MaterialIcon name="check_circle" className="text-sm" />
              <span>View / Blade Cache</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearCache}
            disabled={clearingCache}
            className="w-full bg-[#3B4CCA] hover:bg-[#2A379D] text-white border-3 border-[#1C1A27] shadow-[3px_3px_0px_0px_#1C1A27] py-3 px-4 font-label-mono text-xs uppercase font-black flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all active:translate-y-0.5"
          >
            <MaterialIcon name="cleaning_services" className={`text-base ${clearingCache ? 'animate-spin' : ''}`} />
            <span>{clearingCache ? 'Membersihkan Cache...' : 'Bersihkan Cache Sistem (Clear)'}</span>
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

