<?php

declare(strict_types=1);

namespace App\Models;

use App\Contracts\HasMediaGallery;
use App\Models\Concerns\HasGallery;
use App\Models\Concerns\Publishable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * A certification, accreditation or award held by the company.
 *
 * @property string $type
 * @property string $name
 */
#[Fillable(['type', 'name', 'issuer', 'description', 'reference', 'year', 'image_id', 'is_active', 'position'])]
class Credential extends Model implements HasMediaGallery
{
    use HasGallery, Publishable;

    protected function casts(): array
    {
        return ['year' => 'integer', 'is_active' => 'boolean', 'position' => 'integer'];
    }

    /**
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeOfType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }
}
