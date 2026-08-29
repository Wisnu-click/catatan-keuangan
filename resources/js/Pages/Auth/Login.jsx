import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import NeoCard from '../../Components/NeoCard';
import NeoInput from '../../Components/NeoInput';
import NeoButton from '../../Components/NeoButton';
import MaterialIcon from '../../Components/MaterialIcon';

export default function Login() {
  const { data, setData, post, processing, errors } = useForm({
    login: '',
    password: '',
    remember: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/login');
  };

  const handleDemoLogin = (email) => {
    setData({
      login: email,
      password: 'password',
      remember: true,
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#FDF8FF] bg-[radial-gradient(#C5C5D6_1px,transparent_1px)] [background-size:24px_24px] flex flex-col justify-center items-center p-6 selection:bg-[#3B4CCA] selection:text-white">
      <Head title="Sign In - RAW LOGIC" />

      {/* Brand Header */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block">
          <h1 className="text-4xl md:text-5xl font-headline-md font-black text-[#1C1A27] tracking-tighter uppercase">
            RAW LOGIC
          </h1>
          <p className="text-xs font-label-mono text-[#454654] uppercase tracking-widest mt-1 font-bold">
            FINANCIAL CORE
          </p>
        </Link>
      </div>

      {/* Login Card */}
      <NeoCard
        bg="bg-[#F1EBFE]"
        rotate="rotate-[-0.5deg]"
        className="w-full max-w-md p-8 md:p-10 space-y-6"
      >
        <div className="border-b-4 border-[#1C1A27] pb-4">
          <h2 className="text-3xl font-display-xl font-black text-[#1C1A27] uppercase tracking-tight">
            MASUK AKUN
          </h2>
          <p className="text-sm font-body-md text-[#454654] mt-1 font-bold">
            Akses dashboard keuangan Anda dengan presisi.
          </p>
        </div>

        {/* Global Error Banner */}
        {errors.login && (
          <div className="bg-[#FFDAD6] border-4 border-[#1C1A27] p-3 text-[#93000A] font-label-mono text-xs font-bold neo-shadow-sm flex items-center gap-2">
            <MaterialIcon name="error" className="text-xl shrink-0" />
            <span>{errors.login}</span>
          </div>
        )}

        {/* Google OAuth Login Button */}
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
          MASUK DENGAN GOOGLE
        </a>

        <div className="flex items-center gap-3 text-center my-2">
          <div className="h-1 bg-[#1C1A27] flex-1" />
          <span className="font-label-mono text-xs font-bold uppercase text-[#454654]">ATAU MASUK MANUAL</span>
          <div className="h-1 bg-[#1C1A27] flex-1" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email / Phone Input */}
          <div className="space-y-2">
            <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
              EMAIL ATAU NOMOR WA
            </label>
            <NeoInput
              type="text"
              value={data.login}
              onChange={(e) => setData('login', e.target.value)}
              placeholder="alex@rawlogic.io atau 081234567890"
              required
              icon="person"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
                PASSWORD
              </label>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Fitur Reset Password akan dikirim via WhatsApp bot.');
                }}
                className="font-label-mono text-xs uppercase text-[#3B4CCA] hover:underline underline-offset-4 font-bold"
              >
                LUPA PASSWORD?
              </a>
            </div>
            <NeoInput
              type="password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              placeholder="••••••••••••"
              required
              icon="lock"
            />
            {errors.password && (
              <p className="text-[#93000A] font-label-mono text-xs font-bold mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center gap-3 pt-1">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={data.remember}
                onChange={(e) => setData('remember', e.target.checked)}
                className="w-6 h-6 neo-border bg-white text-[#3B4CCA] focus:ring-0 focus:outline-none cursor-pointer rounded-none"
              />
              <span className="font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
                INGAT SAYA DI PERANGKAT INI
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <NeoButton
            type="submit"
            variant="primary"
            size="xl"
            disabled={processing}
            className="w-full mt-4"
          >
            <MaterialIcon name="login" className="text-2xl" />
            {processing ? 'MEMPROSES...' : 'MASUK SEKARANG'}
          </NeoButton>
        </form>

        {/* Demo Account Quick Access */}
        <div className="bg-[#E7DEFF] border-4 border-[#1C1A27] p-3 text-center space-y-2">
          <p className="font-label-mono text-xs uppercase font-bold text-[#1C1A27]">
            AKUN DEMO CEPAT (1-CLICK)
          </p>
          <button
            type="button"
            onClick={() => handleDemoLogin('wisnu@click')}
            className="w-full neo-border bg-white py-1.5 px-3 font-label-mono text-xs uppercase hover:bg-[#8B5CF6] hover:text-white transition-all font-bold cursor-pointer"
          >
            Isi Demo: wisnu@click
          </button>
        </div>

        {/* Register Footer */}
        <div className="pt-4 border-t-4 border-[#1C1A27] text-center">
          <p className="font-body-md text-sm text-[#454654] font-bold">
            Belum punya akun?{' '}
            <Link
              href="/register"
              className="font-label-mono text-xs uppercase text-[#8B5CF6] hover:underline underline-offset-4 ml-1 font-bold"
            >
              DAFTAR SEKARANG
            </Link>
          </p>
        </div>
      </NeoCard>
    </div>
  );
}
