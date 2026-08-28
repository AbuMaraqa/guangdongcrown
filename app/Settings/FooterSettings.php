<?php

declare(strict_types=1);

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

class FooterSettings extends Settings
{
    /** @var array<string, string> */
    public array $cta_heading;

    /** @var array<string, string> */
    public array $cta_body;

    /** @var array<string, string> */
    public array $copyright;

    public ?string $accent;

    public static function group(): string
    {
        return 'footer';
    }
}
