import type { Auth } from '@/types/auth';
import type { SiteChrome } from '@/types/site';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth & { abilities: string[] };
            flash: { success: string | null; error: string | null };
            site: SiteChrome | null;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
