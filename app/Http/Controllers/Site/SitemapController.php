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
use App\Support\Locales;
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

    /**
     * Every page is listed once per published language, so each translation
     * can be discovered and ranked on its own.
     */
    private function build(): string
    {
        $landing = [
            ['site.home', '1.0', 'daily'],
            ['site.products.index', '0.9', 'weekly'],
            ['site.contact', '0.9', 'weekly'],
            ['site.quote', '0.9', 'weekly'],
            ['site.about', '0.8', 'weekly'],
            ['site.services.index', '0.8', 'weekly'],
            ['site.solutions.index', '0.8', 'weekly'],
            ['site.logistics', '0.8', 'weekly'],
            ['site.projects.index', '0.8', 'weekly'],
            ['site.industries.index', '0.7', 'weekly'],
            ['site.insights.index', '0.7', 'weekly'],
            ['site.presence', '0.6', 'weekly'],
            ['site.team.index', '0.6', 'weekly'],
            ['site.faq', '0.5', 'weekly'],
        ];

        $collections = [
            [Product::class, 'site.products.show', '0.7'],
            [Service::class, 'site.services.show', '0.7'],
            [Solution::class, 'site.solutions.show', '0.7'],
            [Industry::class, 'site.industries.show', '0.6'],
            [Project::class, 'site.projects.show', '0.6'],
            [TeamMember::class, 'site.team.show', '0.4'],
        ];

        $urls = [];

        foreach (Locales::codes() as $locale) {
            foreach ($landing as [$name, $priority, $frequency]) {
                $urls[] = $this->url(Locales::url($name, [], $locale), null, $priority, $frequency);
            }

            foreach ($collections as [$model, $route, $priority]) {
                foreach ($model::query()->where('is_active', true)->get(['slug', 'updated_at']) as $record) {
                    $urls[] = $this->url(Locales::url($route, [$record->slug], $locale), $record->updated_at, $priority);
                }
            }

            foreach (Post::query()->published()->get(['slug', 'updated_at']) as $post) {
                $urls[] = $this->url(Locales::url('site.insights.show', [$post->slug], $locale), $post->updated_at, '0.6');
            }

            foreach (Page::query()->published()->get(['slug', 'updated_at']) as $page) {
                $urls[] = $this->url(Locales::url('site.page', [$page->slug], $locale), $page->updated_at, '0.4');
            }
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
