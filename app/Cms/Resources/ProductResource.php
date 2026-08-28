<?php

declare(strict_types=1);

namespace App\Cms\Resources;

use App\Cms\CmsResource;
use App\Cms\Field;
use App\Models\Product;
use App\Models\ProductCategory;

class ProductResource extends CmsResource
{
    public function model(): string
    {
        return Product::class;
    }

    public function icon(): string
    {
        return 'package';
    }

    public function group(): string
    {
        return 'Catalogue';
    }

    public function description(): ?string
    {
        return 'Aluminium profiles, sheet and billet listed on the public catalogue.';
    }

    public function with(): array
    {
        return ['image', 'category'];
    }

    public function searchable(): array
    {
        return ['name', 'sku', 'excerpt'];
    }

    public function columns(): array
    {
        return [
            ['key' => 'name', 'label' => 'Product', 'type' => 'primary'],
            ['key' => 'sku', 'label' => 'SKU', 'type' => 'mono'],
            ['key' => 'category.name', 'label' => 'Category', 'type' => 'text'],
            ['key' => 'is_featured', 'label' => 'Featured', 'type' => 'boolean'],
            ['key' => 'is_active', 'label' => 'Live', 'type' => 'boolean'],
        ];
    }

    public function filters(): array
    {
        return [
            [
                'key' => 'product_category_id',
                'label' => 'Category',
                'options' => ProductCategory::query()->ordered()->get(['id', 'name'])
                    ->map(fn (ProductCategory $c): array => ['value' => $c->id, 'label' => $c->name])->all(),
            ],
            [
                'key' => 'is_active',
                'label' => 'Visibility',
                'options' => [['value' => '1', 'label' => 'Live'], ['value' => '0', 'label' => 'Hidden']],
            ],
        ];
    }

    public function formOptions(): array
    {
        return [
            'product_category_id' => ProductCategory::query()->ordered()->get(['id', 'name'])
                ->map(fn (ProductCategory $c): array => ['value' => $c->id, 'label' => $c->name])->all(),
        ];
    }

    public function fields(): array
    {
        return [
            Field::text('name', 'Product name')->required()->rules(['required', 'string', 'max:180']),
            Field::slug('slug', 'name')->rules(['nullable', 'string', 'max:180']),
            Field::textarea('excerpt', 'Short description')
                ->rules(['nullable', 'string', 'max:400'])
                ->help('One or two sentences used on catalogue cards.'),
            Field::richtext('description', 'Full description')->rules(['nullable', 'string']),
            Field::repeater('specifications', [
                Field::text('label', 'Property')->required()->rules(['required', 'string', 'max:120'])->width('half'),
                Field::text('value', 'Value')->required()->rules(['required', 'string', 'max:240'])->width('half'),
            ], 'Technical specifications')
                ->section('Specifications')
                ->help('Alloy, temper, tolerances, finishes, dimensional range.'),
            Field::stringList('applications', 'Typical applications')->section('Specifications'),
            Field::repeater('downloads', [
                Field::text('label', 'Document')->required()->rules(['required', 'string', 'max:120'])->width('half'),
                Field::url('url', 'File URL')->required()->rules(['required', 'url', 'max:2048'])->width('half'),
            ], 'Downloads')->section('Specifications'),
            Field::text('sku', 'SKU / reference')
                ->rules(['nullable', 'string', 'max:64'])
                ->panel('side')->section('Details'),
            Field::select('product_category_id', 'Category')
                ->relation('product_category_id')
                ->rules(['nullable', 'integer', 'exists:product_categories,id'])
                ->panel('side')->section('Details'),
            Field::image('image_id', 'Cover image')->panel('side')->section('Media'),
            Field::toggle('is_featured', 'Featured')->panel('side')->section('Visibility'),
            Field::toggle('is_active', 'Live on site')->default(true)->panel('side')->section('Visibility'),
            Field::number('position', 'Order')->rules(['nullable', 'integer', 'min:0'])->panel('side')->section('Visibility'),
        ];
    }
}
