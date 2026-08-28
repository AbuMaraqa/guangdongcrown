<?php

declare(strict_types=1);

namespace App\Cms\Resources;

use App\Cms\CmsResource;
use App\Cms\Field;
use App\Models\Industry;

class IndustryResource extends CmsResource
{
    public function model(): string
    {
        return Industry::class;
    }

    public function label(): string
    {
        return 'Industries';
    }

    public function key(): string
    {
        return 'industries';
    }

    public function icon(): string
    {
        return 'building-2';
    }

    public function group(): string
    {
        return 'Capabilities';
    }

    public function with(): array
    {
        return ['image'];
    }

    public function columns(): array
    {
        return [
            ['key' => 'name', 'label' => 'Industry', 'type' => 'primary'],
            ['key' => 'slug', 'label' => 'URL', 'type' => 'mono'],
            ['key' => 'is_active', 'label' => 'Live', 'type' => 'boolean'],
        ];
    }

    public function fields(): array
    {
        return [
            Field::text('name')->required()->rules(['required', 'string', 'max:140']),
            Field::slug('slug', 'name')->rules(['nullable', 'string', 'max:140']),
            Field::textarea('excerpt', 'Short description')->rules(['nullable', 'string', 'max:400']),
            Field::richtext('description', 'Full description')->rules(['nullable', 'string']),
            Field::icon('icon', 'Icon')->panel('side')->section('Details'),
            Field::image('image_id', 'Image')->panel('side')->section('Media'),
            Field::toggle('is_active', 'Live on site')->default(true)->panel('side')->section('Visibility'),
            Field::number('position', 'Order')->rules(['nullable', 'integer', 'min:0'])->panel('side')->section('Visibility'),
        ];
    }
}
