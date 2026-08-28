import {
    Award,
    Bookmark,
    Briefcase,
    Building,
    Building2,
    CircleHelp,
    FileText,
    FolderTree,
    House,
    Image,
    Inbox,
    LayoutDashboard,
    LayoutTemplate,
    Layers,
    MapPin,
    Milestone,
    Newspaper,
    Package,
    PanelBottom,
    Quote,
    Route,
    Search,
    Settings,
    Share2,
    Tags,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Icons referenced by name from the PHP resource and settings schemas.
 */
const ICONS: Record<string, LucideIcon> = {
    award: Award,
    bookmark: Bookmark,
    briefcase: Briefcase,
    building: Building,
    'building-2': Building2,
    'circle-help': CircleHelp,
    'file-text': FileText,
    'folder-tree': FolderTree,
    house: House,
    image: Image,
    inbox: Inbox,
    'layout-dashboard': LayoutDashboard,
    'layout-template': LayoutTemplate,
    layers: Layers,
    'map-pin': MapPin,
    milestone: Milestone,
    newspaper: Newspaper,
    package: Package,
    'panel-bottom': PanelBottom,
    quote: Quote,
    route: Route,
    search: Search,
    settings: Settings,
    'share-2': Share2,
    tags: Tags,
    users: Users,
};

export function AdminIcon({
    name,
    className,
}: {
    name?: string | null;
    className?: string;
}) {
    const Icon = (name && ICONS[name]) || FileText;

    return <Icon aria-hidden="true" className={cn('size-4', className)} />;
}
