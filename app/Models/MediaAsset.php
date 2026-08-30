<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Number;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * One entry in the shared media library.
 *
 * spatie/laravel-medialibrary attaches files to the model that owns them,
 * which is the wrong shape for a CMS where an editor uploads an image once
 * and reuses it on a product, a project and an article. This model is that
 * missing owner: each asset holds exactly one file in its `file` collection,
 * and content records reference the asset by id.
 *
 * @property string|null $alt
 * @property string|null $title
 * @property string|null $folder
 * @property string|null $hash
 * @property-read string $url
 * @property-read string $thumb_url
 * @property-read string $medium_url
 * @property-read string $readable_size
 * @property-read bool $is_image
 * @property-read string $file_name
 * @property-read string $mime_type
 * @property-read string $extension
 */
#[Fillable(['alt', 'title', 'folder', 'hash', 'user_id'])]
class MediaAsset extends Model implements HasMedia
{
    use InteractsWithMedia, SoftDeletes;

    public const COLLECTION = 'file';

    /** @var list<string> */
    protected $appends = ['url', 'thumb_url', 'readable_size', 'is_image'];

    /**
     * Conversions are queued by default; medialibrary regenerates them if the
     * original is replaced.
     */
    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->nonQueued()
            ->fit(Fit::Max, 400, 400)
            ->format('webp')
            ->quality(82);

        $this->addMediaConversion('medium')
            ->fit(Fit::Max, 1000, 1000)
            ->format('webp')
            ->quality(82);

        $this->addMediaConversion('large')
            ->fit(Fit::Max, 1920, 1920)
            ->format('webp')
            ->quality(82);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection(self::COLLECTION)
            ->singleFile()
            ->useDisk('public');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function file(): ?Media
    {
        return $this->getFirstMedia(self::COLLECTION);
    }

    /**
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeImages(Builder $query): Builder
    {
        return $query->whereHas('media', fn (Builder $inner) => $inner->where('mime_type', 'like', 'image/%'));
    }

    /**
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeDocuments(Builder $query): Builder
    {
        return $query->whereHas('media', fn (Builder $inner) => $inner->where('mime_type', 'not like', 'image/%'));
    }

    /**
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        return $query->when($term, fn (Builder $q, string $t): Builder => $q->where(
            fn (Builder $inner) => $inner
                ->where('alt', 'like', "%{$t}%")
                ->orWhere('title', 'like', "%{$t}%")
                ->orWhereHas('media', fn (Builder $m) => $m->where('name', 'like', "%{$t}%"))
        ));
    }

    /**
     * @return Attribute<string, never>
     */
    protected function url(): Attribute
    {
        return Attribute::get(fn (): string => $this->file()?->getUrl() ?? '');
    }

    /**
     * @return Attribute<string, never>
     */
    protected function thumbUrl(): Attribute
    {
        return Attribute::get(fn (): string => $this->conversion('thumb'));
    }

    /**
     * @return Attribute<string, never>
     */
    protected function mediumUrl(): Attribute
    {
        return Attribute::get(fn (): string => $this->conversion('medium'));
    }

    /**
     * @return Attribute<string, never>
     */
    protected function readableSize(): Attribute
    {
        return Attribute::get(fn (): string => (string) Number::fileSize((int) ($this->file()->size ?? 0), precision: 1));
    }

    /**
     * @return Attribute<bool, never>
     */
    protected function isImage(): Attribute
    {
        return Attribute::get(fn (): bool => str_starts_with((string) $this->file()?->mime_type, 'image/'));
    }

    /**
     * @return Attribute<string, never>
     */
    protected function fileName(): Attribute
    {
        return Attribute::get(fn (): string => (string) ($this->file()->name ?? ''));
    }

    /**
     * @return Attribute<string, never>
     */
    protected function mimeType(): Attribute
    {
        return Attribute::get(fn (): string => (string) ($this->file()->mime_type ?? ''));
    }

    /**
     * Plain methods rather than Eloquent attributes: nothing casts or persists
     * these, and `Attribute`'s TGet template is invariant, which makes a
     * nullable accessor awkward to type for no benefit.
     */
    public function width(): ?int
    {
        return $this->dimension('width');
    }

    public function height(): ?int
    {
        return $this->dimension('height');
    }

    /**
     * @return Attribute<int, never>
     */
    protected function size(): Attribute
    {
        return Attribute::get(fn (): int => (int) ($this->file()->size ?? 0));
    }

    /**
     * @return Attribute<string, never>
     */
    protected function extension(): Attribute
    {
        return Attribute::get(fn (): string => (string) ($this->file()->extension ?? ''));
    }

    /**
     * Medialibrary records image dimensions as custom properties when the file
     * is added; documents simply have none.
     */
    private function dimension(string $key): ?int
    {
        $value = $this->file()?->getCustomProperty($key);

        return is_numeric($value) ? (int) $value : null;
    }

    /**
     * Falls back to the original whenever a conversion was not generated —
     * a document, or an image already smaller than the target.
     */
    private function conversion(string $name): string
    {
        $file = $this->file();

        if (! $file) {
            return '';
        }

        return $file->hasGeneratedConversion($name) ? $file->getUrl($name) : $file->getUrl();
    }
}
