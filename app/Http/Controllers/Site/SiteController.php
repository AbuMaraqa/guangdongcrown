<?php

declare(strict_types=1);

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Services\SeoService;
use App\Services\StructuredData;
use App\Settings\CompanySettings;
use App\Settings\HomeSettings;
use Illuminate\Database\Eloquent\Model;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Shared plumbing for the public-facing pages: SEO assembly, breadcrumbs
 * and the settings accessor.
 */
abstract class SiteController extends Controller
{
    public function __construct(
        protected readonly SeoService $seo,
        protected readonly CompanySettings $company,
        protected readonly HomeSettings $home,
        protected readonly StructuredData $schema,
    ) {}

    /**
     * @param  array<string, mixed>  $props
     * @param  array<string, mixed>  $seo
     */
    protected function page(string $component, array $props, array $seo = [], ?Model $model = null): Response
    {
        return Inertia::render($component, [
            ...$props,
            'seo' => $this->seo->build($seo, $model),
        ]);
    }

    /**
     * @param  list<array{name: string, url: string}>  $trail
     * @return list<array{name: string, url: string}>
     */
    protected function trail(array $trail): array
    {
        return [['name' => 'Home', 'url' => route('site.home')], ...$trail];
    }
}
