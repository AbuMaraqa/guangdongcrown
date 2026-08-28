<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Http\Resources\Concerns\PresentsCover;
use App\Models\TeamMember;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin TeamMember
 */
class TeamMemberResource extends JsonResource
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
            'slug' => $this->slug,
            'position' => $this->position,
            'department' => $this->department,
            'bio' => $this->bio,
            'email' => $this->email,
            'socials' => $this->socials ?? [],
            'photo' => $this->cover($this->whenLoaded('photo')),
            'isLeadership' => $this->is_leadership,
        ];
    }
}
