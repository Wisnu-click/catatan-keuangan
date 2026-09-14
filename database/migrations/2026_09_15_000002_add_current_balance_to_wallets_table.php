<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('wallets', 'current_balance')) {
            Schema::table('wallets', function (Blueprint $table) {
                $table->decimal('current_balance', 15, 2)->default(0)->after('initial_balance');
            });
        }

        // Sinkronisasi nilai current_balance awal berdasarkan initial_balance dan transaksi yang ada
        try {
            DB::statement("
                UPDATE wallets w
                LEFT JOIN (
                    SELECT 
                        wallet_id,
                        SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net_trx
                    FROM transactions
                    WHERE deleted_at IS NULL
                    GROUP BY wallet_id
                ) t ON w.id = t.wallet_id
                SET w.current_balance = w.initial_balance + COALESCE(t.net_trx, 0)
            ");
        } catch (\Exception $e) {
            // Fallback jika database belum ada transaksi
            DB::table('wallets')->update([
                'current_balance' => DB::raw('initial_balance')
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('wallets', 'current_balance')) {
            Schema::table('wallets', function (Blueprint $table) {
                $table->dropColumn('current_balance');
            });
        }
    }
};

