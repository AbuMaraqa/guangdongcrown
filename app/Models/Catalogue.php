<?php

declare(strict_types=1);

namespace App\Models;

use App\Contracts\HasMediaGallery;
use App\Contracts\Seoable;
use App\Models\Concerns\HasGallery;
use App\Models\Concerns\HasSeo;
use App\Models\Concerns\HasSlug;
use App\Models\Concerns\Publishable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * A browsable product catalogue.
 *
 * The gallery holds the page images in order; `image_id` is the cover. An
 * optional `file_url` points at a print-ready PDF for people who would rather
 * download than browse.
 *
 * @property string $name
 * @property string $slug
 * @property string|null $code
 * @property string|null $file_url
 */
#[Fillable([
    'product_category_id', 'name', 'slug', 'code', 'excerpt', 'image_id',
    'file_url', 'year', 'is_featured', 'is_active', 'position',
])]
class Catalogue extends Model implements HasMediaGallery, Seoable
{
    use HasGallery, HasSeo, HasSlug, Publishable, SoftDeletes;

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'position' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<ProductCategory, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'product_category_id');
    }

    /**
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        return $query->when($term, fn (Builder $q, string $t): Builder => $q->where(
            fn (Builder $inner) => $inner
                ->where('name', 'like', "%{$t}%")
                ->orWhere('code', 'like', "%{$t}%")
        ));
    }
}
