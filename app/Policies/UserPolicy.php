<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;

/**
 * Only super admins manage accounts, and nobody may lock themselves out
 * by deleting or demoting their own account.
 */
class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    public function view(User $user, User $model): bool
    {
        return $user->isSuperAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    public function update(User $user, User $model): bool
    {
        return $user->isSuperAdmin();
    }

    public function delete(User $user, User $model): bool
    {
        return $user->isSuperAdmin() && $user->isNot($model);
    }
}
