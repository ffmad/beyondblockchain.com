import {
  CircleGeometry,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Quaternion,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

// The "How I build" globe: every technology is a dot on a sphere, sized by how many projects use it. Picking one
// turns it blue and brings it to the front; arcs run to the technologies it's used alongside and the rest fade
// back. Labels are HTML, placed from the projected dots each frame, so they stay sharp and use the site's fonts.
// Loaded only in the browser, on demand, so Three.js stays out of the main bundle and the server render.

export interface SceneTechnology {
  name: string;
  /** Slugs of the projects that use it. */
  projects: string[];
  /** Its logo (a 24 × 24 SVG path and brand colour), shown before the label. */
  icon?: { path: string; hex: string } | null;
}

export interface StackSceneOptions {
  /** Most-used first. */
  technologies: SceneTechnology[];
  selected: string | null;
  /** A dot was clicked or tapped. The caller decides, then calls select(). */
  onPick: (name: string) => void;
  /** The pointer moved onto a dot, or off it (null). */
  onHover?: (name: string | null) => void;
}

export interface StackScene {
  select(name: string | null): void;
  /** Highlight a technology from outside (the list), or clear it with null. */
  hover(name: string | null): void;
  resize(): void;
  dispose(): void;
}

type State = 'selected' | 'related' | 'other';

interface Node {
  name: string;
  index: number;
  count: number;
  /** Unit position on the globe, in its own frame. */
  base: Vector3;
  radius: number;
  mesh: Mesh<CircleGeometry, MeshBasicMaterial>;
  color: Color;
  scale: number;
  appear: number;
  delay: number;
  state: State;
  label: HTMLSpanElement;
  labelWidth: number;
  labelHeight: number;
  labelOpacity: number;
  labelShown: boolean;
  labelX: number;
  labelY: number;
  // Where it is this frame.
  z: number;
  x: number;
  y: number;
  /** Screen pixels per world unit at its depth. */
  unit: number;
}

interface Arc {
  line: Line2;
  geometry: LineGeometry;
  material: LineMaterial;
  created: number;
  delay: number;
}

/** Camera distance, in globe radii. Far enough for a calm, nearly flat perspective. */
const DISTANCE = 6;
/** Idle turn, in radians per second: a full turn in about a minute and a half. */
const SPIN = 0.07;
/** How long the globe stays still after the visitor touches it. */
const RESUME_AFTER = 2600;
const ARC_POINTS = 48;
/** Dots sit just in front of the globe's surface so arcs end beneath them. */
const LIFT = 0.02;
/** The ring around the picked technology, as a multiple of its dot's radius. */
const RING = 1.6;
/** Where a picked technology comes to rest: the front, a touch above centre to leave room for its label. */
const FRONT = new Vector3(0, 0.1, 1).normalize();
const AXIS_X = new Vector3(1, 0, 0);
const AXIS_Y = new Vector3(0, 1, 0);

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
const smooth = (from: number, to: number, value: number) => {
  const t = clamp01((value - from) / (to - from));
  return t * t * (3 - 2 * t);
};
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeOutBack = (t: number) => {
  const c = 1.4;
  return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2;
};

function readPalette(element: HTMLElement) {
  const style = getComputedStyle(element);
  const read = (name: string, fallback: string) => {
    const value = style.getPropertyValue(name).trim();
    return new Color(/^#[\da-f]{3,8}$|^rgba?\(/i.test(value) ? value : fallback);
  };
  const surface = read('--stack-surface', '#f5f4f0');
  const muted = read('--muted', '#586174');
  return {
    surface,
    ink: read('--ink', '#0c1424'),
    line: read('--line', '#d9dbe1'),
    brand: read('--brand-700', '#234e9b'),
    brandDeep: read('--brand-900', '#16346f'),
    brandMid: read('--brand-500', '#5072af'),
    brandSoft: read('--brand-300', '#859dc8'),
    brandPale: read('--brand-100', '#cdd7e8'),
    faint: muted.clone().lerp(surface, 0.35),
  };
}

/** Points on the unit sphere along `a`→`b`'s great circle. */
function slerpUnit(a: Vector3, b: Vector3, angle: number, t: number, out: Vector3) {
  const sin = Math.sin(angle);
  if (sin < 1e-4) {
    if (angle < 1) return out.copy(a);
    // Opposite points: any way round will do.
    const axis = new Vector3(0, 1, 0).cross(a);
    if (axis.lengthSq() < 1e-6) axis.set(1, 0, 0);
    return out.copy(a).applyAxisAngle(axis.normalize(), angle * t);
  }
  const wa = Math.sin((1 - t) * angle) / sin;
  const wb = Math.sin(t * angle) / sin;
  return out.set(a.x * wa + b.x * wb, a.y * wa + b.y * wb, a.z * wa + b.z * wb);
}

/** A route over the globe between two technologies, barely lifted: a higher arc would overshoot dots near the edge. */
function arcPositions(a: Vector3, b: Vector3) {
  const angle = a.angleTo(b);
  const lift = 0.01 + 0.04 * (angle / Math.PI);
  const point = new Vector3();
  const positions: number[] = [];
  for (let i = 0; i < ARC_POINTS; i++) {
    const t = i / (ARC_POINTS - 1);
    slerpUnit(a, b, angle, t, point).multiplyScalar(1 + lift * Math.sin(Math.PI * t) ** 2);
    positions.push(point.x, point.y, point.z);
  }
  return positions;
}

/**
 * Even spacing (a Fibonacci sphere), then a short relaxation that draws technologies used together closer, so a
 * project's tools tend to sit near each other and the arcs stay short. Deterministic: same data, same globe.
 */
function arrange(count: number, affinity: number[][]) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  // Spread the big dots around instead of stacking them at one pole.
  let stride = Math.max(1, Math.round(count * 0.382));
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  while (gcd(stride, count) !== 1) stride++;
  const points = Array.from({ length: count }, (_, i) => {
    const slot = (i * stride) % count;
    const y = count === 1 ? 0 : 1 - (2 * (slot + 0.5)) / count;
    const r = Math.sqrt(1 - y * y);
    return new Vector3(Math.cos(golden * slot) * r, y, Math.sin(golden * slot) * r);
  });
  if (count < 3) return points;
  const spacing = Math.sqrt((4 * Math.PI) / count);
  const closest = spacing * 0.75;
  const forces = points.map(() => new Vector3());
  const d = new Vector3();
  const rounds = 140;
  for (let round = 0; round < rounds; round++) {
    for (const force of forces) force.set(0, 0, 0);
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        d.subVectors(points[i]!, points[j]!);
        const dist = Math.max(d.length(), 0.02);
        // Repulsion keeps the spacing; affinity pulls related tools together.
        const push = (spacing * spacing) / (dist * dist * dist);
        const pull = affinity[i]![j]! * 0.9;
        const strength = push * 0.06 - pull;
        forces[i]!.addScaledVector(d, strength);
        forces[j]!.addScaledVector(d, -strength);
      }
    }
    const step = 0.02 * (1 - round / rounds) + 0.004;
    for (let i = 0; i < count; i++) {
      const force = forces[i]!;
      const length = force.length();
      if (length > 1) force.multiplyScalar(1 / length);
      points[i]!.addScaledVector(force, step).normalize();
    }
    // Close, but never on top of each other.
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        d.subVectors(points[i]!, points[j]!);
        const dist = d.length();
        if (dist >= closest || dist === 0) continue;
        d.multiplyScalar((closest - dist) / dist / 2);
        points[i]!.add(d).normalize();
        points[j]!.sub(d).normalize();
      }
    }
  }
  return points;
}

export function createStackScene(container: HTMLElement, options: StackSceneOptions): StackScene {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = motion.matches;
  const palette = readPalette(container);

  // Data
  const technologies = options.technologies;
  const total = technologies.length;
  const maxCount = Math.max(1, ...technologies.map((t) => t.projects.length));
  const sets = technologies.map((t) => new Set(t.projects));
  const shared = technologies.map((a, i) =>
    technologies.map((b, j) =>
      i === j ? 0 : b.projects.filter((slug) => sets[i]!.has(slug)).length,
    ),
  );
  const affinity = shared.map((row, i) =>
    row.map(
      (n, j) =>
        n / Math.sqrt(technologies[i]!.projects.length * technologies[j]!.projects.length || 1),
    ),
  );
  const positions = arrange(total, affinity);

  // Three.js
  const renderer = new WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
  renderer.setClearColor(palette.surface, 1);
  const canvas = renderer.domElement;
  canvas.className = 'stack-canvas';
  const labels = document.createElement('div');
  labels.className = 'stack-labels';
  container.append(canvas, labels);

  const camera = new PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, DISTANCE);
  const scene = new Scene();
  const globe = new Group();
  scene.add(globe);

  // Arcs soften toward the porcelain as they pass behind the globe, like the dots do, so a line that goes over
  // the horizon fades out instead of hooking round the edge.
  const fadeUniforms = {
    fadeColor: { value: palette.surface },
    cameraDistance: { value: DISTANCE },
  };
  const fadeBehind: LineMaterial['onBeforeCompile'] = (shader) => {
    Object.assign(shader.uniforms, fadeUniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        'uniform vec2 resolution;',
        '$&\nuniform float cameraDistance;\nvarying float vDepth;',
      )
      .replace(
        'vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );',
        '$&\nvDepth = ( position.y < 0.5 ? start.z : end.z ) + cameraDistance;',
      );
    shader.fragmentShader = shader.fragmentShader
      .replace('uniform float linewidth;', '$&\nuniform vec3 fadeColor;\nvarying float vDepth;')
      .replace(
        'gl_FragColor = vec4( diffuseColor.rgb, alpha );',
        'gl_FragColor = vec4( mix( diffuseColor.rgb, fadeColor, ( 1.0 - smoothstep( -0.1, 0.35, vDepth ) ) * 0.95 ), alpha );',
      );
  };

  const lineMaterials = new Set<LineMaterial>();
  const lineMaterial = (color: Color, width: number, transparent = false) => {
    const material = new LineMaterial({ color, linewidth: width, transparent });
    material.resolution.set(1, 1);
    lineMaterials.add(material);
    return material;
  };
  const circle = (radius: number, z: number) => {
    const points: number[] = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      points.push(Math.cos(a) * radius, Math.sin(a) * radius, z);
    }
    const geometry = new LineGeometry();
    geometry.setPositions(points);
    return geometry;
  };

  // The globe's outline, exactly where the sphere's edge falls in perspective.
  const outlineGeometry = circle(Math.sqrt(1 - 1 / DISTANCE ** 2), 1 / DISTANCE);
  const outlineMaterial = lineMaterial(palette.line, 1);
  const outline = new Line2(outlineGeometry, outlineMaterial);
  scene.add(outline);

  // A ring that locks onto the picked technology.
  const ringGeometry = circle(1, LIFT + 0.001);
  const ringMaterial = lineMaterial(palette.brandSoft.clone(), 1.25, true);
  const ring = new Line2(ringGeometry, ringMaterial);
  ring.renderOrder = 3;
  ring.visible = false;
  globe.add(ring);

  const dotGeometry = new CircleGeometry(1, 40);
  dotGeometry.translate(0, 0, LIFT);

  const nodes: Node[] = technologies.map((tech, index) => {
    const count = tech.projects.length;
    const material = new MeshBasicMaterial({ color: palette.ink });
    const mesh = new Mesh(dotGeometry, material);
    mesh.renderOrder = 2;
    globe.add(mesh);
    const label = document.createElement('span');
    label.className = 'stack-label';
    if (tech.icon) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('class', 'stack-label-icon');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', tech.icon.path);
      path.setAttribute('fill', `#${tech.icon.hex}`);
      svg.append(path);
      label.append(svg);
    }
    label.append(tech.name);
    label.style.visibility = 'hidden';
    labels.append(label);
    const base = positions[index]!;
    return {
      name: tech.name,
      index,
      count,
      base,
      radius: 0.013 + 0.021 * Math.sqrt(count / maxCount),
      mesh,
      color: palette.faint.clone(),
      scale: 1,
      appear: 0,
      // The dots arrive from the top of the globe down.
      delay: (1 - base.y) * 260 + index * 6,
      state: 'other',
      label,
      labelWidth: 0,
      labelHeight: 0,
      labelOpacity: 0,
      labelShown: false,
      labelX: Number.NaN,
      labelY: Number.NaN,
      z: 0,
      x: 0,
      y: 0,
      unit: 1,
    };
  });
  const byName = new Map(nodes.map((node) => [node.name, node]));
  const order = [...nodes];

  // State
  const orientation = new Quaternion();
  const inverse = new Quaternion();
  const turn = new Quaternion();
  const world = new Vector3();
  const target = new Color();
  let selected: Node | null = null;
  let hovered: Node | null = null;
  let hinted: Node | null = null;
  let arcs: Arc[] = [];
  let ease: { from: Quaternion; to: Quaternion; start: number; duration: number } | null = null;
  let spin = 0;
  const velocity = { yaw: 0, pitch: 0 };
  let ringStart = 0;
  let introStart = 0;
  let lastInteraction = -Infinity;
  let pointerInside = false;
  let pointer: {
    id: number;
    type: string;
    x: number;
    y: number;
    startX: number;
    startY: number;
    time: number;
    dragging: boolean;
  } | null = null;
  let width = 0;
  let height = 0;
  let focal = 1;
  let ratio = 1;
  let onScreen = false;
  let lost = false;
  let disposed = false;
  let frame = 0;
  let last = 0;
  let wake: ReturnType<typeof setTimeout> | undefined;
  const placed: number[] = [];

  function rotateBy(yaw: number, pitch: number) {
    if (yaw) orientation.premultiply(turn.setFromAxisAngle(AXIS_Y, yaw));
    if (pitch) orientation.premultiply(turn.setFromAxisAngle(AXIS_X, pitch));
    orientation.normalize();
  }

  /** The rotation that brings `node` to the front from where the globe is now. */
  function facing(node: Node) {
    const direction = node.base.clone().applyQuaternion(orientation);
    return new Quaternion().setFromUnitVectors(direction, FRONT).multiply(orientation);
  }

  function bringToFront(node: Node) {
    const to = facing(node);
    velocity.yaw = velocity.pitch = 0;
    spin = 0;
    const angle = orientation.angleTo(to);
    if (reduced || !introStart || angle < 0.01) {
      orientation.copy(to);
      ease = null;
      return;
    }
    ease = {
      from: orientation.clone(),
      to,
      start: performance.now(),
      duration: 520 + 520 * (angle / Math.PI),
    };
  }

  function applyStates() {
    for (const node of nodes) {
      node.state =
        node === selected
          ? 'selected'
          : !selected || shared[selected.index]![node.index]! > 0
            ? 'related'
            : 'other';
    }
    updateLabelClasses();
  }

  function updateLabelClasses() {
    const highlight = hovered ?? hinted;
    for (const node of nodes) {
      const className = `stack-label is-${node.state}${node === highlight ? ' is-hovered' : ''}`;
      if (node.label.className !== className) node.label.className = className;
    }
  }

  function clearArcs() {
    for (const arc of arcs) {
      globe.remove(arc.line);
      arc.geometry.dispose();
      arc.material.dispose();
      lineMaterials.delete(arc.material);
    }
    arcs = [];
  }

  function buildArcs() {
    clearArcs();
    if (!selected) return;
    const from = selected;
    const related = nodes
      .filter((node) => node !== from && shared[from.index]![node.index]! > 0)
      .sort((a, b) => from.base.distanceTo(a.base) - from.base.distanceTo(b.base));
    const now = performance.now();
    related.forEach((node, i) => {
      const strength = shared[from.index]![node.index]! / Math.max(1, from.count);
      const geometry = new LineGeometry();
      geometry.setPositions(arcPositions(from.base, node.base));
      const material = lineMaterial(
        // Tools used together in most of its projects get the clearest lines.
        palette.brandPale.clone().lerp(palette.brandMid, strength),
        1 + 0.5 * strength,
      );
      material.resolution.set(width || 1, height || 1);
      material.onBeforeCompile = fadeBehind;
      const line = new Line2(geometry, material);
      line.renderOrder = 0;
      geometry.instanceCount = reduced ? ARC_POINTS - 1 : 0;
      globe.add(line);
      arcs.push({ line, geometry, material, created: now, delay: 140 + i * 45 });
    });
  }

  function setHovered(node: Node | null) {
    if (node === hovered) return;
    hovered = node;
    container.classList.toggle('is-pointing', !!node);
    updateLabelClasses();
    options.onHover?.(node?.name ?? null);
    schedule();
  }

  /** The front-most technology under a point, counting a generous circle around each dot and its label. */
  function hitTest(x: number, y: number, coarse: boolean) {
    let best: Node | null = null;
    for (const node of nodes) {
      if (node.appear < 0.5) continue;
      const r = node.radius * node.scale * node.unit;
      const reach = Math.max(r + (coarse ? 10 : 5), coarse ? 22 : 12);
      const dx = x - node.x;
      const dy = y - node.y;
      let hit = dx * dx + dy * dy <= reach * reach;
      if (!hit && node.labelOpacity > 0.6) {
        hit =
          x >= node.labelX - 3 &&
          x <= node.labelX + node.labelWidth + 3 &&
          y >= node.labelY - 2 &&
          y <= node.labelY + node.labelHeight + 2;
      }
      if (hit && (!best || node.z > best.z)) best = node;
    }
    return best;
  }

  // Frames
  function schedule() {
    if (frame || disposed || lost || !onScreen || document.hidden || !width) return;
    frame = requestAnimationFrame(tick);
  }

  function pause() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
  }

  function wakeAt(time: number) {
    clearTimeout(wake);
    wake = setTimeout(schedule, Math.max(16, time - performance.now()));
  }

  function tick(now: number) {
    frame = 0;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    const busy = update(dt, now);
    renderer.render(scene, camera);
    if (busy) schedule();
    else last = 0;
  }

  function update(dt: number, now: number) {
    let busy = false;
    const k = reduced ? 1 : 1 - Math.exp(-dt * 12);

    // Turning: an eased move to the front, the visitor's drag and its glide, or the idle turn.
    if (ease) {
      const t = clamp01((now - ease.start) / ease.duration);
      orientation.slerpQuaternions(ease.from, ease.to, easeInOut(t));
      if (t >= 1) ease = null;
      busy = true;
    } else if (pointer?.dragging) {
      busy = true;
    } else if (!reduced) {
      if (Math.hypot(velocity.yaw, velocity.pitch) > 0.003) {
        rotateBy(velocity.yaw * dt, velocity.pitch * dt);
        const decay = Math.exp(-dt * 3.2);
        velocity.yaw *= decay;
        velocity.pitch *= decay;
        busy = true;
      } else {
        velocity.yaw = velocity.pitch = 0;
      }
      const resumeAt = lastInteraction + RESUME_AFTER;
      const calm = !pointerInside && !pointer && now >= resumeAt;
      spin += ((calm ? SPIN : 0) - spin) * (1 - Math.exp(-dt * 1.1));
      if (spin > 0.0004) rotateBy(spin * dt, 0);
      else spin = 0;
      if (calm || spin) busy = true;
      else if (!pointerInside && !pointer) wakeAt(resumeAt);
    }
    globe.quaternion.copy(orientation);
    inverse.copy(orientation).invert();

    // Dots
    const highlight = hovered ?? hinted;
    const half = width / 2;
    const middle = height / 2;
    for (const node of nodes) {
      if (reduced) node.appear = 1;
      else if (!introStart) node.appear = 0;
      else if (node.appear < 1) {
        const t = clamp01((now - introStart - node.delay) / 560);
        node.appear = t >= 1 ? 1 : easeOutBack(t);
        busy = true;
      }

      world.copy(node.base).applyQuaternion(orientation);
      node.z = world.z;
      node.unit = focal / (DISTANCE - world.z);
      node.x = half + world.x * node.unit;
      node.y = middle - world.y * node.unit;

      const scale = (node === selected ? 1.25 : 1) * (node === highlight ? 1.3 : 1);
      node.scale += (scale - node.scale) * k;
      if (Math.abs(scale - node.scale) > 0.002) busy = true;

      if (node === selected) target.copy(node === highlight ? palette.brandDeep : palette.brand);
      else if (node === highlight) target.copy(palette.brandMid);
      else target.copy(node.state === 'related' ? palette.ink : palette.faint);
      node.color.lerp(target, k);
      const gap =
        Math.abs(node.color.r - target.r) +
        Math.abs(node.color.g - target.g) +
        Math.abs(node.color.b - target.b);
      if (gap > 0.003) busy = true;
      // Behind the globe, colours soften toward the porcelain.
      const fade = smooth(0.3, -0.85, world.z) * 0.8;
      node.mesh.material.color.copy(node.color).lerp(palette.surface, fade);
      const size = node.radius * node.scale * node.appear;
      node.mesh.visible = size > 1e-4;
      node.mesh.position.copy(node.base);
      node.mesh.quaternion.copy(inverse);
      node.mesh.scale.set(size, size, 1);
    }

    // The ring around the picked technology
    if (selected && selected.appear > 0) {
      const t = reduced ? 1 : clamp01((now - ringStart) / 640);
      if (t < 1) busy = true;
      const size =
        selected.radius * selected.scale * selected.appear * (RING + 1.1 * (1 - easeOut(t)));
      ring.visible = true;
      ring.position.copy(selected.base);
      ring.quaternion.copy(inverse);
      ring.scale.set(size, size, 1);
      const fade = Math.max(smooth(0.3, -0.85, selected.z) * 0.8, 1 - easeOut(t));
      ringMaterial.color.copy(palette.brandSoft).lerp(palette.surface, fade);
    } else {
      ring.visible = false;
    }

    // Arcs draw out from the picked technology once the dots have arrived.
    for (const arc of arcs) {
      if (!introStart && !reduced) continue;
      const start = Math.max(arc.created, introStart + 600) + arc.delay;
      const t = reduced ? 1 : clamp01((now - start) / 560);
      arc.geometry.instanceCount = Math.round(easeOut(t) * (ARC_POINTS - 1));
      if (t < 1) busy = true;
    }

    // Labels: the most important first; any that would overlap one already placed waits its turn.
    order.sort((a, b) => priority(b, highlight) - priority(a, highlight));
    placed.length = 0;
    const kl = reduced ? 1 : 1 - Math.exp(-dt * 10);
    for (const node of order) {
      const important = node === selected || node === highlight;
      let goal = node.appear > 0.85 ? visibility(node, highlight) : 0;
      // Below the dot, or below the ring around the picked one.
      const r = node.radius * node.scale * node.appear * node.unit * (node === selected ? RING : 1);
      let x = node.x - node.labelWidth / 2;
      let y = node.y + r + 4;
      if (goal > 0) {
        const outside =
          x < 2 || x + node.labelWidth > width - 2 || y + node.labelHeight > height - 2;
        if (outside && important) {
          x = Math.min(Math.max(x, 2), width - node.labelWidth - 2);
          y = Math.min(y, height - node.labelHeight - 2);
        } else if (outside) goal = 0;
      }
      if (goal > 0) {
        for (let i = 0; i < placed.length; i += 4) {
          if (
            x < placed[i]! + placed[i + 2]! + 6 &&
            x + node.labelWidth + 6 > placed[i]! &&
            y < placed[i + 1]! + placed[i + 3]! + 2 &&
            y + node.labelHeight + 2 > placed[i + 1]!
          ) {
            goal = 0;
            break;
          }
        }
        // A faded technology's label never covers a highlighted dot.
        if (goal > 0 && node.state === 'other' && !important) {
          for (const other of nodes) {
            if (other.state === 'other' || other.z < -0.2) continue;
            const reach = other.radius * other.scale * other.unit + 2;
            if (
              x < other.x + reach &&
              x + node.labelWidth > other.x - reach &&
              y < other.y + reach &&
              y + node.labelHeight > other.y - reach
            ) {
              goal = 0;
              break;
            }
          }
        }
        if (goal > 0) placed.push(x, y, node.labelWidth, node.labelHeight);
      }
      node.labelOpacity += (goal - node.labelOpacity) * kl;
      if (Math.abs(goal - node.labelOpacity) > 0.01) busy = true;
      else node.labelOpacity = goal;
      writeLabel(node, x, y);
    }
    return busy;
  }

  function priority(node: Node, highlight: Node | null) {
    const rank = node === selected ? 4 : node === highlight ? 3 : node.state === 'related' ? 2 : 1;
    return rank + node.z * 0.5 + (node.count / maxCount) * 0.3;
  }

  function visibility(node: Node, highlight: Node | null) {
    if (node === selected) return Math.max(0.55, smooth(-0.7, 0.1, node.z));
    if (node === highlight) return Math.max(0.6, smooth(-0.7, 0.1, node.z));
    if (node.state === 'related') return smooth(-0.35, 0.2, node.z);
    return smooth(-0.05, 0.45, node.z) * 0.9;
  }

  function writeLabel(node: Node, x: number, y: number) {
    const style = node.label.style;
    if (node.labelOpacity < 0.02) {
      if (node.labelShown) {
        style.visibility = 'hidden';
        node.labelShown = false;
      }
      return;
    }
    if (!node.labelShown) {
      style.visibility = 'visible';
      node.labelShown = true;
    }
    // Whole device pixels keep the text crisp.
    const px = Math.round(x * ratio) / ratio;
    const py = Math.round(y * ratio) / ratio;
    if (px !== node.labelX || py !== node.labelY) {
      style.transform = `translate(${px}px, ${py}px)`;
      node.labelX = px;
      node.labelY = py;
    }
    const opacity = node.labelOpacity > 0.99 ? '1' : node.labelOpacity.toFixed(2);
    if (style.opacity !== opacity) style.opacity = opacity;
  }

  function measure() {
    for (const node of nodes) {
      node.labelWidth = node.label.offsetWidth;
      node.labelHeight = node.label.offsetHeight;
    }
  }

  function resize() {
    width = container.clientWidth;
    height = container.clientHeight;
    if (!width || !height) return;
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    // Fit the globe's outline, leaving room around it for the labels.
    const outlineRadius = Math.max(
      70,
      Math.min(height / 2 - 34, width / 2 - Math.min(58, width * 0.1)),
    );
    focal = outlineRadius * Math.sqrt(DISTANCE * DISTANCE - 1);
    camera.aspect = width / height;
    camera.fov = (2 * Math.atan(height / 2 / focal) * 180) / Math.PI;
    camera.updateProjectionMatrix();
    for (const material of lineMaterials) material.resolution.set(width, height);
    measure();
    if (frame) return;
    // Draw straight away, so the canvas is never shown blank or stretched.
    last = 0;
    if (onScreen && !document.hidden && !lost) tick(performance.now());
  }

  // Pointer: drag to turn (with a little glide), click or tap to pick, hover to highlight.
  function local(event: PointerEvent) {
    const rect = container.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top] as const;
  }

  function onPointerDown(event: PointerEvent) {
    if (pointer || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const [x, y] = local(event);
    pointer = {
      id: event.pointerId,
      type: event.pointerType,
      x,
      y,
      startX: x,
      startY: y,
      time: event.timeStamp,
      dragging: false,
    };
    velocity.yaw = velocity.pitch = 0;
    lastInteraction = performance.now();
    try {
      container.setPointerCapture(event.pointerId);
    } catch {
      // The pointer is already gone.
    }
    schedule();
  }

  function onPointerMove(event: PointerEvent) {
    const [x, y] = local(event);
    if (pointer && event.pointerId === pointer.id) {
      if (!pointer.dragging) {
        const threshold = pointer.type === 'mouse' ? 4 : 8;
        if (Math.hypot(x - pointer.startX, y - pointer.startY) < threshold) return;
        pointer.dragging = true;
        ease = null;
        spin = 0;
        setHovered(null);
        container.classList.add('is-dragging');
      }
      // The point under the finger follows it.
      const perPixel = (DISTANCE - 1) / focal;
      const yaw = (x - pointer.x) * perPixel;
      const pitch = (y - pointer.y) * perPixel;
      rotateBy(yaw, pitch);
      const dt = Math.max(event.timeStamp - pointer.time, 4) / 1000;
      const blend = Math.min(1, dt / 0.05);
      velocity.yaw += (yaw / dt - velocity.yaw) * blend;
      velocity.pitch += (pitch / dt - velocity.pitch) * blend;
      const speed = Math.hypot(velocity.yaw, velocity.pitch);
      if (speed > 5) {
        velocity.yaw *= 5 / speed;
        velocity.pitch *= 5 / speed;
      }
      pointer.x = x;
      pointer.y = y;
      pointer.time = event.timeStamp;
      lastInteraction = performance.now();
      schedule();
      return;
    }
    if (event.pointerType === 'mouse' && !pointer) setHovered(hitTest(x, y, false));
  }

  function release(event: PointerEvent, cancelled: boolean) {
    if (!pointer || event.pointerId !== pointer.id) return;
    const { dragging, type, time } = pointer;
    pointer = null;
    container.classList.remove('is-dragging');
    if (container.hasPointerCapture(event.pointerId))
      container.releasePointerCapture(event.pointerId);
    lastInteraction = performance.now();
    const [x, y] = local(event);
    if (dragging) {
      // A drag that stopped before letting go doesn't glide.
      if (reduced || cancelled || event.timeStamp - time > 90) velocity.yaw = velocity.pitch = 0;
    } else if (!cancelled) {
      const node = hitTest(x, y, type !== 'mouse');
      if (node) {
        if (node === selected) bringToFront(node);
        options.onPick(node.name);
      }
    }
    if (type === 'mouse') setHovered(hitTest(x, y, false));
    schedule();
  }
  const onPointerUp = (event: PointerEvent) => release(event, false);
  const onPointerCancel = (event: PointerEvent) => release(event, true);

  function onPointerEnter(event: PointerEvent) {
    if (event.pointerType === 'mouse') pointerInside = true;
  }
  function onPointerLeave(event: PointerEvent) {
    if (event.pointerType !== 'mouse') return;
    pointerInside = false;
    if (!pointer) setHovered(null);
    schedule();
  }

  function onVisibility() {
    if (document.hidden) pause();
    else schedule();
  }
  function onMotion() {
    reduced = motion.matches;
    if (reduced) {
      ease = null;
      spin = 0;
      velocity.yaw = velocity.pitch = 0;
      for (const arc of arcs) arc.geometry.instanceCount = ARC_POINTS - 1;
    }
    schedule();
  }
  function onContextLost(event: Event) {
    event.preventDefault();
    lost = true;
    pause();
  }
  function onContextRestored() {
    lost = false;
    schedule();
  }

  container.addEventListener('pointerdown', onPointerDown);
  container.addEventListener('pointermove', onPointerMove);
  container.addEventListener('pointerup', onPointerUp);
  container.addEventListener('pointercancel', onPointerCancel);
  container.addEventListener('pointerenter', onPointerEnter);
  container.addEventListener('pointerleave', onPointerLeave);
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);
  document.addEventListener('visibilitychange', onVisibility);
  motion.addEventListener('change', onMotion);

  // Only render while the globe is on screen.
  const intersection = new IntersectionObserver(
    (entries) => {
      const entry = entries[entries.length - 1];
      if (!entry) return;
      onScreen = entry.isIntersecting;
      // The dots arrive once a good part of the globe is in view.
      if (onScreen && !introStart && entry.intersectionRatio >= 0.3) {
        introStart = performance.now();
        ringStart = introStart + 600;
      }
      if (onScreen) schedule();
      else pause();
    },
    { threshold: [0, 0.3, 0.6] },
  );
  intersection.observe(container);
  const resizing = new ResizeObserver(() => resize());
  resizing.observe(container);
  void document.fonts?.ready.then(() => {
    if (disposed) return;
    measure();
    schedule();
  });

  // Start with the given technology at the front.
  const initial = options.selected ? byName.get(options.selected) : undefined;
  if (initial) {
    selected = initial;
    orientation.copy(facing(initial));
  }
  applyStates();
  buildArcs();
  resize();

  return {
    select(name) {
      const node = (name && byName.get(name)) || null;
      if (node === selected) return;
      selected = node;
      ringStart = performance.now();
      lastInteraction = ringStart;
      applyStates();
      buildArcs();
      if (node) bringToFront(node);
      schedule();
    },
    hover(name) {
      const node = (name && byName.get(name)) || null;
      if (node === hinted) return;
      hinted = node;
      updateLabelClasses();
      schedule();
    },
    resize,
    dispose() {
      if (disposed) return;
      disposed = true;
      pause();
      clearTimeout(wake);
      intersection.disconnect();
      resizing.disconnect();
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointercancel', onPointerCancel);
      container.removeEventListener('pointerenter', onPointerEnter);
      container.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      document.removeEventListener('visibilitychange', onVisibility);
      motion.removeEventListener('change', onMotion);
      container.classList.remove('is-dragging', 'is-pointing');
      clearArcs();
      for (const node of nodes) node.mesh.material.dispose();
      dotGeometry.dispose();
      ringGeometry.dispose();
      outlineGeometry.dispose();
      for (const material of lineMaterials) material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      labels.remove();
    },
  };
}
