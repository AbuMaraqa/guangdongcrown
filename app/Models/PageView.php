<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $path
 * @property string|null $page_type
 */
#[Fillable(['path', 'page_type', 'referrer', 'visitor_hash', 'viewed_at'])]
class PageView extends Model
{
    public $timestamps = false;

    protected function casts(): array
    {
        return ['viewed_at' => 'datetime'];
    }
}
