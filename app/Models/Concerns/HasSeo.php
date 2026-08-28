<?php

declare(strict_types=1);

namespace App\Models\Concerns;

use App\Models\Seo;
use App\Support\Locales;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/**
 * Per-locale SEO overrides for a content record.
 *
 * @mixin Model
 */
trait HasSeo
{
    public static function bootHasSeo(): void
    {
        static::deleting(function (Model $model): void {
            /** @var static $model */
            $softDeleting = method_exists($model, 'isForceDeleting') && ! $model->isForceDeleting();

            if (! $softDeleting) {
                $model->seoEntries()->delete();
            }
        });
    }

    /**
     * @return MorphMany<Seo, $this>
     */
    public function seoEntries(): MorphMany
    {
        return $this->morphMany(Seo::class, 'seoable');
    }

    public function seoFor(?string $locale = null): ?Seo
    {
        $locale ??= Locales::current();

        return $this->seoEntries->firstWhere('locale', $locale);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function syncSeo(array $attributes, ?string $locale = null): Seo
    {
        $locale ??= Locales::current();

        return $this->seoEntries()->updateOrCreate(['locale' => $locale], $attributes);
    }

    public function forgetSeo(?string $locale = null): void
    {
        $this->seoEntries()->where('locale', $locale ?? Locales::current())->delete();
    }
}
