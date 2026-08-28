<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Http\Resources\Concerns\PresentsCover;
use App\Models\Testimonial;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Testimonial
 */
class TestimonialResource extends JsonResource
{
    use PresentsCover;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'role' => $this->role,
            'company' => $this->company,
            'country' => $this->country,
            'content' => $this->content,
            'rating' => $this->rating,
            'avatar' => $this->cover($this->whenLoaded('avatar')),
        ];
    }
}
