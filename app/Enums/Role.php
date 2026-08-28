<?php

declare(strict_types=1);

namespace App\Enums;

enum Role: string
{
    case SuperAdmin = 'super_admin';
    case Admin = 'admin';
    case Editor = 'editor';

    public function label(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Super Admin',
            self::Admin => 'Administrator',
            self::Editor => 'Editor',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Full access, including user management and system settings.',
            self::Admin => 'Manages all content, inquiries and website settings.',
            self::Editor => 'Creates and edits website content and media only.',
        };
    }

    /**
     * Abilities granted to this role. Super admins bypass this map entirely.
     *
     * @return list<string>
     */
    public function abilities(): array
    {
        return match ($this) {
            self::SuperAdmin => ['*'],
            self::Admin => [
                'content.view', 'content.create', 'content.update', 'content.delete', 'content.publish',
                'media.view', 'media.upload', 'media.delete',
                'inquiries.view', 'inquiries.update', 'inquiries.delete',
                'settings.view', 'settings.update',
                'seo.manage',
            ],
            self::Editor => [
                'content.view', 'content.create', 'content.update',
                'media.view', 'media.upload',
                'seo.manage',
            ],
        };
    }

    public function can(string $ability): bool
    {
        $abilities = $this->abilities();

        return in_array('*', $abilities, true) || in_array($ability, $abilities, true);
    }

    /**
     * @return list<array{value: string, label: string, description: string}>
     */
    public static function options(): array
    {
        return array_map(fn (self $role): array => [
            'value' => $role->value,
            'label' => $role->label(),
            'description' => $role->description(),
        ], self::cases());
    }
}
