<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Concerns\PasswordValidationRules;
use App\Enums\Role;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserRequest extends FormRequest
{
    use PasswordValidationRules;

    public function authorize(): bool
    {
        $target = $this->route('user');

        return $target instanceof User
            ? $this->user()?->can('update', $target) === true
            : $this->user()?->can('create', User::class) === true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var User|null $target */
        $target = $this->route('user');
        $creating = $target === null;

        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => [
                'required', 'string', 'email:rfc', 'max:255',
                Rule::unique('users', 'email')->ignore($target?->getKey()),
            ],
            'job_title' => ['nullable', 'string', 'max:120'],
            'role' => ['required', Rule::enum(Role::class)],
            'is_active' => ['required', 'boolean'],
            'password' => $creating
                ? $this->passwordRules()
                : ['nullable', ...array_filter($this->passwordRules(), fn (mixed $rule): bool => $rule !== 'required')],
        ];
    }

    /**
     * Guard against an admin locking themselves out of their own account.
     */
    public function withValidator(mixed $validator): void
    {
        $validator->after(function ($validator): void {
            $target = $this->route('user');

            if ($target instanceof User && $this->user()->is($target)) {
                if ($this->input('role') !== $target->role->value) {
                    $validator->errors()->add('role', 'You cannot change your own role.');
                }

                if (! $this->boolean('is_active')) {
                    $validator->errors()->add('is_active', 'You cannot deactivate your own account.');
                }
            }
        });
    }
}
