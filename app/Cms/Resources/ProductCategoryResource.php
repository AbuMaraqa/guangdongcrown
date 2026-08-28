<?php

declare(strict_types=1);

namespace App\Cms\Resources;

use App\Cms\CmsResource;
use App\Cms\Field;
use App\Models\ProductCategory;

class ProductCategoryResource extends CmsResource
{
    public function model(): string
    {
        return ProductCategory::class;
    }

    public function key(): string
    {
        return 'product-categories';
    }

    public function label(): string
    {
        return 'Product categories';
    }

    public function singular(): string
    {
        return 'Product category';
    }

    public function icon(): string
    {
        return 'folder-tree';
    }

    public function group(): string
    {
        return 'Catalogue';
    }

    public function with(): array
    {
        return ['image'];
    }

    public function columns(): array
    {
        return [
            ['key' => 'name', 'label' => 'Category', 'type' => 'primary'],
            ['key' => 'slug', 'label' => 'URL', 'type' => 'mono'],
            ['key' => 'is_active', 'label' => 'Live', 'type' => 'boolean'],
        ];
    }

    public function formOptions(): array
    {
        return [
            'parent_id' => ProductCategory::query()->ordered()->get(['id', 'name'])
                ->map(fn (ProductCategory $c): array => ['value' => $c->id, 'label' => $c->name])->all(),
        ];
    }

    public function fields(): array
    {
        return [
            Field::text('name')->required()->rules(['required', 'string', 'max:140']),
            Field::slug('slug', 'name')->rules(['nullable', 'string', 'max:140']),
            Field::textarea('description')->rules(['nullable', 'string', 'max:600']),
            Field::select('parent_id', 'Parent category')
                ->relation('parent_id')
                ->rules(['nullable', 'integer', 'exists:product_categories,id'])
                ->panel('side')->section('Details'),
            Field::image('image_id', 'Category image')->panel('side')->section('Media'),
            Field::toggle('is_active', 'Live on site')->default(true)->panel('side')->section('Visibility'),
            Field::number('position', 'Order')->rules(['nullable', 'integer', 'min:0'])->panel('side')->section('Visibility'),
        ];
    }
}
