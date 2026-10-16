import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import logoMarkup from './crown-mark.svg?raw';

gsap.registerPlugin(ScrollTrigger);

/**
 * "From material to network": the Guang Dong Crown mark is the protagonist. It is drawn, lands as the sign
 * on a first structure, rides the roof as that structure becomes a tower, while a city grows along the
 * mark's own stroke. At the end the camera rises overhead and the mark dissolves into the city it became.
 */

const CAMERA_FOV = 32;
const CITY_WIDTH = 12;
const GRID_COLUMNS = 38;
const CELL = CITY_WIDTH / GRID_COLUMNS;
const CONTEXT_RADIUS = CITY_WIDTH * 0.92;
const FLOOR_HEIGHT = 0.1;
const HQ_FOOTPRINT = 0.62;
const LOGO_DEPTH = 0.07;
const BUILD_SPREAD = 0.1;
const FINAL_LOGO_HEIGHT = 5;

/** Where each chapter starts on the 0–1 story timeline (matches the chapter order in logo-story.tsx). */
const CHAPTER_STARTS = [0, 0.12, 0.3, 0.5, 0.74];

/** Graphite and teal from the brand palette in app.css; `day` matches the page, `night` the inverted bands. */
const PALETTE = {
    day: {
        background: '#f6f8f9',
        ground: '#edf2f3',
        grid: '#12303a',
        facade: '#1f4652',
        roof: '#3a6b78',
        hq: '#12303a',
        context: '#dce5e8',
        contextRoof: '#f0f4f5',
        window: '#a9c9d2',
        ink: '#1a2b31',
        muted: '#55656b',
        accent: '#077d8b',
        line: 'rgba(18, 48, 58, 0.14)',
    },
    night: {
        background: '#0b1a1f',
        ground: '#0d2229',
        grid: '#0aa6b8',
        facade: '#163842',
        roof: '#2a5a66',
        hq: '#0d3640',
        context: '#0e2128',
        contextRoof: '#11272e',
        window: '#173843',
        ink: '#ffffff',
        muted: '#a3b6bc',
        accent: '#3cc4d3',
        line: 'rgba(255, 255, 255, 0.16)',
    },
    lit: '#d2f6fa',
    accent: '#0aa6b8',
    accentDeep: '#077d8b',
    accentLight: '#9fe3ea',
    navy: '#12303a',
};

const color = (hex) => new THREE.Color(hex);
const lerp = (from, to, amount) => from + (to - from) * amount;
const clamp01 = (value) => Math.min(1, Math.max(0, value));
const smooth = (value) => value * value * (3 - 2 * value);

const colorspaceChunk = /* glsl */ `
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
`;

const buildingVertexShader = /* glsl */ `
    attribute vec3 aCenter;
    attribute vec2 aFoot;
    attribute float aHeight;
    attribute float aOrder;
    attribute float aKind;
    attribute float aSeed;
    uniform float uGrowth;
    uniform float uContext;
    uniform float uSpread;
    uniform float uHqHeight;
    varying vec3 vNormal;
    varying vec3 vLocal;
    varying vec2 vFoot;
    varying float vHeight;
    varying float vKind;
    varying float vSeed;
    varying float vBuild;
    varying float vFogDepth;

    void main() {
        bool isHq = aKind > 1.5;
        float progress = aKind < 0.5 ? uContext : uGrowth;
        float build = isHq ? 1.0 : clamp((progress - aOrder) / uSpread, 0.0, 1.0);
        float eased = 1.0 - pow(1.0 - build, 3.0);
        float height = isHq ? uHqHeight : aHeight * eased;
        vec2 foot = aFoot * (isHq ? smoothstep(0.0, 0.04, uHqHeight) : smoothstep(0.0, 0.2, build));

        vec3 local = vec3(position.x * foot.x, (position.y + 0.5) * max(height, 0.0001), position.z * foot.y);
        vec4 viewPosition = viewMatrix * vec4(aCenter + local, 1.0);

        vNormal = normal;
        vLocal = local;
        vFoot = foot;
        vHeight = height;
        vKind = aKind;
        vSeed = aSeed;
        vBuild = build;
        vFogDepth = -viewPosition.z;
        gl_Position = projectionMatrix * viewPosition;
    }
`;

const buildingFragmentShader = /* glsl */ `
    uniform vec3 uFacade;
    uniform vec3 uRoof;
    uniform vec3 uHq;
    uniform vec3 uContextFacade;
    uniform vec3 uContextRoof;
    uniform vec3 uWindow;
    uniform vec3 uLit;
    uniform vec3 uGreen;
    uniform vec3 uFogColor;
    uniform vec3 uLightDirection;
    uniform float uNight;
    uniform float uLights;
    uniform float uFloor;
    uniform float uFogNear;
    uniform float uFogFar;
    varying vec3 vNormal;
    varying vec3 vLocal;
    varying vec2 vFoot;
    varying float vHeight;
    varying float vKind;
    varying float vSeed;
    varying float vBuild;
    varying float vFogDepth;

    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    void main() {
        vec3 n = normalize(vNormal);
        bool isHq = vKind > 1.5;
        bool isContext = vKind < 0.5;
        float diffuse = 0.62 + 0.38 * max(dot(n, uLightDirection), 0.0);
        vec3 facade = isContext ? uContextFacade : (isHq ? uHq : uFacade);
        vec3 outColor;

        if (n.y > 0.5) {
            outColor = isContext ? uContextRoof : uRoof;
            float construction = vBuild * (1.0 - vBuild) * 4.0;
            outColor = mix(outColor, uGreen, isContext ? 0.0 : construction * 0.9);
            outColor = mix(outColor, uGreen, isHq ? 0.75 : 0.0);
        } else {
            outColor = facade * diffuse;

            float along = abs(n.x) > 0.5 ? vLocal.z : vLocal.x;
            float width = abs(n.x) > 0.5 ? vFoot.y : vFoot.x;
            float columns = max(1.0, floor(width / 0.075));
            vec2 cell = vec2((along / max(width, 0.0001) + 0.5) * columns, vLocal.y / uFloor);
            vec2 f = fract(cell);
            vec2 aa = fwidth(cell);

            float windowX = smoothstep(0.18 - aa.x, 0.18 + aa.x, f.x) * (1.0 - smoothstep(0.82 - aa.x, 0.82 + aa.x, f.x));
            float windowY = smoothstep(0.28 - aa.y, 0.28 + aa.y, f.y) * (1.0 - smoothstep(0.84 - aa.y, 0.84 + aa.y, f.y));
            float pane = windowX * windowY * step(1.0, cell.y) * step(cell.y, vHeight / uFloor - 0.4);
            float detail = 1.0 - smoothstep(0.3, 0.65, max(aa.x, aa.y));

            float litChance = isContext ? 0.12 : (isHq ? 0.92 : 0.72);
            float roll = hash(floor(cell) + vec2(vSeed * 31.7, n.x * 3.0 + n.z * 7.0));
            float lit = step(roll, uLights * litChance) * uNight;
            vec3 paneColor = mix(uWindow, uLit * (0.8 + 0.4 * hash(floor(cell) + 3.1)), lit);

            outColor = mix(outColor, paneColor, pane * detail * mix(0.6, 1.0, uNight));
            outColor += uLit * (1.0 - detail) * uLights * litChance * uNight * 0.28;
            outColor *= mix(0.7, 1.0, smoothstep(0.0, 0.3, vLocal.y));

            if (isHq) {
                float crown = smoothstep(vHeight - uFloor * 0.6, vHeight - uFloor * 0.2, vLocal.y);
                outColor = mix(outColor, uGreen, crown * 0.85);
            }
        }

        float fog = smoothstep(uFogNear, uFogFar, vFogDepth);
        gl_FragColor = vec4(mix(outColor, uFogColor, fog), 1.0);
        ${colorspaceChunk}
    }
`;

const groundVertexShader = /* glsl */ `
    varying vec3 vWorld;
    varying float vFogDepth;

    void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vec4 viewPosition = viewMatrix * worldPosition;
        vWorld = worldPosition.xyz;
        vFogDepth = -viewPosition.z;
        gl_Position = projectionMatrix * viewPosition;
    }
`;

const groundFragmentShader = /* glsl */ `
    uniform vec3 uGround;
    uniform vec3 uGrid;
    uniform vec3 uFogColor;
    uniform float uCell;
    uniform float uRadius;
    uniform float uOpacity;
    uniform float uNight;
    uniform float uFogNear;
    uniform float uFogFar;
    varying vec3 vWorld;
    varying float vFogDepth;

    void main() {
        vec2 grid = vWorld.xz / uCell;
        vec2 distanceToLine = abs(fract(grid) - 0.5) / max(fwidth(grid), vec2(0.0001));
        float line = 1.0 - min(min(distanceToLine.x, distanceToLine.y), 1.0);
        float radial = 1.0 - smoothstep(uRadius * 0.55, uRadius * 1.3, length(vWorld.xz));
        vec3 outColor = mix(uGround, uGrid, line * mix(0.07, 0.09, uNight));
        float fog = smoothstep(uFogNear, uFogFar, vFogDepth);

        gl_FragColor = vec4(mix(outColor, uFogColor, fog), uOpacity * radial);
        ${colorspaceChunk}
    }
`;

const arcVertexShader = /* glsl */ `
    attribute float aT;
    attribute float aArc;
    varying float vT;
    varying float vArc;

    void main() {
        vT = aT;
        vArc = aArc;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const arcFragmentShader = /* glsl */ `
    uniform vec3 uColor;
    uniform vec3 uHighlight;
    uniform float uTime;
    uniform float uDraw;
    uniform float uOpacity;
    varying float vT;
    varying float vArc;

    void main() {
        if (vT > uDraw) {
            discard;
        }

        float head = fract(uTime * 0.22 + vArc * 0.37);
        float trail = exp(-fract(head - vT) * 9.0);
        vec3 outColor = mix(uColor, uHighlight, trail);
        gl_FragColor = vec4(outColor, uOpacity * (0.25 + trail * 0.9));
        ${colorspaceChunk}
    }
`;

const glowVertexShader = /* glsl */ `
    attribute float aSize;
    uniform float uSizeScale;

    void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * uSizeScale / -viewPosition.z;
        gl_Position = projectionMatrix * viewPosition;
    }
`;

const glowFragmentShader = /* glsl */ `
    uniform vec3 uColor;
    uniform float uOpacity;

    void main() {
        float distanceFromCenter = length(gl_PointCoord - 0.5) * 2.0;
        float core = smoothstep(0.35, 0.0, distanceFromCenter);
        float halo = exp(-distanceFromCenter * distanceFromCenter * 5.0);
        gl_FragColor = vec4(uColor, clamp(halo * 0.5 + core, 0.0, 1.0) * uOpacity);
        ${colorspaceChunk}
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
        gl_FragColor = vec4(uColor, pow(falloff, 2.2) * uOpacity);
        ${colorspaceChunk}
    }
`;

/**
 * Mount the scroll-driven logo story inside the given section element.
 *
 * @param {HTMLElement} root
 * @param {{ mirror?: boolean }} [options] mirror the framing for right-to-left pages (copy on the right)
 * @returns {() => void} cleanup callback
 */
export function mountLogoStory(root, { mirror = false } = {}) {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (motionQuery.matches) {
        return () => {};
    }

    const track = root.querySelector('[data-logo-story-track]');
    const stage = root.querySelector('[data-logo-story-stage]');
    const canvas = root.querySelector('[data-logo-story-canvas]');
    const chapterElements = [
        ...root.querySelectorAll('[data-logo-story-chapter]'),
    ];
    const tickElements = [...root.querySelectorAll('[data-logo-story-tick]')];
    const progressBar = root.querySelector('[data-logo-story-progress]');
    const stats = {
        stage: root.querySelector('[data-logo-story-stat="stage"]'),
        buildings: root.querySelector('[data-logo-story-stat="buildings"]'),
        floors: root.querySelector('[data-logo-story-stat="floors"]'),
    };
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
        return () => {};
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 200);
    const regions = parseLogoRegions(logoMarkup);
    const city = createCity(regions);
    const ground = createGround();
    const logo = createLogo(logoMarkup, regions);
    const footprintOutline = createOutline(
        regions,
        (point) => [point.x * CITY_WIDTH, 0.03, -point.y * CITY_WIDTH],
        2.5,
        PALETTE.accent,
        false,
    );
    const arcs = createArcs(city);
    const lights = createLights();

    scene.add(
        lights.group,
        ground.mesh,
        city.mesh,
        arcs.group,
        footprintOutline.group,
        logo.group,
    );

    /** Every animated value in the story, scrubbed by GSAP and read once per frame. */
    const story = {
        draw: 0,
        fill: 0,
        landing: 0,
        lift: 0,
        logoOpacity: 1,
        groundOpacity: 0,
        hqHeight: 0,
        growth: 0,
        context: 0,
        night: 0,
        lights: 0,
        arcs: 0,
        outline: 0,
        cameraX: city.hq.x,
        cameraY: 1.25,
        cameraZ: city.hq.z,
        azimuth: -0.35,
        polar: 1.42,
        distance: 6.4,
    };

    const day = mapColors(PALETTE.day);
    const night = mapColors(PALETTE.night);
    const mixed = mapColors(PALETTE.day);
    const copyKeys = ['ink', 'muted', 'accent'];
    const pointer = { targetX: 0, targetY: 0, x: 0, y: 0 };
    const viewport = {
        width: 1,
        height: 1,
        offsetX: 0,
        offsetY: 0,
        portraitFit: 1,
    };

    let pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        finePointerQuery.matches ? 1.75 : 1.5,
    );
    let elapsed = 0;
    let lastFrameTime = performance.now();
    let isVisible = false;
    let isRunning = false;
    let frameSamples = [];
    let activeChapter = -1;
    let renderedStats = {};
    let renderedNight = -1;
    let timeline;

    function resize() {
        const width = stage.clientWidth;
        const height = stage.clientHeight;

        if (!width || !height) {
            return;
        }

        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;

        // Copy sits on the left on wide screens and at the bottom elsewhere: shift the scene away from it.
        const isWide = width >= 1024 && camera.aspect > 1.1;
        viewport.width = width;
        viewport.height = height;
        viewport.offsetX = isWide ? width * 0.17 * (mirror ? 1 : -1) : 0;
        viewport.offsetY = isWide ? 0 : height * 0.15;
        viewport.portraitFit = Math.max(1, 1.05 / camera.aspect);
        camera.setViewOffset(
            width,
            height,
            viewport.offsetX,
            viewport.offsetY,
            width,
            height,
        );
        camera.updateProjectionMatrix();

        const resolution = new THREE.Vector2(width, height);
        [logo.outline, footprintOutline].forEach((outline) =>
            outline.materials.forEach((material) =>
                material.resolution.copy(resolution),
            ),
        );
        arcs.pulseMaterial.uniforms.uSizeScale.value =
            (height /
                (2 * Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV / 2)))) *
            pixelRatio;

        renderFrame(0);
    }

    function updateCamera() {
        const wideness = smooth(clamp01((story.distance - 6) / 14));
        const distance =
            story.distance *
            lerp(
                Math.sqrt(viewport.portraitFit),
                viewport.portraitFit,
                wideness,
            );
        const polar = Math.max(
            0.0015,
            story.polar - pointer.y * 0.04 * (1 - story.lift),
        );
        const azimuth = story.azimuth + pointer.x * 0.08 * (1 - story.lift);

        camera.position.set(
            story.cameraX + distance * Math.sin(polar) * Math.sin(azimuth),
            story.cameraY + distance * Math.cos(polar),
            story.cameraZ + distance * Math.sin(polar) * Math.cos(azimuth),
        );
        camera.lookAt(story.cameraX, story.cameraY, story.cameraZ);

        return distance;
    }

    function updateLogo() {
        const sway = Math.sin(elapsed * 0.6) * 0.14 * (1 - story.landing);
        const bob = Math.sin(elapsed * 1.1) * 0.05 * (1 - story.lift);
        const roofScale = 0.42;
        const floating = { y: 1.25, scale: 1.45 };
        const roofY = story.hqHeight + roofScale * logo.aspect * 0.5 + 0.08;

        // Overhead, a flat logo at height h must shrink by (camera - h) / camera to match the city footprint.
        const cameraHeight = Math.max(camera.position.y, FINAL_LOGO_HEIGHT + 1);
        const finalY = lerp(
            FINAL_LOGO_HEIGHT,
            1.2,
            clamp01((1 - story.logoOpacity) * 1.2),
        );
        const finalScale =
            CITY_WIDTH * ((cameraHeight - finalY) / cameraHeight);

        const landed = smooth(story.landing);
        const lifted = story.lift;
        const x = lerp(city.hq.x, 0, lifted);
        const z = lerp(city.hq.z, 0, lifted);
        const y = lerp(lerp(floating.y, roofY, landed), finalY, lifted);
        const scale = lerp(
            lerp(floating.scale, roofScale, landed),
            finalScale,
            lifted * lifted,
        );

        logo.group.position.set(x, y + bob, z);
        logo.group.scale.setScalar(scale);
        logo.group.rotation.set(
            (-Math.PI / 2) * smooth(lifted),
            lerp(story.azimuth + sway, 0, smooth(lifted)),
            0,
        );

        const opacity = story.fill * story.logoOpacity;
        logo.materials.forEach((material) => {
            material.opacity = opacity;
            material.visible = opacity > 0.002;
        });
        logo.caps.forEach((cap) => {
            cap.emissiveIntensity = story.night * 0.25;
        });
        logo.halo.material.uniforms.uOpacity.value =
            (0.15 + story.night * 0.55) * story.fill * story.logoOpacity;
        logo.outline.setProgress(story.draw);
        logo.outline.materials.forEach((material) => {
            material.opacity = story.logoOpacity;
        });
    }

    function updateColors() {
        const copyNight = smooth(clamp01((story.night - 0.4) / 0.2));
        Object.keys(day).forEach((key) =>
            mixSrgb(
                mixed[key],
                day[key],
                night[key],
                copyKeys.includes(key) ? copyNight : story.night,
            ),
        );

        const uniforms = city.material.uniforms;
        uniforms.uFacade.value.copy(mixed.facade);
        uniforms.uRoof.value.copy(mixed.roof);
        uniforms.uHq.value.copy(mixed.hq);
        uniforms.uContextFacade.value.copy(mixed.context);
        uniforms.uContextRoof.value.copy(mixed.contextRoof);
        uniforms.uWindow.value.copy(mixed.window);
        uniforms.uFogColor.value.copy(mixed.background);
        uniforms.uNight.value = story.night;
        uniforms.uLights.value = story.lights;

        ground.material.uniforms.uGround.value.copy(mixed.ground);
        ground.material.uniforms.uGrid.value.copy(mixed.grid);
        ground.material.uniforms.uFogColor.value.copy(mixed.background);
        ground.material.uniforms.uNight.value = story.night;
        ground.material.uniforms.uOpacity.value = story.groundOpacity;

        lights.key.intensity = lerp(2.2, 0.9, story.night);
        lights.rim.intensity = story.night * 2.4;
        lights.hemisphere.intensity = lerp(1.3, 0.55, story.night);

        if (renderedNight === story.night) {
            return;
        }

        renderedNight = story.night;
        stage.style.setProperty(
            '--story-bg',
            `#${mixed.background.getHexString()}`,
        );
        stage.style.setProperty('--story-ink', `#${mixed.ink.getHexString()}`);
        stage.style.setProperty(
            '--story-muted',
            `#${mixed.muted.getHexString()}`,
        );
        stage.style.setProperty(
            '--story-accent',
            `#${mixed.accent.getHexString()}`,
        );
        stage.style.setProperty(
            '--story-line',
            copyNight > 0.5 ? PALETTE.night.line : PALETTE.day.line,
        );
    }

    function updateFog(distance) {
        const near = distance * 1.05;
        const far = distance * 2.6 + 6;
        [city.material, ground.material].forEach((material) => {
            material.uniforms.uFogNear.value = near;
            material.uniforms.uFogFar.value = far;
        });
    }

    function updateCopy(progress) {
        let chapterIndex = 0;
        CHAPTER_STARTS.forEach((start, index) => {
            if (progress >= start - 0.001) {
                chapterIndex = index;
            }
        });

        if (chapterIndex !== activeChapter) {
            activeChapter = chapterIndex;
            [chapterElements, tickElements].forEach((elements) =>
                elements.forEach((element, index) => {
                    element.toggleAttribute(
                        'data-active',
                        index === chapterIndex,
                    );
                    element.toggleAttribute('data-past', index < chapterIndex);
                }),
            );
        }

        if (progressBar) {
            progressBar.style.transform = `scaleX(${progress})`;
        }

        setStat('stage', String(chapterIndex + 1).padStart(2, '0'));
        setStat(
            'buildings',
            city.countBuilt(story.growth) + (story.hqHeight > 0.02 ? 1 : 0),
        );
        setStat('floors', Math.round(story.hqHeight / FLOOR_HEIGHT));
    }

    function setStat(name, value) {
        if (stats[name] && renderedStats[name] !== value) {
            renderedStats[name] = value;
            stats[name].textContent =
                typeof value === 'number'
                    ? value.toLocaleString('en-US', { useGrouping: false })
                    : value;
        }
    }

    function renderFrame(delta) {
        elapsed += delta;
        const easing = 1 - Math.exp(-delta * 3);
        pointer.x += (pointer.targetX - pointer.x) * easing;
        pointer.y += (pointer.targetY - pointer.y) * easing;

        const distance = updateCamera();
        updateLogo();
        updateColors();
        updateFog(distance);

        city.material.uniforms.uGrowth.value = story.growth;
        city.material.uniforms.uContext.value = story.context;
        city.material.uniforms.uHqHeight.value = story.hqHeight;
        arcs.update(story.hqHeight, story.arcs, elapsed);
        footprintOutline.setProgress(story.outline);

        renderer.render(scene, camera);
        updateCopy(timeline ? timeline.progress() : 0);
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
        const shouldRun = isVisible && !document.hidden;

        if (shouldRun && !isRunning) {
            lastFrameTime = performance.now();
            renderer.setAnimationLoop(tick);
            isRunning = true;
        } else if (!shouldRun && isRunning) {
            renderer.setAnimationLoop(null);
            isRunning = false;
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
        root.dataset.storyState = 'static';
        ScrollTrigger.refresh();
    }

    root.dataset.storyState = 'ready';

    const animations = gsap.context(() => {
        timeline = createTimeline(track, story, city);
    });

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);

    const intersectionObserver = new IntersectionObserver(
        ([entry]) => {
            isVisible = entry.isIntersecting;
            updateLoop();
        },
        { rootMargin: '25% 0px' },
    );
    intersectionObserver.observe(track);

    document.addEventListener('visibilitychange', updateLoop);
    canvas.addEventListener('webglcontextlost', handleContextLost);

    if (finePointerQuery.matches) {
        window.addEventListener('pointermove', handlePointerMove, {
            passive: true,
        });
    }

    resize();
    ScrollTrigger.refresh();

    return () => {
        animations.revert();
        renderer.setAnimationLoop(null);
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        document.removeEventListener('visibilitychange', updateLoop);
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        window.removeEventListener('pointermove', handlePointerMove);
        scene.traverse((object) => {
            object.geometry?.dispose();
            [object.material].flat().forEach((material) => material?.dispose());
        });
        renderer.dispose();
        root.dataset.storyState = 'static';
    };
}

/**
 * The story script. Positions are fractions of the scroll track; each chapter
 * starts at the matching CHAPTER_STARTS entry.
 */
function createTimeline(track, story, city) {
    const { hq } = city;
    const towardCenter = { x: lerp(hq.x, 0, 0.4), z: lerp(hq.z, 0, 0.4) };

    // The outline draws itself while the section scrolls into view.
    gsap.to(story, {
        draw: 1,
        ease: 'none',
        scrollTrigger: {
            trigger: track,
            start: 'top 85%',
            end: 'top top',
            scrub: 0.8,
        },
    });

    const timeline = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
            trigger: track,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.1,
            invalidateOnRefresh: true,
        },
    });

    timeline
        // 01 · The idea: the drawn mark fills in and turns to face us.
        .to(story, { fill: 1, duration: 0.08, ease: 'power1.out' }, 0)
        .to(
            story,
            { distance: 5.6, azimuth: -0.5, duration: 0.12, ease: 'none' },
            0,
        )

        // 02 · First office: the mark lands as the sign on a small three-storey building.
        .to(story, { groundOpacity: 1, duration: 0.08 }, 0.1)
        .to(story, { landing: 1, duration: 0.12 }, 0.11)
        .to(story, { hqHeight: 0.3, duration: 0.09, ease: 'power3.out' }, 0.14)
        .to(
            story,
            {
                cameraY: 0.45,
                azimuth: -0.75,
                polar: 1.12,
                distance: 3.8,
                duration: 0.14,
            },
            0.11,
        )

        // 03 · Block by block: the office grows and the city spreads along the logo's stroke.
        .to(story, { hqHeight: 1.6, duration: 0.14 }, 0.3)
        .to(story, { growth: 0.42, duration: 0.2, ease: 'none' }, 0.3)
        .to(story, { context: 0.45, duration: 0.2, ease: 'none' }, 0.32)
        .to(
            story,
            {
                cameraX: towardCenter.x,
                cameraY: 0.8,
                cameraZ: towardCenter.z,
                azimuth: -1.1,
                polar: 0.98,
                distance: 10.5,
                duration: 0.2,
            },
            0.28,
        )

        // 04 · Connected: the whole footprint fills in, night falls and the network lights up.
        .to(story, { growth: 1, duration: 0.16, ease: 'power1.inOut' }, 0.48)
        .to(story, { context: 1, duration: 0.16, ease: 'none' }, 0.5)
        .to(story, { hqHeight: 2.4, duration: 0.16 }, 0.5)
        .to(story, { night: 1, duration: 0.07, ease: 'power1.inOut' }, 0.52)
        .to(story, { lights: 1, duration: 0.14, ease: 'power1.in' }, 0.54)
        .to(story, { arcs: 1, duration: 0.1 }, 0.6)
        .to(
            story,
            {
                cameraX: 0,
                cameraY: 0.6,
                cameraZ: 0,
                azimuth: -1.95,
                polar: 0.86,
                distance: 21,
                duration: 0.22,
            },
            0.48,
        )

        // 05 · Today: the HQ becomes a tower, the mark rises, lies down and dissolves into the city it became.
        .to(story, { hqHeight: 3.6, duration: 0.1 }, 0.72)
        .to(story, { lift: 1, duration: 0.14 }, 0.77)
        .to(
            story,
            { cameraY: 0, azimuth: 0, polar: 0, distance: 34, duration: 0.17 },
            0.74,
        )
        .to(story, { arcs: 0.45, duration: 0.08 }, 0.8)
        .to(story, { outline: 1, duration: 0.1, ease: 'power1.inOut' }, 0.86)
        .to(story, { logoOpacity: 0, duration: 0.08, ease: 'power1.in' }, 0.89)
        .to({}, { duration: 0.03 }, 0.97);

    return timeline;
}

const srgbFrom = { r: 0, g: 0, b: 0 };
const srgbTo = { r: 0, g: 0, b: 0 };

/** Blend two colours in sRGB, which reads as a natural dusk instead of the grey midpoint of a linear blend. */
function mixSrgb(target, from, to, amount) {
    from.getRGB(srgbFrom, THREE.SRGBColorSpace);
    to.getRGB(srgbTo, THREE.SRGBColorSpace);
    target.setRGB(
        lerp(srgbFrom.r, srgbTo.r, amount),
        lerp(srgbFrom.g, srgbTo.g, amount),
        lerp(srgbFrom.b, srgbTo.b, amount),
        THREE.SRGBColorSpace,
    );
}

function mapColors(palette) {
    return Object.fromEntries(
        Object.entries(palette)
            .filter(([key]) => key !== 'line')
            .map(([key, value]) => [key, color(value)]),
    );
}

/**
 * Parse the SVG into filled regions normalised to a centred, Y-up unit square
 * (the largest side is 1), keeping the source shapes for extrusion.
 */
function parseLogoRegions(markup) {
    const { paths } = new SVGLoader().parse(markup);
    const parts = paths
        .filter(
            (path) =>
                path.userData?.style?.fill &&
                path.userData.style.fill !== 'none',
        )
        .flatMap((path) =>
            path.toShapes().map((shape) => ({ shape, color: path.color })),
        );
    const shapes = parts.map((part) => part.shape);

    const bounds = new THREE.Box2();
    shapes.forEach((shape) =>
        shape.getPoints().forEach((point) => bounds.expandByPoint(point)),
    );

    const center = bounds.getCenter(new THREE.Vector2());
    const size = bounds.getSize(new THREE.Vector2());
    const unit = 1 / Math.max(size.x, size.y);
    const normalise = (point) =>
        new THREE.Vector2(
            (point.x - center.x) * unit,
            -(point.y - center.y) * unit,
        );

    return {
        shapes,
        shapeColors: parts.map((part) => part.color),
        center,
        unit,
        aspect: size.y / Math.max(size.x, size.y),
        polygons: shapes.map((shape) => ({
            outer: shape.getPoints(8).map(normalise),
            holes: shape.holes.map((hole) => hole.getPoints(8).map(normalise)),
        })),
    };
}

function isInsidePolygon(x, y, polygon) {
    let inside = false;

    for (
        let index = 0, previous = polygon.length - 1;
        index < polygon.length;
        previous = index++
    ) {
        const a = polygon[index];
        const b = polygon[previous];

        if (
            a.y > y !== b.y > y &&
            x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x
        ) {
            inside = !inside;
        }
    }

    return inside;
}

function distanceToEdges(x, y, rings) {
    let closest = Infinity;

    rings.forEach((ring) => {
        for (let index = 0; index < ring.length; index++) {
            const a = ring[index];
            const b = ring[(index + 1) % ring.length];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const t = clamp01(
                ((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy || 1),
            );
            closest = Math.min(
                closest,
                Math.hypot(a.x + dx * t - x, a.y + dy * t - y),
            );
        }
    });

    return closest;
}

/** A tiny seeded generator so the city looks the same on every visit. */
function createRandom(seed) {
    let state = seed;

    return () => {
        state = (state * 1664525 + 1013904223) % 4294967296;

        return state / 4294967296;
    };
}

/**
 * Lay a street grid over the logo. Cells inside the mark become the company's city, grown in
 * walking order along the stroke from the deepest point (the first office); cells around it
 * become a low, pale neighbourhood so the silhouette reads clearly from above.
 */
function createCity(regions) {
    const random = createRandom(2012);
    const rings = regions.polygons.flatMap((polygon) => [
        polygon.outer,
        ...polygon.holes,
    ]);
    const isInsideLogo = (x, y) =>
        regions.polygons.some(
            (polygon) =>
                isInsidePolygon(x, y, polygon.outer) &&
                !polygon.holes.some((hole) => isInsidePolygon(x, y, hole)),
        );
    const half = Math.ceil(CONTEXT_RADIUS / CELL);
    const cells = [];

    for (let column = -half; column <= half; column++) {
        for (let row = -half; row <= half; row++) {
            const x = column * CELL;
            const z = row * CELL;

            if (Math.hypot(x, z) > CONTEXT_RADIUS) {
                continue;
            }

            const logoX = x / CITY_WIDTH;
            const logoY = -z / CITY_WIDTH;
            const inside = isInsideLogo(logoX, logoY);
            const edge = distanceToEdges(logoX, logoY, rings) * CITY_WIDTH;
            cells.push({ column, row, x, z, inside, edge });
        }
    }

    const cityCells = cells.filter(
        (cell) => cell.inside && cell.edge > CELL * 0.3,
    );
    const hq = cityCells.reduce(
        (deepest, cell) => (cell.edge > deepest.edge ? cell : deepest),
        cityCells[0],
    );
    const walkingDistance = measureWalkingDistance(cityCells, hq);
    const maxWalk = Math.max(...walkingDistance.values(), 1);

    const buildings = [];

    cityCells.forEach((cell) => {
        if (
            Math.max(Math.abs(cell.x - hq.x), Math.abs(cell.z - hq.z)) <
            HQ_FOOTPRINT * 1.25
        ) {
            return;
        }

        const distanceFromHq = Math.hypot(cell.x - hq.x, cell.z - hq.z);
        const skyline = Math.exp(-((distanceFromHq / (CITY_WIDTH * 0.2)) ** 2));
        const landmark = random() < 0.04 ? 0.5 + random() * 0.6 : 0;
        const height =
            0.16 +
            random() * 0.28 +
            skyline * (0.3 + random() * 0.7) +
            landmark;
        const walk = walkingDistance.get(cell) / maxWalk;
        const footprint = CELL * (0.62 + random() * 0.14);

        buildings.push({
            x: cell.x,
            z: cell.z,
            footX: footprint,
            footZ: CELL * (0.62 + random() * 0.14),
            height:
                Math.max(2, Math.round(height / FLOOR_HEIGHT)) * FLOOR_HEIGHT,
            order: Math.min(
                1 - BUILD_SPREAD,
                (walk * 0.88 + random() * 0.12) * (1 - BUILD_SPREAD),
            ),
            kind: 1,
        });
    });

    cells
        .filter(
            (cell) => !cell.inside && cell.edge > CELL * 0.7 && random() < 0.45,
        )
        .forEach((cell) => {
            const radial = Math.hypot(cell.x, cell.z) / CONTEXT_RADIUS;

            buildings.push({
                x: cell.x,
                z: cell.z,
                footX: CELL * (0.5 + random() * 0.25),
                footZ: CELL * (0.5 + random() * 0.25),
                height:
                    Math.max(
                        1,
                        Math.round(
                            (0.08 +
                                random() * (random() < 0.12 ? 0.35 : 0.16)) /
                                FLOOR_HEIGHT,
                        ),
                    ) * FLOOR_HEIGHT,
                order: Math.min(
                    1 - BUILD_SPREAD,
                    (radial * 0.75 + random() * 0.25) * (1 - BUILD_SPREAD),
                ),
                kind: 0,
            });
        });

    buildings.push({
        x: hq.x,
        z: hq.z,
        footX: HQ_FOOTPRINT,
        footZ: HQ_FOOTPRINT,
        height: 0,
        order: 0,
        kind: 2,
    });

    const box = new THREE.BoxGeometry(1, 1, 1);
    const geometry = new THREE.InstancedBufferGeometry();
    geometry.index = box.index;
    geometry.setAttribute('position', box.getAttribute('position'));
    geometry.setAttribute('normal', box.getAttribute('normal'));
    geometry.instanceCount = buildings.length;

    const attribute = (size, read) =>
        new THREE.InstancedBufferAttribute(
            new Float32Array(buildings.flatMap(read)),
            size,
        );
    geometry.setAttribute(
        'aCenter',
        attribute(3, (building) => [building.x, 0, building.z]),
    );
    geometry.setAttribute(
        'aFoot',
        attribute(2, (building) => [building.footX, building.footZ]),
    );
    geometry.setAttribute(
        'aHeight',
        attribute(1, (building) => [building.height]),
    );
    geometry.setAttribute(
        'aOrder',
        attribute(1, (building) => [building.order]),
    );
    geometry.setAttribute(
        'aKind',
        attribute(1, (building) => [building.kind]),
    );
    geometry.setAttribute(
        'aSeed',
        attribute(1, () => [random()]),
    );

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uGrowth: { value: 0 },
            uContext: { value: 0 },
            uSpread: { value: BUILD_SPREAD },
            uHqHeight: { value: 0 },
            uFloor: { value: FLOOR_HEIGHT },
            uFacade: { value: new THREE.Color() },
            uRoof: { value: new THREE.Color() },
            uHq: { value: new THREE.Color() },
            uContextFacade: { value: new THREE.Color() },
            uContextRoof: { value: new THREE.Color() },
            uWindow: { value: new THREE.Color() },
            uLit: { value: color(PALETTE.lit) },
            uGreen: { value: color(PALETTE.accent) },
            uFogColor: { value: new THREE.Color() },
            uLightDirection: {
                value: new THREE.Vector3(-0.55, 0.7, 0.45).normalize(),
            },
            uNight: { value: 0 },
            uLights: { value: 0 },
            uFogNear: { value: 10 },
            uFogFar: { value: 40 },
        },
        vertexShader: buildingVertexShader,
        fragmentShader: buildingFragmentShader,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;

    const builtOrders = buildings
        .filter((building) => building.kind === 1)
        .map((building) => building.order)
        .sort((a, b) => a - b);

    return {
        mesh,
        material,
        hq: { x: hq.x, z: hq.z },
        buildings,
        countBuilt(growth) {
            let low = 0;
            let high = builtOrders.length;

            while (low < high) {
                const middle = (low + high) >> 1;

                if (builtOrders[middle] < growth - BUILD_SPREAD * 0.5) {
                    low = middle + 1;
                } else {
                    high = middle;
                }
            }

            return low;
        },
    };
}

/** Dijkstra over neighbouring city cells, so growth flows along the logo's stroke rather than as a circle. */
function measureWalkingDistance(cityCells, start) {
    const byKey = new Map(
        cityCells.map((cell) => [`${cell.column}:${cell.row}`, cell]),
    );
    const distance = new Map(cityCells.map((cell) => [cell, Infinity]));
    const visited = new Set();
    distance.set(start, 0);

    for (let step = 0; step < cityCells.length; step++) {
        let current = null;

        distance.forEach((value, cell) => {
            if (
                !visited.has(cell) &&
                value < Infinity &&
                (current === null || value < distance.get(current))
            ) {
                current = cell;
            }
        });

        if (current === null) {
            break;
        }

        visited.add(current);

        for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
                const neighbour = byKey.get(
                    `${current.column + dx}:${current.row + dz}`,
                );

                if (!neighbour || visited.has(neighbour)) {
                    continue;
                }

                const candidate = distance.get(current) + Math.hypot(dx, dz);

                if (candidate < distance.get(neighbour)) {
                    distance.set(neighbour, candidate);
                }
            }
        }
    }

    distance.forEach((value, cell) => {
        if (value === Infinity) {
            distance.set(cell, 0);
        }
    });

    return distance;
}

function createGround() {
    const material = new THREE.ShaderMaterial({
        uniforms: {
            uGround: { value: new THREE.Color() },
            uGrid: { value: new THREE.Color() },
            uFogColor: { value: new THREE.Color() },
            uCell: { value: CELL },
            uRadius: { value: CONTEXT_RADIUS },
            uOpacity: { value: 0 },
            uNight: { value: 0 },
            uFogNear: { value: 10 },
            uFogFar: { value: 40 },
        },
        vertexShader: groundVertexShader,
        fragmentShader: groundFragmentShader,
        transparent: true,
        depthWrite: false,
    });

    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(CONTEXT_RADIUS * 3, CONTEXT_RADIUS * 3).rotateX(
            -Math.PI / 2,
        ),
        material,
    );
    mesh.renderOrder = -1;

    return { mesh, material };
}

/**
 * The protagonist: the mark extruded into a slim slab, each part in its own brand colour, with
 * brushed-aluminium sides, a self-drawing outline on its face and a soft halo behind it.
 */
function createLogo(markup, regions) {
    const { shapes, shapeColors, center, unit } = regions;
    const svgDepth = LOGO_DEPTH / unit;

    const side = new THREE.MeshStandardMaterial({
        color: color('#c9d6db'),
        metalness: 0.7,
        roughness: 0.28,
        transparent: true,
        opacity: 0,
    });

    const group = new THREE.Group();
    const caps = [];
    const byColor = new Map();

    shapes.forEach((shape, index) => {
        const key = shapeColors[index]?.getHexString() ?? PALETTE.navy.slice(1);
        byColor.set(key, [...(byColor.get(key) ?? []), shape]);
    });

    byColor.forEach((colorShapes, key) => {
        const geometry = new THREE.ExtrudeGeometry(colorShapes, {
            depth: svgDepth,
            bevelEnabled: true,
            bevelThickness: svgDepth * 0.25,
            bevelSize: svgDepth * 0.15,
            bevelSegments: 3,
            curveSegments: 40,
        })
            .translate(-center.x, -center.y, 0)
            .rotateX(Math.PI)
            .scale(unit, unit, unit)
            .translate(0, 0, LOGO_DEPTH / 2);

        const cap = new THREE.MeshStandardMaterial({
            color: color(`#${key}`),
            metalness: 0.35,
            roughness: 0.38,
            emissive: color(PALETTE.accent),
            emissiveIntensity: 0,
            transparent: true,
            opacity: 0,
        });

        caps.push(cap);
        group.add(new THREE.Mesh(geometry, [cap, side]));
    });

    const frontZ = LOGO_DEPTH / 2 + LOGO_DEPTH * 0.3;
    const outline = createOutline(
        regions,
        (point) => [point.x, point.y, frontZ],
        2,
        PALETTE.accentDeep,
    );
    group.add(outline.group);

    const halo = new THREE.Mesh(
        new THREE.PlaneGeometry(2.6, 2.6),
        new THREE.ShaderMaterial({
            uniforms: {
                uColor: { value: color(PALETTE.accentLight) },
                uOpacity: { value: 0 },
            },
            vertexShader: haloVertexShader,
            fragmentShader: haloFragmentShader,
            transparent: true,
            depthWrite: false,
        }),
    );
    halo.position.z = -LOGO_DEPTH * 2;
    group.add(halo);

    return {
        group,
        caps,
        halo,
        outline,
        materials: [...caps, side],
        aspect: regions.aspect,
    };
}

/** Closed outlines of every logo ring as fat lines that can be progressively drawn. */
function createOutline(
    regions,
    project,
    linewidth,
    lineColor = PALETTE.accent,
    depthTest = true,
) {
    const group = new THREE.Group();
    const rings = regions.polygons.flatMap((polygon) => [
        polygon.outer,
        ...polygon.holes,
    ]);
    const lines = rings.map((ring) => {
        const positions = [...ring, ring[0]].flatMap(project);
        const geometry = new LineGeometry().setPositions(positions);
        const material = new LineMaterial({
            color: color(lineColor),
            linewidth,
            transparent: true,
            depthWrite: false,
            depthTest,
        });
        const line = new Line2(geometry, material);
        line.frustumCulled = false;
        line.renderOrder = depthTest ? 0 : 2;
        group.add(line);

        return { line, segments: ring.length };
    });

    return {
        group,
        materials: lines.map(({ line }) => line.material),
        setProgress(progress) {
            lines.forEach(({ line, segments }) => {
                const count = Math.round(segments * progress);
                line.visible = count > 0;
                line.geometry.instanceCount = count;
            });
        },
    };
}

/** Light arcs linking the headquarters to the furthest districts, with pulses travelling along them. */
function createArcs(city) {
    const SEGMENTS = 64;
    const districts = city.buildings
        .filter((building) => building.kind === 1)
        .sort((a, b) => b.order - a.order);
    const targets = [];

    districts.forEach((building) => {
        const farFromOthers = targets.every(
            (target) =>
                Math.hypot(target.x - building.x, target.z - building.z) >
                CITY_WIDTH * 0.2,
        );

        if (targets.length < 7 && building.order > 0.25 && farFromOthers) {
            targets.push(building);
        }
    });

    const positions = new Float32Array(targets.length * SEGMENTS * 2 * 3);
    const tValues = [];
    const arcIndex = [];

    targets.forEach((target, arc) => {
        for (let segment = 0; segment < SEGMENTS; segment++) {
            tValues.push(segment / SEGMENTS, (segment + 1) / SEGMENTS);
            arcIndex.push(arc, arc);
        }
    });

    const geometry = new THREE.BufferGeometry()
        .setAttribute('position', new THREE.BufferAttribute(positions, 3))
        .setAttribute('aT', new THREE.Float32BufferAttribute(tValues, 1))
        .setAttribute('aArc', new THREE.Float32BufferAttribute(arcIndex, 1));

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: color(PALETTE.accentDeep) },
            uHighlight: { value: color(PALETTE.accentLight) },
            uTime: { value: 0 },
            uDraw: { value: 0 },
            uOpacity: { value: 0 },
        },
        vertexShader: arcVertexShader,
        fragmentShader: arcFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    const pulsePositions = new Float32Array(targets.length * 3);
    const pulseGeometry = new THREE.BufferGeometry()
        .setAttribute('position', new THREE.BufferAttribute(pulsePositions, 3))
        .setAttribute(
            'aSize',
            new THREE.Float32BufferAttribute(
                targets.map(() => 0.16),
                1,
            ),
        );
    const pulseMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: color(PALETTE.lit) },
            uOpacity: { value: 0 },
            uSizeScale: { value: 1 },
        },
        vertexShader: glowVertexShader,
        fragmentShader: glowFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    const lines = new THREE.LineSegments(geometry, material);
    const pulses = new THREE.Points(pulseGeometry, pulseMaterial);
    lines.frustumCulled = false;
    pulses.frustumCulled = false;

    const group = new THREE.Group();
    group.add(lines, pulses);

    const start = new THREE.Vector3();
    const end = new THREE.Vector3();
    const control = new THREE.Vector3();
    const point = new THREE.Vector3();
    const curve = new THREE.QuadraticBezierCurve3(start, control, end);

    return {
        group,
        pulseMaterial,
        update(hqHeight, visibility, time) {
            group.visible = visibility > 0.001;

            if (!group.visible) {
                return;
            }

            material.uniforms.uTime.value = time;
            material.uniforms.uDraw.value = Math.min(1, visibility * 1.4);
            material.uniforms.uOpacity.value = visibility;
            pulseMaterial.uniforms.uOpacity.value = smooth(
                clamp01(visibility * 1.6 - 0.6),
            );

            targets.forEach((target, arc) => {
                start.set(city.hq.x, hqHeight, city.hq.z);
                end.set(target.x, target.height + 0.02, target.z);
                control.copy(start).add(end).multiplyScalar(0.5);
                control.y =
                    Math.max(start.y, end.y) + start.distanceTo(end) * 0.35;

                for (let segment = 0; segment < SEGMENTS; segment++) {
                    const offset = (arc * SEGMENTS + segment) * 6;
                    curve
                        .getPoint(segment / SEGMENTS, point)
                        .toArray(positions, offset);
                    curve
                        .getPoint((segment + 1) / SEGMENTS, point)
                        .toArray(positions, offset + 3);
                }

                curve
                    .getPoint((time * 0.22 + arc * 0.37) % 1, point)
                    .toArray(pulsePositions, arc * 3);
            });

            geometry.attributes.position.needsUpdate = true;
            pulseGeometry.attributes.position.needsUpdate = true;
        },
    };
}

function createLights() {
    const group = new THREE.Group();
    const key = new THREE.DirectionalLight('#ffffff', 2.2);
    key.position.set(-4, 7, 6);
    const rim = new THREE.DirectionalLight(PALETTE.accent, 0);
    rim.position.set(5, 3, -6);
    const hemisphere = new THREE.HemisphereLight('#ffffff', '#9fb2c8', 1.3);
    group.add(key, rim, hemisphere);

    return { group, key, rim, hemisphere };
}
