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
        // Create Demo User
        $user = User::firstOrCreate(
            ['phone_number' => '081234567890'],
            [
                'name' => 'wisnu',
                'email' => 'wisnu@click.com',
                'password' => Hash::make('wisnu123'),
                'pin_hash' => Hash::make('123456'),
                'avatar_url' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9yZsBGgN8XacufvV-ntEUsK1HwpH1dJ03oKSzqnR7HcQtNjpQjN_lsCuQL6YjX2sj018Ux9YYODKoNtPJKHFBLIOnKFXMLZjf20lPVS_xr5jqWme7QV_uhavuWrIMXABqsT8yKs9eOmBiSBpKKzPWD5RTAhsEC-_sk1OFegpBu1GWPtTVl9OpjEoqWJCqJ_EWf-I9Vig8Zp0pjfqAsitG5AUNhR0odkQ3lCf9DNp2NmI6X-5KUdM',
                'is_active' => true,
            ]
        );

        // Create Default Wallets for User
        $wallets = [
            ['name' => 'E-Wallet', 'type' => 'other', 'initial_balance' => 4250000, 'icon' => 'account_balance_wallet', 'color_hex' => '#C4B5FD', 'display_order' => 1],
            ['name' => 'Usaha Servis', 'type' => 'business', 'initial_balance' => 12800000, 'icon' => 'build', 'color_hex' => '#C4B5FD', 'display_order' => 2],
            ['name' => 'Tabungan', 'type' => 'savings', 'initial_balance' => 85000000, 'icon' => 'savings', 'color_hex' => '#FFFFFF', 'display_order' => 3],
            ['name' => 'Pribadi', 'type' => 'personal', 'initial_balance' => 22540000, 'icon' => 'person', 'color_hex' => '#C4B5FD', 'display_order' => 4],
        ];

        foreach ($wallets as $w) {
            Wallet::firstOrCreate(
                ['user_id' => $user->id, 'name' => $w['name']],
                array_merge($w, ['user_id' => $user->id])
            );
        }

        // Create Default Categories for User
        $categories = [
            ['name' => 'Jajan', 'type' => 'expense', 'icon' => 'fastfood', 'color_hex' => '#C4B5FD'],
            ['name' => 'Beli Kuota', 'type' => 'expense', 'icon' => 'wifi', 'color_hex' => '#C4B5FD'],
            ['name' => 'Transportasi', 'type' => 'expense', 'icon' => 'directions_bus', 'color_hex' => '#C4B5FD'],
            ['name' => 'Tagihan', 'type' => 'expense', 'icon' => 'receipt', 'color_hex' => '#C4B5FD'],
            ['name' => 'Lainnya', 'type' => 'expense', 'icon' => 'more_horiz', 'color_hex' => '#C4B5FD'],
            ['name' => 'Gaji', 'type' => 'income', 'icon' => 'payments', 'color_hex' => '#A7F3D0'],
            ['name' => 'Jasa / Servis', 'type' => 'income', 'icon' => 'build', 'color_hex' => '#A7F3D0'],
            ['name' => 'Bonus / Freelance', 'type' => 'income', 'icon' => 'work', 'color_hex' => '#A7F3D0'],
        ];

        foreach ($categories as $c) {
            Category::firstOrCreate(
                ['user_id' => $user->id, 'name' => $c['name']],
                array_merge($c, ['user_id' => $user->id])
            );
        }
    }
}
