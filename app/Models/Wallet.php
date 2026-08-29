<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Wallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'type',
        'initial_balance',
        'icon',
        'color_hex',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'initial_balance' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    protected $appends = [
        'current_balance',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function transfersIn()
    {
        return $this->hasMany(Transfer::class, 'to_wallet_id');
    }

    public function transfersOut()
    {
        return $this->hasMany(Transfer::class, 'from_wallet_id');
    }

    /**
     * Hitung Saldo Real-Time (Initial Balance + Income - Expense + Transfers In - Transfers Out)
     */
    public function getCurrentBalanceAttribute(): float
    {
        $income = $this->transactions()->where('type', 'income')->sum('amount');
        $expense = $this->transactions()->where('type', 'expense')->sum('amount');
        $transfersIn = $this->transfersIn()->sum('amount');
        $transfersOut = $this->transfersOut()->sum('amount');

        return (float) ($this->initial_balance + $income - $expense + $transfersIn - $transfersOut);
    }
}
