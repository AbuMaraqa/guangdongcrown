import {
    Anchor,
    Award,
    Boxes,
    Building2,
    CircleCheck,
    Compass,
    Container,
    Cpu,
    Factory,
    Forklift,
    Gauge,
    Globe,
    HardHat,
    Layers,
    LayoutGrid,
    LifeBuoy,
    Map,
    Package,
    PackageCheck,
    Plane,
    Recycle,
    Route,
    Ruler,
    Scale,
    Settings,
    Ship,
    ShieldCheck,
    Sparkles,
    Target,
    Thermometer,
    Train,
    Truck,
    Warehouse,
    Wrench,
    Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Icons available to CMS editors.
 *
 * Curated rather than dynamically imported so the bundle only ever ships the
 * glyphs the site can actually use, and an unknown name degrades gracefully.
 */
export const SITE_ICONS: Record<string, LucideIcon> = {
    anchor: Anchor,
    award: Award,
    boxes: Boxes,
    'building-2': Building2,
    'circle-check': CircleCheck,
    compass: Compass,
    container: Container,
    cpu: Cpu,
    factory: Factory,
    forklift: Forklift,
    gauge: Gauge,
    globe: Globe,
    'hard-hat': HardHat,
    layers: Layers,
    'layout-grid': LayoutGrid,
    'life-buoy': LifeBuoy,
    map: Map,
    package: Package,
    'package-check': PackageCheck,
    plane: Plane,
    recycle: Recycle,
    route: Route,
    ruler: Ruler,
    scale: Scale,
    settings: Settings,
    ship: Ship,
    'shield-check': ShieldCheck,
    sparkles: Sparkles,
    target: Target,
    thermometer: Thermometer,
    train: Train,
    truck: Truck,
    warehouse: Warehouse,
    wrench: Wrench,
    zap: Zap,
};

export const SITE_ICON_NAMES = Object.keys(SITE_ICONS);

export function DynamicIcon({
    name,
    className,
    fallback = Layers,
}: {
    name?: string | null;
    className?: string;
    fallback?: LucideIcon;
}) {
    const Icon = (name && SITE_ICONS[name]) || fallback;

    return <Icon aria-hidden="true" className={cn('size-5', className)} />;
}
