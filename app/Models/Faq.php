<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\Publishable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $question
 * @property string $answer
 */
#[Fillable(['question', 'answer', 'category', 'is_active', 'position'])]
class Faq extends Model
{
    use Publishable;

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'position' => 'integer'];
    }
}
