<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Http\Resources\Concerns\PresentsCover;
use App\Models\Industry;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Industry
 */
class IndustryResource extends JsonResource
{
    use PresentsCover;

    public function __construct(Industry $resource, private readonly bool $detailed = false)
    {
        parent::__construct($resource);
    }

    public static function detailed(Industry $industry): self
    {
        return new self($industry, true);
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

        return $this->detailed
            ? [...$card, 'description' => $this->description]
            : $card;
    }
}
