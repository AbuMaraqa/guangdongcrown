<?php

declare(strict_types=1);

namespace App\Http\Requests\Site;

use App\Enums\InquiryType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validates public contact and quotation submissions. Every field is
 * re-validated here regardless of what the browser enforced.
 */
class InquiryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $isQuote = $this->input('type') === InquiryType::Quote->value;

        return [
            'type' => ['required', Rule::enum(InquiryType::class)],
            'name' => ['required', 'string', 'max:120'],
            'company' => [$isQuote ? 'required' : 'nullable', 'string', 'max:160'],
            'email' => ['required', 'string', 'email:rfc', 'max:255'],
            'phone' => ['nullable', 'string', 'max:64', 'regex:/^[0-9+()\-.\s]{6,64}$/'],
            'country' => ['nullable', 'string', 'max:120'],
            'service_id' => ['nullable', 'integer', Rule::exists('services', 'id')->where('is_active', true)],
            'product_id' => ['nullable', 'integer', Rule::exists('products', 'id')->where('is_active', true)],
            'quantity' => ['nullable', 'string', 'max:120'],
            'message' => ['required', 'string', 'min:20', 'max:4000'],
            'attachment' => ['nullable', 'file', 'max:10240', 'mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png,zip'],
            'consent' => ['accepted'],
            'website' => ['prohibited'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'message.min' => 'Please give us a little more detail so we can route your request correctly.',
            'consent.accepted' => 'Please confirm you are happy for us to contact you about this enquiry.',
            'attachment.mimes' => 'Attach a PDF, Office document, image or ZIP archive.',
            'attachment.max' => 'Attachments must be 10 MB or smaller.',
            'website.prohibited' => 'Your submission could not be processed.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'service_id' => 'service',
            'product_id' => 'product',
            'consent' => 'consent',
        ];
    }
}
