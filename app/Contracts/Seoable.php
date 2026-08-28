<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\Seo;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * A model that carries its own per-locale SEO overrides.
 *
 * Satisfied by the HasSeo trait; declared as a contract so the CMS pipeline
 * can narrow on it rather than inspecting which traits a model happens to use.
 * The relation itself stays off the interface: its generics are invariant over
 * the declaring model and would break every implementation.
 *
 * @property-read Collection<int, Seo> $seoEntries
 *
 * @phpstan-require-extends Model
 */
interface Seoable
{
    public function seoFor(?string $locale = null): ?Seo;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function syncSeo(array $attributes, ?string $locale = null): Seo;

    public function forgetSeo(?string $locale = null): void;
}
