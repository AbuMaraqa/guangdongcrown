<?php

declare(strict_types=1);

namespace App\Enums;

enum InquiryStatus: string
{
    case New = 'new';
    case Contacted = 'contacted';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::New => 'New',
            self::Contacted => 'Contacted',
            self::InProgress => 'In progress',
            self::Completed => 'Completed',
            self::Archived => 'Archived',
        };
    }

    public function tone(): string
    {
        return match ($this) {
            self::New => 'blue',
            self::Contacted => 'amber',
            self::InProgress => 'violet',
            self::Completed => 'emerald',
            self::Archived => 'slate',
        };
    }

    /**
     * @return list<array{value: string, label: string, tone: string}>
     */
    public static function options(): array
    {
        return array_map(fn (self $s): array => [
            'value' => $s->value,
            'label' => $s->label(),
            'tone' => $s->tone(),
        ], self::cases());
    }
}
