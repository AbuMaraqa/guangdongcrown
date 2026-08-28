<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\MediaAsset;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

/**
 * Adds files to the shared media library.
 *
 * Storage, conversions and responsive variants are handled by
 * spatie/laravel-medialibrary; this service only owns the library semantics
 * medialibrary leaves to the application — de-duplication by content hash and
 * the folder taxonomy.
 */
class MediaService
{
    public function upload(UploadedFile $file, ?int $userId = null, ?string $folder = null): MediaAsset
    {
        $hash = (string) hash_file('sha256', $file->getRealPath());

        // Re-uploading a file the library already holds returns the existing
        // asset, so an editor never creates a second copy by accident.
        if ($existing = MediaAsset::query()->where('hash', $hash)->first()) {
            return $existing;
        }

        $asset = MediaAsset::query()->create([
            'hash' => $hash,
            'folder' => $folder,
            'user_id' => $userId,
            'title' => Str::headline(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)),
        ]);

        $asset
            ->addMedia($file)
            ->usingName(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME))
            ->withCustomProperties($this->dimensions($file))
            ->toMediaCollection(MediaAsset::COLLECTION);

        return $asset->refresh();
    }

    /**
     * Pixel dimensions, stored alongside the file so listings and `<img>` tags
     * can reserve the right space without re-reading the image.
     *
     * @return array<string, int>
     */
    private function dimensions(UploadedFile $file): array
    {
        if (! str_starts_with((string) $file->getMimeType(), 'image/')) {
            return [];
        }

        $size = @getimagesize($file->getRealPath());

        return $size === false ? [] : ['width' => $size[0], 'height' => $size[1]];
    }

    /**
     * Removes the asset and every file medialibrary generated for it.
     */
    public function delete(MediaAsset $asset): void
    {
        $asset->clearMediaCollection(MediaAsset::COLLECTION);
        $asset->forceDelete();
    }
}
