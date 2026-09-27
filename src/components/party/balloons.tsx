import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { balloonColors } from "@/lib/palette";
import { usePartyStore } from "@/lib/party-store";

const tmp = new THREE.Vector3();
const mouse = new THREE.Vector3();

function makeBalloonGeometry() {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 18; i += 1) {
    const t = i / 18;
    const y = (1 - t) * 1.12;
    let r = 0.04;
    if (t < 0.08) r = 0.08 + t * 4.6;
    else if (t < 0.82) r = 0.46 * Math.sin(Math.PI * ((0.95 - t) / 0.95));
    pts.push(new THREE.Vector2(Math.max(r, 0.03), y));
  }
  const geometry = new THREE.LatheGeometry(pts, 28);
  geometry.computeVertexNormals();
  return geometry;
}

type BalloonSpec = {
  position: [number, number, number];
  color: string;
  scale: number;
  seed: number;
  metal: number;
};

const SPECS: BalloonSpec[] = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * Math.PI * 2 + (i % 3) * 0.18;
  const radius = 3.1 + (i % 5) * 0.42;
  const y = 2.1 + (i % 4) * 0.55 + (i % 2) * 0.2;
  return {
    position: [Math.cos(angle) * radius, y, Math.sin(angle) * radius - 0.4],
    color: balloonColors[i % balloonColors.length],
    scale: 0.72 + (i % 5) * 0.07,
    seed: i * 1.37,
    metal: i % 4 === 0 ? 0.55 : 0.08,
  };
});

function Balloon({ spec, geometry }: { spec: BalloonSpec; geometry: THREE.LatheGeometry }) {
  const group = useRef<THREE.Group>(null);
  const reduced = usePartyStore((s) => s.reducedMotion);

  useFrame((state, delta) => {
    const mesh = group.current;
    if (!mesh) return;
    const d = Math.min(delta, 0.1);
    const t = state.clock.elapsedTime;
    const floatX = reduced ? 0 : Math.sin(t * 0.45 + spec.seed) * 0.16;
    const floatY = reduced ? 0 : Math.sin(t * 0.62 + spec.seed * 1.7) * 0.18;
    const floatZ = reduced ? 0 : Math.cos(t * 0.38 + spec.seed) * 0.12;
    const px = spec.position[0] + floatX;
    const py = spec.position[1] + floatY;
    const pz = spec.position[2] + floatZ;
    tmp.set(px, py, pz);

    if (!reduced) {
      mouse.set(state.pointer.x * 4.2, 2.2 + state.pointer.y * 2.2, 1.4);
      const dist = tmp.distanceTo(mouse);
      if (dist < 2.1 && dist > 0.001) {
        const force = ((2.1 - dist) / 2.1) * 0.85;
        tmp.sub(mouse).normalize();
        tmp.set(px + tmp.x * force, py + tmp.y * force * 0.45, pz + tmp.z * force);
      }
    }

    mesh.position.lerp(tmp, 1 - Math.exp(-3.2 * d));
    mesh.rotation.z = Math.sin(t * 0.5 + spec.seed) * 0.08;
    mesh.rotation.x = Math.cos(t * 0.4 + spec.seed) * 0.05;
  });

  return (
    <group ref={group} position={spec.position} scale={spec.scale}>
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial
          color={spec.color}
          roughness={0.18}
          metalness={spec.metal}
          envMapIntensity={0.9}
        />
      </mesh>
      <mesh position={[0, -0.04, 0]}>
        <sphereGeometry args={[0.055, 12, 12]} />
        <meshStandardMaterial color={spec.color} roughness={0.3} metalness={0.15} />
      </mesh>
      <mesh position={[0, -0.62, 0]}>
        <cylinderGeometry args={[0.007, 0.007, 1.12, 6]} />
        <meshBasicMaterial color="#d4c0b6" transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

export function Balloons() {
  const geometry = useMemo(() => makeBalloonGeometry(), []);
  const count = typeof window !== "undefined" && window.innerWidth < 640 ? 10 : SPECS.length;
  const specs = SPECS.slice(0, count);

  return (
    <group>
      {specs.map((spec) => (
        <Balloon key={spec.seed} spec={spec} geometry={geometry} />
      ))}
    </group>
  );
}
