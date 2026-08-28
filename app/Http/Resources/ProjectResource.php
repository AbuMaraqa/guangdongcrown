<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Http\Resources\Concerns\PresentsCover;
use App\Models\Industry;
use App\Models\Project;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Project
 */
class ProjectResource extends JsonResource
{
    use PresentsCover;

    public function __construct(Project $resource, private readonly bool $detailed = false)
    {
        parent::__construct($resource);
    }

    public static function detailed(Project $project): self
    {
        return new self($project, true);
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
            'client' => $this->client,
            'location' => $this->location,
            'country' => $this->country,
            'excerpt' => $this->excerpt,
            'completedAt' => $this->resource->completed_at?->format('M Y'),
            'image' => $this->cover($this->whenLoaded('image')),
            'category' => $this->whenLoaded('category', fn (): ?array => $this->category ? [
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ] : null),
        ];

        if (! $this->detailed) {
            return $card;
        }

        return [
            ...$card,
            'description' => $this->description,
            'results' => $this->results ?? [],
            'gallery' => $this->covers($this->whenLoaded('gallery', fn () => $this->gallery, fn () => [])),
            'services' => $this->whenLoaded('services', fn (): array => $this->services
                ->map(fn (Service $s): array => ['name' => $s->name, 'slug' => $s->slug])->all()),
            'industries' => $this->whenLoaded('industries', fn (): array => $this->industries
                ->map(fn (Industry $i): array => ['name' => $i->name, 'slug' => $i->slug])->all()),
        ];
    }
}
