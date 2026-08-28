<?php

declare(strict_types=1);

namespace App\Models;

use App\Contracts\HasMediaGallery;
use App\Contracts\Seoable;
use App\Enums\ContentStatus;
use App\Models\Concerns\HasGallery;
use App\Models\Concerns\HasSeo;
use App\Models\Concerns\HasSlug;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * @property string $title
 * @property string $slug
 * @property ContentStatus $status
 * @property CarbonImmutable|null $published_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
#[Fillable([
    'category_id', 'user_id', 'title', 'slug', 'excerpt', 'content', 'image_id',
    'status', 'published_at', 'is_featured', 'reading_minutes',
])]
class Post extends Model implements HasMediaGallery, Seoable
{
    use HasGallery, HasSeo, HasSlug, SoftDeletes;

    protected function casts(): array
    {
        return [
            'status' => ContentStatus::class,
            'published_at' => 'datetime',
            'is_featured' => 'boolean',
            'views' => 'integer',
            'reading_minutes' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (self $post): void {
            $post->reading_minutes = max(1, (int) ceil(str_word_count(strip_tags((string) $post->content)) / 200));
        });
    }

    public function slugSource(): string
    {
        return 'title';
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @return BelongsToMany<Tag, $this>
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    /**
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query
            ->where('status', ContentStatus::Published)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
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
                ->orWhere('excerpt', 'like', "%{$t}%")
        ));
    }

    public function summary(int $words = 28): string
    {
        return $this->excerpt ?: Str::words(strip_tags((string) $this->content), $words);
    }
}
