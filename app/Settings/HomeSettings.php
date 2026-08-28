<?php

declare(strict_types=1);

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

class HomeSettings extends Settings
{
    /** @var array<string, string> */
    public array $hero_eyebrow;

    /** @var array<string, string> */
    public array $hero_headline;

    /** @var array<string, string> */
    public array $hero_subheadline;

    /** @var array<string, string> */
    public array $hero_primary_label;

    public ?string $hero_primary_url;

    /** @var array<string, string> */
    public array $hero_secondary_label;

    public ?string $hero_secondary_url;

    public ?int $hero_image_id;

    /**
     * Credibility figures. Each row is
     * ['value' => '…', 'label' => [locale => …], 'caption' => [locale => …]].
     *
     * Deliberately has no `@var` tag: the settings cast layer resolves docblock
     * element types and cannot express a nested row shape, so the type is given
     * to static analysis only.
     *
     * @phpstan-var list<array<string, mixed>>
     */
    public array $stats;

    /** @var array<string, string> */
    public array $intro_eyebrow;

    /** @var array<string, string> */
    public array $intro_heading;

    /** @var array<string, string> */
    public array $intro_body;

    public static function group(): string
    {
        return 'home';
    }
}
