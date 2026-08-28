<?php

declare(strict_types=1);

namespace App\Models;

use App\Contracts\Seoable;
use App\Models\Concerns\HasSeo;
use App\Models\Concerns\HasSlug;
use App\Models\Concerns\Publishable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Editorial category for the news / insights section.
 *
 * @property string $name
 * @property string $slug
 */
#[Fillable(['name', 'slug', 'description', 'position', 'is_active'])]
class Category extends Model implements Seoable
{
    use HasSeo, HasSlug, Publishable;

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'position' => 'integer'];
    }

    /**
     * @return HasMany<Post, $this>
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }
}
