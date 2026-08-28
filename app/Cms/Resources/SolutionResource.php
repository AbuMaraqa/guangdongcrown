<?php

declare(strict_types=1);

namespace App\Cms\Resources;

use App\Cms\CmsResource;
use App\Cms\Field;
use App\Models\Industry;
use App\Models\Solution;

class SolutionResource extends CmsResource
{
    public function model(): string
    {
        return Solution::class;
    }

    public function icon(): string
    {
        return 'route';
    }

    public function group(): string
    {
        return 'Capabilities';
    }

    public function description(): ?string
    {
        return 'End-to-end offerings with their own landing page, process and benefits.';
    }

    public function titleAttribute(): string
    {
        return 'title';
    }

    public function searchable(): array
    {
        return ['title', 'excerpt'];
    }

    public function with(): array
    {
        return ['image'];
    }

    public function syncedRelations(): array
    {
        return ['industries'];
    }

    public function columns(): array
    {
        return [
            ['key' => 'title', 'label' => 'Solution', 'type' => 'primary'],
            ['key' => 'is_featured', 'label' => 'Featured', 'type' => 'boolean'],
            ['key' => 'is_active', 'label' => 'Live', 'type' => 'boolean'],
        ];
    }

    public function formOptions(): array
    {
        return [
            'industries' => Industry::query()->ordered()->get(['id', 'name'])
                ->map(fn (Industry $i): array => ['value' => $i->id, 'label' => $i->name])->all(),
        ];
    }

    public function fields(): array
    {
        return [
            Field::text('title')->required()->rules(['required', 'string', 'max:160']),
            Field::slug('slug', 'title')->rules(['nullable', 'string', 'max:160']),
            Field::textarea('excerpt', 'Short description')->rules(['nullable', 'string', 'max:400']),
            Field::richtext('content', 'Body')->rules(['nullable', 'string']),
            Field::repeater('features', [
                Field::text('title')->required()->rules(['required', 'string', 'max:140']),
                Field::textarea('description')->rules(['nullable', 'string', 'max:400']),
            ], 'Features')->section('Details'),
            Field::repeater('benefits', [
                Field::text('title')->required()->rules(['required', 'string', 'max:140']),
                Field::textarea('description')->rules(['nullable', 'string', 'max:400']),
            ], 'Benefits')->section('Details'),
            Field::repeater('process', [
                Field::text('title', 'Step')->required()->rules(['required', 'string', 'max:140']),
                Field::textarea('description')->rules(['nullable', 'string', 'max:400']),
            ], 'Process steps')->section('Details'),
            Field::multiselect('industries', 'Industries served')
                ->relation('industries')
                ->rules(['array'])
                ->panel('side')->section('Relations'),
            Field::icon('icon', 'Icon')->panel('side')->section('Details'),
            Field::image('image_id', 'Hero image')->panel('side')->section('Media'),
            Field::toggle('is_featured', 'Featured')->panel('side')->section('Visibility'),
            Field::toggle('is_active', 'Live on site')->default(true)->panel('side')->section('Visibility'),
            Field::number('position', 'Order')->rules(['nullable', 'integer', 'min:0'])->panel('side')->section('Visibility'),
        ];
    }
}
