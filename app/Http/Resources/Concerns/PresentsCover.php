<?php

declare(strict_types=1);

namespace App\Http\Resources\Concerns;

use App\Http\Resources\MediaResource;
use App\Models\MediaAsset;

trait PresentsCover
{
    /**
     * @return array<string, mixed>|null
     */
    protected function cover(?MediaAsset $media): ?array
    {
        return $media ? (new MediaResource($media))->resolve() : null;
    }

    /**
     * @param  iterable<MediaAsset>  $items
     * @return list<array<string, mixed>>
     */
    protected function covers(iterable $items): array
    {
        $mapped = [];

        foreach ($items as $item) {
            $mapped[] = (new MediaResource($item))->resolve();
        }

        return $mapped;
    }
}
