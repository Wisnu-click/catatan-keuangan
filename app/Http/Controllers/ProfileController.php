<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Tampilkan Halaman Profile Pengguna
     */
    public function show(): Response
    {
        $user = Auth::user();

        $activeWalletsCount = Wallet::where('user_id', $user->id)
            ->where('is_active', true)
            ->count();

        $totalTransactionsCount = Transaction::where('user_id', $user->id)->count();

        return Inertia::render('Profile/Index', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'avatar_url' => $user->avatar_url ?: 'https://api.dicebear.com/7.x/bottts/svg?seed=' . urlencode($user->name),
                'is_active' => $user->is_active,
                'created_at_formatted' => $user->created_at ? $user->created_at->translatedFormat('d F Y') : 'Baru Bergabung',
            ],
            'stats' => [
                'active_wallets_count' => $activeWalletsCount,
                'total_transactions_count' => $totalTransactionsCount,
            ],
        ]);
    }

    /**
     * Update Informasi Profil (Nama, Email, Nomor Telepon, Avatar)
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone_number' => ['nullable', 'string', 'max:20', Rule::unique('users')->ignore($user->id)],
            'avatar_url' => ['nullable', 'string', 'max:1000'],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah digunakan oleh akun lain.',
            'phone_number.unique' => 'Nomor WhatsApp/HP ini sudah digunakan oleh akun lain.',
        ]);

        $user->update($validated);

        return redirect()->back()->with('success', 'Profil Anda berhasil diperbarui!');
    }

    /**
     * Update Password Akun Pengguna
     */
    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ], [
            'current_password.required' => 'Masukkan password Anda saat ini.',
            'current_password.current_password' => 'Password saat ini tidak sesuai.',
            'password.required' => 'Password baru wajib diisi.',
            'password.confirmed' => 'Konfirmasi password baru tidak cocok.',
        ]);

        $user = Auth::user();
        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->back()->with('success', 'Password Anda berhasil diperbarui!');
    }
}

