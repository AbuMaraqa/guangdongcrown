<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Actions\SaveCmsResource;
use App\Cms\CmsResource;
use App\Cms\ResourceRegistry;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CmsResourceRequest;
use App\Services\ActivityLogger;
use App\Services\SiteDataService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Drives create/read/update/delete for every schema-declared CMS resource.
 */
class ResourceController extends Controller
{
    public function __construct(
        private readonly ResourceRegistry $registry,
        private readonly SaveCmsResource $saver,
        private readonly ActivityLogger $activity,
    ) {}

    public function index(Request $request, string $resource): Response
    {
        $cms = $this->registry->get($resource);
        $this->authorize('viewAny', $cms->model());

        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'sort' => ['nullable', 'string', 'max:40'],
            'direction' => ['nullable', 'in:asc,desc'],
            'trashed' => ['nullable', 'in:1'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        [$sort, $direction] = $cms->defaultSort();
        $sort = $this->safeSort($cms, $validated['sort'] ?? $sort);
        $direction = $validated['direction'] ?? $direction;

        $query = $cms->scopeIndex($cms->model()::query()->with($cms->with()));

        if (! empty($validated['trashed']) && $cms->softDeletes()) {
            $query
                ->withoutGlobalScope(SoftDeletingScope::class)
                ->whereNotNull($query->qualifyColumn($cms->deletedAtColumn()));
        }

        $this->applySearch($query, $cms, $validated['search'] ?? null);
        $this->applyFilters($query, $cms, $request);

        $paginator = $query
            ->orderBy($sort, $direction)
            ->paginate($cms->perPage())
            ->withQueryString();

        return Inertia::render('admin/resources/index', [
            'schema' => $cms->schema(),
            'rows' => $paginator->through(fn (Model $model): array => $cms->toRow($model)),
            'filters' => [
                'search' => $validated['search'] ?? '',
                'sort' => $sort,
                'direction' => $direction,
                'trashed' => $request->query('trashed') === '1',
                ...$this->activeFilterValues($cms, $request),
            ],
        ]);
    }

    public function create(string $resource): Response
    {
        $cms = $this->registry->get($resource);
        $this->authorize('create', $cms->model());

        return Inertia::render('admin/resources/form', [
            'schema' => $cms->schema(),
            'options' => $cms->formOptions(),
            'record' => null,
            'data' => $cms->toForm(null),
        ]);
    }

    public function store(CmsResourceRequest $request, string $resource): RedirectResponse
    {
        $cms = $this->registry->get($resource);
        $model = $this->saver->handle($cms, $request->validated());

        return redirect()
            ->route('admin.resources.edit', [$resource, $model->getKey()])
            ->with('success', $cms->singular().' created.');
    }

    public function edit(string $resource, int|string $record): Response
    {
        $cms = $this->registry->get($resource);
        $model = $this->findRecord($cms, $record);
        $this->authorize('update', $model);

        return Inertia::render('admin/resources/form', [
            'schema' => $cms->schema(),
            'options' => $cms->formOptions(),
            'record' => [
                'id' => $model->getKey(),
                'title' => (string) $model->getAttribute($cms->titleAttribute()),
                'updated_at' => $model->getAttribute('updated_at'),
                'url' => $this->publicUrl($cms, $model),
            ],
            'data' => $cms->toForm($model),
        ]);
    }

    public function update(CmsResourceRequest $request, string $resource, int|string $record): RedirectResponse
    {
        $cms = $this->registry->get($resource);
        $model = $this->findRecord($cms, $record);

        $this->saver->handle($cms, $request->validated(), $model);

        return back()->with('success', $cms->singular().' saved.');
    }

    public function destroy(string $resource, int|string $record): RedirectResponse
    {
        $cms = $this->registry->get($resource);
        $model = $this->findRecord($cms, $record);
        $this->authorize('delete', $model);

        $this->activity->deleted($model);
        $model->delete();
        SiteDataService::flush();

        return back()->with('success', $cms->singular().' deleted.');
    }

    public function restore(string $resource, int|string $record): RedirectResponse
    {
        $cms = $this->registry->get($resource);
        abort_unless($cms->softDeletes(), 404);

        $model = $this->findRecord($cms, $record);
        $this->authorize('restore', $model);

        // Clearing the timestamp through the query builder keeps this typed
        // without needing the SoftDeletes trait on the Model contract.
        $cms->model()::query()
            ->withoutGlobalScope(SoftDeletingScope::class)
            ->whereKey($model->getKey())
            ->update([$cms->deletedAtColumn() => null]);

        $this->activity->log('restored', $model);
        SiteDataService::flush();

        return back()->with('success', $cms->singular().' restored.');
    }

    /**
     * Toggles a boolean column straight from the index table.
     */
    public function toggle(Request $request, string $resource, int|string $record): RedirectResponse
    {
        $cms = $this->registry->get($resource);
        $model = $this->findRecord($cms, $record);
        $this->authorize('update', $model);

        $column = $request->validate([
            'column' => ['required', 'string', 'in:is_active,is_featured,is_leadership,is_headquarters'],
        ])['column'];

        abort_unless(array_key_exists($column, $model->getAttributes()), 422);

        $model->forceFill([$column => ! $model->getAttribute($column)])->save();
        SiteDataService::flush();

        return back();
    }

    /**
     * Persists a drag-and-drop reorder from the index table.
     */
    public function reorder(Request $request, string $resource): RedirectResponse
    {
        $cms = $this->registry->get($resource);
        $this->authorize('create', $cms->model());
        abort_unless($cms->isSortable(), 404);

        $validated = $request->validate([
            'ids' => ['required', 'array', 'max:500'],
            'ids.*' => ['integer'],
        ]);

        $column = $cms->positionColumn();

        DB::transaction(function () use ($cms, $validated, $column): void {
            foreach ($validated['ids'] as $index => $id) {
                $cms->model()::query()->whereKey($id)->update([$column => $index]);
            }
        });

        SiteDataService::flush();

        return back()->with('success', 'Order updated.');
    }

    private function findRecord(CmsResource $cms, int|string $record): Model
    {
        return $cms->model()::query()
            ->withoutGlobalScope(SoftDeletingScope::class)
            ->whereKey($record)
            ->firstOrFail();
    }

    /**
     * @param  Builder<Model>  $query
     */
    private function applySearch(Builder $query, CmsResource $cms, ?string $term): void
    {
        if (! $term) {
            return;
        }

        $query->where(function (Builder $inner) use ($cms, $term): void {
            foreach ($cms->searchable() as $column) {
                $inner->orWhere($inner->qualifyColumn($column), 'like', '%'.$term.'%');
            }
        });
    }

    /**
     * @param  Builder<Model>  $query
     */
    private function applyFilters(Builder $query, CmsResource $cms, Request $request): void
    {
        foreach ($cms->filters() as $filter) {
            $value = $request->query($filter['key']);

            if ($value === null || $value === '') {
                continue;
            }

            $allowed = array_column($filter['options'], 'value');

            if (! in_array($value, array_map('strval', $allowed), true)) {
                continue;
            }

            $query->where($query->qualifyColumn($filter['key']), $value);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function activeFilterValues(CmsResource $cms, Request $request): array
    {
        $values = [];

        foreach ($cms->filters() as $filter) {
            $values[$filter['key']] = $request->query($filter['key'], '');
        }

        return $values;
    }

    private function safeSort(CmsResource $cms, string $sort): string
    {
        $allowed = [...array_column($cms->columns(), 'key'), 'created_at', 'updated_at', $cms->positionColumn()];
        $allowed = array_filter($allowed, static fn (string $key): bool => ! str_contains($key, '.'));

        return in_array($sort, $allowed, true) ? $sort : ($cms->defaultSort()[0]);
    }

    private function publicUrl(CmsResource $cms, Model $model): ?string
    {
        $routes = [
            'products' => 'site.products.show',
            'solutions' => 'site.solutions.show',
            'services' => 'site.services.show',
            'industries' => 'site.industries.show',
            'projects' => 'site.projects.show',
            'posts' => 'site.insights.show',
            'team' => 'site.team.show',
            'pages' => 'site.page',
        ];

        $name = $routes[$cms->key()] ?? null;
        $slug = $model->getAttribute('slug');

        if (! $name || ! $slug || $model->getAttribute('deleted_at')) {
            return null;
        }

        return route($name, $slug);
    }
}
