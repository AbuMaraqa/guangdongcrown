<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Support\Locales;
use Closure;
use Illuminate\Http\Request;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;
use Symfony\Component\HttpFoundation\Response;

/**
 * Applies the locale a route group was registered for.
 *
 * The locale is decided by which URL matched rather than by inspecting the
 * request, so it behaves identically whether routes were resolved fresh, from
 * the route cache, or inside the test harness. It is also remembered in the
 * session, which is what lets an un-prefixed link from an Arabic page redirect
 * back into Arabic.
 */
class SetLocale
{
    public function handle(Request $request, Closure $next, string $locale): Response
    {
        if (! Locales::isSupported($locale)) {
            $locale = Locales::default();
        }

        app()->setLocale($locale);
        LaravelLocalization::setLocale($locale);
        $request->session()->put('locale', $locale);

        return $next($request);
    }
}
