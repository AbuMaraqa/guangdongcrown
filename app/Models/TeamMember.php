<?php

declare(strict_types=1);

namespace App\Models;

use App\Contracts\Seoable;
use App\Models\Concerns\HasSeo;
use App\Models\Concerns\HasSlug;
use App\Models\Concerns\Publishable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property string $name
 * @property string $slug
 * @property array<string, string>|null $socials
 */
#[Fillable([
    'name', 'slug', 'position', 'department', 'bio', 'email', 'socials',
    'photo_id', 'is_leadership', 'is_active', 'position_order',
])]
class TeamMember extends Model implements Seoable
{
    use HasSeo, HasSlug, Publishable, SoftDeletes;

    protected function casts(): array
    {
        return [
            'socials' => 'array',
            'is_leadership' => 'boolean',
            'is_active' => 'boolean',
            'position_order' => 'integer',
        ];
    }

    public function orderColumn(): string
    {
        return 'position_order';
    }

    /**
     * @return BelongsTo<MediaAsset, $this>
     */
    public function photo(): BelongsTo
    {
        return $this->belongsTo(MediaAsset::class, 'photo_id');
    }
}
