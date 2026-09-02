<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function create(Request $request): Response
    {
        $user = Auth::user();

        $wallets = Wallet::where('user_id', $user->id)
            ->where('is_active', true)
            ->get()
            ->map(fn ($w) => [
                'id' => $w->id,
                'name' => $w->name,
                'balance' => 'Rp ' . number_format($w->current_balance, 0, ',', '.'),
            ]);

        $categories = Category::where('user_id', $user->id)
            ->where('is_active', true)
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'type' => $c->type,
                'icon' => $c->icon,
            ]);

        $firstWalletId = $wallets->first()['id'] ?? null;

        return Inertia::render('Transactions/Create', [
            'wallets' => $wallets,
            'categories' => $categories,
            'selectedWalletId' => $request->query('wallet_id', $firstWalletId),
            'selectedType' => $request->query('type', 'expense'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'wallet_id' => ['required', 'exists:wallets,id'],
            'type' => ['required', 'in:income,expense'],
            'amount' => ['required', 'numeric', 'min:0.01', 'max:9999999999999'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'description' => ['nullable', 'string', 'max:255'],
            'transaction_date' => ['required', 'date'],
        ], [
            'wallet_id.required' => 'Pilih wallet terlebih dahulu.',
            'amount.required' => 'Nominal transaksi wajib diisi.',
            'amount.min' => 'Nominal transaksi minimal Rp 0.01',
            'amount.max' => 'Nominal transaksi melebihi batas maksimal (Rp 9,99 Triliun).',
        ]);

        $user = Auth::user();

        // Check ownership
        $wallet = Wallet::where('user_id', $user->id)->findOrFail($validated['wallet_id']);

        Transaction::create([
            'user_id' => $user->id,
            'wallet_id' => $wallet->id,
            'category_id' => $validated['category_id'] ?? null,
            'type' => $validated['type'],
            'amount' => $validated['amount'],
            'description' => $validated['description'] ?? null,
            'source' => 'web',
            'transaction_date' => $validated['transaction_date'],
        ]);

        return redirect()->route('wallets.show', $wallet->id)->with('success', 'Transaksi berhasil dicatat!');
    }

    /**
     * UPDATE: Perbarui data transaksi
     */
    public function update(Request $request, Transaction $transaction)
    {
        $user = Auth::user();

        if ($transaction->user_id !== $user->id) {
            abort(403, 'Akses ditolak.');
        }

        $validated = $request->validate([
            'wallet_id' => ['required', 'exists:wallets,id'],
            'type' => ['required', 'in:income,expense'],
            'amount' => ['required', 'numeric', 'min:0.01', 'max:9999999999999'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'description' => ['nullable', 'string', 'max:255'],
            'transaction_date' => ['required', 'date'],
        ], [
            'wallet_id.required' => 'Pilih wallet terlebih dahulu.',
            'amount.required' => 'Nominal transaksi wajib diisi.',
            'amount.min' => 'Nominal transaksi minimal Rp 0.01',
            'amount.max' => 'Nominal transaksi melebihi batas maksimal (Rp 9,99 Triliun).',
            'transaction_date.required' => 'Tanggal transaksi wajib diisi.',
        ]);

        // Pastikan wallet milik user yang sedang login
        Wallet::where('user_id', $user->id)->findOrFail($validated['wallet_id']);

        $transaction->update([
            'wallet_id' => $validated['wallet_id'],
            'category_id' => $validated['category_id'] ?? null,
            'type' => $validated['type'],
            'amount' => $validated['amount'],
            'description' => $validated['description'] ?? null,
            'transaction_date' => $validated['transaction_date'],
        ]);

        return redirect()->back()->with('success', 'Transaksi berhasil diperbarui!');
    }

    /**
     * DELETE: Hapus transaksi
     */
    public function destroy(Transaction $transaction)
    {
        $user = Auth::user();

        if ($transaction->user_id !== $user->id) {
            abort(403, 'Akses ditolak.');
        }

        $transaction->delete();

        return redirect()->back()->with('success', 'Transaksi berhasil dihapus!');
    }
}
