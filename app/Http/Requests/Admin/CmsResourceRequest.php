<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Cms\CmsResource;
use App\Cms\Field;
use App\Cms\ResourceRegistry;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Derives validation rules from the CMS resource schema so that every
 * admin form is validated server side from the same declaration that
 * renders it.
 */
class CmsResourceRequest extends FormRequest
{
    private ?CmsResource $resource = null;

    public function cmsResource(): CmsResource
    {
        return $this->resource ??= app(ResourceRegistry::class)->get((string) $this->route('resource'));
    }

    public function authorize(): bool
    {
        $record = $this->record();

        return $record
            ? $this->user()?->can('update', $record) === true
            : $this->user()?->can('create', $this->cmsResource()->model()) === true;
    }

    public function record(): ?Model
    {
        $id = $this->route('record');

        if (! $id) {
            return null;
        }

        return $this->cmsResource()->model()::query()
            ->withoutGlobalScope(SoftDeletingScope::class)
            ->whereKey($id)
            ->firstOrFail();
    }

    /**
     * Drop the blank rows repeater and list inputs carry.
     *
     * Both widgets keep an empty row at the end of the list so there is
     * always somewhere to type. Submitting the form as-is would otherwise
     * fail validation on a row the operator never intended to fill in, so the
     * empties are pruned here rather than being reported as errors.
     */
    protected function prepareForValidation(): void
    {
        $pruned = [];

        foreach ($this->cmsResource()->fields() as $field) {
            if (! is_array($value = $this->input($field->name))) {
                continue;
            }

            $pruned[$field->name] = match ($field->type) {
                'repeater' => array_values(array_filter($value, self::rowHasContent(...))),
                'list', 'tags' => array_values(array_filter(
                    array_map(fn ($item) => is_string($item) ? trim($item) : $item, $value),
                    fn ($item): bool => $item !== null && $item !== '',
                )),
                default => $value,
            };
        }

        if ($pruned !== []) {
            $this->merge($pruned);
        }
    }

    /**
     * Whether a repeater row holds anything at all.
     */
    private static function rowHasContent(mixed $row): bool
    {
        if (! is_array($row)) {
            return $row !== null && $row !== '';
        }

        foreach ($row as $value) {
            if (is_array($value) ? $value !== [] : (is_string($value) ? trim($value) !== '' : $value !== null)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $resource = $this->cmsResource();
        $instance = new ($resource->model());
        $rules = [];

        foreach ($resource->fields() as $field) {
            $rules = [...$rules, ...$this->rulesForField($field, $instance)];
        }

        if ($resource->hasGallery()) {
            $rules['gallery'] = ['array', 'max:60'];
            $rules['gallery.*'] = ['integer', 'exists:media_assets,id'];
        }

        if ($resource->hasSeo()) {
            $rules['seo'] = ['array'];
            $rules['seo.meta_title'] = ['nullable', 'string', 'max:180'];
            $rules['seo.meta_description'] = ['nullable', 'string', 'max:400'];
            $rules['seo.canonical_url'] = ['nullable', 'url', 'max:2048'];
            $rules['seo.og_title'] = ['nullable', 'string', 'max:180'];
            $rules['seo.og_description'] = ['nullable', 'string', 'max:400'];
            $rules['seo.og_image_id'] = ['nullable', 'integer', 'exists:media_assets,id'];
            $rules['seo.robots'] = ['nullable', 'string', 'max:64'];
        }

        return $rules;
    }

    /**
     * @return array<string, mixed>
     */
    private function rulesForField(Field $field, Model $instance): array
    {
        $name = $field->name;
        $rules = [$name => $field->validationRules()];

        if ($name === 'slug') {
            $unique = Rule::unique($instance->getTable(), 'slug');

            if ($record = $this->record()) {
                $unique->ignore($record->getKey());
            }

            $rules[$name] = [...$field->validationRules(), $unique];

            return $rules;
        }

        return match ($field->type) {
            'repeater' => [...$rules, ...$this->repeaterRules($field)],
            'multiselect' => [...$rules, "{$name}.*" => $this->relationItemRules($field, $instance)],
            'tags' => [...$rules, "{$name}.*" => ['string', 'max:60']],
            'list' => [...$rules, "{$name}.*" => ['string', 'max:400']],
            default => $rules,
        };
    }

    /**
     * @return array<string, mixed>
     */
    private function repeaterRules(Field $field): array
    {
        $rules = [];

        foreach ($field->subfields() as $subfield) {
            $rules["{$field->name}.*.{$subfield->name}"] = $subfield->validationRules();
        }

        return $rules;
    }

    /**
     * @return list<mixed>
     */
    private function relationItemRules(Field $field, Model $instance): array
    {
        if (! method_exists($instance, $field->name)) {
            return ['integer'];
        }

        $table = $instance->{$field->name}()->getRelated()->getTable();

        return ['integer', "exists:{$table},id"];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        $attributes = [];

        foreach ($this->cmsResource()->fields() as $field) {
            $attributes[$field->name] = mb_strtolower($field->toArray()['label']);
        }

        return $attributes;
    }
}
