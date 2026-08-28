<?php

declare(strict_types=1);

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Illuminate\Support\Str;

/**
 * Generates a unique, URL-safe slug from a source attribute.
 *
 * @mixin Model
 */
trait HasSlug
{
    public static function bootHasSlug(): void
    {
        static::saving(function (Model $model): void {
            /** @var static $model */
            $source = $model->slugSource();

            if (blank($model->slug) && filled($model->{$source})) {
                $model->slug = $model->generateUniqueSlug((string) $model->{$source});

                return;
            }

            if (filled($model->slug) && $model->isDirty('slug')) {
                $model->slug = $model->generateUniqueSlug((string) $model->slug);
            }
        });
    }

    public function slugSource(): string
    {
        return 'name';
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function generateUniqueSlug(string $value): string
    {
        $base = Str::slug($value) ?: Str::lower(Str::random(8));
        $slug = $base;
        $suffix = 2;

        while ($this->slugExists($slug)) {
            $slug = $base.'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }

    protected function slugExists(string $slug): bool
    {
        // Soft-deleted records keep their slug, so they still have to be
        // considered when testing uniqueness. Lifting the global scope is the
        // builder-agnostic equivalent of withTrashed().
        $query = static::query()
            ->withoutGlobalScope(SoftDeletingScope::class)
            ->where('slug', $slug);

        if ($this->exists) {
            $query->whereKeyNot($this->getKey());
        }

        return $query->exists();
    }
}
