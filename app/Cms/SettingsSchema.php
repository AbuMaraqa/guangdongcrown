<?php

declare(strict_types=1);

namespace App\Cms;

use App\Settings\CompanySettings;
use App\Settings\FooterSettings;
use App\Settings\HomeSettings;
use App\Settings\SeoSettings;
use App\Settings\SocialSettings;
use App\Support\Locales;

/**
 * Declares the global settings screens.
 *
 * Reuses the same Field builder as the content resources, so the settings
 * forms render and validate identically — including the per-locale inputs
 * produced by `->translatable()`.
 */
class SettingsSchema
{
    /**
     * @return array<string, array{label: string, icon: string, description: string, settings: class-string, fields: list<Field>}>
     */
    public function groups(): array
    {
        return [
            'company' => [
                'label' => 'Company',
                'icon' => 'building',
                'description' => 'Identity and contact details used across the site, structured data and email.',
                'settings' => CompanySettings::class,
                'fields' => [
                    Field::text('name', 'Trading name')->translatable()->required()->rules(['required', 'string', 'max:120']),
                    Field::text('legal_name', 'Registered legal name')->translatable()->rules(['nullable', 'string', 'max:180']),
                    Field::text('tagline')->translatable()->rules(['nullable', 'string', 'max:180']),
                    Field::textarea('description', 'Company description')
                        ->translatable()
                        ->rules(['nullable', 'string', 'max:600'])
                        ->help('Used in the footer and as the fallback meta description.'),
                    Field::textarea('address', 'Registered address')->translatable()->rules(['nullable', 'string', 'max:400']),
                    Field::number('founded_year', 'Year founded')->rules(['nullable', 'integer', 'min:1800', 'max:2100']),
                    Field::email('email', 'Primary email'),
                    Field::text('phone')->rules(['nullable', 'string', 'max:64']),
                    Field::text('whatsapp', 'WhatsApp number')->rules(['nullable', 'string', 'max:64']),
                    Field::image('logo_id', 'Logo (dark on light)'),
                    Field::image('logo_inverse_id', 'Logo (light on dark)'),
                ],
            ],
            'home' => [
                'label' => 'Home page',
                'icon' => 'house',
                'description' => 'The hero message and the credibility figures shown beneath it.',
                'settings' => HomeSettings::class,
                'fields' => [
                    Field::text('hero_eyebrow', 'Eyebrow')->translatable()->rules(['nullable', 'string', 'max:80']),
                    Field::textarea('hero_headline', 'Headline')->translatable()->rules(['nullable', 'string', 'max:200']),
                    Field::textarea('hero_subheadline', 'Supporting statement')->translatable()->rules(['nullable', 'string', 'max:400']),
                    Field::text('hero_primary_label', 'Primary button label')->translatable()->rules(['nullable', 'string', 'max:60']),
                    Field::text('hero_primary_url', 'Primary button link')->rules(['nullable', 'string', 'max:255']),
                    Field::text('hero_secondary_label', 'Secondary button label')->translatable()->rules(['nullable', 'string', 'max:60']),
                    Field::text('hero_secondary_url', 'Secondary button link')->rules(['nullable', 'string', 'max:255']),
                    Field::image('hero_image_id', 'Hero image'),
                    Field::repeater('stats', [
                        Field::text('value', 'Figure')->required()->rules(['required', 'string', 'max:24'])->width('half'),
                        Field::text('label', 'Label')->translatable()->required()->rules(['required', 'string', 'max:60'])->width('half'),
                        Field::text('caption', 'Caption')->translatable()->rules(['nullable', 'string', 'max:120']),
                    ], 'Credibility figures')
                        ->help('Publish a figure only once you can evidence it. Leave the list empty to hide the band entirely.'),
                    Field::text('intro_eyebrow', 'Introduction eyebrow')->translatable()->rules(['nullable', 'string', 'max:80']),
                    Field::textarea('intro_heading', 'Introduction heading')->translatable()->rules(['nullable', 'string', 'max:220']),
                    Field::textarea('intro_body', 'Introduction text')->translatable()->rules(['nullable', 'string', 'max:900']),
                ],
            ],
            'social' => [
                'label' => 'Social profiles',
                'icon' => 'share-2',
                'description' => 'Leave a field empty to hide that icon from the site.',
                'settings' => SocialSettings::class,
                'fields' => [
                    Field::url('linkedin', 'LinkedIn'),
                    Field::url('facebook', 'Facebook'),
                    Field::url('instagram', 'Instagram'),
                    Field::url('youtube', 'YouTube'),
                    Field::url('x', 'X / Twitter'),
                    Field::url('wechat', 'WeChat'),
                ],
            ],
            'seo' => [
                'label' => 'SEO defaults',
                'icon' => 'search',
                'description' => 'Fallbacks used whenever a page has no SEO override of its own.',
                'settings' => SeoSettings::class,
                'fields' => [
                    Field::text('default_title', 'Default meta title')->translatable()->rules(['nullable', 'string', 'max:180']),
                    Field::textarea('default_description', 'Default meta description')->translatable()->rules(['nullable', 'string', 'max:400']),
                    Field::image('default_og_image_id', 'Default share image')
                        ->help('Shown when a page is shared on social platforms. 1200 x 630 pixels works best.'),
                    Field::text('google_verification', 'Google site verification token')->rules(['nullable', 'string', 'max:120']),
                    Field::toggle('indexable', 'Allow search engines to index this site')->default(true),
                ],
            ],
            'footer' => [
                'label' => 'Footer & appearance',
                'icon' => 'panel-bottom',
                'description' => 'Closing call to action, copyright line and brand accent.',
                'settings' => FooterSettings::class,
                'fields' => [
                    Field::text('cta_heading', 'Call-to-action heading')->translatable()->rules(['nullable', 'string', 'max:180']),
                    Field::textarea('cta_body', 'Call-to-action text')->translatable()->rules(['nullable', 'string', 'max:400']),
                    Field::text('copyright', 'Copyright line')->translatable()->rules(['nullable', 'string', 'max:200']),
                    Field::text('accent', 'Brand accent colour')
                        ->rules(['nullable', 'string', 'regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/'])
                        ->placeholder('#0AA6B8')
                        ->help('Hex value applied to buttons, links and highlights. Sampled from the logo by default.'),
                ],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function schemaFor(string $group): array
    {
        $definition = $this->groups()[$group] ?? abort(404);

        return [
            'key' => $group,
            'label' => $definition['label'],
            'icon' => $definition['icon'],
            'description' => $definition['description'],
            'fields' => array_map(static fn (Field $field): array => $field->toArray(), $definition['fields']),
        ];
    }

    /**
     * Validation rules for one group.
     *
     * A translatable field validates each locale independently, so a required
     * value is required in every published language rather than just once.
     *
     * @return array<string, mixed>
     */
    public function rulesFor(string $group): array
    {
        $definition = $this->groups()[$group] ?? abort(404);
        $rules = [];

        foreach ($definition['fields'] as $field) {
            if ($field->isTranslatable()) {
                $rules[$field->name] = ['array'];

                foreach (Locales::codes() as $code) {
                    $rules["{$field->name}.{$code}"] = $field->validationRules();
                }
            } else {
                $rules[$field->name] = $field->validationRules();
            }

            foreach ($field->subfields() as $subfield) {
                $key = "{$field->name}.*.{$subfield->name}";

                if ($subfield->isTranslatable()) {
                    $rules[$key] = ['array'];

                    foreach (Locales::codes() as $code) {
                        $rules["{$key}.{$code}"] = $subfield->validationRules();
                    }
                } else {
                    $rules[$key] = $subfield->validationRules();
                }
            }
        }

        return $rules;
    }

    /**
     * @return list<array{key: string, label: string, icon: string}>
     */
    public function tabs(): array
    {
        return array_map(
            static fn (string $key, array $definition): array => [
                'key' => $key,
                'label' => $definition['label'],
                'icon' => $definition['icon'],
            ],
            array_keys($this->groups()),
            array_values($this->groups()),
        );
    }
}
