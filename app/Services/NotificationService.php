<?php

namespace App\Services;

use App\Models\Notification;

class NotificationService
{
    /**
     * Buat notifikasi baru
     */
    public static function create(
        int $userId,
        string $type,
        string $title,
        string $message,
        string $icon = 'notifications',
        string $color = '#3B4CCA',
        ?string $link = null
    ): Notification {
        return Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'icon' => $icon,
            'color' => $color,
            'link' => $link,
            'is_read' => false,
        ]);
    }

    /**
     * Notifikasi transaksi baru (pemasukan / pengeluaran)
     */
    public static function notifyTransaction(int $userId, string $trxType, float $amount, string $walletName, ?int $walletId = null): Notification
    {
        $formatted = 'Rp ' . number_format($amount, 0, ',', '.');
        $isIncome = $trxType === 'income';

        return self::create(
            $userId,
            'transaction',
            $isIncome ? 'Pemasukan Tercatat' : 'Pengeluaran Tercatat',
            ($isIncome ? '+ ' : '- ') . "{$formatted} berhasil dicatat ke {$walletName}.",
            $isIncome ? 'arrow_downward' : 'arrow_upward',
            $isIncome ? '#22C55E' : '#EF4444',
            $walletId ? route('wallets.show', $walletId) : null
        );
    }

    /**
     * Notifikasi progres target tabungan
     */
    public static function notifyGoalProgress(int $userId, string $goalName, float $percentage): Notification
    {
        $pct = round($percentage);
        $message = "Target \"{$goalName}\" telah mencapai {$pct}%.";

        if ($pct >= 100) {
            $message = "🎉 Selamat! Target \"{$goalName}\" telah tercapai 100%!";
        } elseif ($pct >= 75) {
            $message = "💪 Target \"{$goalName}\" sudah {$pct}%. Sedikit lagi tercapai!";
        } elseif ($pct >= 50) {
            $message = "📈 Target \"{$goalName}\" sudah {$pct}%. Terus semangat!";
        }

        return self::create(
            $userId,
            'goal',
            'Progress Target Tabungan',
            $message,
            'target',
            $pct >= 100 ? '#22C55E' : '#F59E0B',
            route('goals.index')
        );
    }

    /**
     * Notifikasi wallet baru dibuat
     */
    public static function notifyWalletCreated(int $userId, string $walletName, ?int $walletId = null): Notification
    {
        return self::create(
            $userId,
            'wallet',
            'Wallet Baru Ditambahkan',
            "Wallet \"{$walletName}\" berhasil dibuat dan siap digunakan.",
            'account_balance_wallet',
            '#3B4CCA',
            $walletId ? route('wallets.show', $walletId) : null
        );
    }

    /**
     * Notifikasi sistem umum
     */
    public static function notifySystem(int $userId, string $title, string $message): Notification
    {
        return self::create($userId, 'system', $title, $message, 'info', '#8B5CF6');
    }
}
