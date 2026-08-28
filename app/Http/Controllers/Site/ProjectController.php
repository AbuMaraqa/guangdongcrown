<?php

declare(strict_types=1);

namespace App\Http\Controllers\Site;

use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Models\ProjectCategory;
use Illuminate\Http\Request;
use Inertia\Response;

class ProjectController extends SiteController
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'category' => ['nullable', 'string', 'max:140'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $paginator = Project::query()
            ->active()
            ->with(['image', 'category'])
            ->search($filters['search'] ?? null)
            ->when($filters['category'] ?? null, fn ($query, $slug) => $query->whereHas(
                'category',
                fn ($inner) => $inner->where('slug', $slug)
            ))
            ->ordered()
            ->paginate(9)
            ->withQueryString();

        return $this->page('site/projects/index', [
            'projects' => $paginator->through(fn (Project $project): array => (new ProjectResource($project))->resolve()),
            'categories' => ProjectCategory::query()->active()->ordered()->get(['name', 'slug'])
                ->map(fn (ProjectCategory $c): array => ['name' => $c->name, 'slug' => $c->slug])->all(),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'category' => $filters['category'] ?? '',
            ],
            'breadcrumbs' => $this->trail([['name' => 'Projects', 'url' => route('site.projects.index')]]),
        ], [
            'title' => 'Projects',
            'description' => 'Delivered aluminium supply and logistics programmes, with measured outcomes.',
        ]);
    }

    public function show(Project $project): Response
    {
        abort_unless($project->is_active, 404);

        $project->load(['image', 'gallery', 'category', 'services', 'industries']);

        $related = Project::query()
            ->active()
            ->where('id', '!=', $project->id)
            ->when($project->project_category_id, fn ($query) => $query->where('project_category_id', $project->project_category_id))
            ->with(['image', 'category'])
            ->ordered()
            ->limit(3)
            ->get();

        return $this->page('site/projects/show', [
            'project' => ProjectResource::detailed($project)->resolve(),
            'related' => ProjectResource::collection($related)->resolve(),
            'breadcrumbs' => $this->trail([
                ['name' => 'Projects', 'url' => route('site.projects.index')],
                ['name' => $project->title, 'url' => route('site.projects.show', $project)],
            ]),
        ], [
            'title' => $project->title,
            'description' => $project->excerpt,
            'image' => $project->image?->url,
            'type' => 'article',
        ], $project);
    }
}
