import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { palette } from "@/lib/palette";
import { subscribeBurst } from "@/lib/party-fx";
import { usePartyStore } from "@/lib/party-store";

const COUNT = 320;
const COLORS = [palette.blush, palette.gold, palette.lavender, palette.cream, palette.rose];

function hexToRgb(hex: string): [number, number, number] {
  const v = hex.replace("#", "");
  const n = parseInt(v, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function Confetti() {
  const reduced = usePartyStore((s) => s.reducedMotion);
  const geo = useMemo(() => new THREE.BufferGeometry(), []);
  const positions = useMemo(() => new Float32Array(COUNT * 3), []);
  const colors = useMemo(() => new Float32Array(COUNT * 3), []);
  const velocities = useRef(new Float32Array(COUNT * 3));
  const spins = useRef(new Float32Array(COUNT));

  const reset = (i: number, origin?: { x: number; y: number; z: number }, burst = false) => {
    const ix = i * 3;
    if (burst && origin) {
      positions[ix] = origin.x;
      positions[ix + 1] = origin.y;
      positions[ix + 2] = origin.z;
      velocities.current[ix] = (Math.random() - 0.5) * 4.2;
      velocities.current[ix + 1] = Math.random() * 3.4 + 1.1;
      velocities.current[ix + 2] = (Math.random() - 0.5) * 4.2;
    } else {
      positions[ix] = (Math.random() - 0.5) * 12;
      positions[ix + 1] = 3 + Math.random() * 6;
      positions[ix + 2] = (Math.random() - 0.5) * 10;
      velocities.current[ix] = (Math.random() - 0.5) * 0.25;
      velocities.current[ix + 1] = -0.35 - Math.random() * 0.45;
      velocities.current[ix + 2] = (Math.random() - 0.5) * 0.25;
    }
    const [r, g, b] = hexToRgb(COLORS[i % COLORS.length]);
    colors[ix] = r;
    colors[ix + 1] = g;
    colors[ix + 2] = b;
    spins.current[i] = Math.random() * Math.PI * 2;
  };

  useMemo(() => {
    for (let i = 0; i < COUNT; i += 1) reset(i);
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  }, [geo, positions, colors]);

  useEffect(() => {
    return subscribeBurst((burst) => {
      const n = burst.n ?? 40;
      let used = 0;
      for (let i = 0; i < COUNT && used < n; i += 1) {
        if (positions[i * 3 + 1] < 1.2 || used < n * 0.5) {
          reset(i, burst, true);
          used += 1;
        }
      }
    });
  }, [positions]);

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.1);
    const gravity = reduced ? 0.6 : 1.65;
    for (let i = 0; i < COUNT; i += 1) {
      const ix = i * 3;
      velocities.current[ix + 1] -= gravity * d;
      positions[ix] += velocities.current[ix] * d;
      positions[ix + 1] += velocities.current[ix + 1] * d;
      positions[ix + 2] += velocities.current[ix + 2] * d;
      if (positions[ix + 1] < -0.2) reset(i);
    }
    const attr = geo.getAttribute("position");
    attr.needsUpdate = true;
  });

  return (
    <points geometry={geo}>
      <pointsMaterial
        size={reduced ? 0.045 : 0.07}
        vertexColors
        transparent
        opacity={0.9}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

export function AmbientSparkles() {
  const reduced = usePartyStore((s) => s.reducedMotion);
  return (
    <>
      <Sparkles
        count={reduced ? 18 : 48}
        scale={[10, 5, 10]}
        size={2.4}
        speed={reduced ? 0.1 : 0.35}
        opacity={0.55}
        color="#F7EDE6"
        position={[0, 2.4, 0]}
      />
      <Sparkles
        count={reduced ? 10 : 24}
        scale={[8, 3.5, 8]}
        size={3.2}
        speed={reduced ? 0.08 : 0.22}
        opacity={0.45}
        color={palette.gold}
        position={[0, 1.8, 0]}
      />
    </>
  );
}

function heartShape() {
  const s = new THREE.Shape();
  s.moveTo(0, 0.32);
  s.bezierCurveTo(0, 0.52, -0.38, 0.7, -0.46, 0.38);
  s.bezierCurveTo(-0.62, 0.02, -0.12, -0.18, 0, -0.5);
  s.bezierCurveTo(0.12, -0.18, 0.62, 0.02, 0.46, 0.38);
  s.bezierCurveTo(0.38, 0.7, 0, 0.52, 0, 0.32);
  return s;
}

const HEARTS: Array<[number, number, number, number, string]> = [
  [-1.8, 2.6, 1.2, 0.22, palette.blush],
  [2.1, 3.1, -1.4, 0.18, palette.rose],
  [-0.6, 3.4, -2.2, 0.14, palette.lavender],
  [1.4, 2.4, 2.0, 0.16, palette.gold],
  [-2.6, 2.9, -0.3, 0.12, "#F7EDE6"],
  [0.8, 3.6, 0.6, 0.2, palette.blush],
];

export function FloatingHearts() {
  const geometry = useMemo(
    () => new THREE.ExtrudeGeometry(heartShape(), { depth: 0.08, bevelEnabled: false }),
    [],
  );
  const reduced = usePartyStore((s) => s.reducedMotion);
  const chapter = usePartyStore((s) => s.chapter);
  const stage = usePartyStore((s) => s.stage);

  return (
    <group>
      {HEARTS.map(([x, y, z, s, color], i) => (
        <HeartMesh
          key={i}
          geometry={geometry}
          position={[x, y, z]}
          scale={s}
          color={color}
          seed={i}
          reduced={reduced}
          boosted={stage === "party" && chapter === "wishes"}
        />
      ))}
    </group>
  );
}

function HeartMesh({
  geometry,
  position,
  scale,
  color,
  seed,
  reduced,
  boosted,
}: {
  geometry: THREE.ExtrudeGeometry;
  position: [number, number, number];
  scale: number;
  color: string;
  seed: number;
  reduced: boolean;
  boosted: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const amp = reduced ? 0.02 : boosted ? 0.18 : 0.08;
    ref.current.position.y = position[1] + Math.sin(t * 0.7 + seed) * amp;
    ref.current.rotation.y = t * (reduced ? 0.1 : 0.35) + seed;
    const s = scale * (boosted ? 1.25 : 1);
    ref.current.scale.setScalar(s);
  });
  return (
    <mesh ref={ref} geometry={geometry} position={position} scale={scale}>
      <meshStandardMaterial color={color} roughness={0.35} metalness={0.15} />
    </mesh>
  );
}
