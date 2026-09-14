<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminSettingController extends Controller
{
    public function index(): Response
    {
        $dbDriver = config('database.default');
        $dbConnection = config("database.connections.{$dbDriver}");

        $openrouterKey = config('services.openrouter.api_key') ?: env('OPENROUTER_API_KEY');
        $googleClientId = config('services.google.client_id') ?: env('GOOGLE_CLIENT_ID');

        $systemSettings = [
            'app_name' => config('app.name'),
            'app_env' => config('app.env'),
            'app_debug' => config('app.debug'),
            'app_url' => config('app.url'),
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'database_driver' => $dbDriver,
            'database_name' => $dbConnection['database'] ?? '-',
            'database_host' => $dbConnection['host'] ?? '-',
            'openrouter_configured' => !empty($openrouterKey),
            'openrouter_preview' => !empty($openrouterKey) ? 'sk-or-v1-' . substr($openrouterKey, 9, 4) . '****' : 'Belum Dikonfigurasi',
            'google_oauth_configured' => !empty($googleClientId),
            'default_ai_model' => env('DEFAULT_AI_MODEL', 'openai/gpt-4o'),
            'server_os' => PHP_OS_FAMILY,
            'timezone' => config('app.timezone'),
        ];

        return Inertia::render('Admin/Settings/Index', [
            'system' => $systemSettings,
        ]);
    }

    public function clearCache(Request $request)
    {
        try {
            Artisan::call('config:clear');
            Artisan::call('route:clear');
            Artisan::call('cache:clear');
            Artisan::call('view:clear');

            return redirect()->back()->with('success', 'Cache sistem (Config, Route, Application, View) berhasil dibersihkan!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal membersihkan cache: ' . $e->getMessage());
        }
    }
}

