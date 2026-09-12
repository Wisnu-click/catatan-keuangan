<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('wallets', function (Blueprint $table) {
            $table->boolean('is_dana_synced')->default(false)->after('is_active');
            $table->string('dana_phone_number', 30)->nullable()->after('is_dana_synced');
            $table->string('dana_account_name', 150)->nullable()->after('dana_phone_number');
            $table->string('dana_sync_mode', 50)->default('simulation')->after('dana_account_name');
            $table->text('dana_api_key')->nullable()->after('dana_sync_mode');
            $table->timestamp('dana_last_synced_at')->nullable()->after('dana_api_key');
            $table->string('dana_sync_status', 50)->default('idle')->after('dana_last_synced_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('wallets', function (Blueprint $table) {
            $table->dropColumn([
                'is_dana_synced',
                'dana_phone_number',
                'dana_account_name',
                'dana_sync_mode',
                'dana_api_key',
                'dana_last_synced_at',
                'dana_sync_status',
            ]);
        });
    }
};

