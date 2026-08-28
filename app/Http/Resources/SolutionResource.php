<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Http\Resources\Concerns\PresentsCover;
use App\Models\Industry;
use App\Models\Solution;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Solution
 */
class SolutionResource extends JsonResource
{
    use PresentsCover;

    public function __construct(Solution $resource, private readonly bool $detailed = false)
    {
        parent::__construct($resource);
    }

    public static function detailed(Solution $solution): self
    {
        return new self($solution, true);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $card = [
            'id' => $this->id,
            'title' => $this->title,
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
            'content' => $this->content,
            'features' => $this->features ?? [],
            'benefits' => $this->benefits ?? [],
            'process' => $this->process ?? [],
            'gallery' => $this->covers($this->whenLoaded('gallery', fn () => $this->gallery, fn () => [])),
            'industries' => $this->whenLoaded('industries', fn (): array => $this->industries
                ->map(fn (Industry $i): array => ['name' => $i->name, 'slug' => $i->slug])->all()),
        ];
    }
}
