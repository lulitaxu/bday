import { create } from "zustand";
import { emitBurst } from "@/lib/party-fx";
import { playBlow, playChime, startMusic, stopMusic, unlockAudio } from "@/lib/party-audio";

export type Stage = "invite" | "party";
export type Chapter = "letter" | "celebrate" | "memories" | "wishes";

const LETTER_KEY = "tasha-birthday-letter";

export const DEFAULT_LETTER = `Tasha,

I still don't have the right words for what it is to know you — only the feeling. It's the late-night voice notes. The way you walk into a room and the air gets warmer. The way you love people like it's the easiest thing in the world.

You are my favorite homegirl. The one I call first. The one who makes ordinary Tuesdays feel like a secret celebration.

May this year be soft where you need rest, bright where you want to shine, and wildly kind to you in all the ways you are kind to everyone else.

Blow out the candles. Make the wish. I'm already cheering for it.

Always,
Your homegirl`;

function readLetter() {
  if (typeof window === "undefined") return DEFAULT_LETTER;
  const saved = window.localStorage.getItem(LETTER_KEY);
  return saved && saved.trim().length > 0 ? saved : DEFAULT_LETTER;
}

export type PartyState = {
  ready: boolean;
  loadProgress: number;
  stage: Stage;
  chapter: Chapter;
  musicOn: boolean;
  candlesLit: boolean;
  wishMade: boolean;
  openedGifts: Record<string, boolean>;
  activeGift: string | null;
  selectedMemory: number | null;
  message: string;
  reducedMotion: boolean;
  setReady: (value: boolean) => void;
  setLoadProgress: (value: number) => void;
  enterParty: () => void;
  setChapter: (chapter: Chapter) => void;
  toggleMusic: () => void;
  blowCandles: () => void;
  openGift: (id: string) => void;
  dismissNote: () => void;
  setSelectedMemory: (index: number | null) => void;
  setMessage: (value: string) => void;
};

export const usePartyStore = create<PartyState>((set, get) => ({
  ready: false,
  loadProgress: 8,
  stage: "invite",
  chapter: "letter",
  musicOn: true,
  candlesLit: true,
  wishMade: false,
  openedGifts: {},
  activeGift: null,
  selectedMemory: null,
  message: readLetter(),
  reducedMotion: false,
  setReady: (value) => set({ ready: value }),
  setLoadProgress: (value) => set({ loadProgress: Math.max(0, Math.min(100, value)) }),
  enterParty: () => {
    unlockAudio();
    playChime();
    if (get().musicOn) startMusic();
    emitBurst({ x: 0, y: 1.7, z: 0, n: 90 });
    set({ stage: "party", chapter: "letter" });
  },
  setChapter: (chapter) => set({ chapter, activeGift: null, selectedMemory: null }),
  toggleMusic: () => {
    const next = !get().musicOn;
    unlockAudio();
    if (next) startMusic();
    else stopMusic();
    set({ musicOn: next });
  },
  blowCandles: () => {
    if (!get().candlesLit) return;
    unlockAudio();
    playBlow();
    playChime();
    emitBurst({ x: 0, y: 1.85, z: 0, n: 70 });
    set({ candlesLit: false, wishMade: true });
  },
  openGift: (id) => {
    unlockAudio();
    playChime();
    set({
      openedGifts: { ...get().openedGifts, [id]: true },
      activeGift: id,
    });
  },
  dismissNote: () => set({ activeGift: null, selectedMemory: null }),
  setSelectedMemory: (index) => set({ selectedMemory: index, activeGift: null }),
  setMessage: (value) => {
    set({ message: value });
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LETTER_KEY, value);
    }
  },
}));

if (typeof window !== "undefined") {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  usePartyStore.setState({ reducedMotion: media.matches });
  media.addEventListener("change", (event) => {
    usePartyStore.setState({ reducedMotion: event.matches });
  });
}
