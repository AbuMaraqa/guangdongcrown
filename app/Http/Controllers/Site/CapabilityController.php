<?php

declare(strict_types=1);

namespace App\Http\Controllers\Site;

use App\Http\Resources\IndustryResource;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\ServiceResource;
use App\Http\Resources\SolutionResource;
use App\Models\Industry;
use App\Models\Location;
use App\Models\Project;
use App\Models\Service;
use App\Models\Solution;
use App\Support\Locales;
use Inertia\Response;

/**
 * Services, solutions, industries and the dedicated logistics landing page.
 */
class CapabilityController extends SiteController
{
    public function services(): Response
    {
        return $this->page('site/services/index', [
            'services' => ServiceResource::collection(
                Service::query()->active()->ordered()->with('image')->get()
            )->resolve(),
            'breadcrumbs' => $this->trail([['name' => 'Capabilities', 'url' => Locales::url('site.services.index')]]),
        ], [
            'title' => 'Capabilities',
            'description' => 'Aluminium supply, freight, warehousing and supply chain management under one accountable partner.',
        ]);
    }

    public function service(Service $service): Response
    {
        abort_unless($service->is_active, 404);

        $service->load(['image', 'gallery']);

        $projects = Project::query()
            ->active()
            ->whereHas('services', fn ($query) => $query->whereKey($service->id))
            ->with(['image', 'category'])
            ->ordered()
            ->limit(3)
            ->get();

        return $this->page('site/services/show', [
            'service' => ServiceResource::detailed($service)->resolve(),
            'projects' => ProjectResource::collection($projects)->resolve(),
            'others' => ServiceResource::collection(
                Service::query()->active()->where('id', '!=', $service->id)->ordered()->with('image')->limit(3)->get()
            )->resolve(),
            'breadcrumbs' => $this->trail([
                ['name' => 'Capabilities', 'url' => Locales::url('site.services.index')],
                ['name' => $service->name, 'url' => Locales::url('site.services.show', [$service])],
            ]),
        ], [
            'title' => $service->name,
            'description' => $service->excerpt,
            'image' => $service->image?->url,
        ], $service);
    }

    public function solutions(): Response
    {
        return $this->page('site/solutions/index', [
            'solutions' => SolutionResource::collection(
                Solution::query()->active()->ordered()->with('image')->get()
            )->resolve(),
            'breadcrumbs' => $this->trail([['name' => 'Solutions', 'url' => Locales::url('site.solutions.index')]]),
        ], [
            'title' => 'Solutions',
            'description' => 'End-to-end programmes combining aluminium supply with international logistics.',
        ]);
    }

    public function solution(Solution $solution): Response
    {
        abort_unless($solution->is_active, 404);

        $solution->load(['image', 'gallery', 'industries']);

        return $this->page('site/solutions/show', [
            'solution' => SolutionResource::detailed($solution)->resolve(),
            'related' => SolutionResource::collection(
                Solution::query()->active()->where('id', '!=', $solution->id)->ordered()->with('image')->limit(3)->get()
            )->resolve(),
            'breadcrumbs' => $this->trail([
                ['name' => 'Solutions', 'url' => Locales::url('site.solutions.index')],
                ['name' => $solution->title, 'url' => Locales::url('site.solutions.show', [$solution])],
            ]),
        ], [
            'title' => $solution->title,
            'description' => $solution->excerpt,
            'image' => $solution->image?->url,
        ], $solution);
    }

    public function industries(): Response
    {
        return $this->page('site/industries/index', [
            'industries' => IndustryResource::collection(
                Industry::query()->active()->ordered()->with('image')->get()
            )->resolve(),
            'breadcrumbs' => $this->trail([['name' => 'Industries', 'url' => Locales::url('site.industries.index')]]),
        ], [
            'title' => 'Industries',
            'description' => 'Sectors served by our aluminium supply and logistics programmes.',
        ]);
    }

    public function industry(Industry $industry): Response
    {
        abort_unless($industry->is_active, 404);

        $industry->load(['image', 'solutions.image', 'projects.image', 'projects.category']);

        return $this->page('site/industries/show', [
            'industry' => IndustryResource::detailed($industry)->resolve(),
            'solutions' => SolutionResource::collection($industry->solutions->where('is_active', true))->resolve(),
            'projects' => ProjectResource::collection($industry->projects->where('is_active', true)->take(3))->resolve(),
            'breadcrumbs' => $this->trail([
                ['name' => 'Industries', 'url' => Locales::url('site.industries.index')],
                ['name' => $industry->name, 'url' => Locales::url('site.industries.show', [$industry])],
            ]),
        ], [
            'title' => $industry->name,
            'description' => $industry->excerpt,
            'image' => $industry->image?->url,
        ], $industry);
    }

    /**
     * Dedicated logistics landing page assembled from the logistics-side
     * services, the solutions tagged as logistics and the coverage map.
     */
    public function logistics(): Response
    {
        $solution = Solution::query()->active()->with(['image', 'gallery'])->where('slug', 'global-logistics')->first();

        return $this->page('site/logistics', [
            'solution' => $solution ? SolutionResource::detailed($solution)->resolve() : null,
            'services' => ServiceResource::collection(
                Service::query()->active()->ordered()->with('image')->get()
            )->resolve(),
            'locations' => Location::query()->active()->ordered()->get()
                ->map(fn (Location $location): array => [
                    'name' => $location->name,
                    'type' => $location->type,
                    'city' => $location->city,
                    'country' => $location->country,
                    'latitude' => $location->latitude,
                    'longitude' => $location->longitude,
                    'isHeadquarters' => $location->is_headquarters,
                ])->all(),
            'projects' => ProjectResource::collection(
                Project::query()->active()->featured()->with(['image', 'category'])->ordered()->limit(3)->get()
            )->resolve(),
            'breadcrumbs' => $this->trail([['name' => 'Logistics', 'url' => Locales::url('site.logistics')]]),
        ], [
            'title' => 'Global logistics',
            'description' => 'Ocean and air freight, bonded warehousing, inland transport and end-to-end supply chain control.',
        ], $solution);
    }
}
