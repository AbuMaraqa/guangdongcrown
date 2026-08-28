# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The corporate website and CMS for **Guang Dong Crown**, an aluminium supply and international
logistics company. Two applications share one codebase:

- a public marketing site (`/`) with a fixed brand identity and a GSAP motion system;
- an admin dashboard (`/admin`) that manages every piece of dynamic content on it.

Stack: Laravel 13, Inertia 3, **React 19** (not Vue), TypeScript, Tailwind 4, shadcn/ui, Fortify
(2FA + passkeys), Wayfinder. Built on the `laravel/react-starter-kit` skeleton.

## Commands

```bash
composer dev          # serve + queue worker + vite, all at once
composer ci:check     # everything CI runs: eslint, prettier, phpstan, pint, pest

npm run dev           # vite only
npm run build         # production assets
npm run lint          # eslint --fix
npm run types:check   # tsc --noEmit
npm run format        # prettier --write resources/

composer lint         # pint --parallel (writes)
composer types:check  # phpstan analyse — level 7, must stay at 0 errors
php artisan test      # pest
```

Running one test:

```bash
php artisan test tests/Feature/Admin/ContentResourceTest.php
php artisan test --filter="rich text is sanitised"
```

Tests run against an in-memory SQLite database (`phpunit.xml`) with `RefreshDatabase`. Feature tests
that need content call `$this->seed([SettingsSeeder::class, CatalogueSeeder::class, ...])` — the
seeders are idempotent and are the fixture layer; there are no factories for content models.

`composer setup` bootstraps a fresh clone. `php artisan migrate --seed` prints the generated
super-admin password once (override with `ADMIN_EMAIL` / `ADMIN_PASSWORD`, read via `config/cms.php`).

## The CMS is schema-driven — read this before touching admin code

Sixteen content types share **one** controller, **one** form request and **two** React screens.
Adding or changing a field is a one-file edit; there is no per-entity CRUD code and none should be
written.

```
app/Cms/Field.php               fluent field builder — carries validation rules AND UI metadata
app/Cms/CmsResource.php         base: model, columns, filters, form payload, capability detection
app/Cms/Resources/*.php         one declaration per entity (the only file you normally edit)
app/Cms/ResourceRegistry.php    registry — routes, sidebar and controller all resolve from here
app/Http/Requests/Admin/CmsResourceRequest.php   derives rules from the same Field list
app/Http/Controllers/Admin/ResourceController.php  generic index/create/store/edit/update/…
app/Actions/SaveCmsResource.php  persists attributes + relations + gallery + SEO in one transaction
resources/js/pages/admin/resources/{index,form}.tsx  render whatever the schema describes
resources/js/components/admin/fields.tsx             one control per Field type
```

Current keys: `pages, product-categories, products, services, solutions, industries,
project-categories, projects, categories, posts, team, testimonials, credentials, milestones,
locations, faqs`. Routes are `/admin/content/{resource}` and are constrained to registered keys, so
an unregistered resource 404s rather than erroring.

**To add a field**: add a `Field::…()` to the resource's `fields()`. Validation, the form control,
the label and the persistence all follow. **To add an entity**: create the model + migration, write a
`CmsResource` subclass, register it in `ResourceRegistry::RESOURCES`. Adding a new *field type*
requires a case in both `Field` (factory + defaults) and `fields.tsx` (the control).

`Field::validationRules()` is the single source of truth for validation — never duplicate rules in a
controller.

## Model capabilities are contracts, not trait sniffing

`App\Contracts\Seoable` and `App\Contracts\HasMediaGallery` mark what a model supports; the
`HasSeo` / `HasGallery` traits satisfy them. Pipeline code narrows with `instanceof`, never with
`class_uses_recursive`. The relation methods (`seo()`, `image()`, `gallery()`) are deliberately
**not** on the interfaces — their generics are invariant over the declaring model and would break
every implementation. Access them via the declared `@property-read` (`$model->seo`,
`$model->gallery`) when working through a contract.

Other shared model concerns: `HasSlug` (unique slugs, considers soft-deleted rows via
`withoutGlobalScope(SoftDeletingScope::class)` — `withTrashed()` is not type-safe on a generic
builder), `Publishable` (`active()`, `featured()`, `ordered()` scopes).

## Authorization

`App\Enums\Role` (`super_admin`, `admin`, `editor`) owns the ability map. One `ContentPolicy` is
registered against every content model in `AppServiceProvider::configureAuthorization()`; super
admins bypass via `Gate::before`. Roughly: editors manage content and upload media; admins add
enquiries and settings; super admins add account management.

`EnsureUserIsStaff` (`staff` middleware) logs out and 403s deactivated accounts on every admin route.
**Public registration is disabled** in `config/fortify.php` — accounts are created from
`/admin/users`. Fortify's `home` is `/admin`.

## SEO: server-rendered, client only owns the title

`resources/views/partials/seo.blade.php` emits description, canonical, robots, OpenGraph, Twitter
and JSON-LD from the shared `seo` prop. `SeoHead` in React renders **only** `<title>`. Adding meta
tags to `SeoHead` duplicates every one of them on first load. Controllers build the payload through
`SiteController::page()` → `SeoService`, which merges per-entity `Seo` overrides over the global
settings defaults. Structured data comes from `StructuredData` and is built from stored content only.

## Frontend conventions

`resources/js/app.tsx` resolves layouts by page-name prefix. `SiteLayout` and `AuthLayout` load
eagerly; the authenticated layouts are `React.lazy` so a marketing visitor never downloads the
dashboard. Keep it that way — it is worth ~100 kB gzip on the public entry.

**Two palettes.** The dashboard uses the neutral shadcn tokens and follows the OS light/dark
preference. The public site uses a fixed brand palette (graphite / copper) scoped to `.site-root` in
`resources/css/app.css`, with `.site-invert` for dark bands. Public components read
`var(--site-fg)`, `var(--site-muted)`, `var(--site-line)`, `var(--site-accent)` — not the shadcn
tokens. The accent is overridable from dashboard settings via `--brand-accent`.

**Motion** lives in `resources/js/animation/`. Every helper checks `prefersReducedMotion()` and
animates only `transform`/`opacity`. Nothing is hidden by CSS — the "from" state is written by GSAP
in a layout effect, so the page still renders fully without JS. Import from the leaf modules
(`@/animation/gsap`) rather than the barrel in anything reachable from the app entry.

Prop-derived local state uses `useSyncedState` (adjust-during-render), not `useEffect` + `setState`
— the React compiler lint rule rejects the latter and it is enabled here.

## Things that bite

- **Route order.** `routes/web.php` ends with a `{page}` catch-all for CMS pages. `admin.php` and
  `settings.php` are required *after* the site group, and the catch-all carries a negative-lookahead
  constraint. Adding a top-level public route means checking it is declared before the catch-all.
- **Cache invalidation.** Header, footer and navigation come from `SiteDataService::chrome()`, cached
  forever. Anything that mutates published content must call `SiteDataService::flush()`;
  `SaveCmsResource` and `ResourceController` already do.
- **Lazy loading is prohibited** outside production (`Model::preventLazyLoading`), as is silently
  discarding attributes. A missing `with()` fails loudly in dev and in tests.
- **PHPStan level 7 with larastan.** New Eloquent relations and scopes need generic docblocks
  (`@return BelongsTo<Media, $this>`, `@param Builder<static> $query`) or the build fails.
- **`array_values()` for `list<>` returns.** `Collection::all()` is not typed as a list.
- Rich text is sanitised by `HtmlSanitizer` on save. Do not sanitise again in React — `Prose` injects
  the stored HTML deliberately, and that is the only place it is injected.
- SVG uploads are rejected (`MediaUploadRequest`): uploads are served from the site's own origin.

## Content policy

The company's previous site was an unmodified demo template, so almost nothing on it was true.
Certifications, awards, statistics, team members, offices, projects, testimonials, clients and
contact details are **seeded empty on purpose** and every section that consumes them renders an
empty state instead. Do not populate them with plausible-looking values; they are the company's to
supply through the dashboard. Seeded content is limited to what is verifiable: the four capabilities
the company publishes, aluminium alloys described by their published international standards
(EN 755 / EN 485 / ASTM B209 / B221), and technical articles on public metallurgy and Incoterms.
