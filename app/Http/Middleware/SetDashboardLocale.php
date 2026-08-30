<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Support\Locales;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Applies the signed-in user's own interface language to the dashboard.
 *
 * Kept separate from the public site's locale: the URL decides what language a
 * visitor reads, while a staff member's preference decides what language they
 * work in.
 */
class SetDashboardLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->user()?->locale;

        if ($locale && Locales::isSupported($locale)) {
            app()->setLocale($locale);
        }

        return $next($request);
    }
}
