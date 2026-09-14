<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminWalletController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim($request->input('search', ''));
        $userId = $request->input('user_id', 'all');

        $query = Wallet::with('user')->withCount('transactions');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('type', 'like', "%{$search}%")
                  ->orWhereHas('user', fn ($uq) => $uq->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
            });
        }

        if ($userId !== 'all' && is_numeric($userId)) {
            $query->where('user_id', (int) $userId);
        }

        $wallets = $query->orderBy('id', 'desc')->paginate(15)->withQueryString();

        $formatted = $wallets->through(fn ($w) => [
            'id' => $w->id,
            'name' => $w->name,
            'type' => $w->type ?: 'general',
            'user_name' => $w->user->name ?? 'User #' . $w->user_id,
            'user_email' => $w->user->email ?? '-',
            'current_balance' => (float) $w->current_balance,
            'current_balance_formatted' => 'Rp ' . number_format((float) $w->current_balance, 0, ',', '.'),
            'color_hex' => $w->color_hex ?: '#8B5CF6',
            'icon' => $w->icon ?: 'account_balance_wallet',
            'is_active' => (bool) $w->is_active,
            'transactions_count' => $w->transactions_count ?? 0,
            'created_at' => $w->created_at ? $w->created_at->format('d M Y') : '-',
        ]);

        $allUsers = User::orderBy('name')->get(['id', 'name', 'email']);
        $totalBalance = (float) Wallet::whereNull('parent_wallet_id')->get()->sum(fn ($w) => (float) $w->current_balance);

        return Inertia::render('Admin/Wallets/Index', [
            'wallets' => $formatted,
            'users' => $allUsers,
            'filters' => [
                'search' => $search,
                'user_id' => $userId,
            ],
            'summary' => [
                'total_wallets' => Wallet::count(),
                'total_balance' => $totalBalance,
                'total_balance_formatted' => 'Rp ' . number_format($totalBalance, 0, ',', '.'),
                'active_wallets' => Wallet::where('is_active', true)->count(),
            ],
        ]);
    }
}

