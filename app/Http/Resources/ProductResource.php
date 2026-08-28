<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Http\Resources\Concerns\PresentsCover;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Product
 */
class ProductResource extends JsonResource
{
    use PresentsCover;

    public function __construct(Product $resource, private readonly bool $detailed = false)
    {
        parent::__construct($resource);
    }

    public static function detailed(Product $product): self
    {
        return new self($product, true);
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
            'sku' => $this->sku,
            'excerpt' => $this->excerpt,
            'image' => $this->cover($this->whenLoaded('image')),
            'category' => $this->whenLoaded('category', fn (): ?array => $this->category ? [
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ] : null),
            'isFeatured' => $this->is_featured,
        ];

        if (! $this->detailed) {
            return $card;
        }

        return [
            ...$card,
            'description' => $this->description,
            'specifications' => $this->specifications ?? [],
            'applications' => $this->applications ?? [],
            'downloads' => $this->downloads ?? [],
            'gallery' => $this->covers($this->whenLoaded('gallery', fn () => $this->gallery, fn () => [])),
        ];
    }
}
