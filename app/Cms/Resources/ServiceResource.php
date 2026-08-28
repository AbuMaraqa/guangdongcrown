<?php

declare(strict_types=1);

namespace App\Cms\Resources;

use App\Cms\CmsResource;
use App\Cms\Field;
use App\Models\Service;

class ServiceResource extends CmsResource
{
    public function model(): string
    {
        return Service::class;
    }

    public function icon(): string
    {
        return 'layers';
    }

    public function group(): string
    {
        return 'Capabilities';
    }

    public function description(): ?string
    {
        return 'The core capabilities shown in the main navigation and on the home page.';
    }

    public function with(): array
    {
        return ['image'];
    }

    public function columns(): array
    {
        return [
            ['key' => 'name', 'label' => 'Service', 'type' => 'primary'],
            ['key' => 'is_featured', 'label' => 'Featured', 'type' => 'boolean'],
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
            Field::repeater('features', [
                Field::text('title')->required()->rules(['required', 'string', 'max:140']),
                Field::textarea('description')->rules(['nullable', 'string', 'max:400']),
            ], 'Capability highlights')->section('Details'),
            Field::icon('icon', 'Icon')
                ->help('Lucide icon name, for example "ship", "warehouse" or "factory".')
                ->panel('side')->section('Details'),
            Field::image('image_id', 'Image')->panel('side')->section('Media'),
            Field::toggle('is_featured', 'Featured')->panel('side')->section('Visibility'),
            Field::toggle('is_active', 'Live on site')->default(true)->panel('side')->section('Visibility'),
            Field::number('position', 'Order')->rules(['nullable', 'integer', 'min:0'])->panel('side')->section('Visibility'),
        ];
    }
}
