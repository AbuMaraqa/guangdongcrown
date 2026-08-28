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
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property string $title
 * @property string $slug
 * @property array<int, array{title: string, description: string}>|null $features
 * @property array<int, array{title: string, description: string}>|null $benefits
 * @property array<int, array{title: string, description: string}>|null $process
 */
#[Fillable([
    'title', 'slug', 'icon', 'excerpt', 'content', 'features', 'benefits', 'process',
    'image_id', 'is_featured', 'is_active', 'position',
])]
class Solution extends Model implements HasMediaGallery, Seoable
{
    use HasGallery, HasSeo, HasSlug, Publishable, SoftDeletes;

    protected function casts(): array
    {
        return [
            'features' => 'array',
            'benefits' => 'array',
            'process' => 'array',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'position' => 'integer',
        ];
    }

    public function slugSource(): string
    {
        return 'title';
    }

    /**
     * @return BelongsToMany<Industry, $this>
     */
    public function industries(): BelongsToMany
    {
        return $this->belongsToMany(Industry::class);
    }
}
