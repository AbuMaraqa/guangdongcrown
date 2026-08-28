<?php

declare(strict_types=1);

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

class SocialSettings extends Settings
{
    public ?string $linkedin;

    public ?string $facebook;

    public ?string $instagram;

    public ?string $youtube;

    public ?string $x;

    public ?string $wechat;

    public static function group(): string
    {
        return 'social';
    }

    /**
     * @return array<string, string>
     */
    public function links(): array
    {
        return array_filter([
            'linkedin' => $this->linkedin,
            'facebook' => $this->facebook,
            'instagram' => $this->instagram,
            'youtube' => $this->youtube,
            'x' => $this->x,
            'wechat' => $this->wechat,
        ]);
    }
}
