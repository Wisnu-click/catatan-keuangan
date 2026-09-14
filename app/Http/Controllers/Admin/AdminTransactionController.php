<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminTransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim($request->input('search', ''));
        $type = $request->input('type', 'all');
        $userId = $request->input('user_id', 'all');
        $startDate = $request->input('start_date', '');
        $endDate = $request->input('end_date', '');

        $query = Transaction::with(['user', 'wallet', 'category']);

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhereHas('user', fn ($uq) => $uq->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"))
                  ->orWhereHas('category', fn ($cq) => $cq->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('wallet', fn ($wq) => $wq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($type !== 'all' && in_array($type, ['income', 'expense'])) {
            $query->where('type', $type);
        }

        if ($userId !== 'all' && is_numeric($userId)) {
            $query->where('user_id', (int) $userId);
        }

        if (!empty($startDate)) {
            $query->whereDate('transaction_date', '>=', $startDate);
        }

        if (!empty($endDate)) {
            $query->whereDate('transaction_date', '<=', $endDate);
        }

        $transactions = $query->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(20)
            ->withQueryString();

        $formatted = $transactions->through(fn ($t) => [
            'id' => $t->id,
            'user_id' => $t->user_id,
            'user_name' => $t->user->name ?? 'User #' . $t->user_id,
            'user_email' => $t->user->email ?? '-',
            'type' => $t->type,
            'amount' => (float) $t->amount,
            'amount_formatted' => 'Rp ' . number_format($t->amount, 0, ',', '.'),
            'category' => $t->category->name ?? 'Umum',
            'wallet' => $t->wallet->name ?? 'Dompet',
            'description' => $t->description ?: '-',
            'source' => $t->source ?: 'manual',
            'date' => $t->transaction_date ? $t->transaction_date->format('d M Y') : $t->created_at->format('d M Y'),
            'created_at' => $t->created_at ? $t->created_at->format('d M Y H:i') : '-',
        ]);

        $allUsers = User::orderBy('name')->get(['id', 'name', 'email']);

        return Inertia::render('Admin/Transactions/Index', [
            'transactions' => $formatted,
            'users' => $allUsers,
            'filters' => [
                'search' => $search,
                'type' => $type,
                'user_id' => $userId,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'summary' => [
                'total_count' => Transaction::count(),
                'total_income' => (float) Transaction::where('type', 'income')->sum('amount'),
                'total_income_formatted' => 'Rp ' . number_format((float) Transaction::where('type', 'income')->sum('amount'), 0, ',', '.'),
                'total_expense' => (float) Transaction::where('type', 'expense')->sum('amount'),
                'total_expense_formatted' => 'Rp ' . number_format((float) Transaction::where('type', 'expense')->sum('amount'), 0, ',', '.'),
            ],
        ]);
    }

    public function destroy(Transaction $transaction)
    {
        $id = $transaction->id;
        $transaction->delete();

        return redirect()->back()->with('success', "Transaksi #{$id} berhasil dihapus dari sistem.");
    }
}

