<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\Publishable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $name
 * @property string $country
 * @property string $type
 */
#[Fillable([
    'name', 'type', 'country', 'country_code', 'city', 'address',
    'latitude', 'longitude', 'phone', 'email', 'is_headquarters', 'is_active', 'position',
])]
class Location extends Model
{
    use Publishable;

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'is_headquarters' => 'boolean',
            'is_active' => 'boolean',
            'position' => 'integer',
        ];
    }
}
