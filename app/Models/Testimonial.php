<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\Publishable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property string $name
 * @property string $content
 */
#[Fillable([
    'name', 'company', 'role', 'country', 'content', 'rating',
    'avatar_id', 'is_featured', 'is_active', 'position',
])]
class Testimonial extends Model
{
    use Publishable, SoftDeletes;

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'position' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<MediaAsset, $this>
     */
    public function avatar(): BelongsTo
    {
        return $this->belongsTo(MediaAsset::class, 'avatar_id');
    }
}
