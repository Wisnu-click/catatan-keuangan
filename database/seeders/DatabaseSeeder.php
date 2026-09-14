<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Wallet;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create / Update Super Admin Account (admin@vira.com)
        $admin = User::updateOrCreate(
            ['email' => 'admin@vira.com'],
            [
                'name' => 'Super Admin VIRA',
                'phone_number' => '081299998888',
                'role' => 'admin',
                'password' => Hash::make('admin123'),
                'pin_hash' => Hash::make('123456'),
                'avatar_url' => 'https://api.dicebear.com/7.x/bottts/svg?seed=SuperAdmin',
                'is_active' => true,
            ]
        );

        // // 2. Create / Update Main Admin (wisnu@click.com)
        // $userWisnu = User::updateOrCreate(
        //     ['email' => 'wisnu@click.com'],
        //     [
        //         'name' => 'Wisnu (Admin)',
        //         'phone_number' => '081234567890',
        //         'role' => 'admin',
        //         'password' => Hash::make('wisnu123'),
        //         'pin_hash' => Hash::make('123456'),
        //         'avatar_url' => 'https://api.dicebear.com/7.x/bottts/svg?seed=wisnu',
        //         'is_active' => true,
        //     ]
        // );

        // // 3. Create Sample Regular User (user@vira.com)
        // $regularUser = User::updateOrCreate(
        //     ['email' => 'user@vira.com'],
        //     [
        //         'name' => 'Budi Santoso',
        //         'phone_number' => '081234567899',
        //         'role' => 'pengguna',
        //         'password' => Hash::make('user123'),
        //         'pin_hash' => Hash::make('123456'),
        //         'avatar_url' => 'https://api.dicebear.com/7.x/bottts/svg?seed=BudiSantoso',
        //         'is_active' => true,
        //     ]
        // );

        // // Create Default Wallets for Users
        // $usersToSetup = [$admin, $userWisnu, $regularUser];

        // foreach ($usersToSetup as $u) {
        //     $wallets = [
        //         ['name' => 'Rekening Utama (BCA)', 'type' => 'personal', 'initial_balance' => 15000000, 'icon' => 'account_balance', 'color_hex' => '#3B4CCA', 'display_order' => 1],
        //         ['name' => 'DANA E-Wallet', 'type' => 'other', 'initial_balance' => 1250000, 'icon' => 'account_balance_wallet', 'color_hex' => '#8B5CF6', 'display_order' => 2],
        //         ['name' => 'Dompet Tunai', 'type' => 'personal', 'initial_balance' => 500000, 'icon' => 'payments', 'color_hex' => '#FEF08A', 'display_order' => 3],
        //         ['name' => 'Tabungan Darurat', 'type' => 'savings', 'initial_balance' => 25000000, 'icon' => 'savings', 'color_hex' => '#4ADE80', 'display_order' => 4],
        //     ];

        //     foreach ($wallets as $w) {
        //         Wallet::firstOrCreate(
        //             ['user_id' => $u->id, 'name' => $w['name']],
        //             array_merge($w, ['user_id' => $u->id, 'is_active' => true])
        //         );
        //     }

        //     // Create Default Categories for User
        //     $categories = [
        //         ['name' => 'Makanan & Minuman', 'type' => 'expense', 'icon' => 'fastfood', 'color_hex' => '#FFDAD6'],
        //         ['name' => 'Internet & Kuota', 'type' => 'expense', 'icon' => 'wifi', 'color_hex' => '#FFDAD6'],
        //         ['name' => 'Transportasi & BBM', 'type' => 'expense', 'icon' => 'directions_bus', 'color_hex' => '#FFDAD6'],
        //         ['name' => 'Tagihan & Utilitas', 'type' => 'expense', 'icon' => 'receipt', 'color_hex' => '#FFDAD6'],
        //         ['name' => 'Belanja Harian', 'type' => 'expense', 'icon' => 'shopping_cart', 'color_hex' => '#FFDAD6'],
        //         ['name' => 'Gaji Bulanan', 'type' => 'income', 'icon' => 'payments', 'color_hex' => '#DCFCE7'],
        //         ['name' => 'Bonus & Freelance', 'type' => 'income', 'icon' => 'work', 'color_hex' => '#DCFCE7'],
        //         ['name' => 'Investasi & Bunga', 'type' => 'income', 'icon' => 'trending_up', 'color_hex' => '#DCFCE7'],
        //     ];

        //     foreach ($categories as $c) {
        //         Category::firstOrCreate(
        //             ['user_id' => $u->id, 'name' => $c['name']],
        //             array_merge($c, ['user_id' => $u->id])
        //         );
        //     }
        // }
    }
}
