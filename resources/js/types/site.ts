export type MediaImage = {
    id: number;
    url: string;
    thumb: string;
    medium: string;
    alt: string;
    width: number | null;
    height: number | null;
};

export type Crumb = {
    name: string;
    url: string;
};

export type LinkedLabel = {
    label: string;
    url: string;
};

export type NavEntry = {
    name: string;
    slug: string;
    icon?: string | null;
    excerpt?: string | null;
};

export type SiteChrome = {
    company: {
        name: string;
        legalName: string | null;
        tagline: string | null;
        description: string | null;
        email: string | null;
        phone: string | null;
        whatsapp: string | null;
        address: string | null;
        logo: string | null;
        logoInverse: string | null;
        founded: string | number | null;
    };
    social: Record<string, string>;
    footer: {
        cta_heading?: string;
        cta_body?: string;
        copyright?: string;
        accent?: string;
    };
    navigation: {
        productCategories: NavEntry[];
        services: NavEntry[];
        solutions: NavEntry[];
    };
    legalPages: { title: string; slug: string }[];
    headquarters: {
        name: string;
        city: string | null;
        country: string;
        address: string | null;
        phone: string | null;
        email: string | null;
    } | null;
};

export type SeoPayload = {
    title: string;
    rawTitle: string;
    description: string | null;
    canonical: string;
    robots: string;
    ogTitle: string;
    ogDescription: string | null;
    ogImage: string | null;
    ogType: string;
    siteName: string;
    locale: string;
    schema: Record<string, unknown>[] | null;
};

export type ProductCard = {
    id: number;
    name: string;
    slug: string;
    sku: string | null;
    excerpt: string | null;
    image: MediaImage | null;
    category: { name: string; slug: string } | null;
    isFeatured: boolean;
};

export type ProductDetail = ProductCard & {
    description: string | null;
    specifications: { label: string; value: string }[];
    applications: string[];
    downloads: { label: string; url: string }[];
    gallery: MediaImage[];
};

export type ServiceCard = {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
    excerpt: string | null;
    image: MediaImage | null;
};

export type ServiceDetail = ServiceCard & {
    description: string | null;
    features: { title: string; description: string | null }[];
    gallery: MediaImage[];
};

export type SolutionCard = {
    id: number;
    title: string;
    slug: string;
    icon: string | null;
    excerpt: string | null;
    image: MediaImage | null;
};

export type SolutionDetail = SolutionCard & {
    content: string | null;
    features: { title: string; description: string | null }[];
    benefits: { title: string; description: string | null }[];
    process: { title: string; description: string | null }[];
    gallery: MediaImage[];
    industries?: { name: string; slug: string }[];
};

export type IndustryCard = {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
    excerpt: string | null;
    image: MediaImage | null;
};

export type IndustryDetail = IndustryCard & {
    description: string | null;
};

export type ProjectCard = {
    id: number;
    title: string;
    slug: string;
    client: string | null;
    location: string | null;
    country: string | null;
    excerpt: string | null;
    completedAt: string | null;
    image: MediaImage | null;
    category: { name: string; slug: string } | null;
};

export type ProjectDetail = ProjectCard & {
    description: string | null;
    results: { label: string; value: string }[];
    gallery: MediaImage[];
    services?: { name: string; slug: string }[];
    industries?: { name: string; slug: string }[];
};

export type PostCard = {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    image: MediaImage | null;
    publishedAt: string | null;
    publishedLabel: string | null;
    readingMinutes: number;
    isFeatured: boolean;
    category: { name: string; slug: string } | null;
    author?: { name: string; jobTitle: string | null } | null;
};

export type PostDetail = PostCard & {
    content: string | null;
    tags?: { name: string; slug: string }[];
};

export type TeamMember = {
    id: number;
    name: string;
    slug: string;
    position: string | null;
    department: string | null;
    bio: string | null;
    email: string | null;
    socials: { platform: string; url: string }[];
    photo: MediaImage | null;
    isLeadership: boolean;
};

export type Testimonial = {
    id: number;
    name: string;
    role: string | null;
    company: string | null;
    country: string | null;
    content: string;
    rating: number | null;
    avatar: MediaImage | null;
};

export type Credential = {
    id: number;
    type: string;
    name: string;
    issuer: string | null;
    description?: string | null;
    reference?: string | null;
    year: number | null;
    image: MediaImage | null;
};

export type Milestone = {
    id: number;
    year: string;
    title: string;
    description: string | null;
    image: MediaImage | null;
};

export type SiteLocation = {
    id?: number;
    name: string;
    type: string;
    city: string | null;
    country: string;
    countryCode?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    latitude: number | null;
    longitude: number | null;
    isHeadquarters: boolean;
};

export type FaqItem = {
    id: number;
    question: string;
    answer: string;
};

export type Stat = {
    value: string;
    label: string;
    caption?: string | null;
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
};

export type SelectOption = {
    value: number | string;
    label: string;
};
