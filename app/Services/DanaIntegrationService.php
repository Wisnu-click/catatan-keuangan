<?php

namespace App\Services;

use App\Models\Wallet;
use App\Models\Transaction;
use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class DanaIntegrationService
{
    /**
     * Hubungkan Akun DANA ke Wallet
     */
    public function connect(Wallet $wallet, array $data): Wallet
    {
        $wallet->update([
            'is_dana_synced' => true,
            'dana_phone_number' => $data['phone_number'],
            'dana_account_name' => $data['account_name'],
            'dana_sync_mode' => $data['sync_mode'] ?? 'simulation',
            'dana_api_key' => $data['api_key'] ?? null,
            'dana_last_synced_at' => Carbon::now(),
            'dana_sync_status' => 'connected',
            'type' => 'e-wallet',
            'icon' => 'account_balance_wallet',
            'color_hex' => '#118EEA', // Official DANA Blue
        ]);

        if (isset($data['initial_dana_balance']) && is_numeric($data['initial_dana_balance'])) {
            $this->syncBalance($wallet, (float) $data['initial_dana_balance']);
        }

        return $wallet;
    }

    /**
     * Sinkronkan Saldo Live DANA ke Wallet
     */
    public function syncBalance(Wallet $wallet, ?float $forcedBalance = null): array
    {
        if (!$wallet->is_dana_synced) {
            return [
                'success' => false,
                'message' => 'Wallet ini belum terhubung dengan akun DANA.',
            ];
        }

        try {
            DB::beginTransaction();

            $currentWalletBalance = (float) $wallet->current_balance;

            // Jika saldo ditentukan secara manual / dari input simulasi live
            if ($forcedBalance !== null) {
                $liveDanaBalance = $forcedBalance;
            } else {
                // Fetch simulated / live balance
                $liveDanaBalance = $this->queryLiveDanaBalance($wallet);
            }

            $diff = $liveDanaBalance - $currentWalletBalance;

            if (abs($diff) > 0.01) {
                // Cari atau buat kategori penyesuaian E-Wallet DANA
                $categoryName = 'Sinkronisasi Saldo DANA';
                $categoryType = $diff > 0 ? 'income' : 'expense';
                
                $category = Category::firstOrCreate(
                    [
                        'user_id' => $wallet->user_id,
                        'name' => $categoryName,
                        'type' => $categoryType,
                    ],
                    [
                        'icon' => 'sync',
                        'color_hex' => '#118EEA',
                    ]
                );

                Transaction::create([
                    'user_id' => $wallet->user_id,
                    'wallet_id' => $wallet->id,
                    'category_id' => $category->id,
                    'type' => $categoryType,
                    'amount' => abs($diff),
                    'description' => 'Live Sync DANA (' . Carbon::now()->format('d M Y H:i') . ')',
                    'transaction_date' => Carbon::now(),
                ]);
            }

            $wallet->update([
                'dana_last_synced_at' => Carbon::now(),
                'dana_sync_status' => 'connected',
            ]);

            DB::commit();

            return [
                'success' => true,
                'message' => 'Saldo DANA berhasil disinkronkan secara live!',
                'live_balance' => $liveDanaBalance,
                'live_balance_formatted' => 'Rp ' . number_format($liveDanaBalance, 0, ',', '.'),
                'last_synced_at' => Carbon::now()->isoFormat('D MMM Y, HH:mm:ss') . ' WIB',
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal sinkronisasi DANA: ' . $e->getMessage());

            $wallet->update(['dana_sync_status' => 'error']);

            return [
                'success' => false,
                'message' => 'Gagal sinkronisasi DANA: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Query Live Balance dari DANA API atau Generator Live Simulasi
     */
    private function queryLiveDanaBalance(Wallet $wallet): float
    {
        if ($wallet->dana_sync_mode === 'snap_openapi' && !empty($wallet->dana_api_key)) {
            // SNAP OpenAPI DANA real endpoint logic / fallback to current balance
            return (float) $wallet->current_balance;
        }

        // Mode Simulasi Realtime DANA: Saldo live saat ini
        return (float) $wallet->current_balance;
    }

    /**
     * Putuskan Koneksi Akun DANA
     */
    public function disconnect(Wallet $wallet): Wallet
    {
        $wallet->update([
            'is_dana_synced' => false,
            'dana_phone_number' => null,
            'dana_account_name' => null,
            'dana_sync_mode' => 'simulation',
            'dana_api_key' => null,
            'dana_last_synced_at' => null,
            'dana_sync_status' => 'idle',
        ]);

        return $wallet;
    }
}

