<?php

declare(strict_types=1);

namespace App\Actions;

use App\Cms\CmsResource;
use App\Cms\Field;
use App\Contracts\HasMediaGallery;
use App\Contracts\Seoable;
use App\Services\ActivityLogger;
use App\Services\HtmlSanitizer;
use App\Services\SiteDataService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * Persists a validated CMS payload: model attributes, many-to-many
 * relations, the media gallery and the SEO record, in one transaction.
 */
class SaveCmsResource
{
    public function __construct(
        private readonly ActivityLogger $activity,
        private readonly HtmlSanitizer $sanitizer,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function handle(CmsResource $resource, array $data, ?Model $model = null): Model
    {
        $isNew = $model === null;
        $model ??= new ($resource->model());

        DB::transaction(function () use ($resource, $data, $model): void {
            $model->fill($this->attributes($resource, $data));
            $model->save();

            $this->syncRelations($resource, $model, $data);
            $this->syncGallery($resource, $model, $data);
            $this->syncSeo($resource, $model, $data);

            $resource->afterSave($model, $data);
        });

        $isNew ? $this->activity->created($model) : $this->activity->updated($model);

        SiteDataService::flush();

        return $model->refresh();
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function attributes(CmsResource $resource, array $data): array
    {
        $attributes = [];

        foreach ($resource->fields() as $field) {
            if (in_array($field->type, ['multiselect', 'tags'], true)) {
                continue;
            }

            if (! array_key_exists($field->name, $data)) {
                continue;
            }

            $attributes[$field->name] = $this->normalise($field, $data[$field->name]);
        }

        return $attributes;
    }

    private function normalise(Field $field, mixed $value): mixed
    {
        return match ($field->type) {
            'toggle' => (bool) $value,
            'number' => $value === null || $value === '' ? ($field->name === 'position' ? 0 : null) : $value + 0,
            'repeater', 'list' => $this->compact(is_array($value) ? $value : []),
            'richtext' => $this->sanitizer->clean(is_string($value) ? $value : null),
            'text', 'textarea', 'email', 'url', 'slug', 'icon' => $value === '' ? null : $value,
            default => $value,
        };
    }

    /**
     * Drops blank rows so empty repeater slots are never persisted.
     *
     * @param  array<int, mixed>  $rows
     * @return list<mixed>|null
     */
    private function compact(array $rows): ?array
    {
        $filtered = array_values(array_filter($rows, function (mixed $row): bool {
            if (is_array($row)) {
                return count(array_filter($row, static fn (mixed $v): bool => filled($v))) > 0;
            }

            return filled($row);
        }));

        return $filtered ?: null;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function syncRelations(CmsResource $resource, Model $model, array $data): void
    {
        foreach ($resource->syncedRelations() as $relation) {
            if (array_key_exists($relation, $data)) {
                $model->{$relation}()->sync(array_map('intval', $data[$relation] ?? []));
            }
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function syncGallery(CmsResource $resource, Model $model, array $data): void
    {
        if (! $model instanceof HasMediaGallery) {
            return;
        }

        if (array_key_exists('gallery', $data)) {
            $model->syncGallery(array_values(array_map('intval', $data['gallery'] ?? [])));
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function syncSeo(CmsResource $resource, Model $model, array $data): void
    {
        if (! $model instanceof Seoable) {
            return;
        }

        $seo = array_filter($data['seo'] ?? [], static fn (mixed $value): bool => $value !== null && $value !== '');

        if ($seo === []) {
            $model->forgetSeo();

            return;
        }

        $model->syncSeo($seo);
    }
}
