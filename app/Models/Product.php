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
 * @property string $name
 * @property string $slug
 * @property array<int, array{label: string, value: string}>|null $specifications
 * @property array<int, string>|null $applications
 * @property array<int, array{label: string, url: string}>|null $downloads
 */
#[Fillable([
    'product_category_id', 'name', 'slug', 'sku', 'excerpt', 'description',
    'specifications', 'applications', 'downloads', 'image_id',
    'is_featured', 'is_active', 'position',
])]
class Product extends Model implements HasMediaGallery, Seoable
{
    use HasGallery, HasSeo, HasSlug, Publishable, SoftDeletes;

    protected function casts(): array
    {
        return [
            'specifications' => 'array',
            'applications' => 'array',
            'downloads' => 'array',
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
                ->orWhere('sku', 'like', "%{$t}%")
                ->orWhere('excerpt', 'like', "%{$t}%")
        ));
    }
}
