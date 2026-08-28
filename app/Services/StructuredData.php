<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Faq;
use App\Models\Post;
use App\Models\Product;
use App\Settings\CompanySettings;
use App\Settings\SocialSettings;
use App\Support\Translated;
use Illuminate\Support\Collection;

/**
 * Builds schema.org JSON-LD graphs from real stored content only.
 */
class StructuredData
{
    public function __construct(
        private readonly CompanySettings $company,
        private readonly SocialSettings $social,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function organisation(): array
    {
        $social = array_values($this->social->links());

        return array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            'name' => Translated::get($this->company->name) ?? config('app.name'),
            'legalName' => Translated::get($this->company->legal_name),
            'url' => url('/'),
            'description' => Translated::get($this->company->description),
            'email' => $this->company->email,
            'telephone' => $this->company->phone,
            'foundingDate' => $this->company->founded_year,
            'address' => Translated::get($this->company->address) ? [
                '@type' => 'PostalAddress',
                'streetAddress' => Translated::get($this->company->address),
            ] : null,
            'sameAs' => $social ?: null,
        ], static fn (mixed $value): bool => $value !== null && $value !== []);
    }

    /**
     * @param  list<array{name: string, url: string}>  $items
     * @return array<string, mixed>
     */
    public function breadcrumbs(array $items): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => array_map(static fn (array $item, int $index): array => [
                '@type' => 'ListItem',
                'position' => $index + 1,
                'name' => $item['name'],
                'item' => $item['url'],
            ], $items, array_keys($items)),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function article(Post $post): array
    {
        return array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'Article',
            'headline' => $post->title,
            'description' => $post->summary(),
            'datePublished' => $post->published_at?->toIso8601String(),
            'dateModified' => $post->updated_at?->toIso8601String(),
            'image' => $post->image?->url,
            'author' => $post->author ? ['@type' => 'Person', 'name' => $post->author->name] : null,
            'publisher' => $this->organisation(),
        ], static fn (mixed $value): bool => $value !== null);
    }

    /**
     * @return array<string, mixed>
     */
    public function product(Product $product): array
    {
        return array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'Product',
            'name' => $product->name,
            'sku' => $product->sku,
            'description' => $product->excerpt,
            'image' => $product->image?->url,
            'category' => $product->category?->name,
            'brand' => ['@type' => 'Brand', 'name' => Translated::get($this->company->name) ?? config('app.name')],
        ], static fn (mixed $value): bool => $value !== null);
    }

    /**
     * @param  Collection<int, Faq>  $faqs
     * @return array<string, mixed>|null
     */
    public function faq(Collection $faqs): ?array
    {
        if ($faqs->isEmpty()) {
            return null;
        }

        return [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => $faqs->map(fn (Faq $faq): array => [
                '@type' => 'Question',
                'name' => $faq->question,
                'acceptedAnswer' => ['@type' => 'Answer', 'text' => $faq->answer],
            ])->values()->all(),
        ];
    }
}
