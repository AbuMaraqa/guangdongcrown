<?php

declare(strict_types=1);

namespace App\Cms;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Support\Str;

/**
 * Declarative description of a single admin form control.
 *
 * A field carries both its validation rules (enforced server side by
 * CmsResourceRequest) and its presentation metadata (rendered by the
 * schema-driven React form), so the two can never drift apart.
 *
 * @implements Arrayable<string, mixed>
 */
final class Field implements Arrayable
{
    private string $label;

    private ?string $help = null;

    private ?string $placeholder = null;

    private string $panel = 'main';

    private string $section = 'Content';

    private string $width = 'full';

    /** @var list<string> */
    private array $rules = ['nullable'];

    /** @var list<array{value: string|int, label: string}> */
    private array $options = [];

    /** @var list<Field> */
    private array $subfields = [];

    private mixed $default = null;

    private ?string $relation = null;

    private ?string $from = null;

    private bool $translatable = false;

    private function __construct(
        public readonly string $type,
        public readonly string $name,
        ?string $label = null,
    ) {
        $this->label = $label ?? Str::headline($name);
    }

    public static function text(string $name, ?string $label = null): self
    {
        return new self('text', $name, $label);
    }

    public static function slug(string $name = 'slug', ?string $from = 'name'): self
    {
        return (new self('slug', $name, 'Slug'))->generatedFrom($from);
    }

    public static function textarea(string $name, ?string $label = null): self
    {
        return new self('textarea', $name, $label);
    }

    public static function richtext(string $name, ?string $label = null): self
    {
        return new self('richtext', $name, $label);
    }

    public static function number(string $name, ?string $label = null): self
    {
        return new self('number', $name, $label);
    }

    public static function email(string $name, ?string $label = null): self
    {
        return (new self('email', $name, $label))->rules(['nullable', 'email:rfc', 'max:255']);
    }

    public static function url(string $name, ?string $label = null): self
    {
        return (new self('url', $name, $label))->rules(['nullable', 'url', 'max:2048']);
    }

    public static function select(string $name, ?string $label = null): self
    {
        return new self('select', $name, $label);
    }

    public static function multiselect(string $name, ?string $label = null): self
    {
        return (new self('multiselect', $name, $label))->rules(['array']);
    }

    public static function toggle(string $name, ?string $label = null): self
    {
        return (new self('toggle', $name, $label))->rules(['boolean'])->default(false);
    }

    public static function date(string $name, ?string $label = null): self
    {
        return (new self('date', $name, $label))->rules(['nullable', 'date']);
    }

    public static function datetime(string $name, ?string $label = null): self
    {
        return (new self('datetime', $name, $label))->rules(['nullable', 'date']);
    }

    public static function icon(string $name = 'icon', ?string $label = null): self
    {
        return (new self('icon', $name, $label))->rules(['nullable', 'string', 'max:64']);
    }

    public static function image(string $name = 'image_id', ?string $label = 'Image'): self
    {
        return (new self('image', $name, $label))->rules(['nullable', 'integer', 'exists:media_assets,id']);
    }

    public static function gallery(string $name = 'gallery', ?string $label = 'Gallery'): self
    {
        return (new self('gallery', $name, $label))->rules(['array']);
    }

    /**
     * A repeating group of sub-fields, stored as a JSON column.
     *
     * @param  list<Field>  $subfields
     */
    public static function repeater(string $name, array $subfields, ?string $label = null): self
    {
        $field = new self('repeater', $name, $label);
        $field->subfields = $subfields;
        $field->rules = ['array'];

        return $field;
    }

    /**
     * An ordered list of plain strings, stored as a JSON column.
     */
    public static function stringList(string $name, ?string $label = null): self
    {
        return (new self('list', $name, $label))->rules(['array']);
    }

    public static function tags(string $name = 'tags', ?string $label = 'Tags'): self
    {
        return (new self('tags', $name, $label))->rules(['array']);
    }

    /**
     * @param  list<string>  $rules
     */
    public function rules(array $rules): self
    {
        $this->rules = $rules;

        return $this;
    }

    public function required(): self
    {
        $kept = array_values(array_filter($this->rules, static fn (string $rule): bool => $rule !== 'nullable'));

        $this->rules = ['required', ...$kept];

        return $this;
    }

    /**
     * @param  array<int|string, string|array{value: string|int, label: string}>  $options
     */
    public function options(array $options): self
    {
        $normalised = [];

        foreach ($options as $key => $option) {
            $normalised[] = is_array($option)
                ? ['value' => $option['value'], 'label' => $option['label']]
                : ['value' => $key, 'label' => $option];
        }

        $this->options = $normalised;

        return $this;
    }

    /**
     * Marks the field as holding one value per supported locale.
     */
    public function translatable(): self
    {
        $this->translatable = true;

        return $this;
    }

    public function isTranslatable(): bool
    {
        return $this->translatable;
    }

    public function relation(string $relation): self
    {
        $this->relation = $relation;

        return $this;
    }

    public function generatedFrom(?string $from): self
    {
        $this->from = $from;

        return $this;
    }

    public function help(string $help): self
    {
        $this->help = $help;

        return $this;
    }

    public function placeholder(string $placeholder): self
    {
        $this->placeholder = $placeholder;

        return $this;
    }

    public function panel(string $panel): self
    {
        $this->panel = $panel;

        return $this;
    }

    public function section(string $section): self
    {
        $this->section = $section;

        return $this;
    }

    public function width(string $width): self
    {
        $this->width = $width;

        return $this;
    }

    public function default(mixed $default): self
    {
        $this->default = $default;

        return $this;
    }

    /**
     * @return list<string>
     */
    public function validationRules(): array
    {
        return $this->rules;
    }

    /**
     * @return list<Field>
     */
    public function subfields(): array
    {
        return $this->subfields;
    }

    public function isRepeater(): bool
    {
        return $this->type === 'repeater';
    }

    public function defaultValue(): mixed
    {
        if ($this->default !== null) {
            return $this->default;
        }

        return match ($this->type) {
            'multiselect', 'gallery', 'repeater', 'list', 'tags' => [],
            'toggle' => false,
            default => null,
        };
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return array_filter([
            'type' => $this->type,
            'name' => $this->name,
            'label' => $this->label,
            'help' => $this->help,
            'placeholder' => $this->placeholder,
            'panel' => $this->panel,
            'section' => $this->section,
            'width' => $this->width,
            'options' => $this->options,
            'relation' => $this->relation,
            'from' => $this->from,
            'translatable' => $this->translatable,
            'required' => in_array('required', $this->rules, true),
            'subfields' => array_map(static fn (Field $field): array => $field->toArray(), $this->subfields),
        ], static fn (mixed $value): bool => $value !== null && $value !== [] && $value !== false);
    }
}
