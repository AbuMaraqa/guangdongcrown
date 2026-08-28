<?php

declare(strict_types=1);

namespace App\Models;

use App\Contracts\HasMediaGallery;
use App\Models\Concerns\HasGallery;
use App\Models\Concerns\Publishable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $year
 * @property string $title
 */
#[Fillable(['year', 'title', 'description', 'image_id', 'is_active', 'position'])]
class Milestone extends Model implements HasMediaGallery
{
    use HasGallery, Publishable;

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'position' => 'integer'];
    }
}
