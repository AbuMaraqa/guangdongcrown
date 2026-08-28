<?php

declare(strict_types=1);

namespace App\Enums;

enum ContentStatus: string
{
    case Draft = 'draft';
    case Published = 'published';
    case Archived = 'archived';

    public function label(): string
    {
        return ucfirst($this->value);
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(fn (self $s): array => ['value' => $s->value, 'label' => $s->label()], self::cases());
    }
}
