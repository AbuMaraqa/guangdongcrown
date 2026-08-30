<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Location;
use App\Models\MediaAsset;
use App\Models\Page;
use App\Models\ProductCategory;
use App\Models\Service;
use App\Models\Solution;
use App\Settings\CompanySettings;
use App\Settings\FooterSettings;
use App\Settings\SocialSettings;
use App\Support\Locales;
use App\Support\Translated;
use Illuminate\Support\Facades\Cache;

/**
 * Builds the cached chrome payload (branding, contact, navigation) shared with
 * every public page, so the header and footer never re-query per request.
 *
 * The cache is keyed by locale: the navigation labels and company copy differ
 * per language, the media and links do not.
 */
class SiteDataService
{
    public const CACHE_PREFIX = 'site.chrome.';

    public function __construct(
        private readonly CompanySettings $company,
        private readonly FooterSettings $footer,
        private readonly SocialSettings $social,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function chrome(): array
    {
        $locale = Locales::current();

        return Cache::rememberForever(self::CACHE_PREFIX.$locale, fn (): array => [
            'company' => $this->company(),
            'social' => $this->social->links(),
            'footer' => [
                'cta_heading' => Translated::get($this->footer->cta_heading),
                'cta_body' => Translated::get($this->footer->cta_body),
                'copyright' => Translated::get($this->footer->copyright),
                'accent' => $this->footer->accent,
            ],
            'navigation' => $this->navigation(),
            'legalPages' => $this->legalPages(),
            'headquarters' => $this->headquarters(),
        ]);
    }

    /**
     * Just the marks and the name — enough to brand the dashboard and the
     * sign-in screen without loading the whole public navigation.
     *
     * @return array{name: string, logo: string|null, logoInverse: string|null}
     */
    public function brand(): array
    {
        $locale = Locales::current();

        return Cache::rememberForever(self::CACHE_PREFIX.'brand.'.$locale, fn (): array => [
            'name' => Translated::get($this->company->name) ?? config('app.name'),
            'logo' => $this->mediaUrl($this->company->logo_id),
            'logoInverse' => $this->mediaUrl($this->company->logo_inverse_id),
        ]);
    }

    public static function flush(): void
    {
        foreach (Locales::codes() as $code) {
            Cache::forget(self::CACHE_PREFIX.$code);
            Cache::forget(self::CACHE_PREFIX.'brand.'.$code);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function company(): array
    {
        return [
            'name' => Translated::get($this->company->name) ?? config('app.name'),
            'legalName' => Translated::get($this->company->legal_name),
            'tagline' => Translated::get($this->company->tagline),
            'description' => Translated::get($this->company->description),
            'email' => $this->company->email,
            'phone' => $this->company->phone,
            'whatsapp' => $this->company->whatsapp,
            'address' => Translated::get($this->company->address),
            'logo' => $this->mediaUrl($this->company->logo_id),
            'logoInverse' => $this->mediaUrl($this->company->logo_inverse_id),
            'founded' => $this->company->founded_year,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function navigation(): array
    {
        return [
            'productCategories' => ProductCategory::query()
                ->active()
                ->ordered()
                ->whereNull('parent_id')
                ->get()
                ->map(fn (ProductCategory $c): array => ['name' => $c->name, 'slug' => $c->slug])
                ->values()
                ->all(),
            'services' => Service::query()
                ->active()
                ->ordered()
                ->get()
                ->map(fn (Service $s): array => [
                    'name' => $s->name,
                    'slug' => $s->slug,
                    'icon' => $s->icon,
                    'excerpt' => $s->excerpt,
                ])
                ->values()
                ->all(),
            'solutions' => Solution::query()
                ->active()
                ->ordered()
                ->get()
                ->map(fn (Solution $s): array => [
                    'name' => $s->title,
                    'slug' => $s->slug,
                    'icon' => $s->icon,
                    'excerpt' => $s->excerpt,
                ])
                ->values()
                ->all(),
        ];
    }

    /**
     * Published standalone pages linked from the footer. Nothing is linked
     * until the page actually exists, so the footer can never point at a 404.
     *
     * @return list<array{title: string, slug: string}>
     */
    private function legalPages(): array
    {
        return array_values(Page::query()
            ->published()
            ->orderBy('position')
            ->get()
            ->map(fn (Page $page): array => ['title' => $page->title, 'slug' => $page->slug])
            ->all());
    }

    /**
     * @return array<string, mixed>|null
     */
    private function headquarters(): ?array
    {
        $hq = Location::query()->active()->where('is_headquarters', true)->first()
            ?? Location::query()->active()->ordered()->first();

        return $hq ? [
            'name' => $hq->name,
            'city' => $hq->city,
            'country' => $hq->country,
            'address' => $hq->address,
            'phone' => $hq->phone,
            'email' => $hq->email,
        ] : null;
    }

    private function mediaUrl(?int $id): ?string
    {
        return $id ? MediaAsset::query()->find($id)?->url : null;
    }
}
