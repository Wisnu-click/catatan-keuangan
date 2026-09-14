<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SavingReminderController;
use App\Http\Controllers\GoldController;

// Auth Routes
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);

Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
Route::post('/register', [AuthController::class, 'register']);

// Google OAuth Routes
Route::get('/auth/google', [AuthController::class, 'redirectToGoogle'])->name('auth.google');
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback'])->name('auth.google.callback');

Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Protected Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/', [DashboardController::class, 'index']);
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Wallets CRUD Routes
    Route::get('/wallets', [WalletController::class, 'index'])->name('wallets.index');
    Route::post('/wallets', [WalletController::class, 'store'])->name('wallets.store');
    Route::get('/wallets/detail/{id?}', [WalletController::class, 'show'])->name('wallets.show');
    Route::put('/wallets/{wallet}', [WalletController::class, 'update'])->name('wallets.update');
    Route::post('/wallets/{wallet}/budget', [WalletController::class, 'updateBudget'])->name('wallets.budget');
    Route::post('/wallets/{wallet}/link-wallets', [WalletController::class, 'linkWallets'])->name('wallets.link');
    Route::delete('/wallets/{wallet}', [WalletController::class, 'destroy'])->name('wallets.destroy');
    Route::post('/wallets/quick-dana', [WalletController::class, 'quickCreateDana'])->name('wallets.quick-dana');
    Route::post('/wallets/{wallet}/dana/connect', [WalletController::class, 'connectDana'])->name('wallets.dana.connect');
    Route::post('/wallets/{wallet}/dana/sync', [WalletController::class, 'syncDana'])->name('wallets.dana.sync');
    Route::post('/wallets/{wallet}/dana/disconnect', [WalletController::class, 'disconnectDana'])->name('wallets.dana.disconnect');
    Route::post('/wallet-groups', [WalletController::class, 'storeGroup'])->name('wallet-groups.store');
    Route::put('/wallet-groups/{walletGroup}', [WalletController::class, 'updateGroup'])->name('wallet-groups.update');
    Route::delete('/wallet-groups/{walletGroup}', [WalletController::class, 'destroyGroup'])->name('wallet-groups.destroy');

    // Goals CRUD Routes
    Route::get('/goals', [GoalController::class, 'index'])->name('goals.index');
    Route::post('/goals', [GoalController::class, 'store'])->name('goals.store');
    Route::put('/goals/{goal}', [GoalController::class, 'update'])->name('goals.update');
    Route::delete('/goals/{goal}', [GoalController::class, 'destroy'])->name('goals.destroy');
    Route::post('/goals/{goal}/deposit', [GoalController::class, 'deposit'])->name('goals.deposit');
    Route::post('/goals/{goal}/withdraw', [GoalController::class, 'withdraw'])->name('goals.withdraw');

    // Transactions Routes
    Route::get('/transactions/create', [TransactionController::class, 'create'])->name('transactions.create');
    Route::post('/transactions', [TransactionController::class, 'store'])->name('transactions.store');
    Route::put('/transactions/{transaction}', [TransactionController::class, 'update'])->name('transactions.update');
    Route::delete('/transactions/{transaction}', [TransactionController::class, 'destroy'])->name('transactions.destroy');

    // Reports Routes
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');

    // AI Chat Routes
    Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');
    Route::post('/chat/send', [ChatController::class, 'sendMessage'])->name('chat.send');
    Route::post('/chat/confirm/{message}', [ChatController::class, 'confirmReceipt'])->name('chat.confirm');
    Route::delete('/chat/clear', [ChatController::class, 'clearHistory'])->name('chat.clear');

    // Settings Routes
    Route::get('/settings/whatsapp', [SettingController::class, 'whatsapp'])->name('settings.whatsapp');

    // Profile Routes
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');
    Route::post('/profile/google/disconnect', [ProfileController::class, 'disconnectGoogle'])->name('profile.google.disconnect');

    // Live Search Route
    Route::get('/search/query', [SearchController::class, 'search'])->name('search.query');

    // Notification Routes
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::put('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.readAll');
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');

    // Saving Reminder Routes (Goals & Wallets)
    Route::post('/saving-reminders', [SavingReminderController::class, 'store'])->name('saving-reminders.store');
    Route::put('/saving-reminders/{id}', [SavingReminderController::class, 'update'])->name('saving-reminders.update');
    Route::patch('/saving-reminders/{id}/toggle', [SavingReminderController::class, 'toggle'])->name('saving-reminders.toggle');
    Route::delete('/saving-reminders/{id}', [SavingReminderController::class, 'destroy'])->name('saving-reminders.destroy');
    Route::post('/saving-reminders/{id}/deposit', [SavingReminderController::class, 'executeDeposit'])->name('saving-reminders.deposit');
    Route::post('/saving-reminders/{id}/transaction', [SavingReminderController::class, 'executeTransaction'])->name('saving-reminders.transaction');

    // Nabung di Emas & Live Tracker Routes
    Route::get('/gold', [GoldController::class, 'index'])->name('gold.index');
    Route::post('/gold/transactions', [GoldController::class, 'store'])->name('gold.transactions.store');
    Route::put('/gold/transactions/{gold}', [GoldController::class, 'update'])->name('gold.transactions.update');
    Route::delete('/gold/transactions/{gold}', [GoldController::class, 'destroy'])->name('gold.transactions.destroy');
    Route::post('/gold/target', [GoldController::class, 'updateTarget'])->name('gold.target.update');
    Route::get('/gold/price/refresh', [GoldController::class, 'refreshPrice'])->name('gold.price.refresh');
});
