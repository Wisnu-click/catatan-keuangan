<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    /**
     * Tampilkan Halaman Login
     */
    public function showLogin(): Response|\Illuminate\Http\RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->intended('/dashboard');
        }

        return Inertia::render('Auth/Login');
    }

    /**
     * Tampilkan Halaman Register
     */
    public function showRegister(): Response|\Illuminate\Http\RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->intended('/dashboard');
        }

        return Inertia::render('Auth/Register');
    }

    /**
     * Proses Login Dinamis (Bisa pakai Email ATAU Nomor WhatsApp)
     */
    public function login(Request $request)
    {
        $request->validate([
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
        ], [
            'login.required' => 'Email atau Nomor WhatsApp wajib diisi.',
            'password.required' => 'Password wajib diisi.',
        ]);

        $loginInput = trim($request->input('login'));
        $password = $request->input('password');
        $remember = $request->boolean('remember');

        // Try email first
        $emailCredentials = [
            'email' => $loginInput,
            'password' => $password,
            'is_active' => true,
        ];
        if (Auth::attempt($emailCredentials, $remember)) {
            $request->session()->regenerate();
            return redirect()->intended('/dashboard');
        }

        // Then try phone number
        $phoneCredentials = [
            'phone_number' => $loginInput,
            'password' => $password,
            'is_active' => true,
        ];
        if (Auth::attempt($phoneCredentials, $remember)) {
            $request->session()->regenerate();
            return redirect()->intended('/dashboard');
        }

        // If both attempts fail, return validation error
        throw ValidationException::withMessages([
            'login' => 'Kombinasi email/nomor WhatsApp dan password tidak cocok.',
        ]);
    }

    /**
     * Proses Pendaftaran Akun Baru
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'phone_number' => ['required', 'string', 'max:20', 'unique:users,phone_number'],
            'email' => ['required', 'string', 'email', 'max:150', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'phone_number.required' => 'Nomor WhatsApp wajib diisi.',
            'phone_number.unique' => 'Nomor WhatsApp sudah terdaftar.',
            'email.required' => 'Email wajib diisi.',
            'email.unique' => 'Alamat email sudah terdaftar.',
            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Password minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'phone_number' => $validated['phone_number'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'is_active' => true,
        ]);

        // Create default initial wallet for newly registered user
        Wallet::create([
            'user_id' => $user->id,
            'name' => 'Dompet Utama',
            'type' => 'personal',
            'initial_balance' => 0,
            'icon' => 'account_balance_wallet',
            'color_hex' => '#C4B5FD',
            'is_active' => true,
            'display_order' => 1,
        ]);

        Auth::login($user);

        return redirect('/dashboard')->with('success', 'Selamat datang! Akun berhasil dibuat.');
    }

    /**
     * Redirect ke Google OAuth Login
     */
    public function redirectToGoogle()
    {
        if (!config('services.google.client_id')) {
            return redirect('/login')->with('error', 'Google Client ID belum dikonfigurasi.');
        }

        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle Google OAuth Callback
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            // Coba ambil user Google secara reguler, fallback ke stateless() jika session state hilang
            try {
                $googleUser = Socialite::driver('google')->user();
            } catch (\Exception $stateException) {
                $googleUser = Socialite::driver('google')->stateless()->user();
            }

            if (!$googleUser || !$googleUser->getEmail()) {
                return redirect('/login')->with('error', 'Tidak dapat mengambil data email dari Google.');
            }

            $user = User::where('email', $googleUser->getEmail())->first();

            if (!$user) {
                // Register user baru dari akun Google
                $user = User::create([
                    'name' => $googleUser->getName() ?: ($googleUser->getNickname() ?: 'Google User'),
                    'email' => $googleUser->getEmail(),
                    'phone_number' => '08' . rand(100000000, 999999999),
                    'avatar_url' => $googleUser->getAvatar(),
                    'password' => Hash::make(Str::random(24)),
                    'is_active' => true,
                ]);

                // Buat dompet awal
                Wallet::create([
                    'user_id' => $user->id,
                    'name' => 'Dompet Utama',
                    'type' => 'personal',
                    'initial_balance' => 0,
                    'icon' => 'account_balance_wallet',
                    'color_hex' => '#C4B5FD',
                    'is_active' => true,
                    'display_order' => 1,
                ]);
            } else if ($googleUser->getAvatar() && !$user->avatar_url) {
                $user->update(['avatar_url' => $googleUser->getAvatar()]);
            }

            Auth::login($user, true);
            $request->session()->regenerate();
            $request->session()->forget('url.intended');

            return redirect('/dashboard')->with('success', 'Berhasil masuk dengan Google!');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Google OAuth Error: ' . $e->getMessage());
            return redirect('/login')->with('error', 'Gagal login via Google: ' . $e->getMessage());
        }
    }

    /**
     * Proses Logout
     */
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }
}
