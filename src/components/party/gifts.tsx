import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GIFTS } from "@/lib/party-content";
import { emitBurst } from "@/lib/party-fx";
import { usePartyStore } from "@/lib/party-store";

function GiftBox({ gift }: { gift: (typeof GIFTS)[number] }) {
  const group = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const openGift = usePartyStore((s) => s.openGift);
  const opened = usePartyStore((s) => Boolean(s.openedGifts[gift.id]));
  const hovered = useRef(false);

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.1);
    if (group.current) {
      const target = hovered.current || opened ? 1.08 : 1;
      const s = THREE.MathUtils.damp(group.current.scale.x, target, 8, d);
      group.current.scale.setScalar(s);
      group.current.position.y = THREE.MathUtils.damp(
        group.current.position.y,
        hovered.current ? 0.08 : 0,
        6,
        d,
      );
    }
    if (lid.current) {
      const rot = opened ? -Math.PI * 0.72 : 0;
      lid.current.rotation.x = THREE.MathUtils.damp(lid.current.rotation.x, rot, 6, d);
      lid.current.position.z = THREE.MathUtils.damp(lid.current.position.z, opened ? -0.12 : 0, 6, d);
    }
  });

  const [w, h, depth] = gift.size;

  return (
    <group
      ref={group}
      position={gift.position}
      rotation={[0, gift.rotation, 0]}
      onClick={(event) => {
        event.stopPropagation();
        if (!opened) {
          emitBurst({ x: gift.position[0], y: h + 0.35, z: gift.position[2], n: 55 });
        }
        openGift(gift.id);
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
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, depth]} />
        <meshStandardMaterial color={gift.color} roughness={0.38} metalness={0.08} />
      </mesh>
      <mesh position={[0, h / 2 + 0.01, 0]}>
        <boxGeometry args={[0.1, h + 0.02, depth + 0.01]} />
        <meshStandardMaterial color={gift.ribbon} metalness={0.55} roughness={0.3} />
      </mesh>
      <mesh position={[0, h / 2 + 0.01, 0]}>
        <boxGeometry args={[w + 0.01, h + 0.02, 0.1]} />
        <meshStandardMaterial color={gift.ribbon} metalness={0.55} roughness={0.3} />
      </mesh>
      <group ref={lid} position={[0, h, 0]}>
        <mesh position={[0, 0.05, 0]} castShadow>
          <boxGeometry args={[w + 0.04, 0.1, depth + 0.04]} />
          <meshStandardMaterial color={gift.color} roughness={0.34} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.16, 0]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color={gift.ribbon} metalness={0.6} roughness={0.28} />
        </mesh>
        <mesh position={[0.08, 0.18, 0]} rotation={[0, 0, 0.7]}>
          <torusGeometry args={[0.07, 0.015, 8, 16, Math.PI]} />
          <meshStandardMaterial color={gift.ribbon} metalness={0.6} roughness={0.28} />
        </mesh>
        <mesh position={[-0.08, 0.18, 0]} rotation={[0, 0, -0.7]}>
          <torusGeometry args={[0.07, 0.015, 8, 16, Math.PI]} />
          <meshStandardMaterial color={gift.ribbon} metalness={0.6} roughness={0.28} />
        </mesh>
      </group>
    </group>
  );
}

export function Gifts() {
  return (
    <group>
      {GIFTS.map((gift) => (
        <GiftBox key={gift.id} gift={gift} />
      ))}
    </group>
  );
}
