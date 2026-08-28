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
 * @property string $name
 * @property string $slug
 */
#[Fillable(['name', 'slug', 'icon', 'excerpt', 'description', 'image_id', 'is_active', 'position'])]
class Industry extends Model implements HasMediaGallery, Seoable
{
    use HasGallery, HasSeo, HasSlug, Publishable, SoftDeletes;

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'position' => 'integer'];
    }

    /**
     * @return BelongsToMany<Solution, $this>
     */
    public function solutions(): BelongsToMany
    {
        return $this->belongsToMany(Solution::class);
    }

    /**
     * @return BelongsToMany<Project, $this>
     */
    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class);
    }
}
