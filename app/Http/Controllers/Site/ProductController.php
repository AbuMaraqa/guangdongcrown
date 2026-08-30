<?php

declare(strict_types=1);

namespace App\Http\Controllers\Site;

use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Support\Locales;
use Illuminate\Http\Request;
use Inertia\Response;

class ProductController extends SiteController
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'category' => ['nullable', 'string', 'max:140'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $categories = ProductCategory::query()->active()->ordered()->withCount([
            'products as products_count' => fn ($query) => $query->where('is_active', true),
        ])->get();

        $paginator = Product::query()
            ->active()
            ->with(['image', 'category'])
            ->search($filters['search'] ?? null)
            ->when($filters['category'] ?? null, fn ($query, $slug) => $query->whereHas(
                'category',
                fn ($inner) => $inner->where('slug', $slug)
            ))
            ->ordered()
            ->paginate(12)
            ->withQueryString();

        return $this->page('site/products/index', [
            'products' => $paginator->through(fn (Product $product): array => (new ProductResource($product))->resolve()),
            'categories' => $categories->map(fn (ProductCategory $category): array => [
                'name' => $category->name,
                'slug' => $category->slug,
                'count' => (int) $category->getAttribute('products_count'),
            ])->all(),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'category' => $filters['category'] ?? '',
            ],
            'breadcrumbs' => $this->trail([['name' => 'Aluminium products', 'url' => Locales::url('site.products.index')]]),
        ], [
            'title' => 'Aluminium products',
            'description' => 'Extruded profiles, sheet, coil and billet supplied to international specification.',
        ]);
    }

    public function show(Product $product): Response
    {
        abort_unless($product->is_active, 404);

        $product->load(['image', 'gallery', 'category']);

        $related = Product::query()
            ->active()
            ->where('id', '!=', $product->id)
            ->when($product->product_category_id, fn ($query) => $query->where('product_category_id', $product->product_category_id))
            ->with(['image', 'category'])
            ->ordered()
            ->limit(3)
            ->get();

        return $this->page('site/products/show', [
            'product' => ProductResource::detailed($product)->resolve(),
            'related' => ProductResource::collection($related)->resolve(),
            'breadcrumbs' => $this->trail([
                ['name' => 'Aluminium products', 'url' => Locales::url('site.products.index')],
                ['name' => $product->name, 'url' => Locales::url('site.products.show', [$product])],
            ]),
        ], [
            'title' => $product->name,
            'description' => $product->excerpt,
            'image' => $product->image?->url,
            'type' => 'product',
            'schema' => [$this->schema->product($product)],
        ], $product);
    }
}
