<?php

declare(strict_types=1);

namespace App\Enums;

enum InquiryType: string
{
    case Contact = 'contact';
    case Quote = 'quote';

    public function label(): string
    {
        return match ($this) {
            self::Contact => 'Contact',
            self::Quote => 'Quotation',
        };
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(fn (self $t): array => ['value' => $t->value, 'label' => $t->label()], self::cases());
    }
}
