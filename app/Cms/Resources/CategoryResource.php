<?php

declare(strict_types=1);

namespace App\Cms\Resources;

use App\Cms\CmsResource;
use App\Cms\Field;
use App\Models\Category;

class CategoryResource extends CmsResource
{
    public function model(): string
    {
        return Category::class;
    }

    public function key(): string
    {
        return 'categories';
    }

    public function label(): string
    {
        return 'Insight categories';
    }

    public function singular(): string
    {
        return 'Category';
    }

    public function icon(): string
    {
        return 'bookmark';
    }

    public function group(): string
    {
        return 'Editorial';
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
            Field::text('name')->required()->rules(['required', 'string', 'max:120']),
            Field::slug('slug', 'name')->rules(['nullable', 'string', 'max:120']),
            Field::textarea('description')->rules(['nullable', 'string', 'max:600']),
            Field::toggle('is_active', 'Live on site')->default(true)->panel('side')->section('Visibility'),
            Field::number('position', 'Order')->rules(['nullable', 'integer', 'min:0'])->panel('side')->section('Visibility'),
        ];
    }
}
