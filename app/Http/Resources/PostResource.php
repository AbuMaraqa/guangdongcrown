<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Http\Resources\Concerns\PresentsCover;
use App\Models\Post;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Post
 */
class PostResource extends JsonResource
{
    use PresentsCover;

    public function __construct(Post $resource, private readonly bool $detailed = false)
    {
        parent::__construct($resource);
    }

    public static function detailed(Post $post): self
    {
        return new self($post, true);
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
            'excerpt' => $this->summary(),
            'image' => $this->cover($this->whenLoaded('image')),
            'publishedAt' => $this->resource->published_at?->toIso8601String(),
            'publishedLabel' => $this->resource->published_at?->translatedFormat('j F Y'),
            'readingMinutes' => $this->reading_minutes,
            'isFeatured' => $this->is_featured,
            'category' => $this->whenLoaded('category', fn (): ?array => $this->category ? [
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ] : null),
            'author' => $this->whenLoaded('author', fn (): ?array => $this->author ? [
                'name' => $this->author->name,
                'jobTitle' => $this->author->job_title,
            ] : null),
        ];

        if (! $this->detailed) {
            return $card;
        }

        return [
            ...$card,
            'content' => $this->content,
            'tags' => $this->whenLoaded('tags', fn (): array => $this->tags
                ->map(fn (Tag $t): array => ['name' => $t->name, 'slug' => $t->slug])->all()),
        ];
    }
}
