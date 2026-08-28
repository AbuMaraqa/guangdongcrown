<?php

declare(strict_types=1);

namespace App\Cms\Resources;

use App\Cms\CmsResource;
use App\Cms\Field;
use App\Models\Milestone;

class MilestoneResource extends CmsResource
{
    public function model(): string
    {
        return Milestone::class;
    }

    public function label(): string
    {
        return 'Company timeline';
    }

    public function singular(): string
    {
        return 'Milestone';
    }

    public function icon(): string
    {
        return 'milestone';
    }

    public function group(): string
    {
        return 'Company';
    }

    public function searchable(): array
    {
        return ['title', 'year'];
    }

    public function titleAttribute(): string
    {
        return 'title';
    }

    public function columns(): array
    {
        return [
            ['key' => 'year', 'label' => 'Year', 'type' => 'mono'],
            ['key' => 'title', 'label' => 'Milestone', 'type' => 'primary'],
            ['key' => 'is_active', 'label' => 'Live', 'type' => 'boolean'],
        ];
    }

    public function fields(): array
    {
        return [
            Field::text('year')->required()->rules(['required', 'string', 'max:16'])->width('half'),
            Field::text('title')->required()->rules(['required', 'string', 'max:180']),
            Field::textarea('description')->rules(['nullable', 'string', 'max:800']),
            Field::image('image_id', 'Image')->panel('side')->section('Media'),
            Field::toggle('is_active', 'Live on site')->default(true)->panel('side')->section('Visibility'),
            Field::number('position', 'Order')->rules(['nullable', 'integer', 'min:0'])->panel('side')->section('Visibility'),
        ];
    }
}
