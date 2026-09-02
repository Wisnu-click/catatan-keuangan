<?php

namespace App\Http\Controllers;

use App\Models\GoalContribution;
use App\Models\SavingReminder;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SavingReminderController extends Controller
{
    /**
     * Buat pengingat keuangan rutin baru
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'title'        => ['required', 'string', 'max:150'],
            'goal_id'      => ['nullable', 'exists:savings_goals,id'],
            'wallet_id'    => ['required', 'exists:wallets,id'],
            'category_id'  => ['nullable', 'exists:categories,id'],
            'amount'       => ['required', 'numeric', 'min:1000', 'max:9999999999999'],
            'type'         => ['nullable', 'in:saving,income,expense'],
            'frequency'    => ['required', 'in:daily,weekly,monthly'],
            'day_of_week'  => ['nullable', 'integer', 'between:0,6'],
            'day_of_month' => ['nullable', 'integer', 'between:1,31'],
            'is_active'    => ['nullable', 'boolean'],
        ], [
            'title.required'  => 'Nama pengingat wajib diisi.',
            'amount.required' => 'Nominal wajib diisi.',
            'amount.min'      => 'Minimal nominal Rp 1.000.',
            'amount.max'      => 'Nominal melebihi batas maksimal (Rp 9,99 Triliun).',
        ]);

        // Pastikan wallet milik user
        Wallet::where('id', $validated['wallet_id'])
            ->where('user_id', $user->id)
            ->firstOrFail();

        SavingReminder::create([
            'user_id'      => $user->id,
            'title'        => $validated['title'],
            'goal_id'      => $validated['goal_id'] ?? null,
            'wallet_id'    => $validated['wallet_id'],
            'category_id'  => $validated['category_id'] ?? null,
            'amount'       => $validated['amount'],
            'type'         => $validated['type'] ?? 'saving',
            'frequency'    => $validated['frequency'],
            'day_of_week'  => $validated['day_of_week'] ?? null,
            'day_of_month' => $validated['day_of_month'] ?? null,
            'is_active'    => $validated['is_active'] ?? true,
        ]);

        return redirect()->back()->with('success', 'Pengingat keuangan rutin berhasil dibuat!');
    }

    /**
     * Update pengingat keuangan rutin
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $reminder = SavingReminder::where('user_id', $user->id)->findOrFail($id);

        $validated = $request->validate([
            'title'        => ['required', 'string', 'max:150'],
            'goal_id'      => ['nullable', 'exists:savings_goals,id'],
            'wallet_id'    => ['required', 'exists:wallets,id'],
            'category_id'  => ['nullable', 'exists:categories,id'],
            'amount'       => ['required', 'numeric', 'min:1000', 'max:9999999999999'],
            'type'         => ['nullable', 'in:saving,income,expense'],
            'frequency'    => ['required', 'in:daily,weekly,monthly'],
            'day_of_week'  => ['nullable', 'integer', 'between:0,6'],
            'day_of_month' => ['nullable', 'integer', 'between:1,31'],
            'is_active'    => ['nullable', 'boolean'],
        ], [
            'amount.max' => 'Nominal melebihi batas maksimal (Rp 9,99 Triliun).',
        ]);

        // Pastikan wallet milik user
        Wallet::where('id', $validated['wallet_id'])
            ->where('user_id', $user->id)
            ->firstOrFail();

        $reminder->update([
            'title'        => $validated['title'],
            'goal_id'      => $validated['goal_id'] ?? null,
            'wallet_id'    => $validated['wallet_id'],
            'category_id'  => $validated['category_id'] ?? null,
            'amount'       => $validated['amount'],
            'type'         => $validated['type'] ?? $reminder->type,
            'frequency'    => $validated['frequency'],
            'day_of_week'  => $validated['day_of_week'] ?? null,
            'day_of_month' => $validated['day_of_month'] ?? null,
            'is_active'    => $validated['is_active'] ?? $reminder->is_active,
        ]);

        return redirect()->back()->with('success', 'Pengingat berhasil diperbarui!');
    }

    /**
     * Toggle status aktif/nonaktif
     */
    public function toggle($id)
    {
        $user = Auth::user();
        $reminder = SavingReminder::where('user_id', $user->id)->findOrFail($id);

        $reminder->update(['is_active' => !$reminder->is_active]);

        return redirect()->back()->with('success', $reminder->is_active ? 'Pengingat diaktifkan.' : 'Pengingat dinonaktifkan.');
    }

    /**
     * Hapus pengingat
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $reminder = SavingReminder::where('user_id', $user->id)->findOrFail($id);

        $reminder->delete();

        return redirect()->back()->with('success', 'Pengingat berhasil dihapus.');
    }

    /**
     * 1-Click Fast Deposit ke Goal (untuk tipe 'saving')
     */
    public function executeDeposit($id)
    {
        $user = Auth::user();
        $reminder = SavingReminder::where('user_id', $user->id)->findOrFail($id);

        if (!$reminder->goal_id) {
            return redirect()->back()->with('error', 'Tidak ada target tabungan yang terhubung.');
        }

        $goal = $reminder->goal;
        if (!$goal || $goal->user_id !== $user->id) {
            return redirect()->back()->with('error', 'Target tabungan tidak ditemukan.');
        }

        // Create contribution to the goal
        GoalContribution::create([
            'goal_id'           => $goal->id,
            'amount'            => $reminder->amount,
            'source'            => 'web',
            'description'       => "Nabung rutin: {$reminder->title}",
            'contribution_date' => now()->toDateString(),
        ]);

        // Auto-complete if target reached
        $currentAmount = (float) $goal->contributions()->sum('amount');
        if ($currentAmount >= (float) $goal->target_amount && $goal->status === 'active') {
            $goal->update(['status' => 'completed']);
        }

        $percentage = (float) $goal->target_amount > 0
            ? ($currentAmount / (float) $goal->target_amount) * 100
            : 0;

        \App\Services\NotificationService::notifyGoalProgress($user->id, $goal->name, $percentage);

        return redirect()->back()->with('success', 'Nabung berhasil! Rp ' . number_format($reminder->amount, 0, ',', '.') . ' telah ditambahkan ke target "' . $goal->name . '".');
    }

    /**
     * 1-Click Catat Transaksi ke Wallet (untuk tipe 'income' / 'expense')
     */
    public function executeTransaction($id)
    {
        $user = Auth::user();
        $reminder = SavingReminder::where('user_id', $user->id)->findOrFail($id);

        $type = $reminder->type ?? 'income';
        if ($type === 'saving') {
            return $this->executeDeposit($id);
        }

        $wallet = $reminder->wallet;
        if (!$wallet || $wallet->user_id !== $user->id) {
            return redirect()->back()->with('error', 'Wallet tidak ditemukan.');
        }

        // Create transaction
        Transaction::create([
            'user_id'          => $user->id,
            'wallet_id'        => $wallet->id,
            'category_id'      => $reminder->category_id,
            'type'             => $type, // 'income' or 'expense'
            'amount'           => $reminder->amount,
            'description'      => $reminder->title,
            'transaction_date' => now()->toDateString(),
        ]);

        $formatted = 'Rp ' . number_format($reminder->amount, 0, ',', '.');
        $label = $type === 'income' ? 'Pemasukan' : 'Pengeluaran';

        \App\Services\NotificationService::notifyTransaction($user->id, $type, $reminder->amount, $wallet->name, $wallet->id);

        return redirect()->back()->with('success', "{$label} berhasil dicatat! {$formatted} ke \"{$wallet->name}\".");
    }
}
