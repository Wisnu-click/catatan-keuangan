<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AIIntentLog extends Model
{
    use HasFactory;

    protected $table = 'ai_intent_logs';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'raw_message',
        'detected_intent',
        'extracted_entities',
        'confidence_score',
        'was_confirmed',
        'related_transaction_id',
    ];

    protected $casts = [
        'extracted_entities' => 'array',
        'confidence_score' => 'float',
        'was_confirmed' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function relatedTransaction()
    {
        return $this->belongsTo(Transaction::class, 'related_transaction_id');
    }
}

