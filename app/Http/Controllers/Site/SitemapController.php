<?php

declare(strict_types=1);

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Industry;
use App\Models\Page;
use App\Models\Post;
use App\Models\Product;
use App\Models\Project;
use App\Models\Service;
use App\Models\Solution;
use App\Models\TeamMember;
use App\Settings\SeoSettings;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

class SitemapController extends Controller
{
    public function __construct(private readonly SeoSettings $seo) {}

    public function sitemap(): Response
    {
        $xml = Cache::remember('sitemap.xml', now()->addHour(), fn (): string => $this->build());

        return response($xml, 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }

    public function robots(): Response
    {
        $indexable = $this->seo->indexable;

        $lines = $indexable
            ? ['User-agent: *', 'Disallow: /admin', 'Disallow: /settings', 'Disallow: /login', '', 'Sitemap: '.route('sitemap')]
            : ['User-agent: *', 'Disallow: /'];

        return response(implode("\n", $lines)."\n", 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }

    private function build(): string
    {
        $urls = [
            $this->url(route('site.home'), null, '1.0', 'daily'),
            $this->url(route('site.about'), null, '0.8'),
            $this->url(route('site.services.index'), null, '0.8'),
            $this->url(route('site.solutions.index'), null, '0.8'),
            $this->url(route('site.products.index'), null, '0.9'),
            $this->url(route('site.logistics'), null, '0.8'),
            $this->url(route('site.industries.index'), null, '0.7'),
            $this->url(route('site.projects.index'), null, '0.8'),
            $this->url(route('site.presence'), null, '0.6'),
            $this->url(route('site.team.index'), null, '0.6'),
            $this->url(route('site.insights.index'), null, '0.7'),
            $this->url(route('site.faq'), null, '0.5'),
            $this->url(route('site.contact'), null, '0.9'),
            $this->url(route('site.quote'), null, '0.9'),
        ];

        $collections = [
            [Product::class, 'site.products.show', '0.7'],
            [Service::class, 'site.services.show', '0.7'],
            [Solution::class, 'site.solutions.show', '0.7'],
            [Industry::class, 'site.industries.show', '0.6'],
            [Project::class, 'site.projects.show', '0.6'],
            [TeamMember::class, 'site.team.show', '0.4'],
        ];

        foreach ($collections as [$model, $route, $priority]) {
            foreach ($model::query()->where('is_active', true)->get(['slug', 'updated_at']) as $record) {
                $urls[] = $this->url(route($route, $record->slug), $record->updated_at, $priority);
            }
        }

        foreach (Post::query()->published()->get(['slug', 'updated_at']) as $post) {
            $urls[] = $this->url(route('site.insights.show', $post->slug), $post->updated_at, '0.6');
        }

        foreach (Page::query()->published()->get(['slug', 'updated_at']) as $page) {
            $urls[] = $this->url(route('site.page', $page->slug), $page->updated_at, '0.4');
        }

        return '<?xml version="1.0" encoding="UTF-8"?>'."\n"
            .'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n"
            .implode("\n", $urls)."\n"
            .'</urlset>';
    }

    private function url(string $location, mixed $lastModified = null, string $priority = '0.5', string $frequency = 'weekly'): string
    {
        $lastmod = $lastModified instanceof \DateTimeInterface
            ? '<lastmod>'.$lastModified->format('Y-m-d').'</lastmod>'
            : '';

        return sprintf(
            '  <url><loc>%s</loc>%s<changefreq>%s</changefreq><priority>%s</priority></url>',
            htmlspecialchars($location, ENT_XML1),
            $lastmod,
            $frequency,
            $priority,
        );
    }
}
