<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\MediaAsset;
use App\Models\User;

class MediaPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAbility('media.view');
    }

    public function create(User $user): bool
    {
        return $user->hasAbility('media.upload');
    }

    public function update(User $user, MediaAsset $media): bool
    {
        return $user->hasAbility('media.upload');
    }

    public function delete(User $user, MediaAsset $media): bool
    {
        return $user->hasAbility('media.delete');
    }
}
