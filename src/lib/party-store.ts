import { create } from "zustand";
import { emitBurst } from "@/lib/party-fx";
import { playBlow, playChime, startMusic, stopMusic, unlockAudio } from "@/lib/party-audio";

export type Stage = "invite" | "party";
export type Chapter = "letter" | "celebrate" | "memories" | "wishes";

const LETTER_KEY = "tasha-birthday-letter";

export const DEFAULT_LETTER = `Tasha,

Happy birthday to my cute ass homegirl 😭❤️

I genuinely don't know how to write these things without sounding corny, but you already know I love having you around. You're funny, you're cute as hell, and somehow you can make the most random conversations feel like a whole event.

I hope this year treats you good and gives you everything you deserve. Keep being you, keep laughing at dumb shit, and please never lose that energy of yours.

Also, I need to address something VERY serious: **STOP USING THAT FUCKING CHIPMUNK VOICE EFFECT ON INSTAGRAM WHEN YOU SEND ME VMs.** 😭 I am begging you. Just talk normally. I wanna hear YOU, not Alvin and the damn Chipmunks.

And stop bullying me too 😭 you know damn well you be doing it for entertainment.

Anyway, happy birthday, pretty girl. I hope you have the best day and an even better year. Stay cute, stay annoying, and stay my homegirl.

Love you, idiot ❤️

— Your favorite victim
 ARZU`;

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
