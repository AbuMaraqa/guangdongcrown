<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * A single locale's SEO overrides for one content record.
 *
 * @property string $locale
 * @property string|null $meta_title
 * @property string|null $meta_description
 * @property string|null $canonical_url
 * @property string|null $og_title
 * @property string|null $og_description
 * @property string $robots
 */
#[Fillable([
    'locale', 'meta_title', 'meta_description', 'canonical_url',
    'og_title', 'og_description', 'og_image_id', 'robots',
])]
class Seo extends Model
{
    /**
     * @return MorphTo<Model, $this>
     */
    public function seoable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * @return BelongsTo<MediaAsset, $this>
     */
    public function ogImage(): BelongsTo
    {
        return $this->belongsTo(MediaAsset::class, 'og_image_id');
    }
}
