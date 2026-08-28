<?php

declare(strict_types=1);

namespace App\Cms\Resources;

use App\Cms\CmsResource;
use App\Cms\Field;
use App\Models\Testimonial;

class TestimonialResource extends CmsResource
{
    public function model(): string
    {
        return Testimonial::class;
    }

    public function icon(): string
    {
        return 'quote';
    }

    public function group(): string
    {
        return 'Evidence';
    }

    public function description(): ?string
    {
        return 'Client quotes. Publish only statements you have written approval to use.';
    }

    public function with(): array
    {
        return ['avatar'];
    }

    public function thumbRelation(): ?string
    {
        return 'avatar';
    }

    public function searchable(): array
    {
        return ['name', 'company'];
    }

    public function columns(): array
    {
        return [
            ['key' => 'name', 'label' => 'Person', 'type' => 'primary'],
            ['key' => 'company', 'label' => 'Company', 'type' => 'text'],
            ['key' => 'country', 'label' => 'Country', 'type' => 'text'],
            ['key' => 'is_featured', 'label' => 'Featured', 'type' => 'boolean'],
            ['key' => 'is_active', 'label' => 'Live', 'type' => 'boolean'],
        ];
    }

    public function fields(): array
    {
        return [
            Field::textarea('content', 'Quote')->required()->rules(['required', 'string', 'max:1200']),
            Field::text('name')->required()->rules(['required', 'string', 'max:140']),
            Field::text('role', 'Job title')->rules(['nullable', 'string', 'max:140'])->panel('side')->section('Attribution'),
            Field::text('company')->rules(['nullable', 'string', 'max:160'])->panel('side')->section('Attribution'),
            Field::text('country')->rules(['nullable', 'string', 'max:120'])->panel('side')->section('Attribution'),
            Field::number('rating', 'Rating (1-5)')->rules(['nullable', 'integer', 'min:1', 'max:5'])->panel('side')->section('Attribution'),
            Field::image('avatar_id', 'Photo or logo')->panel('side')->section('Media'),
            Field::toggle('is_featured', 'Featured')->panel('side')->section('Visibility'),
            Field::toggle('is_active', 'Live on site')->default(true)->panel('side')->section('Visibility'),
            Field::number('position', 'Order')->rules(['nullable', 'integer', 'min:0'])->panel('side')->section('Visibility'),
        ];
    }
}
