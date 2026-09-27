import { useEffect, useRef, useState } from "react";
import {
  Flame,
  Gift,
  Heart,
  Mail,
  MousePointer2,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GIFTS } from "@/lib/party-content";
import { type Chapter, DEFAULT_LETTER, usePartyStore } from "@/lib/party-store";

const CHAPTERS: Array<{ id: Chapter; label: string; icon: typeof Mail }> = [
  { id: "letter", label: "Letter", icon: Mail },
  { id: "celebrate", label: "Celebrate", icon: Gift },
  { id: "wishes", label: "Wishes", icon: Heart },
];

function GoldRule({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)} aria-hidden="true">
      <span className="h-px flex-1 bg-gold/50" />
      <span className="size-1.5 rotate-45 bg-gold/80" />
      <span className="h-px flex-1 bg-gold/50" />
    </div>
  );
}

function LoadingScreen() {
  const ready = usePartyStore((s) => s.ready);
  const progress = usePartyStore((s) => s.loadProgress);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    if (!ready) return;
    const id = window.setTimeout(() => setMounted(false), 520);
    return () => window.clearTimeout(id);
  }, [ready]);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-40 flex flex-col items-center justify-center bg-scene px-6 text-center transition-opacity duration-[var(--motion-slow)] ease-[var(--ease-smooth-out)]",
        ready ? "pointer-events-none opacity-0" : "pointer-events-auto opacity-100",
      )}
      aria-hidden={ready}
    >
      <div className="loader-balloons mb-8" aria-hidden="true">
        <span className="loader-balloon loader-balloon-a" />
        <span className="loader-balloon loader-balloon-b" />
      </div>
      <p className="font-sans text-xs font-medium tracking-[0.32em] text-rose uppercase">
        A surprise for Tasha
      </p>
      <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight text-ink text-balance sm:text-5xl">
        Setting the table
      </h1>
      <div className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-ink/10">
        <div
          className="h-full rounded-full bg-rose transition-[width] duration-[var(--motion-fast)] ease-[var(--ease-smooth-out)]"
          style={{ width: `${Math.round(progress)}%` }}
        />
      </div>
    </div>
  );
}

function InviteScreen() {
  const ready = usePartyStore((s) => s.ready);
  const stage = usePartyStore((s) => s.stage);
  const enterParty = usePartyStore((s) => s.enterParty);
  const visible = ready && stage === "invite";
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      return;
    }
    const id = window.setTimeout(() => setMounted(false), 420);
    return () => window.clearTimeout(id);
  }, [visible]);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-30 flex flex-col items-center justify-end px-5 pb-12 pt-24 text-center sm:justify-center sm:pb-0 sm:pt-8",
        "transition-opacity duration-[var(--motion-slow)] ease-[var(--ease-smooth-out)]",
        visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!visible}
    >
      <div className="max-w-xl">
        <p className="font-sans text-[0.7rem] font-medium tracking-[0.38em] text-rose uppercase">
          A private celebration
        </p>
        <h1 className="mt-4 font-serif text-[clamp(3rem,12vw,6.5rem)] leading-[0.92] font-medium tracking-[-0.03em] text-ink text-balance">
          Happy Birthday,
          <em className="title-sheen mt-1 block font-medium italic">Tasha</em>
        </h1>
        <p className="mt-5 font-sans text-base font-light tracking-wide text-muted sm:text-lg">
          To my favorite homegirl
        </p>
        <button
          type="button"
          onClick={enterParty}
          className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-7 pr-6 text-sm font-medium tracking-wide text-cream shadow-[0_10px_30px_-12px_rgba(58,42,50,0.55)] transition-[transform,background-color] duration-[var(--motion-quick)] ease-out hover:bg-ink/90 active:scale-[0.96]"
        >
          Open Your Gift
          <Sparkles className="size-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

function LetterPanel() {
  const setMessage = usePartyStore((s) => s.setMessage);
  const initial = useRef(usePartyStore.getState().message);

  return (
    <article className="glass-card pointer-events-auto mx-auto max-h-[min(58dvh,32rem)] w-full max-w-lg overflow-y-auto p-6 sm:p-8">
      <p className="font-sans text-[0.68rem] font-medium tracking-[0.28em] text-rose uppercase">
        Your letter · tap to personalize
      </p>
      <GoldRule className="mt-4 mb-5" />
      <div
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label="Birthday letter"
        className="font-serif text-[1.05rem] leading-[1.7] text-ink text-pretty outline-none sm:text-xl sm:leading-[1.7]"
        onInput={(event) => {
          setMessage(event.currentTarget.innerText);
        }}
        onBlur={(event) => {
          if (event.currentTarget.innerText.trim().length === 0) {
            event.currentTarget.innerText = DEFAULT_LETTER;
            setMessage(DEFAULT_LETTER);
          }
        }}
      >
        {initial.current}
      </div>
    </article>
  );
}

function CelebratePanel() {
  const blowCandles = usePartyStore((s) => s.blowCandles);
  const candlesLit = usePartyStore((s) => s.candlesLit);
  const wishMade = usePartyStore((s) => s.wishMade);
  const openGift = usePartyStore((s) => s.openGift);
  const openedGifts = usePartyStore((s) => s.openedGifts);

  return (
    <article className="glass-card pointer-events-auto mx-auto w-full max-w-md p-5 sm:p-6">
      <p className="font-sans text-[0.68rem] font-medium tracking-[0.28em] text-rose uppercase">
        Make it count
      </p>
      <h2 className="mt-2 font-serif text-2xl text-ink text-balance sm:text-3xl">Blow out the candles</h2>
      <p className="mt-2 font-sans text-sm leading-relaxed text-muted text-pretty">
        Tap the cake, or open a gift — each box is hiding a little note.
      </p>
      <button
        type="button"
        onClick={blowCandles}
        disabled={!candlesLit}
        className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-rose px-5 text-sm font-medium text-cream transition-[transform,opacity] duration-[var(--motion-quick)] ease-out hover:opacity-90 active:scale-[0.96] disabled:cursor-default disabled:opacity-50"
      >
        <Flame className="size-4" strokeWidth={1.75} />
        {candlesLit ? "Blow out the candles" : "Wish locked in"}
      </button>
      {wishMade ? (
        <p className="mt-3 font-serif text-base text-ink italic">It already looks good on you.</p>
      ) : null}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {GIFTS.map((gift) => (
          <button
            key={gift.id}
            type="button"
            onClick={() => openGift(gift.id)}
            className="min-h-11 rounded-full bg-cream/80 px-2 text-[0.68rem] font-medium tracking-wide text-ink transition-transform duration-[var(--motion-quick)] active:scale-[0.96]"
          >
            {openedGifts[gift.id] ? "Opened" : gift.title.replace("A little ", "")}
          </button>
        ))}
      </div>
    </article>
  );
}

function WishesPanel() {
  return (
    <article className="glass-card pointer-events-auto mx-auto w-full max-w-md p-5 text-center sm:p-7">
      <Heart className="mx-auto size-5 text-rose" strokeWidth={1.5} />
      <h2 className="mt-3 font-serif text-3xl text-ink text-balance sm:text-4xl">
        May your year be as luminous as you are.
      </h2>
      <p className="mt-3 font-sans text-sm leading-relaxed text-muted text-pretty">
        Happy birthday, homegirl. The world can wait — today is yours.
      </p>
      <GoldRule className="my-5" />
      <p className="font-serif text-base text-ink italic">Made with love for you</p>
    </article>
  );
}

function ChapterPanel() {
  const chapter = usePartyStore((s) => s.chapter);
  return (
    <div key={chapter} className="panel-enter w-full max-w-lg">
      {chapter === "letter" ? <LetterPanel /> : null}
      {chapter === "celebrate" ? <CelebratePanel /> : null}
      {chapter === "wishes" ? <WishesPanel /> : null}
    </div>
  );
}

function GiftNote() {
  const activeGift = usePartyStore((s) => s.activeGift);
  const dismissNote = usePartyStore((s) => s.dismissNote);
  const gift = GIFTS.find((item) => item.id === activeGift);
  if (!gift) return null;

  return (
    <>
      <button
        type="button"
        className="absolute inset-0 bg-ink/20"
        aria-label="Close note"
        onClick={dismissNote}
      />
      <article
        role="dialog"
        aria-label={gift.title}
        className="glass-card panel-enter relative z-10 w-full max-w-sm p-7 text-center"
      >
        <p className="font-sans text-[0.68rem] font-medium tracking-[0.28em] text-rose uppercase">
          Inside the box
        </p>
        <h3 className="mt-3 font-serif text-3xl text-ink">{gift.title}</h3>
        <p className="mt-4 font-serif text-lg leading-relaxed text-ink/85 text-pretty italic">
          {gift.note}
        </p>
        <button
          type="button"
          onClick={dismissNote}
          className="mt-6 inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-cream transition-transform duration-[var(--motion-quick)] active:scale-[0.96]"
        >
          Tuck it away
        </button>
      </article>
    </>
  );
}

function PartyChrome() {
  const stage = usePartyStore((s) => s.stage);
  const ready = usePartyStore((s) => s.ready);
  const chapter = usePartyStore((s) => s.chapter);
  const setChapter = usePartyStore((s) => s.setChapter);
  const [hint, setHint] = useState(true);
  const visible = ready && stage === "party";
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      return;
    }
    const id = window.setTimeout(() => setMounted(false), 420);
    return () => window.clearTimeout(id);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const id = window.setTimeout(() => setHint(false), 4200);
    return () => window.clearTimeout(id);
  }, [visible]);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-20 flex flex-col justify-between px-3 pt-[max(0.8rem,env(safe-area-inset-top))] pb-[max(0.7rem,env(safe-area-inset-bottom))] sm:px-6 sm:pt-[max(1.25rem,env(safe-area-inset-top))] sm:pb-[max(1rem,env(safe-area-inset-bottom))]",
        "transition-opacity duration-[var(--motion-slow)] ease-[var(--ease-smooth-out)]",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!visible}
    >
      <div className="flex items-start justify-between gap-3 pr-14">
        <div>
          <p className="font-sans text-[0.65rem] font-medium tracking-[0.32em] text-rose uppercase">
            For Tasha
          </p>
          <p className="font-serif text-[1.35rem] leading-tight text-ink italic sm:text-3xl">The party is yours</p>
        </div>
        {hint ? (
          <p className="hidden items-center gap-1.5 rounded-full bg-cream/55 px-3 py-2 font-sans text-[0.7rem] tracking-wide text-muted backdrop-blur-md sm:flex">
            <MousePointer2 className="size-3.5" strokeWidth={1.75} />
            Drag to look around
          </p>
        ) : (
          <span />
        )}
      </div>

      <div
        className={cn(
          "flex min-h-0 flex-1 justify-center",
          chapter === "letter" ? "items-end pb-2 pt-2 sm:items-center sm:py-6" : "items-end py-2 sm:pt-2 sm:pb-3",
        )}
      >
        <ChapterPanel />
      </div>

      <nav
        aria-label="Party chapters"
        className="pointer-events-auto mx-auto mb-0 flex w-full max-w-md items-center justify-between gap-1 rounded-[1.15rem] bg-cream/70 p-1 shadow-[var(--shadow-card)] backdrop-blur-xl sm:rounded-full sm:p-1.5"
      >
        {CHAPTERS.map((item) => {
          const Icon = item.icon;
          const active = chapter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setChapter(item.id)}
              className={cn(
                "flex min-h-10 min-w-0 flex-1 items-center justify-center gap-1 rounded-[0.9rem] px-1.5 text-[0.62rem] font-medium tracking-wide transition-[background-color,color,transform] duration-[var(--motion-quick)] ease-out sm:min-h-11 sm:rounded-full sm:px-2 sm:text-xs",
                active ? "bg-ink text-cream" : "text-muted hover:text-ink",
              )}
            >
              <Icon className="size-3.5" strokeWidth={1.75} />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function MusicToggle() {
  const ready = usePartyStore((s) => s.ready);
  const musicOn = usePartyStore((s) => s.musicOn);
  const toggleMusic = usePartyStore((s) => s.toggleMusic);
  if (!ready) return null;

  return (
    <button
      type="button"
      onClick={toggleMusic}
      aria-label={musicOn ? "Mute music" : "Play music"}
      className="pointer-events-auto absolute top-[max(0.8rem,env(safe-area-inset-top))] right-3 z-50 flex size-10 items-center justify-center rounded-full bg-cream/75 sm:top-[max(1rem,env(safe-area-inset-top))] sm:right-6 sm:size-11 text-ink shadow-[var(--shadow-card)] backdrop-blur-md transition-transform duration-[var(--motion-quick)] ease-out hover:bg-cream active:scale-[0.96] sm:right-6"
    >
      {musicOn ? (
        <Volume2 className="size-4" strokeWidth={1.75} />
      ) : (
        <VolumeX className="size-4" strokeWidth={1.75} />
      )}
    </button>
  );
}

export function Overlays() {
  const activeGift = usePartyStore((s) => s.activeGift);
  const modalOpen = Boolean(activeGift);

  return (
    <div className="pointer-events-none absolute inset-0">
      <LoadingScreen />
      <InviteScreen />
      <PartyChrome />
      <MusicToggle />
      {modalOpen ? (
        <div className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center px-5">
          <GiftNote />
        </div>
      ) : null}
    </div>
  );
}
