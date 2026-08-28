<?php

declare(strict_types=1);

namespace App\Cms\Resources;

use App\Cms\CmsResource;
use App\Cms\Field;
use App\Models\ProjectCategory;

class ProjectCategoryResource extends CmsResource
{
    public function model(): string
    {
        return ProjectCategory::class;
    }

    public function key(): string
    {
        return 'project-categories';
    }

    public function label(): string
    {
        return 'Project categories';
    }

    public function singular(): string
    {
        return 'Project category';
    }

    public function icon(): string
    {
        return 'tags';
    }

    public function group(): string
    {
        return 'Evidence';
    }

    public function columns(): array
    {
        return [
            ['key' => 'name', 'label' => 'Category', 'type' => 'primary'],
            ['key' => 'slug', 'label' => 'URL', 'type' => 'mono'],
            ['key' => 'is_active', 'label' => 'Live', 'type' => 'boolean'],
        ];
    }

    public function fields(): array
    {
        return [
            Field::text('name')->required()->rules(['required', 'string', 'max:140']),
            Field::slug('slug', 'name')->rules(['nullable', 'string', 'max:140']),
            Field::toggle('is_active', 'Live on site')->default(true)->panel('side')->section('Visibility'),
            Field::number('position', 'Order')->rules(['nullable', 'integer', 'min:0'])->panel('side')->section('Visibility'),
        ];
    }
}
