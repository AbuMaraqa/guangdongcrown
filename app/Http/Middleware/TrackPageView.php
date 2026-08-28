<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\PageView;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/**
 * Records anonymous, non-identifying traffic counts for the dashboard.
 * Visitor IPs are one-way hashed with the app key and never stored raw.
 */
class TrackPageView
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (! $request->isMethod('GET') || $request->ajax()) {
            return $response;
        }

        if ($response->getStatusCode() !== 200 || $request->user()) {
            return $response;
        }

        PageView::query()->create([
            'path' => Str::limit($request->path(), 500, ''),
            'page_type' => $this->classify($request->path()),
            'referrer' => Str::limit((string) $request->headers->get('referer'), 500, '') ?: null,
            'visitor_hash' => hash('sha256', $request->ip().'|'.$request->userAgent().'|'.config('app.key')),
            'viewed_at' => now(),
        ]);

        return $response;
    }

    private function classify(string $path): string
    {
        $segment = Str::before(trim($path, '/'), '/');

        return match ($segment) {
            '' => 'home',
            'products', 'solutions', 'services', 'projects', 'industries',
            'insights', 'about', 'team', 'contact', 'quote' => $segment,
            default => 'other',
        };
    }
}
