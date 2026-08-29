<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function whatsapp(): Response
    {
        return Inertia::render('Settings/WhatsApp', [
            'isConnected' => false,
        ]);
    }
}

