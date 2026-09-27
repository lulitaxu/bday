import { Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import * as THREE from "three";
import { palette } from "@/lib/palette";
import { usePartyStore } from "@/lib/party-store";
import { Scene } from "@/components/party/scene";

function LoadingReporter() {
  const { active, progress, loaded, total } = useProgress();
  const setLoadProgress = usePartyStore((s) => s.setLoadProgress);
  const setReady = usePartyStore((s) => s.setReady);
  const started = useRef(typeof performance === "undefined" ? 0 : performance.now());

  useEffect(() => {
    setLoadProgress(total === 0 ? 18 : Math.max(18, progress));
  }, [progress, total, setLoadProgress]);

  useEffect(() => {
    const fallback = window.setTimeout(() => {
      setLoadProgress(100);
      setReady(true);
    }, 7000);
    return () => window.clearTimeout(fallback);
  }, [setLoadProgress, setReady]);

  useEffect(() => {
    const texturesReady = !active && loaded > 0 && loaded >= total;
    if (!texturesReady) return;
    const remain = Math.max(0, 1200 - (performance.now() - started.current));
    const id = window.setTimeout(() => {
      setLoadProgress(100);
      setReady(true);
    }, remain);
    return () => window.clearTimeout(id);
  }, [active, loaded, total, setLoadProgress, setReady]);

  return null;
}

export default function PartyCanvas() {
  const dismissNote = usePartyStore((s) => s.dismissNote);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const dpr: [number, number] = isMobile ? [1, 1.1] : [1, 1.6];

  return (
    <div className="absolute inset-0">
      <Canvas
        shadows={!isMobile}
        dpr={dpr}
        camera={{ position: [0.4, 2.15, 5.5], fov: isMobile ? 48 : 42, near: 0.1, far: 40 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        style={{ touchAction: "none" }}
        onPointerMissed={() => dismissNote()}
        onCreated={({ gl }) => {
          gl.setClearColor(palette.scene);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = isMobile ? 0.98 : 1.05;
        }}
      >
        <LoadingReporter />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
