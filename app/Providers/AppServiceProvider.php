<?php

namespace App\Providers;

use App\Models;
use App\Policies\ContentPolicy;
use App\Policies\InquiryPolicy;
use App\Policies\MediaPolicy;
use App\Policies\UserPolicy;
use App\Services\HtmlSanitizer;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Content models that share the generic CMS authorization rules.
     *
     * @var list<class-string<Model>>
     */
    private const CONTENT_MODELS = [
        Models\Page::class,
        Models\Product::class,
        Models\Catalogue::class,
        Models\ProductCategory::class,
        Models\Service::class,
        Models\Solution::class,
        Models\Industry::class,
        Models\Project::class,
        Models\ProjectCategory::class,
        Models\TeamMember::class,
        Models\Testimonial::class,
        Models\Credential::class,
        Models\Milestone::class,
        Models\Location::class,
        Models\Faq::class,
        Models\Post::class,
        Models\Category::class,
        Models\Tag::class,
    ];

    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(HtmlSanitizer::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureAuthorization();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        Model::preventLazyLoading(! app()->isProduction());
        Model::preventSilentlyDiscardingAttributes(! app()->isProduction());

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        if (app()->isProduction()) {
            URL::forceScheme('https');
        }

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    /**
     * Map every CMS model onto its policy and let super admins bypass checks.
     */
    protected function configureAuthorization(): void
    {
        Gate::before(fn ($user) => $user->isSuperAdmin() && $user->is_active ? true : null);

        foreach (self::CONTENT_MODELS as $model) {
            Gate::policy($model, ContentPolicy::class);
        }

        Gate::policy(Models\Inquiry::class, InquiryPolicy::class);
        Gate::policy(Models\MediaAsset::class, MediaPolicy::class);
        Gate::policy(Models\User::class, UserPolicy::class);

        Gate::define('manage-settings', fn (Models\User $user): bool => $user->hasAbility('settings.update'));
        Gate::define('view-settings', fn (Models\User $user): bool => $user->hasAbility('settings.view'));
        Gate::define('manage-seo', fn (Models\User $user): bool => $user->hasAbility('seo.manage'));
    }
}
