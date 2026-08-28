<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Models\MediaAsset;
use Illuminate\Foundation\Http\FormRequest;

class MediaUploadRequest extends FormRequest
{
    /**
     * Extensions accepted by the library. SVG is deliberately excluded: it can
     * carry inline script and uploads are served from the site's own origin.
     */
    private const ALLOWED = 'jpg,jpeg,png,webp,avif,gif,pdf,doc,docx,xls,xlsx,zip';

    public function authorize(): bool
    {
        return $this->user()?->can('create', MediaAsset::class) === true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'files' => ['required', 'array', 'min:1', 'max:20'],
            'files.*' => ['required', 'file', 'max:20480', 'mimes:'.self::ALLOWED],
            'folder' => ['nullable', 'string', 'max:60', 'regex:/^[A-Za-z0-9 _-]+$/'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'files.*.mimes' => 'Only images, PDFs, Office documents and ZIP archives can be uploaded.',
            'files.*.max' => 'Each file must be 20 MB or smaller.',
        ];
    }
}
