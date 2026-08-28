import { createInertiaApp } from '@inertiajs/react';
import { lazy, Suspense } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AuthLayout from '@/layouts/auth-layout';
import SiteLayout from '@/layouts/site-layout';

/*
| The public site and the sign-in screen load eagerly: they are the first
| paint for anonymous visitors and must not wait on a second round trip.
| Everything behind authentication is code-split, so a marketing visitor
| never downloads the dashboard chrome.
*/
const AdminLayout = lazy(() => import('@/layouts/admin-layout'));
const AppLayout = lazy(() => import('@/layouts/app-layout'));
const SettingsLayout = lazy(() => import('@/layouts/settings/layout'));

const appName = import.meta.env.VITE_APP_NAME || 'Guang Dong Crown';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            // Public pages set their own <title> and meta through SeoHead.
            case name.startsWith('site/'):
                return SiteLayout;
            case name.startsWith('admin/'):
                return AdminLayout;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                <Suspense fallback={<div className="min-h-dvh" />}>
                    {app}
                </Suspense>
                <Toaster position="top-right" richColors closeButton />
            </TooltipProvider>
        );
    },
    progress: {
        color: 'oklch(0.655 0.115 207)',
        delay: 120,
    },
});

// This will set light / dark mode on load...
initializeTheme();
