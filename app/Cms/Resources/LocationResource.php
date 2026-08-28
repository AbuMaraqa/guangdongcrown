<?php

declare(strict_types=1);

namespace App\Cms\Resources;

use App\Cms\CmsResource;
use App\Cms\Field;
use App\Models\Location;

class LocationResource extends CmsResource
{
    public function model(): string
    {
        return Location::class;
    }

    public function label(): string
    {
        return 'Locations & coverage';
    }

    public function singular(): string
    {
        return 'Location';
    }

    public function icon(): string
    {
        return 'map-pin';
    }

    public function group(): string
    {
        return 'Company';
    }

    public function description(): ?string
    {
        return 'Offices, facilities and served markets plotted on the global presence map.';
    }

    public function searchable(): array
    {
        return ['name', 'country', 'city'];
    }

    public function columns(): array
    {
        return [
            ['key' => 'name', 'label' => 'Location', 'type' => 'primary'],
            ['key' => 'type', 'label' => 'Type', 'type' => 'badge'],
            ['key' => 'country', 'label' => 'Country', 'type' => 'text'],
            ['key' => 'is_headquarters', 'label' => 'HQ', 'type' => 'boolean'],
            ['key' => 'is_active', 'label' => 'Live', 'type' => 'boolean'],
        ];
    }

    public function filters(): array
    {
        return [
            [
                'key' => 'type',
                'label' => 'Type',
                'options' => [
                    ['value' => 'office', 'label' => 'Office'],
                    ['value' => 'facility', 'label' => 'Facility'],
                    ['value' => 'warehouse', 'label' => 'Warehouse'],
                    ['value' => 'market', 'label' => 'Served market'],
                ],
            ],
        ];
    }

    public function fields(): array
    {
        return [
            Field::text('name')->required()->rules(['required', 'string', 'max:160']),
            Field::select('type')
                ->options([
                    ['value' => 'office', 'label' => 'Office'],
                    ['value' => 'facility', 'label' => 'Facility'],
                    ['value' => 'warehouse', 'label' => 'Warehouse'],
                    ['value' => 'market', 'label' => 'Served market'],
                ])
                ->default('office')
                ->rules(['required', 'string', 'in:office,facility,warehouse,market'])
                ->width('half'),
            Field::text('country')->required()->rules(['required', 'string', 'max:120'])->width('half'),
            Field::text('country_code', 'ISO country code')
                ->rules(['nullable', 'string', 'size:2'])
                ->placeholder('CN')
                ->width('half'),
            Field::text('city')->rules(['nullable', 'string', 'max:120'])->width('half'),
            Field::textarea('address')->rules(['nullable', 'string', 'max:600']),
            Field::number('latitude')->rules(['nullable', 'numeric', 'between:-90,90'])->width('half')->panel('side')->section('Map'),
            Field::number('longitude')->rules(['nullable', 'numeric', 'between:-180,180'])->width('half')->panel('side')->section('Map'),
            Field::text('phone')->rules(['nullable', 'string', 'max:64'])->panel('side')->section('Contact'),
            Field::email('email')->panel('side')->section('Contact'),
            Field::toggle('is_headquarters', 'Headquarters')->panel('side')->section('Visibility'),
            Field::toggle('is_active', 'Live on site')->default(true)->panel('side')->section('Visibility'),
            Field::number('position', 'Order')->rules(['nullable', 'integer', 'min:0'])->panel('side')->section('Visibility'),
        ];
    }
}
