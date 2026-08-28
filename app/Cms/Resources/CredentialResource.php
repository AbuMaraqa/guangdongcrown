<?php

declare(strict_types=1);

namespace App\Cms\Resources;

use App\Cms\CmsResource;
use App\Cms\Field;
use App\Models\Credential;

class CredentialResource extends CmsResource
{
    public function model(): string
    {
        return Credential::class;
    }

    public function label(): string
    {
        return 'Certifications & awards';
    }

    public function singular(): string
    {
        return 'Credential';
    }

    public function icon(): string
    {
        return 'award';
    }

    public function group(): string
    {
        return 'Evidence';
    }

    public function description(): ?string
    {
        return 'Publish only credentials the company actually holds, with the issuing body and certificate reference.';
    }

    public function with(): array
    {
        return ['image'];
    }

    public function searchable(): array
    {
        return ['name', 'issuer'];
    }

    public function columns(): array
    {
        return [
            ['key' => 'name', 'label' => 'Credential', 'type' => 'primary'],
            ['key' => 'type', 'label' => 'Type', 'type' => 'badge'],
            ['key' => 'issuer', 'label' => 'Issued by', 'type' => 'text'],
            ['key' => 'year', 'label' => 'Year', 'type' => 'text'],
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
                    ['value' => 'certification', 'label' => 'Certification'],
                    ['value' => 'award', 'label' => 'Award'],
                    ['value' => 'membership', 'label' => 'Membership'],
                ],
            ],
        ];
    }

    public function fields(): array
    {
        return [
            Field::text('name')->required()->rules(['required', 'string', 'max:180']),
            Field::text('issuer', 'Issuing body')
                ->rules(['nullable', 'string', 'max:180'])
                ->help('The organisation that granted this credential.'),
            Field::textarea('description', 'Scope')->rules(['nullable', 'string', 'max:800']),
            Field::text('reference', 'Certificate number')
                ->rules(['nullable', 'string', 'max:120'])
                ->panel('side')->section('Details'),
            Field::select('type')
                ->options([
                    ['value' => 'certification', 'label' => 'Certification'],
                    ['value' => 'award', 'label' => 'Award'],
                    ['value' => 'membership', 'label' => 'Membership'],
                ])
                ->default('certification')
                ->rules(['required', 'string', 'in:certification,award,membership'])
                ->panel('side')->section('Details'),
            Field::number('year')->rules(['nullable', 'integer', 'min:1900', 'max:2100'])->panel('side')->section('Details'),
            Field::image('image_id', 'Logo or certificate')->panel('side')->section('Media'),
            Field::toggle('is_active', 'Live on site')->default(true)->panel('side')->section('Visibility'),
            Field::number('position', 'Order')->rules(['nullable', 'integer', 'min:0'])->panel('side')->section('Visibility'),
        ];
    }
}
