<?php

declare(strict_types=1);

namespace App\Http\Controllers\Site;

use App\Http\Resources\MediaResource;
use App\Models\Catalogue;
use App\Models\MediaAsset;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Support\Locales;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Response;

/**
 * The catalogue library and the category-first product browse.
 */
class CatalogueController extends SiteController
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'category' => ['nullable', 'string', 'max:140'],
        ]);

        $catalogues = Catalogue::query()
            ->active()
            ->with(['image', 'category'])
            ->search($filters['search'] ?? null)
            ->when($filters['category'] ?? null, fn ($query, $slug) => $query->whereHas(
                'category',
                fn ($inner) => $inner->where('slug', $slug)
            ))
            ->ordered()
            ->get();

        return $this->page('site/catalogues/index', [
            'catalogues' => $catalogues->map(fn (Catalogue $catalogue): array => $this->card($catalogue))->all(),
            'categories' => ProductCategory::query()->active()->ordered()
                ->whereHas('catalogues', fn ($query) => $query->where('is_active', true))
                ->get()
                ->map(fn (ProductCategory $c): array => ['name' => $c->name, 'slug' => $c->slug])
                ->values()
                ->all(),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'category' => $filters['category'] ?? '',
            ],
            'breadcrumbs' => $this->trail([['name' => 'Catalogue', 'url' => Locales::url('site.catalogues.index')]]),
        ], [
            'title' => 'Catalogue',
            'description' => 'Profile drawings, system sections and specification sheets, page by page.',
        ]);
    }

    /**
     * The page images for one catalogue, loaded on demand by the viewer so the
     * index stays light no matter how many pages a catalogue runs to.
     */
    public function pages(Catalogue $catalogue): JsonResponse
    {
        abort_unless($catalogue->is_active, 404);

        $catalogue->load(['image', 'gallery']);

        return response()->json([
            'id' => $catalogue->id,
            'name' => $catalogue->name,
            'code' => $catalogue->code,
            'excerpt' => $catalogue->excerpt,
            'fileUrl' => $catalogue->file_url,
            'cover' => $catalogue->image ? (new MediaResource($catalogue->image))->resolve() : null,
            'pages' => $catalogue->gallery
                ->map(fn (MediaAsset $page): array => (new MediaResource($page))->resolve())
                ->values()
                ->all(),
        ]);
    }

    /**
     * Category-first product browse, mirroring how the group's other sites
     * present their profile systems.
     */
    public function products(): Response
    {
        $categories = ProductCategory::query()
            ->active()
            ->ordered()
            ->whereNull('parent_id')
            ->with(['image', 'children' => fn ($query) => $query->where('is_active', true)])
            ->withCount(['products as products_count' => fn ($query) => $query->where('is_active', true)])
            ->get();

        return $this->page('site/products/categories', [
            'categories' => $categories->map(fn (ProductCategory $category): array => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'count' => (int) $category->getAttribute('products_count'),
                'image' => $category->image ? (new MediaResource($category->image))->resolve() : null,
                'children' => $category->children
                    ->map(fn (ProductCategory $child): array => ['name' => $child->name, 'slug' => $child->slug])
                    ->values()
                    ->all(),
            ])->all(),
            'featured' => Product::query()
                ->active()
                ->featured()
                ->with(['image', 'category'])
                ->ordered()
                ->limit(6)
                ->get()
                ->map(fn (Product $product): array => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'excerpt' => $product->excerpt,
                    'image' => $product->image ? (new MediaResource($product->image))->resolve() : null,
                ])->all(),
            'breadcrumbs' => $this->trail([['name' => 'Our products', 'url' => Locales::url('site.products.categories')]]),
        ], [
            'title' => 'Our products',
            'description' => 'Aluminium systems and profile families, grouped by application.',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function card(Catalogue $catalogue): array
    {
        return [
            'id' => $catalogue->id,
            'name' => $catalogue->name,
            'slug' => $catalogue->slug,
            'code' => $catalogue->code,
            'excerpt' => $catalogue->excerpt,
            'year' => $catalogue->year,
            'fileUrl' => $catalogue->file_url,
            'cover' => $catalogue->image ? (new MediaResource($catalogue->image))->resolve() : null,
            'category' => $catalogue->category?->name,
        ];
    }
}
