<?php

declare(strict_types=1);

namespace App\Cms\Resources;

use App\Cms\CmsResource;
use App\Cms\Field;
use App\Models\Catalogue;
use App\Models\ProductCategory;

class CatalogueResource extends CmsResource
{
    public function model(): string
    {
        return Catalogue::class;
    }

    public function label(): string
    {
        return 'Catalogues';
    }

    public function icon(): string
    {
        return 'book-open';
    }

    public function group(): string
    {
        return 'Catalogue';
    }

    public function description(): ?string
    {
        return 'Each catalogue is a cover plus its page images, browsed on the site as a flipbook.';
    }

    public function with(): array
    {
        return ['image', 'category'];
    }

    public function searchable(): array
    {
        return ['name', 'code'];
    }

    public function columns(): array
    {
        return [
            ['key' => 'name', 'label' => 'Catalogue', 'type' => 'primary'],
            ['key' => 'code', 'label' => 'Code', 'type' => 'mono'],
            ['key' => 'category.name', 'label' => 'Category', 'type' => 'text'],
            ['key' => 'year', 'label' => 'Year', 'type' => 'text'],
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
            Field::text('name', 'Catalogue name')->translatable()->required()->rules(['required', 'string', 'max:160']),
            Field::slug('slug', 'name')->rules(['nullable', 'string', 'max:160']),
            Field::textarea('excerpt', 'Short description')
                ->translatable()
                ->rules(['nullable', 'string', 'max:400'])
                ->help('One line describing what the catalogue covers.'),
            Field::text('code', 'System code')
                ->rules(['nullable', 'string', 'max:40'])
                ->help('Optional reference such as CS-4000, shown beside the name.')
                ->panel('side')->section('Details'),
            Field::select('product_category_id', 'Product category')
                ->relation('product_category_id')
                ->rules(['nullable', 'integer', 'exists:product_categories,id'])
                ->panel('side')->section('Details'),
            Field::number('year', 'Edition year')->rules(['nullable', 'integer', 'min:1980', 'max:2100'])
                ->panel('side')->section('Details'),
            Field::url('file_url', 'PDF download')
                ->help('Optional print-ready file offered alongside the on-site viewer.')
                ->panel('side')->section('Details'),
            Field::image('image_id', 'Cover')->panel('side')->section('Media'),
            Field::toggle('is_featured', 'Featured')->panel('side')->section('Visibility'),
            Field::toggle('is_active', 'Live on site')->default(true)->panel('side')->section('Visibility'),
            Field::number('position', 'Order')->rules(['nullable', 'integer', 'min:0'])->panel('side')->section('Visibility'),
        ];
    }
}
