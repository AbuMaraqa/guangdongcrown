<?php

declare(strict_types=1);

namespace App\Models\Concerns;

use App\Models\MediaAsset;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

/**
 * Adds a single cover image plus an ordered many-to-many media gallery.
 *
 * @mixin Model
 */
trait HasGallery
{
    /**
     * @return BelongsTo<MediaAsset, $this>
     */
    public function image(): BelongsTo
    {
        return $this->belongsTo(MediaAsset::class, $this->coverImageColumn());
    }

    public function coverImageColumn(): string
    {
        return 'image_id';
    }

    /**
     * @return MorphToMany<MediaAsset, $this>
     */
    public function gallery(): MorphToMany
    {
        return $this->morphToMany(MediaAsset::class, 'mediable')
            ->withPivot(['position', 'collection'])
            ->wherePivot('collection', 'gallery')
            ->orderBy('mediables.position');
    }

    /**
     * @param  list<int>  $mediaIds
     */
    public function syncGallery(array $mediaIds, string $collection = 'gallery'): void
    {
        $payload = [];

        foreach (array_values(array_unique(array_filter($mediaIds))) as $index => $mediaId) {
            $payload[(int) $mediaId] = ['position' => $index, 'collection' => $collection];
        }

        $this->morphToMany(MediaAsset::class, 'mediable')
            ->wherePivot('collection', $collection)
            ->sync($payload);
    }
}
