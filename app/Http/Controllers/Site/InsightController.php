<?php

declare(strict_types=1);

namespace App\Http\Controllers\Site;

use App\Enums\ContentStatus;
use App\Http\Resources\PostResource;
use App\Models\Category;
use App\Models\Post;
use App\Models\Tag;
use App\Support\Locales;
use Illuminate\Http\Request;
use Inertia\Response;

class InsightController extends SiteController
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'category' => ['nullable', 'string', 'max:140'],
            'tag' => ['nullable', 'string', 'max:140'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $base = fn () => Post::query()
            ->published()
            ->with(['image', 'category', 'author'])
            ->search($filters['search'] ?? null)
            ->when($filters['category'] ?? null, fn ($query, $slug) => $query->whereHas(
                'category',
                fn ($inner) => $inner->where('slug', $slug)
            ))
            ->when($filters['tag'] ?? null, fn ($query, $slug) => $query->whereHas(
                'tags',
                fn ($inner) => $inner->where('slug', $slug)
            ));

        $featured = ! array_filter($filters)
            ? Post::query()->published()->where('is_featured', true)->with(['image', 'category', 'author'])->latest('published_at')->first()
            : null;

        $paginator = $base()
            ->when($featured, fn ($query) => $query->whereKeyNot($featured->id))
            ->latest('published_at')
            ->paginate(9)
            ->withQueryString();

        return $this->page('site/insights/index', [
            'featured' => $featured ? PostResource::detailed($featured)->resolve() : null,
            'posts' => $paginator->through(fn (Post $post): array => (new PostResource($post))->resolve()),
            'categories' => Category::query()->active()->ordered()->get(['name', 'slug'])
                ->map(fn (Category $c): array => ['name' => $c->name, 'slug' => $c->slug])->all(),
            'tags' => Tag::query()->orderBy('name')->limit(20)->get(['name', 'slug'])
                ->map(fn (Tag $t): array => ['name' => $t->name, 'slug' => $t->slug])->all(),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'category' => $filters['category'] ?? '',
                'tag' => $filters['tag'] ?? '',
            ],
            'breadcrumbs' => $this->trail([['name' => 'Insights', 'url' => Locales::url('site.insights.index')]]),
        ], [
            'title' => 'Insights',
            'description' => 'Technical notes and market commentary on aluminium supply and international freight.',
        ]);
    }

    public function show(Post $post): Response
    {
        abort_unless(
            $post->status === ContentStatus::Published && $post->published_at?->isPast() === true,
            404,
        );

        $post->load(['image', 'category', 'author', 'tags']);

        // Counted without touching updated_at, so a read never looks like an edit.
        Post::query()->whereKey($post->getKey())->increment('views');

        $related = Post::query()
            ->published()
            ->whereKeyNot($post->id)
            ->when($post->category_id, fn ($query) => $query->where('category_id', $post->category_id))
            ->with(['image', 'category'])
            ->latest('published_at')
            ->limit(3)
            ->get();

        return $this->page('site/insights/show', [
            'post' => PostResource::detailed($post)->resolve(),
            'related' => PostResource::collection($related)->resolve(),
            'breadcrumbs' => $this->trail([
                ['name' => 'Insights', 'url' => Locales::url('site.insights.index')],
                ['name' => $post->title, 'url' => Locales::url('site.insights.show', [$post])],
            ]),
        ], [
            'title' => $post->title,
            'description' => $post->summary(),
            'image' => $post->image?->url,
            'type' => 'article',
            'schema' => [$this->schema->article($post)],
        ], $post);
    }
}
