<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminAiLogController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim($request->input('search', ''));
        $sender = $request->input('sender', 'all');
        $model = $request->input('model', 'all');

        $query = ChatMessage::with('user');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('content', 'like', "%{$search}%")
                  ->orWhereHas('user', fn ($uq) => $uq->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
            });
        }

        if ($sender !== 'all' && in_array($sender, ['user', 'ai'])) {
            $query->where('sender', $sender);
        }

        if ($model !== 'all') {
            $query->where('ai_model', $model);
        }

        $logs = $query->orderBy('id', 'desc')->paginate(25)->withQueryString();

        $formatted = $logs->through(fn ($msg) => [
            'id' => $msg->id,
            'user_name' => $msg->user->name ?? 'User #' . $msg->user_id,
            'user_email' => $msg->user->email ?? '-',
            'sender' => $msg->sender,
            'type' => $msg->type,
            'content' => $msg->content,
            'has_image' => !empty($msg->image_path),
            'ai_model' => $msg->ai_model ?: 'default',
            'is_confirmed' => (bool) $msg->is_confirmed,
            'created_at' => $msg->created_at ? $msg->created_at->format('d M Y H:i:s') : '-',
        ]);

        $openrouterKey = config('services.openrouter.api_key') ?: env('OPENROUTER_API_KEY');

        return Inertia::render('Admin/AiLogs/Index', [
            'logs' => $formatted,
            'filters' => [
                'search' => $search,
                'sender' => $sender,
                'model' => $model,
            ],
            'summary' => [
                'total_messages' => ChatMessage::count(),
                'user_prompts' => ChatMessage::where('sender', 'user')->count(),
                'ai_responses' => ChatMessage::where('sender', 'ai')->count(),
                'receipt_scans' => ChatMessage::whereNotNull('image_path')->count(),
                'openrouter_active' => !empty($openrouterKey),
            ],
        ]);
    }
}

