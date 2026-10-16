/**
 * Vanilla port of the React Bits <ScrollExpand /> component: a framed piece of media that
 * opens up to full bleed as the user scrolls, while a title lifts away and overlay content fades in.
 */

const DEFAULT_OPTIONS = {
    startWidth: 42,
    startHeight: 58,
    startRadius: 24,
    endRadius: 0,
    mediaZoom: 1.35,
    scrollDistance: 1.2,
    holdDistance: 0.35,
    smoothing: 0.1,
    overlayScrim: 0.45,
    useWindowScroll: true,
    enabled: true,
};

const clamp = (value, min, max) =>
    value < min ? min : value > max ? max : value;

const smoothstep = (edge0, edge1, x) => {
    const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);

    return t * t * (3 - 2 * t);
};

/**
 * Mount the scroll expansion inside the given element.
 * Options are read as JSON from its `data-scroll-expand` attribute.
 *
 * @param {HTMLElement} root
 * @returns {() => void} cleanup callback
 */
export function mountScrollExpand(root) {
    const options = {
        ...DEFAULT_OPTIONS,
        ...JSON.parse(root.dataset.scrollExpand || '{}'),
    };
    const track = root.querySelector('[data-scroll-expand-track]');
    const stage = root.querySelector('[data-scroll-expand-stage]');
    const frame = root.querySelector('[data-scroll-expand-frame]');
    const media = root.querySelector('[data-scroll-expand-media]');
    const title = root.querySelector('[data-scroll-expand-title]');
    const overlay = root.querySelector('[data-scroll-expand-overlay]');
    const scrim = root.querySelector('[data-scroll-expand-scrim]');
    const hint = root.querySelector('[data-scroll-expand-hint]');

    if (!track || !stage || !frame || !media) {
        return () => {};
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    let frameRequest = 0;
    let current = 0;
    let target = 0;
    let stageHeight = 0;
    let isRunning = false;

    const applyProgress = (progress) => {
        const eased = smoothstep(0, 1, progress);

        const width = options.startWidth + (100 - options.startWidth) * eased;
        const height =
            options.startHeight + (100 - options.startHeight) * eased;
        const insetX = Math.max(0, (100 - width) / 2);
        const insetY = Math.max(0, (100 - height) / 2);
        const radius =
            options.startRadius +
            (options.endRadius - options.startRadius) * eased;
        frame.style.clipPath = `inset(${insetY}% ${insetX}% ${insetY}% ${insetX}% round ${radius}px)`;

        media.style.transform = `scale(${options.mediaZoom + (1 - options.mediaZoom) * eased})`;

        if (scrim) {
            scrim.style.opacity = `${options.overlayScrim * eased}`;
        }

        if (title) {
            const out = smoothstep(0.4, 0.88, progress);
            title.style.opacity = `${1 - out}`;
            title.style.transform = `translate3d(0, ${-28 * out}px, 0) scale(${1 + 0.06 * out})`;
        }

        if (hint) {
            const gone = smoothstep(0, 0.12, progress);
            hint.style.opacity = `${1 - gone}`;
            hint.style.transform = `translate3d(0, ${8 * gone}px, 0)`;
        }

        if (overlay) {
            const visible = smoothstep(0.68, 1, progress);
            overlay.style.opacity = `${visible}`;
            overlay.style.transform = `translate3d(0, ${18 * (1 - visible)}px, 0)`;
        }
    };

    const measure = () => {
        stageHeight = options.useWindowScroll
            ? window.innerHeight
            : root.clientHeight;

        if (stageHeight <= 0) {
            return;
        }

        stage.style.height = `${stageHeight}px`;
        track.style.height = `${stageHeight * (1 + Math.max(0, options.scrollDistance) + Math.max(0, options.holdDistance))}px`;

        const width = root.clientWidth || stageHeight;
        stage.style.setProperty(
            '--se-title-size',
            `${clamp(width * 0.075, 20, 84)}px`,
        );
    };

    const readProgress = () => {
        if (!options.enabled) {
            return 1;
        }

        const span = stageHeight * Math.max(0.01, options.scrollDistance);

        if (options.useWindowScroll) {
            return clamp(-track.getBoundingClientRect().top / span, 0, 1);
        }

        return clamp(root.scrollTop / span, 0, 1);
    };

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

        applyProgress(current);
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
        target = readProgress();

        if (options.smoothing <= 0 || motionQuery.matches) {
            current = target;
            applyProgress(current);

            return;
        }

        kick();
    };

    const handleResize = () => {
        measure();
        target = readProgress();
        current = target;
        applyProgress(current);
    };

    handleResize();

    const scroller = options.useWindowScroll ? window : root;
    scroller.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(root);

    return () => {
        if (frameRequest) {
            cancelAnimationFrame(frameRequest);
        }

        scroller.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        resizeObserver.disconnect();
    };
}
