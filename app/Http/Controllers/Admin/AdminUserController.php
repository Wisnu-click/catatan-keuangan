<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim($request->input('search', ''));
        $role = $request->input('role', 'all');
        $status = $request->input('status', 'all');

        $query = User::withCount(['wallets', 'transactions']);

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone_number', 'like', "%{$search}%");
            });
        }

        if ($role !== 'all' && in_array($role, ['admin', 'pengguna'])) {
            $query->where('role', $role);
        }

        if ($status !== 'all') {
            $isActive = $status === 'active';
            $query->where('is_active', $isActive);
        }

        $users = $query->orderBy('id', 'desc')->paginate(15)->withQueryString();

        $formattedUsers = $users->through(fn ($u) => [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'role' => $u->role ?? 'pengguna',
            'phone_number' => $u->phone_number,
            'avatar_url' => $u->avatar_url ?: 'https://api.dicebear.com/7.x/bottts/svg?seed=' . urlencode($u->name),
            'is_active' => (bool) $u->is_active,
            'is_google_linked' => !empty($u->google_id),
            'wallets_count' => $u->wallets_count ?? 0,
            'transactions_count' => $u->transactions_count ?? 0,
            'created_at' => $u->created_at ? $u->created_at->format('d M Y') : '-',
            'is_self' => $u->id === Auth::id(),
        ]);

        return Inertia::render('Admin/Users/Index', [
            'users' => $formattedUsers,
            'filters' => [
                'search' => $search,
                'role' => $role,
                'status' => $status,
            ],
            'summary' => [
                'total' => User::count(),
                'admins' => User::where('role', 'admin')->count(),
                'pengguna' => User::where('role', '!=', 'admin')->orWhereNull('role')->count(),
                'active' => User::where('is_active', true)->count(),
                'inactive' => User::where('is_active', false)->count(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'string', 'email', 'max:150', 'unique:users,email'],
            'phone_number' => ['required', 'string', 'max:20', 'unique:users,phone_number'],
            'role' => ['required', 'string', Rule::in(['admin', 'pengguna'])],
            'password' => ['required', 'string', 'min:6'],
            'is_active' => ['boolean'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'],
            'role' => $validated['role'],
            'password' => Hash::make($validated['password']),
            'is_active' => $request->boolean('is_active', true),
        ]);

        // Buat wallet default untuk user baru
        $user->wallets()->create([
            'name' => 'Dompet Utama',
            'type' => 'personal',
            'color_hex' => '#8B5CF6',
            'icon' => 'account_balance_wallet',
            'initial_balance' => 0,
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', "Pengguna baru {$user->name} ({$user->role}) berhasil ditambahkan.");
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'string', 'email', 'max:150', Rule::unique('users', 'email')->ignore($user->id)],
            'phone_number' => ['required', 'string', 'max:20', Rule::unique('users', 'phone_number')->ignore($user->id)],
            'role' => ['required', 'string', Rule::in(['admin', 'pengguna'])],
            'is_active' => ['boolean'],
        ]);

        // Cegah admin mengubah role diri sendiri menjadi non-admin jika satu-satunya admin
        if ($user->id === Auth::id() && $validated['role'] !== 'admin') {
            $adminCount = User::where('role', 'admin')->count();
            if ($adminCount <= 1) {
                return redirect()->back()->with('error', 'Gagal: Anda adalah satu-satunya admin. Buat admin lain terlebih dahulu.');
            }
        }

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'],
            'role' => $validated['role'],
            'is_active' => $request->boolean('is_active', $user->is_active),
        ]);

        return redirect()->back()->with('success', "Data pengguna {$user->name} berhasil diperbarui.");
    }

    public function toggleActive(User $user)
    {
        if ($user->id === Auth::id()) {
            return redirect()->back()->with('error', 'Anda tidak dapat menonaktifkan akun Anda sendiri.');
        }

        $user->is_active = !$user->is_active;
        $user->save();

        $statusText = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';
        return redirect()->back()->with('success', "Akun {$user->name} berhasil {$statusText}.");
    }

    public function resetPassword(Request $request, User $user)
    {
        $request->validate([
            'new_password' => ['required', 'string', 'min:6'],
        ]);

        $user->password = Hash::make($request->input('new_password'));
        $user->save();

        return redirect()->back()->with('success', "Password untuk {$user->name} berhasil direset.");
    }

    public function destroy(User $user)
    {
        if ($user->id === Auth::id()) {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        $userName = $user->name;
        $user->delete();

        return redirect()->back()->with('success', "Pengguna {$userName} dan seluruh datanya berhasil dihapus dari sistem.");
    }
}

