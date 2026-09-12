<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WalletGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'icon',
        'color_hex',
        'display_order',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function wallets()
    {
        return $this->hasMany(Wallet::class);
    }
}