<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\MediaAsset;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * A model with a cover image and an ordered media gallery.
 *
 * Satisfied by the HasGallery trait. As with Seoable, the relation methods
 * stay out of the contract so their generics can remain precise.
 *
 * @property-read MediaAsset|null $image
 * @property-read Collection<int, MediaAsset> $gallery
 *
 * @phpstan-require-extends Model
 */
interface HasMediaGallery
{
    /**
     * @param  list<int>  $mediaIds
     */
    public function syncGallery(array $mediaIds, string $collection = 'gallery'): void;
}
