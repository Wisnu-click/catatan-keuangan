<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GoldTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'wallet_id',
        'transaction_id',
        'type',
        'weight_grams',
        'price_per_gram',
        'total_amount',
        'fee',
        'brand',
        'purity',
        'notes',
        'transaction_date',
    ];

    protected $casts = [
        'weight_grams' => 'decimal:4',
        'price_per_gram' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'fee' => 'decimal:2',
        'transaction_date' => 'date',
    ];

    /* ---- Relations ---- */

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    /* ---- Scopes ---- */

    public function scopeBuys($query)
    {
        return $query->where('type', 'buy');
    }

    public function scopeSells($query)
    {
        return $query->where('type', 'sell');
    }

    /* ---- Accessors ---- */

    public function getFormattedWeightAttribute(): string
    {
        return number_format((float) $this->weight_grams, 4, ',', '.') . ' gr';
    }

    public function getFormattedTotalAttribute(): string
    {
        return 'Rp ' . number_format((float) $this->total_amount, 0, ',', '.');
    }

    public function getFormattedPricePerGramAttribute(): string
    {
        return 'Rp ' . number_format((float) $this->price_per_gram, 0, ',', '.');
    }
}

