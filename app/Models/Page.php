<?php

declare(strict_types=1);

namespace App\Models;

use App\Contracts\HasMediaGallery;
use App\Contracts\Seoable;
use App\Enums\ContentStatus;
use App\Models\Concerns\HasGallery;
use App\Models\Concerns\HasSeo;
use App\Models\Concerns\HasSlug;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property string $title
 * @property string $slug
 * @property ContentStatus $status
 * @property bool $is_system
 */
#[Fillable(['title', 'slug', 'excerpt', 'content', 'image_id', 'status', 'is_system', 'position'])]
class Page extends Model implements HasMediaGallery, Seoable
{
    use HasGallery, HasSeo, HasSlug, SoftDeletes;

    protected function casts(): array
    {
        return [
            'status' => ContentStatus::class,
            'is_system' => 'boolean',
            'position' => 'integer',
        ];
    }

    public function slugSource(): string
    {
        return 'title';
    }

    /**
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', ContentStatus::Published);
    }
}
