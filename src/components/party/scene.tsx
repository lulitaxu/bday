import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { palette } from "@/lib/palette";
import { usePartyStore } from "@/lib/party-store";
import { Cake } from "@/components/party/cake";
import { Balloons } from "@/components/party/balloons";
import { Gifts } from "@/components/party/gifts";
import { AmbientSparkles, Confetti, FloatingHearts } from "@/components/party/particles";

const CAM = {
  invite: { pos: [0.4, 2.15, 5.5], look: [0, 1.05, 0] },
  letter: { pos: [0.25, 2.45, 6.7], look: [0, 1.15, 0] },
  celebrate: { pos: [3.15, 2.15, 5.1], look: [0.55, 0.7, 0.35] },
  wishes: { pos: [0.15, 3.55, 8.4], look: [0, 1.45, 0] },
} as const;

function Lights() {
  return (
    <>
      <ambientLight intensity={0.72} color="#fff5ee" />
      <hemisphereLight args={["#f7e4ec", "#e7d3c6", 0.55]} />
      <directionalLight
        position={[4.2, 8.2, 5.2]}
        intensity={1.35}
        color="#fff6e8"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0002}
        shadow-camera-far={22}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
      />
      <pointLight position={[-3.2, 3.1, -1.8]} intensity={0.38} color={palette.blush} />
      <pointLight position={[3.4, 2.6, 2.1]} intensity={0.32} color={palette.gold} />
    </>
  );
}

function Floor() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[12, 80]} />
        <meshStandardMaterial color="#EEDDE4" roughness={0.88} metalness={0.06} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <ringGeometry args={[1.48, 1.66, 64]} />
        <meshStandardMaterial color={palette.gold} metalness={0.76} roughness={0.28} />
      </mesh>
      <ContactShadows position={[0, 0.02, 0]} opacity={0.32} scale={14} blur={2.4} far={6} />
    </>
  );
}

function NameSign() {
  const stage = usePartyStore((s) => s.stage);
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!group.current) return;
    const d = Math.min(delta, 0.1);
    const target = stage === "invite" ? 1 : 0.35;
    const s = THREE.MathUtils.damp(group.current.scale.x, target, 4, d);
    group.current.scale.setScalar(s);
    group.current.visible = s > 0.05;
  });

  return (
    <group ref={group} position={[0, 2.52, -2.85]}>
      <Text
        font={`${import.meta.env.BASE_URL}fonts/cormorant-600.woff`}
        fontSize={1.28}
        letterSpacing={0.16}
        color={palette.rose}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.012}
        outlineColor="#F7EDE6"
      >
        TASHA
      </Text>
    </group>
  );
}

function CameraDirector() {
  const dragging = useRef(false);
  const { camera, controls } = useThree();
  const stage = usePartyStore((s) => s.stage);
  const chapter = usePartyStore((s) => s.chapter);
  const look = useRef(new THREE.Vector3(0, 1, 0));
  const wantPos = useRef(new THREE.Vector3());
  const wantLook = useRef(new THREE.Vector3());

  useEffect(() => {
    const c = controls as unknown as {
      addEventListener?: (e: string, fn: () => void) => void;
      removeEventListener?: (e: string, fn: () => void) => void;
    } | null;
    if (!c?.addEventListener) return;
    const onStart = () => {
      dragging.current = true;
    };
    const onEnd = () => {
      dragging.current = false;
    };
    c.addEventListener("start", onStart);
    c.addEventListener("end", onEnd);
    return () => {
      c.removeEventListener?.("start", onStart);
      c.removeEventListener?.("end", onEnd);
    };
  }, [controls]);

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.1);
    const key = stage === "invite" ? "invite" : chapter;
    const preset = CAM[key];
    wantPos.current.set(preset.pos[0], preset.pos[1], preset.pos[2]);
    wantLook.current.set(preset.look[0], preset.look[1], preset.look[2]);
    const k = 1 - Math.exp(-1.55 * d);
    look.current.lerp(wantLook.current, k);
    const oc = controls as unknown as { target: THREE.Vector3; update: () => void } | null;
    if (oc?.target) oc.target.lerp(look.current, k);
    if (!dragging.current) camera.position.lerp(wantPos.current, k);
    oc?.update();
  });

  return null;
}

export function Scene() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const stage = usePartyStore((s) => s.stage);
  const reduced = usePartyStore((s) => s.reducedMotion);
  const locked = usePartyStore((s) => s.activeGift !== null || s.selectedMemory !== null);

  return (
    <>
      <color attach="background" args={[palette.scene]} />
      <fog attach="fog" args={[palette.scene, 11, 24]} />
      <Lights />
      <CameraDirector />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        autoRotate={stage === "invite" && !reduced}
        autoRotateSpeed={isMobile ? 0.22 : 0.35}
        minPolarAngle={Math.PI * 0.28}
        maxPolarAngle={Math.PI * 0.49}
        minDistance={isMobile ? 5.1 : 4.2}
        maxDistance={isMobile ? 9.5 : 11}
        enabled={!locked}
      />
      <Floor />
      <Cake />
      <Balloons />
      <Gifts />
      <NameSign />
      <FloatingHearts />
      <Confetti />
      <AmbientSparkles />
    </>
  );
}
