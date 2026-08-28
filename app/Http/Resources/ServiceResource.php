<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Http\Resources\Concerns\PresentsCover;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Service
 */
class ServiceResource extends JsonResource
{
    use PresentsCover;

    public function __construct(Service $resource, private readonly bool $detailed = false)
    {
        parent::__construct($resource);
    }

    public static function detailed(Service $service): self
    {
        return new self($service, true);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $card = [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'icon' => $this->icon,
            'excerpt' => $this->excerpt,
            'image' => $this->cover($this->whenLoaded('image')),
        ];

        if (! $this->detailed) {
            return $card;
        }

        return [
            ...$card,
            'description' => $this->description,
            'features' => $this->features ?? [],
            'gallery' => $this->covers($this->whenLoaded('gallery', fn () => $this->gallery, fn () => [])),
        ];
    }
}
