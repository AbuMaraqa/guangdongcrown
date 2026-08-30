<?php

declare(strict_types=1);

namespace App\Http\Controllers\Site;

use App\Http\Resources\MediaResource;
use App\Http\Resources\ServiceResource;
use App\Http\Resources\TeamMemberResource;
use App\Models\Credential;
use App\Models\Faq;
use App\Models\Location;
use App\Models\Milestone;
use App\Models\Page;
use App\Models\Service;
use App\Models\TeamMember;
use App\Support\Locales;
use App\Support\Translated;
use Inertia\Response;

/**
 * About, team, global presence, FAQ and free-form CMS pages.
 */
class CompanyController extends SiteController
{
    public function about(): Response
    {
        return $this->page('site/about', [
            'company' => [
                'name' => Translated::get($this->company->name) ?? config('app.name'),
                'tagline' => Translated::get($this->company->tagline),
                'description' => Translated::get($this->company->description),
                'founded' => $this->company->founded_year,
            ],
            'services' => ServiceResource::collection(
                Service::query()->active()->ordered()->with('image')->get()
            )->resolve(),
            'milestones' => Milestone::query()->active()->ordered()->with('image')->get()
                ->map(fn (Milestone $m): array => [
                    'id' => $m->id,
                    'year' => $m->year,
                    'title' => $m->title,
                    'description' => $m->description,
                    'image' => $m->image ? (new MediaResource($m->image))->resolve() : null,
                ])->all(),
            'credentials' => $this->credentials(),
            'leadership' => TeamMemberResource::collection(
                TeamMember::query()->active()->where('is_leadership', true)->ordered()->with('photo')->get()
            )->resolve(),
            'locations' => $this->locations(),
            'breadcrumbs' => $this->trail([['name' => 'About', 'url' => Locales::url('site.about')]]),
        ], [
            'title' => 'About the company',
            'description' => Translated::get($this->company->description),
            'schema' => [$this->schema->organisation()],
        ]);
    }

    public function team(): Response
    {
        $members = TeamMember::query()->active()->ordered()->with('photo')->get();

        return $this->page('site/team/index', [
            'leadership' => TeamMemberResource::collection($members->where('is_leadership', true))->resolve(),
            'members' => TeamMemberResource::collection($members->where('is_leadership', false))->resolve(),
            'breadcrumbs' => $this->trail([['name' => 'Team', 'url' => Locales::url('site.team.index')]]),
        ], [
            'title' => 'Our team',
            'description' => 'The people accountable for delivery, quality and customer service.',
        ]);
    }

    public function member(TeamMember $member): Response
    {
        abort_unless($member->is_active, 404);

        $member->load('photo');

        return $this->page('site/team/show', [
            'member' => (new TeamMemberResource($member))->resolve(),
            'colleagues' => TeamMemberResource::collection(
                TeamMember::query()->active()->whereKeyNot($member->id)->ordered()->with('photo')->limit(4)->get()
            )->resolve(),
            'breadcrumbs' => $this->trail([
                ['name' => 'Team', 'url' => Locales::url('site.team.index')],
                ['name' => $member->name, 'url' => Locales::url('site.team.show', [$member])],
            ]),
        ], [
            'title' => $member->name,
            'description' => $member->position,
            'image' => $member->photo?->url,
            'type' => 'profile',
        ], $member);
    }

    public function presence(): Response
    {
        return $this->page('site/global-presence', [
            'locations' => $this->locations(),
            'breadcrumbs' => $this->trail([['name' => 'Global presence', 'url' => Locales::url('site.presence')]]),
        ], [
            'title' => 'Global presence',
            'description' => 'Where we operate and the markets we ship to.',
        ]);
    }

    public function faq(): Response
    {
        $faqs = Faq::query()->active()->ordered()->get();

        return $this->page('site/faq', [
            'groups' => $faqs->groupBy(fn (Faq $faq): string => $faq->category ?: 'General')
                ->map(fn ($items, $group): array => [
                    'name' => $group,
                    'items' => $items->map(fn (Faq $faq): array => [
                        'id' => $faq->id,
                        'question' => $faq->question,
                        'answer' => $faq->answer,
                    ])->values()->all(),
                ])->values()->all(),
            'breadcrumbs' => $this->trail([['name' => 'FAQ', 'url' => Locales::url('site.faq')]]),
        ], [
            'title' => 'Frequently asked questions',
            'schema' => array_filter([$this->schema->faq($faqs)]),
        ]);
    }

    public function show(Page $page): Response
    {
        abort_unless($page->status->value === 'published', 404);

        $page->load('image');

        return $this->page('site/page', [
            'page' => [
                'title' => $page->title,
                'excerpt' => $page->excerpt,
                'content' => $page->content,
                'image' => $page->image ? (new MediaResource($page->image))->resolve() : null,
                'updatedAt' => $page->updated_at?->toIso8601String(),
            ],
            'breadcrumbs' => $this->trail([['name' => $page->title, 'url' => Locales::url('site.page', [$page])]]),
        ], [
            'title' => $page->title,
            'description' => $page->excerpt,
        ], $page);
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function credentials(): array
    {
        return array_values(Credential::query()->active()->ordered()->with('image')->get()
            ->map(fn (Credential $c): array => [
                'id' => $c->id,
                'type' => $c->type,
                'name' => $c->name,
                'issuer' => $c->issuer,
                'description' => $c->description,
                'reference' => $c->reference,
                'year' => $c->year,
                'image' => $c->image ? (new MediaResource($c->image))->resolve() : null,
            ])->all());
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function locations(): array
    {
        return array_values(Location::query()->active()->ordered()->get()
            ->map(fn (Location $location): array => [
                'id' => $location->id,
                'name' => $location->name,
                'type' => $location->type,
                'city' => $location->city,
                'country' => $location->country,
                'countryCode' => $location->country_code,
                'address' => $location->address,
                'phone' => $location->phone,
                'email' => $location->email,
                'latitude' => $location->latitude,
                'longitude' => $location->longitude,
                'isHeadquarters' => $location->is_headquarters,
            ])->all());
    }
}
