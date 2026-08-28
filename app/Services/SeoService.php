<?php

declare(strict_types=1);

namespace App\Services;

use App\Contracts\Seoable;
use App\Models\MediaAsset;
use App\Settings\CompanySettings;
use App\Settings\SeoSettings;
use App\Support\Locales;
use App\Support\Translated;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * Resolves the meta payload shared with every page, merging per-entity SEO
 * overrides for the active locale on top of the global defaults.
 */
class SeoService
{
    public function __construct(
        private readonly SeoSettings $seo,
        private readonly CompanySettings $company,
    ) {}

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    public function build(array $overrides = [], ?Model $model = null): array
    {
        $siteName = Translated::get($this->company->name) ?? config('app.name');
        $record = $model instanceof Seoable ? $model->seoFor(Locales::current()) : null;

        $title = $record?->meta_title
            ?: ($overrides['title'] ?? null)
            ?: (Translated::get($this->seo->default_title) ?? $siteName);

        $description = $record?->meta_description
            ?: ($overrides['description'] ?? null)
            ?: Translated::get($this->seo->default_description);

        $image = $record?->ogImage?->url
            ?: ($overrides['image'] ?? null)
            ?: $this->defaultOgImage();

        return [
            'title' => $this->decorateTitle((string) $title, (string) $siteName, $overrides),
            'rawTitle' => $title,
            'description' => $description ? Str::limit(strip_tags($description), 300, '') : null,
            'canonical' => $record?->canonical_url ?: ($overrides['canonical'] ?? url()->current()),
            'robots' => $this->robots($record?->robots ?: ($overrides['robots'] ?? 'index,follow')),
            'ogTitle' => $record?->og_title ?: $title,
            'ogDescription' => $record?->og_description ?: $description,
            'ogImage' => $image,
            'ogType' => $overrides['type'] ?? 'website',
            'siteName' => $siteName,
            'locale' => str_replace('_', '-', Locales::current()),
            'direction' => Locales::direction(),
            'alternates' => Locales::alternates(),
            'schema' => $overrides['schema'] ?? null,
        ];
    }

    /**
     * A site switched to "not indexable" in settings overrides every per-page
     * directive, so staging deployments cannot leak into search results.
     */
    private function robots(string $robots): string
    {
        return $this->seo->indexable ? $robots : 'noindex,nofollow';
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function decorateTitle(string $title, string $siteName, array $overrides): string
    {
        if (($overrides['bareTitle'] ?? false) || Str::contains($title, $siteName)) {
            return $title;
        }

        return $title.' | '.$siteName;
    }

    private function defaultOgImage(): ?string
    {
        $id = $this->seo->default_og_image_id;

        return $id ? MediaAsset::query()->find($id)?->url : null;
    }
}
