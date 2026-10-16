/**
 * Scroll-driven portal zoom, inspired by the React Bits Pro <ScrollPortal /> (no library code used):
 * a stack of full-bleed frames, each nested inside a window at the centre of the frame before it.
 * Scrolling dives through the windows, so every frame grows from a portal into the full stage.
 */

const DEFAULT_OPTIONS = {
    portalScale: 0.42,
    portalRadius: 20,
    segmentDistance: 1,
    dwell: 0.25,
    holdDistance: 0.4,
    depth: 3,
    mediaZoom: 1.2,
    smoothing: 0.1,
};

const clamp = (value, min, max) =>
    value < min ? min : value > max ? max : value;

const smoothstep = (edge0, edge1, x) => {
    const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);

    return t * t * (3 - 2 * t);
};

/**
 * Mount the portal zoom inside the given element.
 * Options are read as JSON from its `data-scroll-portal` attribute.
 *
 * @param {HTMLElement} root
 * @returns {() => void} cleanup callback
 */
export function mountScrollPortal(root) {
    const options = {
        ...DEFAULT_OPTIONS,
        ...JSON.parse(root.dataset.scrollPortal || '{}'),
    };
    const track = root.querySelector('[data-scroll-portal-track]');
    const stage = root.querySelector('[data-scroll-portal-stage]');
    const frames = [...root.querySelectorAll('[data-scroll-portal-frame]')];
    const dots = [...root.querySelectorAll('[data-scroll-portal-dot]')];

    if (!track || !stage || frames.length < 2) {
        return () => {};
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const transitions = frames.length - 1;
    const parts = frames.map((frame) => ({
        frame,
        media: frame.querySelector('[data-scroll-portal-media]'),
        content: frame.querySelector('[data-scroll-portal-content]'),
    }));

    let frameRequest = 0;
    let current = 0;
    let target = 0;
    let stageHeight = 0;
    let activeIndex = -1;
    let isRunning = false;

    /**
     * Rest on each frame for part of its scroll segment, then ease into the next one.
     */
    const settle = (position) => {
        const index = Math.min(Math.floor(position), transitions);
        const fraction = position - index;
        const rest = clamp(options.dwell, 0, 0.9) / 2;

        return index + smoothstep(rest, 1 - rest, fraction);
    };

    const applyPosition = (position) => {
        const depth = settle(position);

        parts.forEach(({ frame, media, content }, index) => {
            // 0 = filling the stage, 1 = sitting in the portal of the active frame, -1 = already dived through.
            const offset = index - depth;
            const isVisible = offset > -1 && offset <= options.depth;

            frame.style.visibility = isVisible ? '' : 'hidden';

            if (!isVisible) {
                return;
            }

            const scale = options.portalScale ** offset;
            const framing = clamp(
                (1 - scale) / (1 - options.portalScale),
                0,
                1,
            );

            frame.style.transform = `scale(${scale})`;
            frame.style.borderRadius = `${(options.portalRadius * framing) / scale}px`;
            frame.style.setProperty('--scroll-portal-scale', `${scale}`);
            frame.style.setProperty('--scroll-portal-framing', `${framing}`);

            if (media) {
                media.style.transform = `scale(${1 + (options.mediaZoom - 1) * clamp(offset, 0, 1)})`;
            }

            if (content) {
                const visible = 1 - smoothstep(0.12, 0.55, Math.abs(offset));
                content.style.opacity = `${visible}`;
                content.style.transform = `translate3d(0, ${16 * clamp(offset, 0, 1)}px, 0)`;
                content.inert = visible < 0.5;
            }
        });

        const nextActive = Math.round(depth);

        if (nextActive !== activeIndex) {
            activeIndex = nextActive;
            dots.forEach((dot, index) => {
                if (index === activeIndex) {
                    dot.setAttribute('aria-current', 'true');
                } else {
                    dot.removeAttribute('aria-current');
                }
            });
        }
    };

    const measure = () => {
        stageHeight = window.innerHeight;

        if (stageHeight <= 0) {
            return;
        }

        stage.style.height = `${stageHeight}px`;
        track.style.height = `${stageHeight * (1 + transitions * Math.max(0.1, options.segmentDistance) + Math.max(0, options.holdDistance))}px`;
    };

    const scrollSpan = () =>
        stageHeight * transitions * Math.max(0.1, options.segmentDistance);

    const readPosition = () =>
        clamp(-track.getBoundingClientRect().top / scrollSpan(), 0, 1) *
        transitions;

    const tick = () => {
        const follow =
            options.smoothing <= 0
                ? 1
                : 1 - Math.exp(-1 / (60 * options.smoothing));
        current += (target - current) * follow;

        if (Math.abs(target - current) < 0.0004) {
            current = target;
            isRunning = false;
        }

        applyPosition(current);
        frameRequest = isRunning ? requestAnimationFrame(tick) : 0;
    };

    const kick = () => {
        if (isRunning) {
            return;
        }

        isRunning = true;

        if (!frameRequest) {
            frameRequest = requestAnimationFrame(tick);
        }
    };

    const handleScroll = () => {
        target = readPosition();

        if (options.smoothing <= 0 || motionQuery.matches) {
            current = target;
            applyPosition(current);

            return;
        }

        kick();
    };

    const handleResize = () => {
        measure();
        target = readPosition();
        current = target;
        applyPosition(current);
    };

    /**
     * Jump to the resting point of a frame by scrolling the page to its segment.
     */
    const handleDotClick = (event) => {
        const index = dots.indexOf(event.currentTarget);
        const trackTop = track.getBoundingClientRect().top + window.scrollY;

        window.scrollTo({
            top: trackTop + (scrollSpan() * index) / transitions,
            behavior: motionQuery.matches ? 'auto' : 'smooth',
        });
    };

    handleResize();
    root.dataset.ready = '';

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    dots.forEach((dot) => dot.addEventListener('click', handleDotClick));
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(root);

    return () => {
        if (frameRequest) {
            cancelAnimationFrame(frameRequest);
        }

        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        dots.forEach((dot) => dot.removeEventListener('click', handleDotClick));
        resizeObserver.disconnect();
    };
}
