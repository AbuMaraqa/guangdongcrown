<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/**
 * Shared authorization for every CMS content model. Registered against each
 * content model in AppServiceProvider so the rules live in exactly one place.
 */
class ContentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAbility('content.view');
    }

    public function view(User $user, Model $model): bool
    {
        return $user->hasAbility('content.view');
    }

    public function create(User $user): bool
    {
        return $user->hasAbility('content.create');
    }

    public function update(User $user, Model $model): bool
    {
        return $user->hasAbility('content.update');
    }

    public function delete(User $user, Model $model): bool
    {
        if ($model->getAttribute('is_system')) {
            return $user->hasAbility('settings.update');
        }

        return $user->hasAbility('content.delete');
    }

    public function restore(User $user, Model $model): bool
    {
        return $user->hasAbility('content.delete');
    }

    public function forceDelete(User $user, Model $model): bool
    {
        return $user->hasAbility('content.delete');
    }

    public function publish(User $user, Model $model): bool
    {
        return $user->hasAbility('content.publish');
    }
}
