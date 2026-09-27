export type Burst = {
  x: number;
  y: number;
  z: number;
  n?: number;
};

type Listener = (burst: Burst) => void;

const listeners = new Set<Listener>();

export function emitBurst(burst: Burst) {
  listeners.forEach((listener) => listener(burst));
}

export function subscribeBurst(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
