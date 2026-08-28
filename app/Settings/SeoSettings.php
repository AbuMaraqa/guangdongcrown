<?php

declare(strict_types=1);

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

class SeoSettings extends Settings
{
    /** @var array<string, string> */
    public array $default_title;

    /** @var array<string, string> */
    public array $default_description;

    public ?int $default_og_image_id;

    public ?string $google_verification;

    public bool $indexable;

    public static function group(): string
    {
        return 'seo';
    }
}
