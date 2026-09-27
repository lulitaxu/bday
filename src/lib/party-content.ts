export const GIFTS = [
  {
    id: "blush",
    color: "#E8B4C4",
    ribbon: "#C9A96E",
    position: [1.85, 0, 1.55] as [number, number, number],
    rotation: 0.28,
    size: [0.72, 0.52, 0.72] as [number, number, number],
    title: "A little softness",
    note: "May this year be the gentlest, brightest one yet — the kind that fits you.",
  },
  {
    id: "lavender",
    color: "#C5B4D6",
    ribbon: "#F7EDE6",
    position: [2.55, 0, 0.35] as [number, number, number],
    rotation: -0.4,
    size: [0.58, 0.7, 0.58] as [number, number, number],
    title: "A little sparkle",
    note: "You deserve every good thing that finds you. Especially the ones you didn't think to ask for.",
  },
  {
    id: "rose",
    color: "#C9897B",
    ribbon: "#C9A96E",
    position: [1.45, 0, 0.35] as [number, number, number],
    rotation: 0.5,
    size: [0.5, 0.42, 0.5] as [number, number, number],
    title: "A little laughter",
    note: "Here's to late-night talks, louder laughter, and you — always you.",
  },
] as const;

const baseUrl = import.meta.env.BASE_URL;

export const MEMORY_PATHS = [
  `${baseUrl}memories/peonies.jpg`,
  `${baseUrl}memories/champagne.jpg`,
  `${baseUrl}memories/cake.jpg`,
  `${baseUrl}memories/letter.jpg`,
  `${baseUrl}memories/jewelry.jpg`,
  `${baseUrl}memories/silk.jpg`,
] as const;

export const MEMORY_CAPTIONS = [
  "The flowers you deserve",
  "A toast to you",
  "Save me a slice",
  "Words I meant to say",
  "Little gold things",
  "Soft as this year should be",
] as const;
