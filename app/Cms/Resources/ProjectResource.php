<?php

declare(strict_types=1);

namespace App\Cms\Resources;

use App\Cms\CmsResource;
use App\Cms\Field;
use App\Models\Industry;
use App\Models\Project;
use App\Models\ProjectCategory;
use App\Models\Service;

class ProjectResource extends CmsResource
{
    public function model(): string
    {
        return Project::class;
    }

    public function icon(): string
    {
        return 'briefcase';
    }

    public function group(): string
    {
        return 'Evidence';
    }

    public function description(): ?string
    {
        return 'Delivered work published as case studies.';
    }

    public function titleAttribute(): string
    {
        return 'title';
    }

    public function searchable(): array
    {
        return ['title', 'client', 'location'];
    }

    public function with(): array
    {
        return ['image', 'category'];
    }

    public function syncedRelations(): array
    {
        return ['services', 'industries'];
    }

    public function columns(): array
    {
        return [
            ['key' => 'title', 'label' => 'Project', 'type' => 'primary'],
            ['key' => 'client', 'label' => 'Client', 'type' => 'text'],
            ['key' => 'country', 'label' => 'Country', 'type' => 'text'],
            ['key' => 'category.name', 'label' => 'Category', 'type' => 'text'],
            ['key' => 'is_active', 'label' => 'Live', 'type' => 'boolean'],
        ];
    }

    public function filters(): array
    {
        return [
            [
                'key' => 'project_category_id',
                'label' => 'Category',
                'options' => ProjectCategory::query()->ordered()->get(['id', 'name'])
                    ->map(fn (ProjectCategory $c): array => ['value' => $c->id, 'label' => $c->name])->all(),
            ],
        ];
    }

    public function formOptions(): array
    {
        return [
            'project_category_id' => ProjectCategory::query()->ordered()->get(['id', 'name'])
                ->map(fn (ProjectCategory $c): array => ['value' => $c->id, 'label' => $c->name])->all(),
            'services' => Service::query()->ordered()->get(['id', 'name'])
                ->map(fn (Service $s): array => ['value' => $s->id, 'label' => $s->name])->all(),
            'industries' => Industry::query()->ordered()->get(['id', 'name'])
                ->map(fn (Industry $i): array => ['value' => $i->id, 'label' => $i->name])->all(),
        ];
    }

    public function fields(): array
    {
        return [
            Field::text('title')->required()->rules(['required', 'string', 'max:180']),
            Field::slug('slug', 'title')->rules(['nullable', 'string', 'max:180']),
            Field::textarea('excerpt', 'Short summary')->rules(['nullable', 'string', 'max:400']),
            Field::richtext('description', 'Case study')->rules(['nullable', 'string']),
            Field::repeater('results', [
                Field::text('label', 'Metric')->required()->rules(['required', 'string', 'max:120'])->width('half'),
                Field::text('value', 'Result')->required()->rules(['required', 'string', 'max:120'])->width('half'),
            ], 'Measured results')->section('Outcome'),
            Field::text('client')->rules(['nullable', 'string', 'max:160'])->panel('side')->section('Details'),
            Field::text('location', 'City / site')->rules(['nullable', 'string', 'max:160'])->panel('side')->section('Details'),
            Field::text('country')->rules(['nullable', 'string', 'max:120'])->panel('side')->section('Details'),
            Field::date('completed_at', 'Completion date')->panel('side')->section('Details'),
            Field::select('project_category_id', 'Category')
                ->relation('project_category_id')
                ->rules(['nullable', 'integer', 'exists:project_categories,id'])
                ->panel('side')->section('Details'),
            Field::multiselect('services', 'Services delivered')
                ->relation('services')->panel('side')->section('Relations'),
            Field::multiselect('industries', 'Industries')
                ->relation('industries')->panel('side')->section('Relations'),
            Field::image('image_id', 'Cover image')->panel('side')->section('Media'),
            Field::toggle('is_featured', 'Featured')->panel('side')->section('Visibility'),
            Field::toggle('is_active', 'Live on site')->default(true)->panel('side')->section('Visibility'),
            Field::number('position', 'Order')->rules(['nullable', 'integer', 'min:0'])->panel('side')->section('Visibility'),
        ];
    }
}
