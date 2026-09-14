<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Wallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'wallet_group_id',
        'parent_wallet_id',
        'name',
        'type',
        'initial_balance',
        'current_balance',
        'icon',
        'color_hex',
        'is_active',
        'is_dana_synced',
        'dana_phone_number',
        'dana_account_name',
        'dana_sync_mode',
        'dana_api_key',
        'dana_last_synced_at',
        'dana_sync_status',
        'display_order',
    ];

    protected $casts = [
        'initial_balance' => 'decimal:2',
        'current_balance' => 'decimal:2',
        'is_active' => 'boolean',
        'is_dana_synced' => 'boolean',
        'dana_last_synced_at' => 'datetime',
    ];

    protected $appends = [
        'current_balance',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function walletGroup()
    {
        return $this->belongsTo(WalletGroup::class);
    }

    public function parentWallet()
    {
        return $this->belongsTo(self::class, 'parent_wallet_id');
    }

    public function childWallets()
    {
        return $this->hasMany(self::class, 'parent_wallet_id')->orderBy('display_order');
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

    public function getCurrentBalanceAttribute(): float
    {
        $income = $this->transactions()->where('type', 'income')->sum('amount');
        $expense = $this->transactions()->where('type', 'expense')->sum('amount');
        $transfersIn = $this->transfersIn()->sum('amount');
        $transfersOut = $this->transfersOut()->sum('amount');

        $ownBalance = (float) ($this->initial_balance + $income - $expense + $transfersIn - $transfersOut);
        $childrenBalance = $this->childWallets()->get()->sum(fn (self $child) => $child->current_balance);

        return $ownBalance + $childrenBalance;
    }
}