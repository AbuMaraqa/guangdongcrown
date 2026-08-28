<?php

declare(strict_types=1);

namespace App\Cms\Resources;

use App\Cms\CmsResource;
use App\Cms\Field;
use App\Enums\ContentStatus;
use App\Models\Page;

class PageResource extends CmsResource
{
    public function model(): string
    {
        return Page::class;
    }

    public function icon(): string
    {
        return 'layout-template';
    }

    public function group(): string
    {
        return 'Content';
    }

    public function description(): ?string
    {
        return 'Standalone pages such as privacy, terms and quality policy.';
    }

    public function titleAttribute(): string
    {
        return 'title';
    }

    public function searchable(): array
    {
        return ['title', 'slug'];
    }

    public function columns(): array
    {
        return [
            ['key' => 'title', 'label' => 'Page', 'type' => 'primary'],
            ['key' => 'slug', 'label' => 'URL', 'type' => 'mono'],
            ['key' => 'status', 'label' => 'Status', 'type' => 'status'],
            ['key' => 'updated_at', 'label' => 'Updated', 'type' => 'date'],
        ];
    }

    public function filters(): array
    {
        return [
            [
                'key' => 'status',
                'label' => 'Status',
                'options' => ContentStatus::options(),
            ],
        ];
    }

    public function fields(): array
    {
        return [
            Field::text('title')->required()->rules(['required', 'string', 'max:180']),
            Field::slug('slug', 'title')->rules(['nullable', 'string', 'max:180']),
            Field::textarea('excerpt', 'Summary')
                ->rules(['nullable', 'string', 'max:400'])
                ->help('Shown in search results and link previews when no meta description is set.'),
            Field::richtext('content')->rules(['nullable', 'string']),
            Field::select('status')
                ->options(ContentStatus::options())
                ->default(ContentStatus::Draft->value)
                ->rules(['required', 'string', 'in:draft,published,archived'])
                ->panel('side')
                ->section('Publishing'),
            Field::image('image_id', 'Header image')->panel('side')->section('Media'),
            Field::number('position', 'Order')->rules(['nullable', 'integer', 'min:0'])->panel('side')->section('Publishing'),
        ];
    }
}
