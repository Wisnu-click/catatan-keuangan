import React, { useState } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import NeoCard from '../../Components/NeoCard';
import NeoInput from '../../Components/NeoInput';
import NeoButton from '../../Components/NeoButton';
import MaterialIcon from '../../Components/MaterialIcon';

export default function Index({ user = {}, stats = {} }) {
  const { flash } = usePage().props;
  const [disconnecting, setDisconnecting] = useState(false);

  // Profile Form State
  const profileForm = useForm({
    name: user.name || '',
    email: user.email || '',
    phone_number: user.phone_number || '',
    avatar_url: user.avatar_url || '',
  });

  // Password Form State
  const passwordForm = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    profileForm.put('/profile', {
      preserveScroll: true,
    });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    passwordForm.put('/profile/password', {
      preserveScroll: true,
      onSuccess: () => passwordForm.reset(),
    });
  };

  const handleDisconnectGoogle = (e) => {
    e.preventDefault();
    if (confirm('Apakah Anda yakin ingin memutuskan hubungan akun Google dari profil ini?')) {
      setDisconnecting(true);
      router.post('/profile/google/disconnect', {}, {
        preserveScroll: true,
        onFinish: () => setDisconnecting(false),
      });
    }
  };

  const presetAvatars = [
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name || 'Alpha')}`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name || 'Beta')}`,
    `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(user.name || 'Gamma')}`,
    `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(user.name || 'Delta')}`,
  ];

  return (
    <AuthenticatedLayout>
      <Head title="Profile Saya - VIRA" />

      {/* Header Section */}
      <div className="mb-8 border-b-4 border-[#1C1A27] pb-6">
        <h1 className="text-4xl md:text-5xl font-headline-md font-black text-[#1C1A27] uppercase tracking-tight mb-2">
          PENGATURAN PROFIL
        </h1>
        <p className="text-base font-body-md text-[#454654] font-bold max-w-2xl">
          Kelola informasi identitas akun, foto profil avatar, nomor WhatsApp, serta keamanan password Anda.
        </p>
      </div>

      {/* Success Notification Alert */}
      {flash?.success && (
        <div className="mb-6 bg-[#4ADE80] text-[#1C1A27] border-4 border-[#1C1A27] neo-shadow p-4 flex items-center gap-3 font-label-mono text-sm uppercase font-black transform rotate-[-0.5deg]">
          <MaterialIcon name="check_circle" className="text-2xl text-[#166534]" />
          <span>{flash.success}</span>
        </div>
      )}

      {/* Error Notification Alert */}
      {flash?.error && (
        <div className="mb-6 bg-[#FFDAD6] text-[#93000A] border-4 border-[#1C1A27] neo-shadow p-4 flex items-center gap-3 font-label-mono text-sm uppercase font-black transform rotate-[-0.5deg]">
          <MaterialIcon name="error" className="text-2xl text-[#BA1A1A]" />
          <span>{flash.error}</span>
        </div>
      )}

      {/* Profile Header Summary Banner */}
      <NeoCard bg="bg-[#8B5CF6]" rotate="rotate-[0.5deg]" className="text-white p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 justify-between">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            {/* Avatar Container */}
            <div className="w-24 h-24 neo-border bg-white rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-[4px_4px_0px_0px_white]">
              <img
                src={profileForm.data.avatar_url || user.avatar_url}
                alt={user.name}
                className="w-full h-full object-cover bg-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap mb-1">
                <h2 className="text-3xl md:text-4xl font-headline-md font-black tracking-tight uppercase">
                  {user.name}
                </h2>
                <span className="bg-[#A7F3D0] text-[#166534] border-2 border-white px-2.5 py-0.5 font-label-mono text-xs font-black shadow-[2px_2px_0px_0px_white]">
                  PRO ACCOUNT
                </span>
              </div>
              <p className="font-label-mono text-sm opacity-90 font-bold">
                {user.email || user.phone_number || 'Pengguna VIRA'}
              </p>
              <p className="font-label-mono text-xs opacity-75 mt-1 font-bold">
                BERGABUNG SEJAK: {user.created_at_formatted}
              </p>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md border-3 border-white p-4 font-label-mono text-xs text-center uppercase font-bold shadow-[4px_4px_0px_0px_white]">
              <span className="block text-2xl font-number-xl font-bold">{stats.active_wallets_count || 0}</span>
              <span>WALLETS AKTIF</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border-3 border-white p-4 font-label-mono text-xs text-center uppercase font-bold shadow-[4px_4px_0px_0px_white]">
              <span className="block text-2xl font-number-xl font-bold">{stats.total_transactions_count || 0}</span>
              <span>TRANSAKSI</span>
            </div>
          </div>
        </div>
      </NeoCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT & CENTER COLUMN: Edit Profile Info */}
        <div className="lg:col-span-2 space-y-8">
          <NeoCard bg="bg-white" className="p-6 md:p-8 space-y-6">
            <div className="border-b-4 border-[#1C1A27] pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#3B4CCA] text-white neo-border flex items-center justify-center font-bold">
                  <MaterialIcon name="person" className="text-xl" />
                </div>
                <h3 className="text-2xl font-headline-md font-black text-[#1C1A27] uppercase">
                  INFORMASI PROFIL
                </h3>
              </div>
              <span className="font-label-mono text-xs bg-[#E7DEFF] border-2 border-[#1C1A27] px-2 py-0.5 font-bold">
                DATA AKTIF
              </span>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Preset Avatar Selection */}
              <div>
                <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
                  PILIH AVATAR PRESET ATALAU MASUKKAN URL
                </label>
                <div className="flex items-center gap-3 mb-3 overflow-x-auto pb-2">
                  {presetAvatars.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => profileForm.setData('avatar_url', url)}
                      className={`w-14 h-14 rounded-full border-3 border-[#1C1A27] overflow-hidden transition-all cursor-pointer ${
                        profileForm.data.avatar_url === url
                          ? 'ring-4 ring-[#8B5CF6] scale-105 shadow-[3px_3px_0px_0px_#1C1A27]'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt="Preset Avatar" className="w-full h-full object-cover bg-white" />
                    </button>
                  ))}
                </div>

                <NeoInput
                  label="URL FOTO AVATAR"
                  value={profileForm.data.avatar_url}
                  onChange={(e) => profileForm.setData('avatar_url', e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  error={profileForm.errors.avatar_url}
                />
              </div>

              {/* Nama Lengkap */}
              <NeoInput
                label="NAMA LENGKAP"
                value={profileForm.data.name}
                onChange={(e) => profileForm.setData('name', e.target.value)}
                placeholder="Masukkan nama lengkap Anda"
                error={profileForm.errors.name}
                required
              />

              {/* Email Address */}
              <NeoInput
                label="ALAMAT EMAIL"
                type="email"
                value={profileForm.data.email}
                onChange={(e) => profileForm.setData('email', e.target.value)}
                placeholder="contoh@domain.com"
                error={profileForm.errors.email}
              />

              {/* Phone Number / WhatsApp */}
              <NeoInput
                label="NOMOR WHATSAPP / TELEPON"
                type="text"
                value={profileForm.data.phone_number}
                onChange={(e) => profileForm.setData('phone_number', e.target.value)}
                placeholder="081234567890"
                error={profileForm.errors.phone_number}
              />

              <div className="pt-4 flex justify-end">
                <NeoButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={profileForm.processing}
                >
                  <MaterialIcon name="save" className="text-xl" />
                  {profileForm.processing ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
                </NeoButton>
              </div>
            </form>
          </NeoCard>

          {/* CHANGE PASSWORD CARD */}
          <NeoCard bg="bg-white" className="p-6 md:p-8 space-y-6">
            <div className="border-b-4 border-[#1C1A27] pb-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FFDAD6] text-[#93000A] neo-border flex items-center justify-center font-bold">
                <MaterialIcon name="lock" className="text-xl" />
              </div>
              <h3 className="text-2xl font-headline-md font-black text-[#1C1A27] uppercase">
                KEAMANAN & PASSWORD
              </h3>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <NeoInput
                label="PASSWORD SAAT INI"
                type="password"
                value={passwordForm.data.current_password}
                onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                placeholder="••••••••"
                error={passwordForm.errors.current_password}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <NeoInput
                  label="PASSWORD BARU"
                  type="password"
                  value={passwordForm.data.password}
                  onChange={(e) => passwordForm.setData('password', e.target.value)}
                  placeholder="••••••••"
                  error={passwordForm.errors.password}
                  required
                />

                <NeoInput
                  label="KONFIRMASI PASSWORD BARU"
                  type="password"
                  value={passwordForm.data.password_confirmation}
                  onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                  placeholder="••••••••"
                  error={passwordForm.errors.password_confirmation}
                  required
                />
              </div>

              <div className="pt-2 flex justify-end">
                <NeoButton
                  type="submit"
                  variant="secondary"
                  size="lg"
                  disabled={passwordForm.processing}
                >
                  <MaterialIcon name="security" className="text-xl" />
                  {passwordForm.processing ? 'MEMPROSES...' : 'UPDATE PASSWORD'}
                </NeoButton>
              </div>
            </form>
          </NeoCard>
        </div>

        {/* RIGHT COLUMN: Account Status & Settings Shortcuts */}
        <div className="space-y-6">
          {/* Account Status Badge Card */}
          <NeoCard bg="bg-[#F1EBFE]" className="p-6 space-y-5">
            <div className="flex items-center gap-2.5 border-b-3 border-[#1C1A27] pb-3">
              <div className="w-8 h-8 bg-[#3B4CCA] text-white neo-border flex items-center justify-center font-bold">
                <MaterialIcon name="verified_user" className="text-lg" />
              </div>
              <h4 className="font-headline-md text-lg font-black uppercase text-[#1C1A27]">
                STATUS AKUN & SISTEM
              </h4>
            </div>

            <div className="space-y-3 font-label-mono text-xs uppercase font-bold">
              <div className="flex justify-between items-center bg-white p-3 neo-border shadow-[2px_2px_0px_0px_#1C1A27]">
                <span className="text-[#454654]">STATUS SISTEM</span>
                <span className="text-[#166534] bg-[#DCFCE7] border-2 border-[#1C1A27] px-2 py-0.5">
                  AKTIF & ONLINE
                </span>
              </div>

              <div className="flex justify-between items-center bg-white p-3 neo-border shadow-[2px_2px_0px_0px_#1C1A27]">
                <span className="text-[#454654]">DATABASE ENGINE</span>
                <span className="text-[#8B5CF6]">MYSQL REALTIME</span>
              </div>
            </div>

            {/* Google Authentication Method Section */}
            <div className="bg-white border-3 border-[#1C1A27] p-4 space-y-3 shadow-[3px_3px_0px_0px_#1C1A27]">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-[#EA4335] text-white border-2 border-[#1C1A27] flex items-center justify-center font-headline-md font-black text-xs shadow-[1px_1px_0px_0px_#1C1A27] shrink-0">
                    G
                  </div>
                  <span className="font-headline-md text-xs sm:text-sm font-black text-[#1C1A27] uppercase">
                    METODE AUTH GOOGLE
                  </span>
                </div>

                {user.is_google_linked ? (
                  <span className="bg-[#DCFCE7] text-[#166534] border-2 border-[#1C1A27] px-2 py-0.5 font-label-mono text-[10px] font-black flex items-center gap-1 shadow-[1px_1px_0px_0px_#1C1A27] shrink-0">
                    <MaterialIcon name="check_circle" className="text-xs" />
                    TERHUBUNG
                  </span>
                ) : (
                  <span className="bg-[#FEF3C7] text-[#92400E] border-2 border-[#1C1A27] px-2 py-0.5 font-label-mono text-[10px] font-black flex items-center gap-1 shadow-[1px_1px_0px_0px_#1C1A27] shrink-0">
                    <MaterialIcon name="link_off" className="text-xs" />
                    BELUM TERHUBUNG
                  </span>
                )}
              </div>

              <p className="font-body-md text-xs text-[#454654] font-bold leading-relaxed">
                {user.is_google_linked
                  ? 'Akun Google Anda sudah terhubung dengan sistem. Anda dapat masuk ke aplikasi secara instan dengan One-Click Google Login.'
                  : 'Akun Anda saat ini didaftarkan secara manual. Hubungkan dengan akun Google Anda untuk login 1-klik yang lebih cepat dan aman.'}
              </p>

              {user.is_google_linked ? (
                <button
                  type="button"
                  onClick={handleDisconnectGoogle}
                  disabled={disconnecting}
                  className="w-full bg-[#FFDAD6] text-[#93000A] hover:bg-[#BA1A1A] hover:text-white border-2 border-[#1C1A27] py-2 px-3 font-label-mono text-xs font-black uppercase transition-all shadow-[2px_2px_0px_0px_#1C1A27] flex items-center justify-center gap-1.5 cursor-pointer active:translate-y-0.5 disabled:opacity-50"
                >
                  <MaterialIcon name="link_off" className="text-base" />
                  {disconnecting ? 'MEMUTUSKAN...' : 'PUTUSKAN SAMBUNGAN GOOGLE'}
                </button>
              ) : (
                <a
                  href="/auth/google"
                  className="w-full bg-[#4285F4] hover:bg-[#3367D6] text-white border-2 border-[#1C1A27] py-2.5 px-3 font-headline-md text-xs font-black uppercase transition-all shadow-[2px_2px_0px_0px_#1C1A27] flex items-center justify-center gap-2 cursor-pointer active:translate-y-0.5 text-center"
                >
                  <MaterialIcon name="login" className="text-base" />
                  HUBUNGKAN AKUN GOOGLE SEKARANG
                </a>
              )}
            </div>
          </NeoCard>

          {/* Shortcuts Card */}
          <NeoCard bg="bg-[#E7DEFF]" className="p-6 space-y-4">
            <h4 className="font-headline-md text-lg font-black uppercase text-[#1C1A27]">
              PENGATURAN TERHUBUNG
            </h4>

            <div className="space-y-3 font-label-mono text-xs uppercase font-bold">
              <a
                href="/settings/whatsapp"
                className="w-full bg-white text-[#1C1A27] neo-border p-3 flex items-center justify-between hover:bg-[#8B5CF6] hover:text-white transition-all shadow-[2px_2px_0px_0px_#1C1A27]"
              >
                <span className="flex items-center gap-2">
                  <MaterialIcon name="chat" className="text-lg" />
                  Koneksi Bot WhatsApp
                </span>
                <span>→</span>
              </a>

              <a
                href="/chat"
                className="w-full bg-white text-[#1C1A27] neo-border p-3 flex items-center justify-between hover:bg-[#8B5CF6] hover:text-white transition-all shadow-[2px_2px_0px_0px_#1C1A27]"
              >
                <span className="flex items-center gap-2">
                  <MaterialIcon name="smart_toy" className="text-lg" />
                  AI Model Engine
                </span>
                <span>→</span>
              </a>
            </div>
          </NeoCard>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

