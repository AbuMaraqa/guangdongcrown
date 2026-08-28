<?php

declare(strict_types=1);

namespace App\Cms\Resources;

use App\Cms\CmsResource;
use App\Cms\Field;
use App\Models\Faq;

class FaqResource extends CmsResource
{
    public function model(): string
    {
        return Faq::class;
    }

    public function key(): string
    {
        return 'faqs';
    }

    public function label(): string
    {
        return 'FAQ';
    }

    public function singular(): string
    {
        return 'Question';
    }

    public function icon(): string
    {
        return 'circle-help';
    }

    public function group(): string
    {
        return 'Content';
    }

    public function titleAttribute(): string
    {
        return 'question';
    }

    public function searchable(): array
    {
        return ['question', 'answer'];
    }

    public function columns(): array
    {
        return [
            ['key' => 'question', 'label' => 'Question', 'type' => 'primary'],
            ['key' => 'category', 'label' => 'Group', 'type' => 'badge'],
            ['key' => 'is_active', 'label' => 'Live', 'type' => 'boolean'],
        ];
    }

    public function fields(): array
    {
        return [
            Field::text('question')->required()->rules(['required', 'string', 'max:300']),
            Field::textarea('answer')->required()->rules(['required', 'string', 'max:2000']),
            Field::text('category', 'Group')
                ->rules(['nullable', 'string', 'max:64'])
                ->help('Used to group questions on the FAQ page, e.g. "Ordering" or "Logistics".')
                ->panel('side')->section('Details'),
            Field::toggle('is_active', 'Live on site')->default(true)->panel('side')->section('Visibility'),
            Field::number('position', 'Order')->rules(['nullable', 'integer', 'min:0'])->panel('side')->section('Visibility'),
        ];
    }
}
