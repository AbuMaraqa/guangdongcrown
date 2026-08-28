<?php

declare(strict_types=1);

namespace App\Models;

use App\Contracts\HasMediaGallery;
use App\Contracts\Seoable;
use App\Models\Concerns\HasGallery;
use App\Models\Concerns\HasSeo;
use App\Models\Concerns\HasSlug;
use App\Models\Concerns\Publishable;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property string $title
 * @property string $slug
 * @property array<int, array{label: string, value: string}>|null $results
 * @property CarbonImmutable|null $completed_at
 */
#[Fillable([
    'project_category_id', 'title', 'slug', 'client', 'location', 'country',
    'excerpt', 'description', 'results', 'completed_at', 'image_id',
    'is_featured', 'is_active', 'position',
])]
class Project extends Model implements HasMediaGallery, Seoable
{
    use HasGallery, HasSeo, HasSlug, Publishable, SoftDeletes;

    protected function casts(): array
    {
        return [
            'results' => 'array',
            'completed_at' => 'date',
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
     * @return BelongsTo<ProjectCategory, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ProjectCategory::class, 'project_category_id');
    }

    /**
     * @return BelongsToMany<Service, $this>
     */
    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class);
    }

    /**
     * @return BelongsToMany<Industry, $this>
     */
    public function industries(): BelongsToMany
    {
        return $this->belongsToMany(Industry::class);
    }

    /**
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        return $query->when($term, fn (Builder $q, string $t): Builder => $q->where(
            fn (Builder $inner) => $inner
                ->where('title', 'like', "%{$t}%")
                ->orWhere('client', 'like', "%{$t}%")
                ->orWhere('location', 'like', "%{$t}%")
                ->orWhere('excerpt', 'like', "%{$t}%")
        ));
    }
}
