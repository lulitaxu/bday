import { lazy, Suspense, useEffect, useSyncExternalStore } from "react";
import { Overlays } from "@/components/party/overlays";
import { resumeAudio } from "@/lib/party-audio";

const PartyCanvas = lazy(() => import("@/components/party/canvas"));

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function PartyExperience() {
  const hydrated = useHydrated();

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") resumeAudio();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-scene text-ink antialiased">
      {hydrated ? (
        <Suspense fallback={null}>
          <PartyCanvas />
        </Suspense>
      ) : null}
      <Overlays />
    </main>
  );
}
