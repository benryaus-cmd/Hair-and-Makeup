import * as THREE from 'three';

/**
 * Experimental mobile cloth for one gown and one blouse.
 * Each cloth is a connected, indexed mass-spring surface. The upper two rows
 * are pinned to its parent bone; lower rows retain their authored silhouette
 * with soft tethers, spring length constraints and damped Verlet integration.
 * No geometry or springs are allocated in the update loop.
 */
export type ClothTestMotion = {
  moving: boolean; speed: number; phase: number; dancing: boolean; sitting: boolean;
};
export type ClothTestLeg = { hip: THREE.Bone; knee: THREE.Bone; ankle: THREE.Bone };
export type ClothTestKind = 'gown' | 'top';

const TAU = Math.PI * 2;
const clamp = THREE.MathUtils.clamp;
const GOWN_SHAPE: [number, number, number][] = [
  [0, .05, .169], [.18, -.12, .19], [.47, -.38, .25],
  [.97, -.87, .405], [1, -.885, .397],
];
const TOP_SHAPE: [number, number, number][] = [
  [0, .40, .205], [.17, .34, .215], [.46, .23, .203],
  [.74, .12, .196], [1, .008, .23],
];

function shapeAt(profile: [number, number, number][], t: number) {
  for (let i = 1; i < profile.length; i++) {
    if (t <= profile[i][0]) {
      const a = profile[i - 1], b = profile[i];
      const f = (t - a[0]) / (b[0] - a[0]);
      return { y: THREE.MathUtils.lerp(a[1], b[1], f), radius: THREE.MathUtils.lerp(a[2], b[2], f) };
    }
  }
  const last = profile[profile.length - 1];
  return { y: last[1], radius: last[2] };
}

export function createClothTestRig(
  parent: THREE.Group,
  material: THREE.MeshStandardMaterial,
  kind: ClothTestKind,
  legs: ClothTestLeg[] = [],
) {
  const gown = kind === 'gown', segments = 32, rows = gown ? 22 : 13;
  const stride = segments, count = rows * segments, depth = gown ? .82 : .76;
  const rest = new Float32Array(count * 3);
  const previous = new Float32Array(count * 3);
  const pin = new Uint8Array(count);
  const rowFractions = new Float32Array(count);
  const theta = new Float32Array(count);
  const profile = gown ? GOWN_SHAPE : TOP_SHAPE;
  const triangles: number[] = [];
  type Spring = { a: number; b: number; len: number; stiffness: number };
  const springs: Spring[] = [];

  for (let row = 0; row < rows; row++) {
    const t = row / (rows - 1), section = shapeAt(profile, t);
    for (let s = 0; s < segments; s++) {
      const i = row * segments + s, off = 3 * i, angle = TAU * s / segments;
      const pleat = gown ? 1 + .035 * Math.sin(angle * 16) * t * t : 1;
      const r = section.radius * pleat;
      rest[off] = Math.sin(angle) * r;
      rest[off + 1] = section.y;
      rest[off + 2] = Math.cos(angle) * r * depth;
      theta[i] = angle; rowFractions[i] = t; pin[i] = row < 2 ? 1 : 0;
      if (row < rows - 1) {
        const a = i, b = row * segments + (s + 1) % segments;
        const c = (row + 1) * segments + s;
        const d = (row + 1) * segments + (s + 1) % segments;
        triangles.push(a, c, b, b, c, d);
      }
    }
  }

  const addSpring = (a: number, b: number, stiffness: number) => {
    const p = a * 3, q = b * 3;
    springs.push({ a, b, len: Math.hypot(rest[p] - rest[q], rest[p + 1] - rest[q + 1], rest[p + 2] - rest[q + 2]), stiffness });
  };
  for (let row = 0; row < rows; row++) for (let s = 0; s < segments; s++) {
    const a = row * segments + s, next = row * segments + (s + 1) % segments;
    addSpring(a, next, .65);
    if (row + 1 < rows) {
      addSpring(a, a + stride, .72);
      addSpring(a, (row + 1) * segments + (s + 1) % segments, .36);
      addSpring(next, a + stride, .36);
    }
    if (row + 2 < rows) addSpring(a, a + 2 * stride, .18);
  }

  const positions = rest.slice();
  previous.set(rest);
  const geometry = new THREE.BufferGeometry();
  const position = new THREE.BufferAttribute(positions, 3);
  position.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute('position', position);
  geometry.setIndex(triangles);
  geometry.computeVertexNormals();
  // Expand static bounds to include both gait and leg collision without
  // requiring Three to inspect every vertex for frustum checks each frame.
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, gown ? -.42 : .21, 0), gown ? 1.15 : .8);
  const fabric = new THREE.Mesh(geometry, material);
  fabric.name = gown ? 'Experimental flowing cloth gown' : 'Experimental flowing cloth top';
  fabric.castShadow = true; fabric.receiveShadow = true;
  material.side = THREE.DoubleSide;
  parent.add(fabric);

  const inverse = new THREE.Matrix4();
  const points = legs.map(() => ({ hip: new THREE.Vector3(), knee: new THREE.Vector3(), ankle: new THREE.Vector3() }));
  const updateLegs = () => {
    if (!gown) return;
    parent.updateWorldMatrix(true, false);
    inverse.copy(parent.matrixWorld).invert();
    for (let i = 0; i < legs.length; i++) {
      legs[i].hip.getWorldPosition(points[i].hip).applyMatrix4(inverse);
      legs[i].knee.getWorldPosition(points[i].knee).applyMatrix4(inverse);
      legs[i].ankle.getWorldPosition(points[i].ankle).applyMatrix4(inverse);
    }
  };

  const collideCapsule = (i: number, a: THREE.Vector3, b: THREE.Vector3, radius: number) => {
    const o = i * 3, px = positions[o], py = positions[o + 1], pz = positions[o + 2];
    const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
    const t = clamp(((px - a.x) * dx + (py - a.y) * dy + (pz - a.z) * dz) /
      Math.max(1e-8, dx * dx + dy * dy + dz * dz), 0, 1);
    let nx = px - (a.x + dx * t), ny = py - (a.y + dy * t), nz = pz - (a.z + dz * t);
    let d = Math.hypot(nx, ny, nz);
    if (d >= radius) return;
    if (d < 1e-6) { nx = Math.sin(theta[i]); ny = 0; nz = Math.cos(theta[i]); d = 1; }
    const push = (radius - d) / d;
    positions[o] += nx * push; positions[o + 1] += ny * push; positions[o + 2] += nz * push;
  };

  const constrain = () => {
    for (const spring of springs) {
      const p = spring.a * 3, q = spring.b * 3;
      const dx = positions[q] - positions[p], dy = positions[q + 1] - positions[p + 1], dz = positions[q + 2] - positions[p + 2];
      const distance = Math.hypot(dx, dy, dz);
      if (distance < 1e-7) continue;
      const aFree = pin[spring.a] ? 0 : 1, bFree = pin[spring.b] ? 0 : 1;
      if (!aFree && !bFree) continue;
      const factor = spring.stiffness * (distance - spring.len) / (distance * (aFree + bFree));
      const x = dx * factor, y = dy * factor, z = dz * factor;
      if (aFree) { positions[p] += x; positions[p + 1] += y; positions[p + 2] += z; }
      if (bFree) { positions[q] -= x; positions[q + 1] -= y; positions[q + 2] -= z; }
    }
    for (let i = 0; i < count; i++) {
      const o = i * 3;
      if (pin[i]) { positions[o] = rest[o]; positions[o + 1] = rest[o + 1]; positions[o + 2] = rest[o + 2]; continue; }
      const t = rowFractions[i];
      // The authored gown stays a bell, not an elastic cone or a collapsed tube.
      const r = Math.hypot(positions[o], positions[o + 2] / depth);
      const restR = Math.hypot(rest[o], rest[o + 2] / depth);
      const lo = restR * (gown ? 1 - .13 * t : .87);
      const hi = restR * (gown ? 1 + .33 * t : 1 + .27 * t);
      if (r > 1e-7) {
        const scale = clamp(r, lo, hi) / r;
        positions[o] *= scale; positions[o + 2] *= scale;
      }
      positions[o + 1] = clamp(positions[o + 1], rest[o + 1] - (gown ? .105 : .065), rest[o + 1] + (gown ? .16 : .08));
      if (gown) {
        for (const leg of points) {
          collideCapsule(i, leg.hip, leg.knee, .092);
          collideCapsule(i, leg.knee, leg.ankle, .065);
        }
        // Floor clearance in local pelvis space for the typical grounded stance.
        positions[o + 1] = Math.max(-.895, positions[o + 1]);
      }
    }
  };

  const reset = () => {
    positions.set(rest); previous.set(rest);
    position.needsUpdate = true;
    geometry.computeVertexNormals();
  };
  const update = (dt: number, motion: ClothTestMotion, snap = false) => {
    if (snap) reset();
    const step = Number.isFinite(dt) ? clamp(dt, 0, .05) : 0;
    if (step <= 0) return;
    updateLegs();
    const substeps = Math.max(1, Math.ceil(step / (1 / 60))), h = step / substeps;
    const pace = motion.moving ? clamp(motion.speed / 4.5, 0, 1) : 0;
    const energy = Math.max(pace, motion.dancing ? .85 : 0);
    const phase = Number.isFinite(motion.phase) ? motion.phase : 0;
    for (let sub = 0; sub < substeps; sub++) {
      for (let i = 0; i < count; i++) {
        if (pin[i]) continue;
        const o = i * 3, t = rowFractions[i], angle = theta[i];
        const x = positions[o], y = positions[o + 1], z = positions[o + 2];
        const damping = gown ? .927 : .895;
        const f = energy * t * t, inertia = gown ? 7.5 : 5.5;
        const ax = Math.sin(phase + angle * .7) * f * inertia;
        const az = Math.cos(phase + angle * .45) * f * inertia * .72;
        positions[o] = x + (x - previous[o]) * damping + ax * h * h;
        positions[o + 1] = y + (y - previous[o + 1]) * damping - (gown ? 1.75 : .7) * h * h;
        positions[o + 2] = z + (z - previous[o + 2]) * damping + az * h * h;
        previous[o] = x; previous[o + 1] = y; previous[o + 2] = z;
        // Shape-memory tethers gradually recover the design when standing still;
        // unlike a procedural sine morph, displacement persists after each step.
        const tether = (gown ? .025 : .042) * (1 - .55 * t);
        positions[o] += (rest[o] - positions[o]) * tether;
        positions[o + 1] += (rest[o + 1] - positions[o + 1]) * tether * .65;
        positions[o + 2] += (rest[o + 2] - positions[o + 2]) * tether;
      }
      constrain(); constrain();
    }
    position.needsUpdate = true;
    geometry.computeVertexNormals();
  };
  return { mesh: fabric, update, reset };
}
