<?php

namespace App\Services;

use App\Models\SavingReminder;
use App\Models\User;

class SavingReminderService
{
    /**
     * Periksa semua reminder aktif milik user yang jatuh tempo hari ini,
     * dan kirim notifikasi live jika belum dinotifikasi hari ini.
     */
    public static function checkAndNotifyDueReminders(User $user): void
    {
        $today = now()->toDateString();
        $dayOfWeek = now()->dayOfWeek;   // 0 = Minggu, 6 = Sabtu
        $dayOfMonth = now()->day;         // 1 - 31

        $reminders = SavingReminder::where('user_id', $user->id)
            ->where('is_active', true)
            ->where(function ($q) use ($today) {
                $q->whereNull('last_notified_at')
                  ->orWhere('last_notified_at', '<', $today);
            })
            ->get();

        foreach ($reminders as $reminder) {
            $isDue = false;

            switch ($reminder->frequency) {
                case 'daily':
                    $isDue = true;
                    break;
                case 'weekly':
                    $isDue = ($reminder->day_of_week === $dayOfWeek);
                    break;
                case 'monthly':
                    $isDue = ($reminder->day_of_month === $dayOfMonth);
                    break;
            }

            if ($isDue) {
                $formatted = 'Rp ' . number_format($reminder->amount, 0, ',', '.');
                $type = $reminder->type ?? 'saving';

                if ($type === 'saving') {
                    $goalName = $reminder->goal?->name ?? 'Tabungan Umum';
                    $walletName = $reminder->wallet?->name ?? 'Wallet';
                    $message = "⏰ Waktunya Menabung Konsisten! Hari ini jadwal rutin menabung {$formatted} untuk target \"{$goalName}\" dari {$walletName}. Konsistensi adalah kunci!";
                    $icon = 'savings';
                    $color = '#F59E0B';
                    $link = route('goals.index');
                } elseif ($type === 'income') {
                    $walletName = $reminder->wallet?->name ?? 'Wallet';
                    $message = "💰 Pengingat Pemasukan Rutin! Hari ini jadwal mencatat pemasukan \"{$reminder->title}\" sebesar {$formatted} ke {$walletName}.";
                    $icon = 'arrow_downward';
                    $color = '#22C55E';
                    $link = route('wallets.index');
                } else {
                    $walletName = $reminder->wallet?->name ?? 'Wallet';
                    $message = "📋 Pengingat Pengeluaran Rutin! Hari ini jadwal membayar \"{$reminder->title}\" sebesar {$formatted} dari {$walletName}.";
                    $icon = 'receipt_long';
                    $color = '#EF4444';
                    $link = route('wallets.index');
                }

                NotificationService::create(
                    $user->id,
                    'reminder',
                    'Pengingat Keuangan Rutin',
                    $message,
                    $icon,
                    $color,
                    $link
                );

                $reminder->update(['last_notified_at' => $today]);
            }
        }
    }
}
