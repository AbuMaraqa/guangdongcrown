<?php

declare(strict_types=1);

namespace App\Cms\Resources;

use App\Cms\CmsResource;
use App\Cms\Field;
use App\Models\TeamMember;

class TeamMemberResource extends CmsResource
{
    public function model(): string
    {
        return TeamMember::class;
    }

    public function key(): string
    {
        return 'team';
    }

    public function label(): string
    {
        return 'Team';
    }

    public function singular(): string
    {
        return 'Team member';
    }

    public function icon(): string
    {
        return 'users';
    }

    public function group(): string
    {
        return 'Company';
    }

    public function description(): ?string
    {
        return 'Leadership and specialists shown on the team page.';
    }

    public function with(): array
    {
        return ['photo'];
    }

    public function thumbRelation(): ?string
    {
        return 'photo';
    }

    public function searchable(): array
    {
        return ['name', 'position', 'department'];
    }

    public function columns(): array
    {
        return [
            ['key' => 'name', 'label' => 'Name', 'type' => 'primary'],
            ['key' => 'position', 'label' => 'Role', 'type' => 'text'],
            ['key' => 'department', 'label' => 'Department', 'type' => 'text'],
            ['key' => 'is_leadership', 'label' => 'Leadership', 'type' => 'boolean'],
            ['key' => 'is_active', 'label' => 'Live', 'type' => 'boolean'],
        ];
    }

    public function fields(): array
    {
        return [
            Field::text('name')->required()->rules(['required', 'string', 'max:140']),
            Field::slug('slug', 'name')->rules(['nullable', 'string', 'max:140']),
            Field::text('position', 'Job title')->rules(['nullable', 'string', 'max:140']),
            Field::text('department')->rules(['nullable', 'string', 'max:140']),
            Field::textarea('bio', 'Biography')->rules(['nullable', 'string', 'max:2000']),
            Field::email('email', 'Public email')->panel('side')->section('Contact'),
            Field::repeater('socials', [
                Field::text('platform', 'Platform')->required()->rules(['required', 'string', 'max:40'])->width('half'),
                Field::url('url', 'Profile URL')->required()->rules(['required', 'url', 'max:2048'])->width('half'),
            ], 'Social profiles')->section('Contact'),
            Field::image('photo_id', 'Portrait')->panel('side')->section('Media'),
            Field::toggle('is_leadership', 'Leadership team')->panel('side')->section('Visibility'),
            Field::toggle('is_active', 'Live on site')->default(true)->panel('side')->section('Visibility'),
            Field::number('position_order', 'Order')->rules(['nullable', 'integer', 'min:0'])->panel('side')->section('Visibility'),
        ];
    }
}
