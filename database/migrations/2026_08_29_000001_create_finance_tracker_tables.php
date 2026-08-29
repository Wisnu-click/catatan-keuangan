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
        // 2. WALLETS
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('name', 100);
            $table->enum('type', ['personal', 'business', 'savings', 'other'])->default('other');
            $table->decimal('initial_balance', 15, 2)->default(0);
            $table->string('icon', 50)->nullable();
            $table->string('color_hex', 7)->default('#8B5CF6');
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();

            $table->index('user_id');
        });

        // 3. CATEGORIES
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('wallet_id')->nullable()->constrained('wallets')->onDelete('cascade');
            $table->string('name', 100);
            $table->enum('type', ['income', 'expense']);
            $table->string('icon', 50)->nullable();
            $table->string('color_hex', 7)->default('#C4B5FD');
            $table->boolean('is_active')->default(true);
            $table->timestamp('created_at')->useCurrent();

            $table->index('user_id');
            $table->index('wallet_id');
        });

        // 4. TRANSACTIONS
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('wallet_id')->constrained('wallets')->onDelete('cascade');
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('set null');
            $table->enum('type', ['income', 'expense']);
            $table->decimal('amount', 15, 2);
            $table->string('description', 255)->nullable();
            $table->enum('source', ['web', 'whatsapp', 'api'])->default('web');
            $table->text('raw_input')->nullable();
            $table->date('transaction_date');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['wallet_id', 'transaction_date']);
            $table->index(['user_id', 'transaction_date']);
            $table->index('category_id');
        });

        // 5. TRANSFERS
        Schema::create('transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('from_wallet_id')->constrained('wallets')->onDelete('cascade');
            $table->foreignId('to_wallet_id')->constrained('wallets')->onDelete('cascade');
            $table->decimal('amount', 15, 2);
            $table->string('description', 255)->nullable();
            $table->enum('source', ['web', 'whatsapp', 'api'])->default('web');
            $table->date('transfer_date');
            $table->timestamp('created_at')->useCurrent();

            $table->index('from_wallet_id');
            $table->index('to_wallet_id');
        });

        // 6. SAVINGS GOALS
        Schema::create('savings_goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('wallet_id')->constrained('wallets')->onDelete('cascade');
            $table->string('name', 150);
            $table->decimal('target_amount', 15, 2);
            $table->date('target_date')->nullable();
            $table->string('icon', 50)->nullable();
            $table->enum('status', ['active', 'completed', 'cancelled'])->default('active');
            $table->timestamps();

            $table->index('wallet_id');
            $table->index('status');
        });

        // 7. GOAL CONTRIBUTIONS
        Schema::create('goal_contributions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('goal_id')->constrained('savings_goals')->onDelete('cascade');
            $table->decimal('amount', 15, 2);
            $table->enum('source', ['web', 'whatsapp', 'api'])->default('web');
            $table->string('description', 255)->nullable();
            $table->date('contribution_date');
            $table->timestamp('created_at')->useCurrent();

            $table->index('goal_id');
        });

        // 8. AUTO ALLOCATION RULES
        Schema::create('auto_allocation_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('source_wallet_id')->constrained('wallets')->onDelete('cascade');
            $table->foreignId('goal_id')->constrained('savings_goals')->onDelete('cascade');
            $table->enum('trigger_type', ['every_income', 'percentage_of_income', 'fixed_monthly']);
            $table->decimal('value', 15, 2);
            $table->boolean('is_active')->default(true);
            $table->timestamp('created_at')->useCurrent();
        });

        // 9. BUDGETS
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('wallet_id')->nullable()->constrained('wallets')->onDelete('cascade');
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('cascade');
            $table->enum('period', ['weekly', 'monthly'])->default('monthly');
            $table->decimal('limit_amount', 15, 2);
            $table->date('start_date');
            $table->boolean('is_active')->default(true);
            $table->timestamp('created_at')->useCurrent();
        });

        // 10. WA SESSIONS
        Schema::create('wa_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('phone_number', 20);
            $table->json('context_json')->nullable();
            $table->string('last_intent', 50)->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index('phone_number');
        });

        // 11. AI INTENT LOGS
        Schema::create('ai_intent_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->text('raw_message');
            $table->string('detected_intent', 50)->nullable();
            $table->json('extracted_entities')->nullable();
            $table->decimal('confidence_score', 4, 3)->nullable();
            $table->boolean('was_confirmed')->nullable();
            $table->foreignId('related_transaction_id')->nullable()->constrained('transactions')->onDelete('set null');
            $table->timestamp('created_at')->useCurrent();

            $table->index('user_id');
        });

        // 12. WALLET RECONCILIATIONS
        Schema::create('wallet_reconciliations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained('wallets')->onDelete('cascade');
            $table->decimal('system_balance', 15, 2);
            $table->decimal('actual_balance', 15, 2);
            $table->decimal('difference', 15, 2)->nullable();
            $table->string('note', 255)->nullable();
            $table->timestamp('checked_at')->useCurrent();

            $table->index('wallet_id');
        });

        // VIEWS (Compatible with SQLite & MySQL)
        DB::statement("DROP VIEW IF EXISTS v_wallet_balances");
        DB::statement("
            CREATE VIEW v_wallet_balances AS
            SELECT
                w.id AS wallet_id,
                w.user_id,
                w.name,
                w.type,
                w.initial_balance
                  + COALESCE((SELECT SUM(CASE WHEN t.type='income' THEN t.amount ELSE -t.amount END)
                              FROM transactions t
                              WHERE t.wallet_id = w.id AND t.deleted_at IS NULL), 0)
                  + COALESCE((SELECT SUM(tr.amount) FROM transfers tr WHERE tr.to_wallet_id = w.id), 0)
                  - COALESCE((SELECT SUM(tr.amount) FROM transfers tr WHERE tr.from_wallet_id = w.id), 0)
                  AS current_balance
            FROM wallets w
            WHERE w.is_active = 1;
        ");

        DB::statement("DROP VIEW IF EXISTS v_goal_progress");
        DB::statement("
            CREATE VIEW v_goal_progress AS
            SELECT
                g.id AS goal_id,
                g.user_id,
                g.wallet_id,
                g.name,
                g.target_amount,
                COALESCE((SELECT SUM(gc.amount) FROM goal_contributions gc WHERE gc.goal_id = g.id), 0) AS current_amount,
                g.target_date,
                g.status
            FROM savings_goals g;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("DROP VIEW IF EXISTS v_goal_progress");
        DB::statement("DROP VIEW IF EXISTS v_wallet_balances");

        Schema::dropIfExists('wallet_reconciliations');
        Schema::dropIfExists('ai_intent_logs');
        Schema::dropIfExists('wa_sessions');
        Schema::dropIfExists('budgets');
        Schema::dropIfExists('auto_allocation_rules');
        Schema::dropIfExists('goal_contributions');
        Schema::dropIfExists('savings_goals');
        Schema::dropIfExists('transfers');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('wallets');
    }
};

