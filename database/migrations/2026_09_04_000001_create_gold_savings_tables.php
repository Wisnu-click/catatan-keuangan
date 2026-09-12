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
        // 1. Gold Transactions (Beli & Jual Emas)
        Schema::create('gold_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('wallet_id')->nullable()->constrained('wallets')->nullOnDelete();
            $table->foreignId('transaction_id')->nullable()->constrained('transactions')->nullOnDelete();
            $table->enum('type', ['buy', 'sell'])->default('buy');
            $table->decimal('weight_grams', 10, 4); // Misal 1.5000 gr, 0.2500 gr
            $table->decimal('price_per_gram', 15, 2); // Harga beli/jual per gram saat transaksi
            $table->decimal('total_amount', 15, 2); // weight_grams * price_per_gram (+/- fee)
            $table->decimal('fee', 15, 2)->default(0); // Biaya cetak/admin jika ada
            $table->string('brand', 50)->nullable(); // Antam, UBS, Galeri 24, Pegadaian, Emas Digital, dll
            $table->string('purity', 10)->default('24K'); // 24K, 22K, 18K
            $table->string('notes', 255)->nullable();
            $table->date('transaction_date');
            $table->timestamps();

            $table->index(['user_id', 'transaction_date']);
            $table->index(['user_id', 'type']);
        });

        // 2. Gold Savings Target
        Schema::create('gold_targets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->decimal('target_grams', 10, 4);
            $table->date('target_date')->nullable();
            $table->string('notes', 255)->nullable();
            $table->timestamps();

            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gold_targets');
        Schema::dropIfExists('gold_transactions');
    }
};

