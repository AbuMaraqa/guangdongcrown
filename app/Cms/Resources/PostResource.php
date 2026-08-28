<?php

declare(strict_types=1);

namespace App\Cms\Resources;

use App\Cms\CmsResource;
use App\Cms\Field;
use App\Enums\ContentStatus;
use App\Models\Category;
use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class PostResource extends CmsResource
{
    public function model(): string
    {
        return Post::class;
    }

    public function key(): string
    {
        return 'posts';
    }

    public function label(): string
    {
        return 'Insights';
    }

    public function singular(): string
    {
        return 'Article';
    }

    public function icon(): string
    {
        return 'newspaper';
    }

    public function group(): string
    {
        return 'Editorial';
    }

    public function description(): ?string
    {
        return 'News and technical articles published to the insights section.';
    }

    public function titleAttribute(): string
    {
        return 'title';
    }

    public function searchable(): array
    {
        return ['title', 'excerpt'];
    }

    public function with(): array
    {
        return ['image', 'category', 'author'];
    }

    public function defaultSort(): array
    {
        return ['published_at', 'desc'];
    }

    public function isSortable(): bool
    {
        return false;
    }

    public function columns(): array
    {
        return [
            ['key' => 'title', 'label' => 'Article', 'type' => 'primary'],
            ['key' => 'category.name', 'label' => 'Category', 'type' => 'text'],
            ['key' => 'author.name', 'label' => 'Author', 'type' => 'text'],
            ['key' => 'status', 'label' => 'Status', 'type' => 'status'],
            ['key' => 'published_at', 'label' => 'Published', 'type' => 'date'],
        ];
    }

    public function filters(): array
    {
        return [
            ['key' => 'status', 'label' => 'Status', 'options' => ContentStatus::options()],
            [
                'key' => 'category_id',
                'label' => 'Category',
                'options' => Category::query()->ordered()->get(['id', 'name'])
                    ->map(fn (Category $c): array => ['value' => $c->id, 'label' => $c->name])->all(),
            ],
        ];
    }

    public function formOptions(): array
    {
        return [
            'category_id' => Category::query()->ordered()->get(['id', 'name'])
                ->map(fn (Category $c): array => ['value' => $c->id, 'label' => $c->name])->all(),
            'user_id' => User::query()->active()->orderBy('name')->get(['id', 'name'])
                ->map(fn (User $u): array => ['value' => $u->id, 'label' => $u->name])->all(),
            'tagSuggestions' => Tag::query()->orderBy('name')->pluck('name')->all(),
        ];
    }

    public function fields(): array
    {
        return [
            Field::text('title')->required()->rules(['required', 'string', 'max:200']),
            Field::slug('slug', 'title')->rules(['nullable', 'string', 'max:200']),
            Field::textarea('excerpt', 'Standfirst')
                ->rules(['nullable', 'string', 'max:400'])
                ->help('The intro paragraph shown on cards and in search results.'),
            Field::richtext('content', 'Article')->rules(['nullable', 'string']),
            Field::select('status')
                ->options(ContentStatus::options())
                ->default(ContentStatus::Draft->value)
                ->rules(['required', 'string', 'in:draft,published,archived'])
                ->panel('side')->section('Publishing'),
            Field::datetime('published_at', 'Publish date')->panel('side')->section('Publishing'),
            Field::select('category_id', 'Category')
                ->relation('category_id')
                ->rules(['nullable', 'integer', 'exists:categories,id'])
                ->panel('side')->section('Publishing'),
            Field::select('user_id', 'Author')
                ->relation('user_id')
                ->rules(['nullable', 'integer', 'exists:users,id'])
                ->panel('side')->section('Publishing'),
            Field::tags('tags')->panel('side')->section('Publishing'),
            Field::image('image_id', 'Featured image')->panel('side')->section('Media'),
            Field::toggle('is_featured', 'Featured article')->panel('side')->section('Visibility'),
        ];
    }

    public function afterSave(Model $model, array $data): void
    {
        /** @var Post $model */
        $names = array_filter(array_map('trim', $data['tags'] ?? []));

        $ids = collect($names)
            ->unique()
            ->map(fn (string $name): int => Tag::query()->firstOrCreate(['name' => $name])->id)
            ->all();

        $model->tags()->sync($ids);

        if ($model->user_id === null) {
            $model->forceFill(['user_id' => Auth::id()])->saveQuietly();
        }
    }
}
