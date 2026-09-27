import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { palette } from "@/lib/palette";
import { usePartyStore } from "@/lib/party-store";

const CANDLES: Array<[number, number]> = [
  [0, 0],
  [0.16, 0.09],
  [-0.15, 0.1],
  [0.08, -0.16],
  [-0.1, -0.14],
  [0.2, -0.04],
  [-0.2, -0.02],
];

function Drips({ radius, y, color }: { radius: number; y: number; color: string }) {
  const offsets = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2 + 0.12;
        return [Math.cos(a) * radius, y, Math.sin(a) * radius] as [number, number, number];
      }),
    [radius, y],
  );

  return (
    <group>
      {offsets.map((pos, i) => (
        <mesh key={i} position={pos} scale={[1, 1.35 + (i % 3) * 0.2, 1]}>
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshStandardMaterial color={color} roughness={0.42} />
        </mesh>
      ))}
    </group>
  );
}

function Candle({ x, z, delay }: { x: number; z: number; delay: number }) {
  const flame = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const candlesLit = usePartyStore((s) => s.candlesLit);
  const reduced = usePartyStore((s) => s.reducedMotion);

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.1);
    const t = state.clock.elapsedTime;
    const flicker = reduced ? 1 : 0.85 + Math.sin(t * 11 + delay) * 0.12 + Math.sin(t * 17 + delay) * 0.06;
    const target = candlesLit ? 1 : 0;
    if (flame.current) {
      const s = THREE.MathUtils.damp(flame.current.scale.y, target, 8, d);
      flame.current.scale.set(s * flicker, s * flicker, s * flicker);
      flame.current.visible = s > 0.02;
    }
    if (light.current) {
      light.current.intensity = THREE.MathUtils.damp(light.current.intensity, candlesLit ? 0.28 * flicker : 0, 8, d);
    }
  });

  return (
    <group position={[x, 1.58, z]}>
      <mesh>
        <cylinderGeometry args={[0.028, 0.03, 0.28, 10]} />
        <meshStandardMaterial color="#F7EDE6" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 0.05, 6]} />
        <meshStandardMaterial color="#5a4038" />
      </mesh>
      <group ref={flame} position={[0, 0.24, 0]}>
        <mesh>
          <coneGeometry args={[0.032, 0.12, 8]} />
          <meshBasicMaterial color={palette.flame} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.01, 0]} scale={0.55}>
          <coneGeometry args={[0.028, 0.08, 8]} />
          <meshBasicMaterial color={palette.flameCore} toneMapped={false} />
        </mesh>
      </group>
      <pointLight ref={light} color="#ffb07a" distance={2.4} intensity={0.28} />
    </group>
  );
}

export function Cake() {
  const group = useRef<THREE.Group>(null);
  const blowCandles = usePartyStore((s) => s.blowCandles);
  const candlesLit = usePartyStore((s) => s.candlesLit);

  useFrame((state) => {
    if (!group.current) return;
    const mx = state.pointer.x * 0.12;
    const my = state.pointer.y * 0.06;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, mx, 0.04);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -my, 0.04);
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <cylinderGeometry args={[1.42, 1.46, 0.08, 48]} />
        <meshStandardMaterial color="#F7EDE6" roughness={0.35} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.38, 1.5, 48]} />
        <meshStandardMaterial color={palette.gold} metalness={0.78} roughness={0.28} />
      </mesh>

      <mesh position={[0, 0.36, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.08, 1.1, 0.52, 48]} />
        <meshStandardMaterial color={palette.frosting} roughness={0.48} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <torusGeometry args={[1.08, 0.045, 10, 48]} />
        <meshStandardMaterial color="#F7EDE6" roughness={0.4} />
      </mesh>
      <Drips radius={1.06} y={0.58} color={palette.frosting} />

      <mesh position={[0, 0.88, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.78, 0.8, 0.46, 48]} />
        <meshStandardMaterial color="#F8E4EA" roughness={0.46} />
      </mesh>
      <mesh position={[0, 1.11, 0]}>
        <torusGeometry args={[0.78, 0.04, 10, 48]} />
        <meshStandardMaterial color={palette.gold} metalness={0.7} roughness={0.32} />
      </mesh>
      <Drips radius={0.76} y={1.08} color="#F8E4EA" />

      <mesh position={[0, 1.36, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.52, 0.42, 40]} />
        <meshStandardMaterial color="#F3D1DA" roughness={0.44} />
      </mesh>
      <mesh position={[0, 1.56, 0]}>
        <torusGeometry args={[0.5, 0.035, 10, 40]} />
        <meshStandardMaterial color="#F7EDE6" roughness={0.38} />
      </mesh>

      {CANDLES.map(([x, z], i) => (
        <Candle key={i} x={x} z={z} delay={i * 0.7} />
      ))}

      <mesh
        position={[0, 0.9, 0]}
        visible={false}
        onClick={(event) => {
          event.stopPropagation();
          if (candlesLit) blowCandles();
        }}
        onPointerOver={() => {
          document.body.style.cursor = candlesLit ? "pointer" : "default";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        <cylinderGeometry args={[1.2, 1.2, 2.0, 16]} />
      </mesh>
    </group>
  );
}
