<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\MediaAsset;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read MediaAsset $resource
 */
class MediaResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $asset = $this->resource;

        return [
            'id' => $asset->id,
            'url' => $asset->url,
            'thumb' => $asset->thumb_url,
            'medium' => $asset->medium_url,
            'alt' => $asset->alt ?: $asset->title ?: '',
            'width' => $asset->width,
            'height' => $asset->height,
        ];
    }
}
