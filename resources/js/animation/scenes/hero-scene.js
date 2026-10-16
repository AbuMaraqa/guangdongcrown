import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import logoMarkup from './crown-mark.svg?raw';

gsap.registerPlugin(ScrollTrigger);

const CAMERA_FOV = 35;
const CAMERA_DISTANCE = 12;
const LOGO_WIDTH = 3;
const MAX_HEADS_PER_ORBIT = 4;

/**
 * Guang Dong Crown teal (#0AA6B8) and its counter-shape navy (#12303A).
 * Tuned for a light page: glows use normal blending, so accents must be darker than the background.
 */
const COLORS = {
    accent: new THREE.Color('#0aa6b8'),
    accentDeep: new THREE.Color('#077d8b'),
    accentLight: new THREE.Color('#9fe3ea'),
    steel: new THREE.Color('#dde7eb'),
    navy: new THREE.Color('#12303a'),
    accentCore: new THREE.Color('#0892a2'),
    dust: new THREE.Color('#5a8f98'),
    haloAccent: new THREE.Color('#bdeef2'),
    haloTeal: new THREE.Color('#d8eef0'),
};

/**
 * Orbits are expressed in logo units (the logo is normalised to LOGO_WIDTH wide).
 * `heads` are the starting phases (0–1) of particles travelling along the path,
 * `nodes` is the number of static glowing nodes evenly distributed on it.
 * The path itself also moves: `spin` turns the ellipse within its plane (rad/s), `wobble`
 * sways its tilt (rad, at `wobbleSpeed`), and `twist` is how far scrolling swings it around the logo.
 */
const ORBITS = [
    {
        radiusX: 3.0,
        radiusY: 2.05,
        rotation: [1.2, 0.16, 0.42],
        speed: 0.032,
        heads: [0.08, 0.58],
        nodes: 5,
        opacity: 0.6,
        spin: 0.05,
        wobble: 0.12,
        wobbleSpeed: 0.35,
        twist: 1,
        phase: 0,
    },
    {
        radiusX: 3.85,
        radiusY: 2.75,
        rotation: [1.36, -0.34, -0.5],
        speed: -0.022,
        heads: [0.32, 0.81],
        nodes: 4,
        opacity: 0.42,
        spin: -0.035,
        wobble: 0.1,
        wobbleSpeed: 0.27,
        twist: -1.2,
        phase: 1.7,
    },
    {
        radiusX: 2.45,
        radiusY: 1.75,
        rotation: [0.28, 1.08, 0.18],
        speed: 0.045,
        heads: [0.2],
        nodes: 3,
        opacity: 0.32,
        spin: 0.07,
        wobble: 0.16,
        wobbleSpeed: 0.42,
        twist: 0.8,
        phase: 3.1,
    },
    {
        radiusX: 4.9,
        radiusY: 3.25,
        rotation: [1.04, 0.12, 1.18],
        speed: 0.016,
        heads: [0.45],
        nodes: 6,
        opacity: 0.22,
        spin: -0.02,
        wobble: 0.08,
        wobbleSpeed: 0.2,
        twist: -0.6,
        phase: 4.6,
    },
];

const orbitLineVertexShader = /* glsl */ `
    attribute float aT;
    varying float vT;
    varying float vDepth;

    void main() {
        vT = aT;
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vDepth = worldPosition.z;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
`;

const orbitLineFragmentShader = /* glsl */ `
    uniform vec3 uColor;
    uniform vec3 uHighlight;
    uniform float uOpacity;
    uniform float uTime;
    uniform float uSpeed;
    uniform float uHeads[${MAX_HEADS_PER_ORBIT}];
    uniform int uHeadCount;
    uniform float uDepthCenter;
    uniform float uDepthRange;
    varying float vT;
    varying float vDepth;

    void main() {
        float depthFade = clamp(0.55 + (vDepth - uDepthCenter) / uDepthRange, 0.16, 1.0);
        float trail = 0.0;

        for (int i = 0; i < ${MAX_HEADS_PER_ORBIT}; i++) {
            if (i >= uHeadCount) {
                break;
            }

            float head = fract(uHeads[i] + uTime * uSpeed);
            float behind = uSpeed >= 0.0 ? fract(head - vT) : fract(vT - head);
            trail += exp(-behind * 24.0);
        }

        trail = clamp(trail, 0.0, 1.0);
        vec3 color = mix(uColor * 0.8, uHighlight, trail * 0.7);
        gl_FragColor = vec4(color, uOpacity * depthFade * (0.5 + trail * 2.4));
    }
`;

const particleVertexShader = /* glsl */ `
    attribute float aPhase;
    attribute float aSize;
    attribute float aMove;
    attribute float aAlpha;
    uniform float uTime;
    uniform float uSpeed;
    uniform float uRadiusX;
    uniform float uRadiusY;
    uniform float uSizeScale;
    uniform float uDepthCenter;
    uniform float uDepthRange;
    varying float vAlpha;

    void main() {
        float angle = (aPhase + uTime * uSpeed * aMove) * 6.28318530718;
        vec4 worldPosition = modelMatrix * vec4(cos(angle) * uRadiusX, sin(angle) * uRadiusY, 0.0, 1.0);
        vec4 viewPosition = viewMatrix * worldPosition;
        float pulse = 1.0 + (1.0 - aMove) * 0.25 * sin(uTime * 1.7 + aPhase * 37.0);
        float depthFade = clamp(0.6 + (worldPosition.z - uDepthCenter) / uDepthRange, 0.25, 1.0);

        vAlpha = aAlpha * depthFade;
        gl_PointSize = aSize * pulse * uSizeScale / -viewPosition.z;
        gl_Position = projectionMatrix * viewPosition;
    }
`;

const dustVertexShader = /* glsl */ `
    attribute float aSize;
    attribute float aAlpha;
    uniform float uTime;
    uniform float uSizeScale;
    varying float vAlpha;

    void main() {
        vec3 drifted = position + vec3(sin(uTime * 0.05 + position.y), sin(uTime * 0.03 + position.z) * 0.6, cos(uTime * 0.04 + position.x)) * 0.25;
        vec4 viewPosition = modelViewMatrix * vec4(drifted, 1.0);
        vAlpha = aAlpha;
        gl_PointSize = aSize * uSizeScale / -viewPosition.z;
        gl_Position = projectionMatrix * viewPosition;
    }
`;

const glowPointFragmentShader = /* glsl */ `
    uniform vec3 uColor;
    uniform vec3 uCoreColor;
    uniform float uOpacity;
    varying float vAlpha;

    void main() {
        float distanceFromCenter = length(gl_PointCoord - 0.5) * 2.0;

        if (distanceFromCenter > 1.0) {
            discard;
        }

        float core = smoothstep(0.32, 0.0, distanceFromCenter);
        float halo = exp(-distanceFromCenter * distanceFromCenter * 5.5);
        vec3 color = mix(uColor, uCoreColor, core);
        gl_FragColor = vec4(color, clamp(halo * 0.45 + core, 0.0, 1.0) * vAlpha * uOpacity);
    }
`;

const haloVertexShader = /* glsl */ `
    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const haloFragmentShader = /* glsl */ `
    uniform vec3 uColor;
    uniform float uOpacity;
    varying vec2 vUv;

    void main() {
        float falloff = 1.0 - smoothstep(0.0, 0.5, length(vUv - 0.5));
        gl_FragColor = vec4(uColor, pow(falloff, 2.4) * uOpacity);
    }
`;

/**
 * Mount the hero visual inside the given section element.
 *
 * @param {HTMLElement} root
 * @param {{ mirror?: boolean }} [options] mirror the layout for right-to-left pages (logo on the left)
 * @returns {() => void} cleanup callback
 */
export function mountHeroScene(root, { mirror = false } = {}) {
    const canvas = root.querySelector('[data-hero-canvas]');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointerQuery = window.matchMedia(
        '(hover: hover) and (pointer: fine)',
    );

    let renderer;

    try {
        renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
        });
    } catch {
        root.dataset.heroState = 'fallback';

        return () => {};
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 100);
    camera.position.set(0, 0, CAMERA_DISTANCE);

    const environment = createEnvironment(renderer);
    scene.environment = environment;
    scene.add(createLights());

    const stage = new THREE.Group();
    const logoPivot = new THREE.Group();
    const orbitsRoot = new THREE.Group();
    const logo = createLogo(logoMarkup);
    const halo = createHalo();
    const orbits = ORBITS.map((definition) => createOrbit(definition));
    const dust = createDust(finePointerQuery.matches ? 420 : 200);

    logoPivot.add(logo);
    orbits.forEach((orbit) => orbitsRoot.add(orbit.group));
    stage.add(halo, orbitsRoot, logoPivot);
    scene.add(stage, dust.points);

    const sharedUniforms = {
        uTime: { value: 0 },
        uSizeScale: { value: 1 },
        uDustSizeScale: { value: 1 },
    };

    orbits.forEach((orbit) => {
        orbit.lineMaterial.uniforms.uTime = sharedUniforms.uTime;
        orbit.pointMaterial.uniforms.uTime = sharedUniforms.uTime;
        orbit.pointMaterial.uniforms.uSizeScale = sharedUniforms.uSizeScale;
    });
    dust.material.uniforms.uTime = sharedUniforms.uTime;
    dust.material.uniforms.uSizeScale = sharedUniforms.uDustSizeScale;

    /** Values driven by GSAP (intro + ScrollTrigger) and read every frame. */
    const scrollState = {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        shiftX: 1,
        shiftY: 0,
        orbitTilt: 0,
    };
    const introState = { progress: 1 };
    const pointer = { targetX: 0, targetY: 0, x: 0, y: 0 };
    const layout = { x: 0, y: 0, scale: 1 };

    let pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        finePointerQuery.matches ? 2 : 1.5,
    );
    let elapsed = 4;
    let lastFrameTime = performance.now();
    let isVisible = true;
    let isRunning = false;
    let frameSamples = [];
    let pointSizeScale = 1;

    function resize() {
        const width = root.clientWidth;
        const height = root.clientHeight;

        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        const visibleHeight =
            2 *
            CAMERA_DISTANCE *
            Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV / 2));
        const visibleWidth = visibleHeight * camera.aspect;

        // Mirrors the CSS: copy sits beside the logo at md+ in landscape, below it otherwise.
        if (width >= 1024 && camera.aspect > 1.05) {
            layout.x = visibleWidth * 0.2;
            layout.y = 0;
            layout.scale =
                Math.min(visibleWidth * 0.3, visibleHeight * 0.52) / LOGO_WIDTH;
        } else if (width >= 768 && camera.aspect >= 1) {
            layout.x = visibleWidth * 0.2;
            layout.y = visibleHeight * 0.04;
            layout.scale =
                Math.min(visibleWidth * 0.32, visibleHeight * 0.42) /
                LOGO_WIDTH;
        } else {
            layout.x = 0;
            layout.y = visibleHeight * 0.2;
            layout.scale =
                Math.min(visibleWidth * 0.5, visibleHeight * 0.26) / LOGO_WIDTH;
        }

        if (mirror) {
            layout.x = -layout.x;
        }

        const pixelsPerUnitAtUnitDistance =
            height / (2 * Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV / 2)));
        pointSizeScale = pixelsPerUnitAtUnitDistance * pixelRatio;
        sharedUniforms.uDustSizeScale.value = pointSizeScale;

        if (!isRunning) {
            renderFrame(0);
        }
    }

    function renderFrame(delta) {
        const motionAllowed = !motionQuery.matches;
        const intro = introState.progress;

        if (motionAllowed) {
            elapsed += delta;
            const easing = 1 - Math.exp(-delta * 3.2);
            pointer.x += (pointer.targetX - pointer.x) * easing;
            pointer.y += (pointer.targetY - pointer.y) * easing;
        }

        sharedUniforms.uTime.value = elapsed;

        const scale = layout.scale * scrollState.scale * (0.82 + intro * 0.18);
        stage.position.set(
            layout.x * scrollState.shiftX,
            layout.y + scrollState.shiftY * layout.scale,
            0,
        );
        stage.scale.setScalar(scale);
        sharedUniforms.uSizeScale.value = pointSizeScale * scale;

        const idleSway = motionAllowed ? Math.sin(elapsed * 0.3) * 0.12 : 0;
        const idleFloat = motionAllowed ? Math.sin(elapsed * 0.6) * 0.05 : 0;
        logoPivot.rotation.set(
            -0.12 + scrollState.rotateX - pointer.y * 0.14,
            -0.32 +
                idleSway +
                scrollState.rotateY +
                pointer.x * 0.24 +
                (1 - intro) * 0.9,
            0,
        );
        logoPivot.position.y = idleFloat;
        orbitsRoot.rotation.set(
            scrollState.orbitTilt - pointer.y * 0.06,
            pointer.x * 0.08,
            scrollState.orbitTilt * 0.4,
        );

        const depthRange = LOGO_WIDTH * scale * 2.2;
        orbits.forEach((orbit) => {
            const { rotation, spin, wobble, wobbleSpeed, twist, phase } =
                orbit.definition;
            const wave = elapsed * wobbleSpeed + phase;
            const scrollTwist = scrollState.orbitTilt * twist;

            orbit.group.rotation.set(
                rotation[0] + Math.sin(wave) * wobble + scrollTwist * 0.5,
                rotation[1] + Math.cos(wave * 0.8) * wobble,
                rotation[2],
            );
            orbit.group.scale.setScalar(1 + Math.sin(wave * 1.3) * 0.035);
            orbit.spinner.rotation.z = elapsed * spin + scrollTwist * 2.4;

            orbit.lineMaterial.uniforms.uDepthRange.value = depthRange;
            orbit.pointMaterial.uniforms.uDepthRange.value = depthRange;
            orbit.lineMaterial.uniforms.uOpacity.value =
                orbit.definition.opacity * intro;
            orbit.pointMaterial.uniforms.uOpacity.value = intro;
        });

        dust.points.position.set(-pointer.x * 0.35, pointer.y * 0.2, 0);
        dust.material.uniforms.uOpacity.value = intro;

        renderer.render(scene, camera);

        if (root.dataset.heroState !== 'ready') {
            root.dataset.heroState = 'ready';
        }
    }

    function tick(now) {
        const delta = Math.min((now - lastFrameTime) / 1000, 0.1);
        lastFrameTime = now;
        renderFrame(delta);
        adaptQuality(delta);
    }

    /** Drop the pixel ratio once if the device can't sustain a smooth frame rate. */
    function adaptQuality(delta) {
        if (pixelRatio <= 1) {
            return;
        }

        frameSamples.push(delta);

        if (frameSamples.length < 90) {
            return;
        }

        const average =
            frameSamples.reduce((sum, sample) => sum + sample, 0) /
            frameSamples.length;
        frameSamples = [];

        if (average > 1 / 40) {
            pixelRatio = Math.max(1, pixelRatio - 0.5);
            resize();
        }
    }

    function updateLoop() {
        const shouldRun = isVisible && !document.hidden && !motionQuery.matches;

        if (shouldRun && !isRunning) {
            lastFrameTime = performance.now();
            renderer.setAnimationLoop(tick);
            isRunning = true;
        } else if (!shouldRun && isRunning) {
            renderer.setAnimationLoop(null);
            isRunning = false;
            renderFrame(0);
        }
    }

    function handlePointerMove(event) {
        pointer.targetX = (event.clientX / window.innerWidth - 0.5) * 2;
        pointer.targetY = (event.clientY / window.innerHeight - 0.5) * 2;
    }

    function handleContextLost(event) {
        event.preventDefault();
        renderer.setAnimationLoop(null);
        isRunning = false;
        root.dataset.heroState = 'fallback';
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        updateLoop();
    });
    intersectionObserver.observe(root);

    document.addEventListener('visibilitychange', updateLoop);
    motionQuery.addEventListener('change', updateLoop);
    canvas.addEventListener('webglcontextlost', handleContextLost);

    if (finePointerQuery.matches) {
        window.addEventListener('pointermove', handlePointerMove, {
            passive: true,
        });
    }

    const animations = setUpAnimations(root, {
        scrollState,
        introState,
        canvas,
    });

    resize();
    updateLoop();

    return () => {
        animations.revert();
        renderer.setAnimationLoop(null);
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        document.removeEventListener('visibilitychange', updateLoop);
        motionQuery.removeEventListener('change', updateLoop);
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        window.removeEventListener('pointermove', handlePointerMove);
        scene.traverse((object) => {
            object.geometry?.dispose();
            [object.material].flat().forEach((material) => material?.dispose());
        });
        environment.dispose();
        renderer.dispose();
    };
}

/**
 * Intro reveal and scroll-linked choreography. Everything lives inside a
 * gsap.matchMedia context so reduced-motion users get a static, unpinned hero.
 */
function setUpAnimations(root, { scrollState, introState, canvas }) {
    const copy = root.querySelectorAll('[data-hero-reveal]');
    const scrollCue = root.querySelector('[data-hero-scroll-cue]');
    const mm = gsap.matchMedia();

    ScrollTrigger.config({ ignoreMobileResize: true });

    mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
            introState,
            { progress: 0 },
            { progress: 1, duration: 2.6, ease: 'power3.out' },
        );
        gsap.from(copy, {
            autoAlpha: 0,
            y: 28,
            duration: 1.1,
            ease: 'power3.out',
            stagger: 0.09,
            delay: 0.25,
        });

        const timeline = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
                trigger: root,
                start: 'top top',
                end: () => `+=${Math.round(window.innerHeight * 1.1)}`,
                pin: true,
                scrub: 0.9,
                anticipatePin: 1,
                invalidateOnRefresh: true,
            },
        });

        timeline
            .to(
                scrollState,
                {
                    rotateY: -1.05,
                    rotateX: 0.32,
                    scale: 1.16,
                    shiftX: 0.45,
                    shiftY: 0.05,
                    orbitTilt: 0.55,
                    duration: 0.7,
                    ease: 'power1.inOut',
                },
                0,
            )
            .to(copy, { autoAlpha: 0, y: -48, stagger: 0.03, duration: 0.3 }, 0)
            .to(scrollCue, { autoAlpha: 0, duration: 0.12 }, 0)
            .to(
                scrollState,
                { rotateY: -1.45, scale: 1.3, orbitTilt: 0.8, duration: 0.3 },
                0.7,
            )
            .to(canvas, { opacity: 0.45, duration: 0.3 }, 0.7);

        return () => {
            Object.assign(scrollState, {
                rotateX: 0,
                rotateY: 0,
                scale: 1,
                shiftX: 1,
                shiftY: 0,
                orbitTilt: 0,
            });
        };
    });

    mm.add('(prefers-reduced-motion: reduce)', () => {
        introState.progress = 1;
    });

    return mm;
}

/**
 * A tiny studio scene baked into a PMREM environment map: pale walls, a white key panel,
 * teal light strips and a few dark bands for contrast, so metal reads as metal on a light page.
 */
function createEnvironment(renderer) {
    const environmentScene = new THREE.Scene();
    environmentScene.background = new THREE.Color('#dfe8ec');

    const panels = [
        {
            size: [8, 2.2],
            position: [0, 5, 1],
            rotation: [Math.PI / 2, 0, 0],
            color: [3, 3.1, 3.3],
        },
        {
            size: [0.7, 7],
            position: [-6, 0, 1],
            rotation: [0, Math.PI / 2, 0],
            color: [0.2, 1.7, 2],
        },
        {
            size: [0.5, 6],
            position: [5, 0.5, -4],
            rotation: [0, -Math.PI / 3, 0],
            color: [0.18, 1.5, 1.7],
        },
        {
            size: [12, 8],
            position: [0, 0, 7],
            rotation: [0, Math.PI, 0],
            color: [0.22, 0.27, 0.34],
        },
        {
            size: [9, 1.6],
            position: [-1.5, 2.2, 6.5],
            rotation: [0, Math.PI, -0.5],
            color: [1.6, 1.8, 2],
        },
        {
            size: [12, 1.4],
            position: [1.5, -1.6, 6.4],
            rotation: [0, Math.PI, -0.35],
            color: [0.05, 0.09, 0.2],
        },
        {
            size: [0.9, 8],
            position: [6, 0, 2],
            rotation: [0, -Math.PI / 2, 0],
            color: [0.06, 0.1, 0.22],
        },
        {
            size: [10, 10],
            position: [0, -5, 0],
            rotation: [-Math.PI / 2, 0, 0],
            color: [0.1, 0.15, 0.28],
        },
    ];

    panels.forEach(({ size, position, rotation, color }) => {
        const panel = new THREE.Mesh(
            new THREE.PlaneGeometry(...size),
            new THREE.MeshBasicMaterial({
                color: new THREE.Color(...color),
                side: THREE.DoubleSide,
            }),
        );
        panel.position.set(...position);
        panel.rotation.set(...rotation);
        environmentScene.add(panel);
    });

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const environment = pmremGenerator.fromScene(
        environmentScene,
        0.035,
    ).texture;

    environmentScene.traverse((object) => {
        object.geometry?.dispose();
        object.material?.dispose();
    });
    pmremGenerator.dispose();

    return environment;
}

function createLights() {
    const lights = new THREE.Group();
    const key = new THREE.DirectionalLight('#ffffff', 1.6);
    key.position.set(-4, 6, 8);
    const rim = new THREE.DirectionalLight(COLORS.accent, 2);
    rim.position.set(6, 2, -6);
    const fill = new THREE.HemisphereLight('#ffffff', '#8aa0c0', 0.8);
    lights.add(key, rim, fill);

    return lights;
}

/**
 * Extrude every filled shape of the SVG logo into a bevelled metal slab, stacking
 * shapes on depth layers, then add glowing edges and receding "ghost" outlines.
 */
function createLogo(markup) {
    const { paths } = new SVGLoader().parse(markup);
    const parts = paths
        .filter(
            (path) =>
                path.userData?.style?.fill &&
                path.userData.style.fill !== 'none',
        )
        .map((path, index) => {
            const layerAttribute =
                path.userData.node?.getAttribute?.('data-layer');

            return {
                shapes: path.toShapes(),
                color: path.color,
                layer:
                    layerAttribute !== null && layerAttribute !== undefined
                        ? Number(layerAttribute)
                        : index,
            };
        })
        .filter((part) => part.shapes.length > 0);

    const bounds = new THREE.Box2();
    parts.forEach((part) =>
        part.shapes.forEach((shape) =>
            shape.getPoints().forEach((point) => bounds.expandByPoint(point)),
        ),
    );

    const center = bounds.getCenter(new THREE.Vector2());
    const size = bounds.getSize(new THREE.Vector2());
    const svgUnits = Math.max(size.x, size.y);
    const unit = LOGO_WIDTH / svgUnits;
    const depth = svgUnits * 0.055;
    const layers = [...new Set(parts.map((part) => part.layer))].sort(
        (a, b) => a - b,
    );
    const layerGap = depth * unit * 1.35;

    // Each part keeps its own brand colour from the SVG fill (teal ribbon, navy counter-shape).
    const capMaterials = new Map();
    const capMaterialFor = (partColor) => {
        const key = partColor?.getHexString() ?? COLORS.navy.getHexString();

        if (!capMaterials.has(key)) {
            capMaterials.set(
                key,
                new THREE.MeshPhysicalMaterial({
                    color: partColor ?? COLORS.navy,
                    metalness: 0.55,
                    roughness: 0.32,
                    clearcoat: 0.35,
                    clearcoatRoughness: 0.18,
                    envMapIntensity: 0.75,
                }),
            );
        }

        return capMaterials.get(key);
    };
    const sideMaterial = new THREE.MeshStandardMaterial({
        color: COLORS.steel,
        metalness: 1,
        roughness: 0.2,
        envMapIntensity: 1.4,
    });
    const edgeMaterial = new THREE.LineBasicMaterial({
        color: COLORS.accentLight,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
    });

    const logo = new THREE.Group();

    /** Map an SVG-space geometry into centred, Y-up logo space (rotateX keeps face winding intact). */
    const toLogoSpace = (geometry) =>
        geometry
            .translate(-center.x, -center.y, 0)
            .rotateX(Math.PI)
            .scale(unit, unit, unit);

    parts.forEach((part) => {
        const geometry = toLogoSpace(
            new THREE.ExtrudeGeometry(part.shapes, {
                depth,
                bevelEnabled: true,
                bevelThickness: svgUnits * 0.012,
                bevelSize: svgUnits * 0.007,
                bevelSegments: 4,
                curveSegments: 32,
            }),
        );

        const z =
            (layers.indexOf(part.layer) - (layers.length - 1) / 2) * layerGap;
        const mesh = new THREE.Mesh(geometry, [
            capMaterialFor(part.color),
            sideMaterial,
        ]);
        const edges = new THREE.LineSegments(
            new THREE.EdgesGeometry(geometry, 28),
            edgeMaterial,
        );
        mesh.position.z = z;
        edges.position.z = z;
        logo.add(mesh, edges);
    });

    const outlinePoints = [];
    parts.forEach((part) =>
        part.shapes.forEach((shape) => {
            [shape, ...shape.holes].forEach((curve) => {
                const points = curve.getPoints(48);
                points.forEach((point, index) => {
                    const next = points[(index + 1) % points.length];
                    outlinePoints.push(point.x, point.y, 0, next.x, next.y, 0);
                });
            });
        }),
    );

    const outlineGeometry = toLogoSpace(
        new THREE.BufferGeometry().setAttribute(
            'position',
            new THREE.Float32BufferAttribute(outlinePoints, 3),
        ),
    );
    const backZ = -((layers.length - 1) / 2) * layerGap - depth * unit;

    [1, 2, 3].forEach((step) => {
        const ghost = new THREE.LineSegments(
            outlineGeometry,
            new THREE.LineBasicMaterial({
                color: COLORS.accentDeep,
                transparent: true,
                opacity: 0.4 / step,
                depthWrite: false,
            }),
        );
        ghost.position.z = backZ - step * 0.2;
        ghost.scale.setScalar(1 + step * 0.018);
        logo.add(ghost);
    });

    return logo;
}

function createHalo() {
    const halo = new THREE.Group();
    const layers = [
        { scale: 7.5, color: COLORS.haloAccent, opacity: 0.45, z: -2.2 },
        { scale: 13, color: COLORS.haloTeal, opacity: 0.5, z: -3.2 },
    ];

    layers.forEach(({ scale, color, opacity, z }) => {
        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 1),
            new THREE.ShaderMaterial({
                uniforms: {
                    uColor: { value: color },
                    uOpacity: { value: opacity },
                },
                vertexShader: haloVertexShader,
                fragmentShader: haloFragmentShader,
                transparent: true,
                depthWrite: false,
            }),
        );
        mesh.scale.setScalar(scale);
        mesh.position.z = z;
        halo.add(mesh);
    });

    return halo;
}

function createOrbit(definition) {
    const { radiusX, radiusY, rotation, speed, heads, nodes, opacity } =
        definition;
    const group = new THREE.Group();
    const spinner = new THREE.Group();
    group.rotation.set(...rotation);
    group.add(spinner);

    const segments = 256;
    const linePositions = [];
    const lineT = [];

    for (let index = 0; index <= segments; index++) {
        const t = index / segments;
        const angle = t * Math.PI * 2;
        linePositions.push(
            Math.cos(angle) * radiusX,
            Math.sin(angle) * radiusY,
            0,
        );
        lineT.push(t);
    }

    const lineGeometry = new THREE.BufferGeometry()
        .setAttribute(
            'position',
            new THREE.Float32BufferAttribute(linePositions, 3),
        )
        .setAttribute('aT', new THREE.Float32BufferAttribute(lineT, 1));

    const headUniform = new Array(MAX_HEADS_PER_ORBIT).fill(0);
    heads.slice(0, MAX_HEADS_PER_ORBIT).forEach((head, index) => {
        headUniform[index] = head;
    });

    const lineMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: COLORS.accentDeep },
            uHighlight: { value: COLORS.accent },
            uOpacity: { value: opacity },
            uTime: { value: 0 },
            uSpeed: { value: speed },
            uHeads: { value: headUniform },
            uHeadCount: { value: Math.min(heads.length, MAX_HEADS_PER_ORBIT) },
            uDepthCenter: { value: 0 },
            uDepthRange: { value: 10 },
        },
        vertexShader: orbitLineVertexShader,
        fragmentShader: orbitLineFragmentShader,
        transparent: true,
        depthWrite: false,
    });

    const particles = [];
    heads.forEach((head) => {
        particles.push({ phase: head, size: 0.26, move: 1, alpha: 1 });

        for (let step = 1; step <= 3; step++) {
            const offset = (speed >= 0 ? -1 : 1) * step * 0.006;
            particles.push({
                phase: head + offset,
                size: 0.17 - step * 0.03,
                move: 1,
                alpha: 0.55 - step * 0.13,
            });
        }
    });

    for (let index = 0; index < nodes; index++) {
        particles.push({
            phase: (index + 0.5) / nodes + radiusX * 0.07,
            size: 0.16,
            move: 0,
            alpha: 0.9,
        });
    }

    const pointGeometry = new THREE.BufferGeometry()
        .setAttribute(
            'position',
            new THREE.Float32BufferAttribute(
                new Float32Array(particles.length * 3),
                3,
            ),
        )
        .setAttribute(
            'aPhase',
            new THREE.Float32BufferAttribute(
                particles.map((particle) => particle.phase),
                1,
            ),
        )
        .setAttribute(
            'aSize',
            new THREE.Float32BufferAttribute(
                particles.map((particle) => particle.size),
                1,
            ),
        )
        .setAttribute(
            'aMove',
            new THREE.Float32BufferAttribute(
                particles.map((particle) => particle.move),
                1,
            ),
        )
        .setAttribute(
            'aAlpha',
            new THREE.Float32BufferAttribute(
                particles.map((particle) => particle.alpha),
                1,
            ),
        );

    const pointMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: COLORS.accent },
            uCoreColor: { value: COLORS.accentCore },
            uOpacity: { value: 1 },
            uTime: { value: 0 },
            uSpeed: { value: speed },
            uRadiusX: { value: radiusX },
            uRadiusY: { value: radiusY },
            uSizeScale: { value: 1 },
            uDepthCenter: { value: 0 },
            uDepthRange: { value: 10 },
        },
        vertexShader: particleVertexShader,
        fragmentShader: glowPointFragmentShader,
        transparent: true,
        depthWrite: false,
    });

    const line = new THREE.Line(lineGeometry, lineMaterial);
    const points = new THREE.Points(pointGeometry, pointMaterial);
    points.frustumCulled = false;
    spinner.add(line, points);

    return { definition, group, spinner, lineMaterial, pointMaterial };
}

function createDust(count) {
    const positions = [];
    const sizes = [];
    const alphas = [];

    for (let index = 0; index < count; index++) {
        positions.push(
            THREE.MathUtils.randFloatSpread(26),
            THREE.MathUtils.randFloatSpread(15),
            THREE.MathUtils.randFloat(-12, 3),
        );
        sizes.push(THREE.MathUtils.randFloat(0.02, 0.06));
        alphas.push(THREE.MathUtils.randFloat(0.15, 0.5));
    }

    const geometry = new THREE.BufferGeometry()
        .setAttribute(
            'position',
            new THREE.Float32BufferAttribute(positions, 3),
        )
        .setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1))
        .setAttribute('aAlpha', new THREE.Float32BufferAttribute(alphas, 1));

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: COLORS.dust },
            uCoreColor: { value: COLORS.dust },
            uOpacity: { value: 1 },
            uTime: { value: 0 },
            uSizeScale: { value: 1 },
        },
        vertexShader: dustVertexShader,
        fragmentShader: glowPointFragmentShader,
        transparent: true,
        depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;

    return { points, material };
}
