<?php

namespace App\Http\Middleware;

use App\Cms\ResourceRegistry;
use App\Models\Inquiry;
use App\Services\SiteDataService;
use App\Support\Locales;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Gate;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
                'abilities' => $user?->role?->abilities() ?? [],
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'locale' => [
                'current' => Locales::current(),
                'default' => Locales::default(),
                'direction' => Locales::direction(),
                'rtl' => Locales::isRtl(),
                'available' => Locales::forSwitcher(),
            ],
            // The UI dictionary for the active language. Sent as a whole so a
            // client-side navigation never has to wait on a second request.
            'translations' => fn (): array => $this->translations(),
            'site' => fn () => $this->isDashboard($request)
                ? null
                : app(SiteDataService::class)->chrome(),
            'admin' => fn () => $this->isDashboard($request) && $user
                ? [
                    'navigation' => app(ResourceRegistry::class)->navigation(),
                    'unreadInquiries' => Gate::allows('viewAny', Inquiry::class)
                        ? Inquiry::query()->unread()->count()
                        : 0,
                ]
                : null,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }

    /**
     * @return array<string, string>
     */
    private function translations(): array
    {
        $path = lang_path(Locales::current().'.json');

        if (! File::exists($path)) {
            return [];
        }

        return json_decode(File::get($path), true) ?: [];
    }

    /**
     * Whether this request targets the dashboard rather than the public site.
     */
    private function isDashboard(Request $request): bool
    {
        return $request->is('admin', 'admin/*', 'settings', 'settings/*', 'login', 'register');
    }
}
