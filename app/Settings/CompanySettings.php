<?php

declare(strict_types=1);

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

/**
 * Identity and contact details. Text that a visitor reads is stored per
 * locale as ['en' => …, 'ar' => …]; identifiers such as the email address
 * and the logo are the same in every language.
 */
class CompanySettings extends Settings
{
    /** @var array<string, string> */
    public array $name;

    /** @var array<string, string> */
    public array $legal_name;

    /** @var array<string, string> */
    public array $tagline;

    /** @var array<string, string> */
    public array $description;

    /** @var array<string, string> */
    public array $address;

    public ?int $founded_year;

    public ?string $email;

    public ?string $phone;

    public ?string $whatsapp;

    public ?int $logo_id;

    public ?int $logo_inverse_id;

    public static function group(): string
    {
        return 'company';
    }
}
