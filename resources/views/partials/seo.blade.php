@php
    /**
     * Server-rendered SEO block.
     *
     * Search engines and social scrapers request each URL as a fresh document,
     * so the canonical place for meta tags is the initial HTML rather than the
     * client. The React <Head> only owns the <title>, which it updates during
     * client-side navigation.
     */
    $seo = $page['props']['seo'] ?? null;
@endphp

@if ($seo)
    @if (! empty($seo['description']))
        <meta name="description" content="{{ $seo['description'] }}">
    @endif
    <meta name="robots" content="{{ $seo['robots'] ?? 'index,follow' }}">
    <link rel="canonical" href="{{ $seo['canonical'] }}">

    {{-- Tells search engines which URL serves which language. --}}
    @foreach ($seo['alternates'] ?? [] as $alternate)
        <link rel="alternate" hreflang="{{ $alternate['hreflang'] }}" href="{{ $alternate['href'] }}">
    @endforeach

    <meta property="og:type" content="{{ $seo['ogType'] ?? 'website' }}">
    <meta property="og:site_name" content="{{ $seo['siteName'] }}">
    <meta property="og:locale" content="{{ $seo['locale'] }}">
    <meta property="og:title" content="{{ $seo['ogTitle'] }}">
    <meta property="og:url" content="{{ $seo['canonical'] }}">
    @if (! empty($seo['ogDescription']))
        <meta property="og:description" content="{{ $seo['ogDescription'] }}">
    @endif
    @if (! empty($seo['ogImage']))
        <meta property="og:image" content="{{ $seo['ogImage'] }}">
    @endif

    <meta name="twitter:card" content="{{ empty($seo['ogImage']) ? 'summary' : 'summary_large_image' }}">
    <meta name="twitter:title" content="{{ $seo['ogTitle'] }}">
    @if (! empty($seo['ogDescription']))
        <meta name="twitter:description" content="{{ $seo['ogDescription'] }}">
    @endif
    @if (! empty($seo['ogImage']))
        <meta name="twitter:image" content="{{ $seo['ogImage'] }}">
    @endif

    @foreach ($seo['schema'] ?? [] as $graph)
        <script type="application/ld+json">{!! json_encode($graph, JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!}</script>
    @endforeach
@endif
