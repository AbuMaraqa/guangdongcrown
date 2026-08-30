<?php

declare(strict_types=1);

namespace App\Cms;

use App\Contracts\HasMediaGallery;
use App\Contracts\Seoable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Base class for every CMS-managed entity.
 *
 * A resource declares its model, form fields and table columns once; the
 * generic admin controller, the FormRequest and the React admin UI all read
 * from that single declaration.
 */
abstract class CmsResource
{
    /**
     * @return class-string<Model>
     */
    abstract public function model(): string;

    /**
     * @return list<Field>
     */
    abstract public function fields(): array;

    /**
     * URL segment and Inertia page key, e.g. "products".
     */
    public function key(): string
    {
        return Str::of(class_basename($this))->beforeLast('Resource')->kebab()->plural()->value();
    }

    public function label(): string
    {
        return Str::headline(Str::plural(Str::of(class_basename($this))->beforeLast('Resource')->value()));
    }

    public function singular(): string
    {
        return Str::headline(Str::singular(Str::of(class_basename($this))->beforeLast('Resource')->value()));
    }

    /**
     * Lucide icon name used in the admin sidebar.
     */
    public function icon(): string
    {
        return 'file-text';
    }

    /**
     * Sidebar grouping label.
     */
    public function group(): string
    {
        return 'Content';
    }

    public function description(): ?string
    {
        return null;
    }

    /**
     * Columns rendered by the generic index table.
     *
     * @return list<array<string, mixed>>
     */
    public function columns(): array
    {
        return [
            ['key' => 'title', 'label' => $this->singular(), 'type' => 'primary'],
            ['key' => 'is_active', 'label' => 'Status', 'type' => 'boolean'],
            ['key' => 'updated_at', 'label' => 'Updated', 'type' => 'date'],
        ];
    }

    /**
     * Relations eager-loaded for the index table.
     *
     * @return list<string>
     */
    public function with(): array
    {
        return [];
    }

    /**
     * Columns searched by the index search box.
     *
     * @return list<string>
     */
    public function searchable(): array
    {
        return ['name'];
    }

    /**
     * Extra index filters, e.g. status or category dropdowns.
     *
     * @return list<array<string, mixed>>
     */
    public function filters(): array
    {
        return [];
    }

    /**
     * Belongs-to-many relations synced from multiselect fields.
     *
     * @return list<string>
     */
    public function syncedRelations(): array
    {
        return [];
    }

    /**
     * Reference data (select options) shared with the form screen.
     *
     * @return array<string, mixed>
     */
    public function formOptions(): array
    {
        return [];
    }

    public function titleAttribute(): string
    {
        return 'name';
    }

    /**
     * @return array{0: string, 1: string}
     */
    public function defaultSort(): array
    {
        return $this->isSortable() ? ['position', 'asc'] : ['updated_at', 'desc'];
    }

    public function isSortable(): bool
    {
        $model = new ($this->model());

        return Schema::hasColumn($model->getTable(), $this->positionColumn());
    }

    public function hasSeo(): bool
    {
        return is_subclass_of($this->model(), Seoable::class);
    }

    public function hasGallery(): bool
    {
        return is_subclass_of($this->model(), HasMediaGallery::class);
    }

    public function softDeletes(): bool
    {
        return in_array(SoftDeletes::class, class_uses_recursive($this->model()), true);
    }

    public function perPage(): int
    {
        return 20;
    }

    /**
     * Hook for resource-specific index constraints.
     *
     * @param  Builder<Model>  $query
     * @return Builder<Model>
     */
    public function scopeIndex(Builder $query): Builder
    {
        return $query;
    }

    /**
     * Hook run inside the save transaction, after the model is persisted.
     *
     * @param  array<string, mixed>  $data
     */
    public function afterSave(Model $model, array $data): void {}

    /**
     * Row payload for the index table.
     *
     * @return array<string, mixed>
     */
    public function toRow(Model $model): array
    {
        $row = ['id' => $model->getKey()];

        foreach ($this->columns() as $column) {
            $key = $column['key'];
            $row[$key] = data_get($model, $key);
        }

        if ($relation = $this->thumbRelation()) {
            $row['thumb'] = $model->getRelationValue($relation)?->thumb_url;
        }

        if ($this->softDeletes()) {
            $row['deleted_at'] = $model->getAttribute('deleted_at');
        }

        $row['position'] = $model->getAttribute($this->positionColumn());

        return $row;
    }

    /**
     * Relation whose thumbnail is shown beside the primary column, if any.
     */
    public function thumbRelation(): ?string
    {
        return $this->hasGallery() ? 'image' : null;
    }

    /**
     * Column holding the deletion timestamp on soft-deleting models.
     */
    public function deletedAtColumn(): string
    {
        return 'deleted_at';
    }

    public function positionColumn(): string
    {
        return method_exists($this->model(), 'orderColumn')
            ? (new ($this->model()))->orderColumn()
            : 'position';
    }

    /**
     * Form payload for the create/edit screen.
     *
     * @return array<string, mixed>
     */
    public function toForm(?Model $model): array
    {
        $data = [];

        foreach ($this->fields() as $field) {
            $data[$field->name] = $model
                ? $this->readValue($model, $field)
                : $field->defaultValue();
        }

        if ($this->hasGallery()) {
            $data['gallery'] = $model instanceof HasMediaGallery
                ? $model->gallery->pluck('id')->all()
                : [];
        }

        if ($this->hasSeo()) {
            $seo = $model instanceof Seoable ? $model->seoFor() : null;

            $data['seo'] = [
                'meta_title' => $seo?->meta_title,
                'meta_description' => $seo?->meta_description,
                'canonical_url' => $seo?->canonical_url,
                'og_title' => $seo?->og_title,
                'og_description' => $seo?->og_description,
                'og_image_id' => $seo?->og_image_id,
                'robots' => $seo->robots ?? 'index,follow',
            ];
        }

        return $data;
    }

    private function readValue(Model $model, Field $field): mixed
    {
        if ($field->type === 'multiselect' && method_exists($model, $field->name)) {
            $relation = $model->{$field->name}();

            return $relation->pluck($relation->getRelated()->getTable().'.id')->all();
        }

        if ($field->type === 'tags' && method_exists($model, $field->name)) {
            return $model->{$field->name}()->pluck('name')->all();
        }

        $value = $model->getAttribute($field->name);

        if ($value instanceof \BackedEnum) {
            return $value->value;
        }

        if ($value instanceof \DateTimeInterface) {
            return $field->type === 'date'
                ? $value->format('Y-m-d')
                : $value->format('Y-m-d\TH:i');
        }

        return $value ?? $field->defaultValue();
    }

    /**
     * Full schema payload consumed by the admin React screens.
     *
     * @return array<string, mixed>
     */
    public function schema(): array
    {
        return [
            'key' => $this->key(),
            'label' => __($this->label()),
            'singular' => __($this->singular()),
            'icon' => $this->icon(),
            'group' => $this->group(),
            'description' => $this->description() ? __($this->description()) : null,
            'columns' => $this->columns(),
            'filters' => $this->filters(),
            'fields' => array_map(static fn (Field $field): array => $field->toArray(), $this->fields()),
            'hasSeo' => $this->hasSeo(),
            'hasGallery' => $this->hasGallery(),
            'sortable' => $this->isSortable(),
            'softDeletes' => $this->softDeletes(),
            'titleAttribute' => $this->titleAttribute(),
        ];
    }
}
