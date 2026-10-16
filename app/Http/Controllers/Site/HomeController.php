<?php

declare(strict_types=1);

namespace App\Http\Controllers\Site;

use App\Http\Resources\IndustryResource;
use App\Http\Resources\MediaResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ServiceResource;
use App\Http\Resources\SolutionResource;
use App\Models\Industry;
use App\Models\Location;
use App\Models\MediaAsset;
use App\Models\Product;
use App\Models\Service;
use App\Models\Solution;
use App\Support\Locales;
use App\Support\Translated;
use Inertia\Response;

class HomeController extends SiteController
{
    public function __invoke(): Response
    {
        return $this->page('site/home', [
            'hero' => $this->hero(),
            'intro' => [
                'eyebrow' => Translated::get($this->home->intro_eyebrow),
                'heading' => Translated::get($this->home->intro_heading),
                'body' => Translated::get($this->home->intro_body),
            ],
            'services' => ServiceResource::collection(
                Service::query()->active()->ordered()->with('image')->limit(6)->get()
            )->resolve(),
            'products' => ProductResource::collection(
                Product::query()->active()->featured()->ordered()->with(['image', 'category'])->limit(6)->get()
            )->resolve(),
            'solutions' => SolutionResource::collection(
                Solution::query()->active()->ordered()->with('image')->limit(4)->get()
            )->resolve(),
            'industries' => IndustryResource::collection(
                Industry::query()->active()->ordered()->with('image')->limit(6)->get()
            )->resolve(),
            'coverage' => $this->coverage(),
        ], [
            'title' => Translated::get($this->home->hero_headline),
            'schema' => array_filter([$this->schema->organisation()]),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function hero(): array
    {
        $image = $this->home->hero_image_id
            ? MediaAsset::query()->find($this->home->hero_image_id)
            : null;

        return [
            'eyebrow' => Translated::get($this->home->hero_eyebrow),
            'headline' => Translated::get($this->home->hero_headline),
            'subheadline' => Translated::get($this->home->hero_subheadline),
            'primary' => $this->cta(
                Translated::get($this->home->hero_primary_label),
                $this->home->hero_primary_url,
            ),
            'secondary' => $this->cta(
                Translated::get($this->home->hero_secondary_label),
                $this->home->hero_secondary_url,
            ),
            'image' => $image ? (new MediaResource($image))->resolve() : null,
        ];
    }

    /**
     * @return array{label: string, url: string}|null
     */
    private function cta(?string $label, ?string $url): ?array
    {
        if (! $label) {
            return null;
        }

        return [
            'label' => $label,
            'url' => $url ?: Locales::url('site.contact'),
        ];
    }

    /**
     * Countries and facilities actually recorded in the CMS.
     *
     * @return array<string, mixed>
     */
    private function coverage(): array
    {
        $locations = Location::query()->active()->ordered()->get();

        return [
            'countries' => $locations->pluck('country')->unique()->values()->all(),
            'facilities' => $locations
                ->whereIn('type', ['office', 'facility', 'warehouse'])
                ->map(fn (Location $location): array => [
                    'name' => $location->name,
                    'city' => $location->city,
                    'country' => $location->country,
                    'type' => $location->type,
                    'isHeadquarters' => $location->is_headquarters,
                    'latitude' => $location->latitude,
                    'longitude' => $location->longitude,
                ])->values()->all(),
        ];
    }
}
