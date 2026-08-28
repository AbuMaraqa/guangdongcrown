<?php

declare(strict_types=1);

namespace App\Cms;

use InvalidArgumentException;

/**
 * Single source of truth for every CMS-managed entity. Routes, the admin
 * sidebar and the generic controller all resolve resources from here.
 */
class ResourceRegistry
{
    /** @var list<class-string<CmsResource>> */
    private const RESOURCES = [
        Resources\PageResource::class,
        Resources\ProductCategoryResource::class,
        Resources\ProductResource::class,
        Resources\ServiceResource::class,
        Resources\SolutionResource::class,
        Resources\IndustryResource::class,
        Resources\ProjectCategoryResource::class,
        Resources\ProjectResource::class,
        Resources\CategoryResource::class,
        Resources\PostResource::class,
        Resources\TeamMemberResource::class,
        Resources\TestimonialResource::class,
        Resources\CredentialResource::class,
        Resources\MilestoneResource::class,
        Resources\LocationResource::class,
        Resources\FaqResource::class,
    ];

    /** @var array<string, CmsResource>|null */
    private ?array $resolved = null;

    /**
     * @return array<string, CmsResource>
     */
    public function all(): array
    {
        if ($this->resolved !== null) {
            return $this->resolved;
        }

        $resolved = [];

        foreach (self::RESOURCES as $class) {
            $resource = new $class;
            $resolved[$resource->key()] = $resource;
        }

        return $this->resolved = $resolved;
    }

    public function has(string $key): bool
    {
        return array_key_exists($key, $this->all());
    }

    public function get(string $key): CmsResource
    {
        return $this->all()[$key] ?? throw new InvalidArgumentException("Unknown CMS resource [{$key}].");
    }

    /**
     * @return list<string>
     */
    public function keys(): array
    {
        return array_keys($this->all());
    }

    /**
     * Sidebar entries grouped by their declared nav group.
     *
     * @return array<string, list<array{key: string, label: string, icon: string}>>
     */
    public function navigation(): array
    {
        $groups = [];

        foreach ($this->all() as $key => $resource) {
            $groups[$resource->group()][] = [
                'key' => $key,
                'label' => $resource->label(),
                'icon' => $resource->icon(),
            ];
        }

        return $groups;
    }
}
