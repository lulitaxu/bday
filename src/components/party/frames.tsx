import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { MEMORY_PATHS } from "@/lib/party-content";
import { usePartyStore } from "@/lib/party-store";

const PLACEMENTS: Array<{
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}> = [
  { position: [-3.15, 1.65, 0.55], rotation: [0.05, 0.55, -0.06], scale: 1 },
  { position: [-3.55, 2.35, -0.85], rotation: [0.02, 0.7, 0.05], scale: 0.92 },
  { position: [-2.35, 2.85, -1.85], rotation: [0.08, 0.35, -0.04], scale: 0.86 },
  { position: [-1.15, 2.15, -2.45], rotation: [0.04, 0.15, 0.06], scale: 0.95 },
  { position: [-3.7, 1.35, 1.65], rotation: [-0.04, 0.85, 0.03], scale: 0.8 },
  { position: [-2.2, 3.15, -0.45], rotation: [0.1, 0.48, -0.08], scale: 0.74 },
];

const tmpScale = new THREE.Vector3(1, 1, 1);

function Polaroid({
  index,
  texture,
}: {
  index: number;
  texture: THREE.Texture;
}) {
  const group = useRef<THREE.Group>(null);
  const hovered = useRef(false);
  const setSelectedMemory = usePartyStore((s) => s.setSelectedMemory);
  const reduced = usePartyStore((s) => s.reducedMotion);
  const placement = PLACEMENTS[index];

  useFrame((state, delta) => {
    const mesh = group.current;
    if (!mesh) return;
    const d = Math.min(delta, 0.1);
    const t = state.clock.elapsedTime;
    const floatY = reduced ? 0 : Math.sin(t * 0.55 + index) * 0.08;
    mesh.position.y = THREE.MathUtils.damp(mesh.position.y, placement.position[1] + floatY, 4, d);
    const s = hovered.current ? 1.12 : 1;
    mesh.scale.lerp(tmpScale.setScalar(placement.scale * s), 1 - Math.exp(-8 * d));
  });

  return (
    <group
      ref={group}
      position={placement.position}
      rotation={placement.rotation}
      scale={placement.scale}
      onClick={(event) => {
        event.stopPropagation();
        setSelectedMemory(index);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        hovered.current = true;
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        hovered.current = false;
        document.body.style.cursor = "default";
      }}
    >
      <mesh castShadow>
        <boxGeometry args={[1.12, 1.42, 0.04]} />
        <meshStandardMaterial color="#FFFAF6" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.12, 0.024]}>
        <planeGeometry args={[0.96, 1.12]} />
        <meshStandardMaterial map={texture} roughness={0.7} />
      </mesh>
    </group>
  );
}

export function Frames() {
  const textures = useTexture([...MEMORY_PATHS]);
  const prepared = useMemo(() => {
    const list = Array.isArray(textures) ? textures : [textures];
    list.forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
    });
    return list;
  }, [textures]);

  return (
    <group>
      {prepared.map((texture, index) => (
        <Polaroid key={MEMORY_PATHS[index]} index={index} texture={texture} />
      ))}
    </group>
  );
}
