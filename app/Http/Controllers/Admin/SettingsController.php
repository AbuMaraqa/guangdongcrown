<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Cms\Field;
use App\Cms\SettingsSchema;
use App\Http\Controllers\Controller;
use App\Services\ActivityLogger;
use App\Services\SiteDataService;
use App\Support\Locales;
use App\Support\Translated;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\LaravelSettings\Settings;

class SettingsController extends Controller
{
    public function __construct(
        private readonly SettingsSchema $schema,
        private readonly ActivityLogger $activity,
    ) {}

    public function edit(string $group = 'company'): Response
    {
        $this->authorize('view-settings');
        abort_unless(array_key_exists($group, $this->schema->groups()), 404);

        return Inertia::render('admin/settings/index', [
            'tabs' => $this->schema->tabs(),
            'schema' => $this->schema->schemaFor($group),
            'values' => $this->values($group),
            'locales' => Locales::forSwitcher(),
            'canEdit' => request()->user()?->can('manage-settings') === true,
        ]);
    }

    public function update(Request $request, string $group): RedirectResponse
    {
        $this->authorize('manage-settings');
        abort_unless(array_key_exists($group, $this->schema->groups()), 404);

        $validated = $request->validate($this->schema->rulesFor($group));

        $settings = $this->settingsFor($group);

        foreach ($this->schema->groups()[$group]['fields'] as $field) {
            /** @var Field $field */
            if (! array_key_exists($field->name, $validated)) {
                continue;
            }

            $settings->{$field->name} = $this->normalise($field, $validated[$field->name]);
        }

        $settings->save();

        SiteDataService::flush();
        $this->activity->log('updated', null, 'Updated '.$group.' settings');

        return back()->with('success', 'Settings saved.');
    }

    /**
     * Translatable values arrive as a locale-keyed map and are stored as one;
     * everything else is written straight through.
     */
    private function normalise(Field $field, mixed $value): mixed
    {
        if ($field->isTranslatable()) {
            // Absent locales are stored as missing keys rather than nulls: the
            // settings cast layer only accepts a homogeneous element type.
            return array_filter(
                Translated::fill(is_array($value) ? $value : null),
                static fn (?string $text): bool => filled($text),
            );
        }

        if ($field->type === 'repeater') {
            return is_array($value) ? array_values(array_filter($value, fn (mixed $row): bool => filled($row))) : [];
        }

        return $value === '' ? null : $value;
    }

    /**
     * @return array<string, mixed>
     */
    private function values(string $group): array
    {
        $settings = $this->settingsFor($group);
        $values = [];

        foreach ($this->schema->groups()[$group]['fields'] as $field) {
            /** @var Field $field */
            $stored = $settings->{$field->name} ?? null;

            $values[$field->name] = $field->isTranslatable()
                ? Translated::fill(is_array($stored) || is_string($stored) ? $stored : null)
                : $stored;
        }

        return $values;
    }

    private function settingsFor(string $group): Settings
    {
        /** @var class-string<Settings> $class */
        $class = $this->schema->groups()[$group]['settings'];

        return app($class);
    }
}
