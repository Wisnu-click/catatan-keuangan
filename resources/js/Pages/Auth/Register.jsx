import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import NeoCard from '../../Components/NeoCard';
import NeoInput from '../../Components/NeoInput';
import NeoButton from '../../Components/NeoButton';
import MaterialIcon from '../../Components/MaterialIcon';

export default function Register() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    phone_number: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/register');
  };

  return (
    <div className="min-h-screen w-full bg-[#FDF8FF] bg-[radial-gradient(#C5C5D6_1px,transparent_1px)] [background-size:24px_24px] flex flex-col justify-center items-center p-6 selection:bg-[#3B4CCA] selection:text-white">
      <Head title="Create Account - VIRA" />

      {/* Brand Header */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block">
          <h1 className="text-4xl md:text-5xl font-headline-md font-black text-[#1C1A27] tracking-tighter uppercase">
            VIRA
          </h1>
          <p className="text-xs font-label-mono text-[#454654] uppercase tracking-widest mt-1 font-bold">
            VIRTUAL INCOME & RECORD ASSISTANT
          </p>
        </Link>
      </div>

      {/* Register Card */}
      <NeoCard
        bg="bg-[#F1EBFE]"
        rotate="rotate-[0.5deg]"
        className="w-full max-w-md p-8 md:p-10 space-y-6"
      >
        <div className="border-b-4 border-[#1C1A27] pb-4">
          <h2 className="text-3xl font-display-xl font-black text-[#1C1A27] uppercase tracking-tight">
            BUAT AKUN BARU
          </h2>
          <p className="text-sm font-body-md text-[#454654] mt-1 font-bold">
            Mulai kelola keuangan multi-wallet & WhatsApp Bot Anda.
          </p>
        </div>

        {/* Google OAuth Login / Register Button */}
        <a
          href="/auth/google"
          className="w-full bg-white text-[#1C1A27] neo-border neo-shadow neo-shadow-hover py-3 px-4 font-label-mono text-xs uppercase font-bold flex items-center justify-center gap-3 cursor-pointer transition-all border-4 border-[#1C1A27]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          DAFTAR DENGAN GOOGLE
        </a>

        <div className="flex items-center gap-3 text-center my-2">
          <div className="h-1 bg-[#1C1A27] flex-1" />
          <span className="font-label-mono text-xs font-bold uppercase text-[#454654]">ATAU DAFTAR FORM</span>
          <div className="h-1 bg-[#1C1A27] flex-1" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div className="space-y-1">
            <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
              NAMA LENGKAP
            </label>
            <NeoInput
              type="text"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              placeholder="Misal: Wisnu Wardhana"
              required
              icon="person"
            />
            {errors.name && (
              <p className="text-[#93000A] font-label-mono text-xs font-bold">{errors.name}</p>
            )}
          </div>

          {/* WhatsApp Phone Input */}
          <div className="space-y-1">
            <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
              NOMOR WHATSAPP (BOT INTEGRATION)
            </label>
            <NeoInput
              type="text"
              value={data.phone_number}
              onChange={(e) => setData('phone_number', e.target.value)}
              placeholder="081234567890"
              required
              icon="call"
            />
            {errors.phone_number && (
              <p className="text-[#93000A] font-label-mono text-xs font-bold">{errors.phone_number}</p>
            )}
          </div>

          {/* Email Input */}
          <div className="space-y-1">
            <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
              ALAMAT EMAIL
            </label>
            <NeoInput
              type="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              placeholder="wisnu@example.com"
              required
              icon="mail"
            />
            {errors.email && (
              <p className="text-[#93000A] font-label-mono text-xs font-bold">{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
              PASSWORD
            </label>
            <NeoInput
              type="password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              placeholder="Minimal 8 Karakter"
              required
              icon="lock"
            />
            {errors.password && (
              <p className="text-[#93000A] font-label-mono text-xs font-bold">{errors.password}</p>
            )}
          </div>

          {/* Password Confirmation */}
          <div className="space-y-1">
            <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
              KONFIRMASI PASSWORD
            </label>
            <NeoInput
              type="password"
              value={data.password_confirmation}
              onChange={(e) => setData('password_confirmation', e.target.value)}
              placeholder="Ulangi Password"
              required
              icon="lock"
            />
          </div>

          {/* Submit Button */}
          <NeoButton
            type="submit"
            variant="primary"
            size="xl"
            disabled={processing}
            className="w-full mt-4"
          >
            <MaterialIcon name="person_add" className="text-2xl" />
            {processing ? 'MEMPROSES...' : 'BUAT AKUN SEKARANG'}
          </NeoButton>
        </form>

        {/* Login Footer Link */}
        <div className="pt-4 border-t-4 border-[#1C1A27] text-center">
          <p className="font-body-md text-sm text-[#454654] font-bold">
            Sudah punya akun?{' '}
            <Link
              href="/login"
              className="font-label-mono text-xs uppercase text-[#8B5CF6] hover:underline underline-offset-4 ml-1 font-bold"
            >
              MASUK DI SINI
            </Link>
          </p>
        </div>
      </NeoCard>
    </div>
  );
}

