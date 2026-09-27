let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let playing = false;
let timer: number | null = null;
let nextNoteTime = 0;
let step = 0;
let noiseBuffer: AudioBuffer | null = null;

const MELODY: Array<[number, number]> = [
  [77, 1],
  [81, 1],
  [84, 1],
  [81, 1],
  [77, 1],
  [74, 1],
  [82, 1],
  [81, 1],
  [79, 1],
  [77, 2],
  [72, 1],
  [81, 1],
  [84, 1],
  [88, 1],
  [86, 1],
  [84, 1],
  [82, 1],
  [81, 1],
  [79, 1],
  [77, 3],
];

const BASS: Array<[number, number]> = [
  [53, 3],
  [53, 3],
  [51, 3],
  [53, 3],
  [48, 3],
  [51, 3],
  [53, 3],
  [53, 3],
];

const BEAT = 0.42;

function midiToFreq(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function ensureGraph() {
  if (ctx) return;
  const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;
  ctx = new AudioCtx({ latencyHint: "interactive" });
  master = ctx.createGain();
  musicGain = ctx.createGain();
  sfxGain = ctx.createGain();
  master.gain.value = 0.72;
  musicGain.gain.value = 0.2;
  sfxGain.gain.value = 0.5;
  musicGain.connect(master);
  sfxGain.connect(master);
  master.connect(ctx.destination);

  noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.6, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
}

export function unlockAudio() {
  ensureGraph();
  if (ctx?.state === "suspended") {
    void ctx.resume();
  }
}

export function resumeAudio() {
  if (ctx?.state === "suspended") {
    void ctx.resume();
  }
}

function playVoice(
  freq: number,
  duration: number,
  when: number,
  type: OscillatorType,
  volume: number,
  bus: GainNode,
  filterFreq?: number,
) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, when);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(volume, when + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
  if (filterFreq) {
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(filterFreq, when);
    osc.connect(filter);
    filter.connect(gain);
  } else {
    osc.connect(gain);
  }
  gain.connect(bus);
  osc.start(when);
  osc.stop(when + duration + 0.05);
}

function schedule() {
  if (!ctx || !musicGain || !playing) return;
  const horizon = ctx.currentTime + 1.4;
  while (nextNoteTime < horizon) {
    const [midi, beats] = MELODY[step % MELODY.length];
    const dur = beats * BEAT * 0.92;
    playVoice(midiToFreq(midi), dur, nextNoteTime, "sine", 0.085, musicGain, 2400);
    playVoice(midiToFreq(midi) * 2, dur * 0.7, nextNoteTime + 0.02, "triangle", 0.03, musicGain, 3200);

    if (step % 3 === 0) {
      const [bassMidi, bassBeats] = BASS[(Math.floor(step / 3) % BASS.length)];
      playVoice(midiToFreq(bassMidi), bassBeats * BEAT * 0.9, nextNoteTime, "sine", 0.05, musicGain, 700);
    }

    nextNoteTime += beats * BEAT;
    step += 1;
  }
  timer = window.setTimeout(schedule, 350);
}

export function startMusic() {
  unlockAudio();
  if (!ctx || !musicGain || playing) return;
  playing = true;
  musicGain.gain.cancelScheduledValues(ctx.currentTime);
  musicGain.gain.setTargetAtTime(0.2, ctx.currentTime, 0.04);
  nextNoteTime = ctx.currentTime + 0.08;
  schedule();
}

export function stopMusic() {
  playing = false;
  if (timer !== null) {
    window.clearTimeout(timer);
    timer = null;
  }
  if (ctx && musicGain) {
    musicGain.gain.cancelScheduledValues(ctx.currentTime);
    musicGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.06);
  }
}

export function playChime() {
  unlockAudio();
  if (!ctx || !sfxGain) return;
  const bus = sfxGain;
  const t = ctx.currentTime;
  const notes = [76, 81, 84, 88];
  notes.forEach((midi, index) => {
    playVoice(midiToFreq(midi), 0.7, t + index * 0.06, "sine", 0.12, bus, 2800);
  });
}

export function playBlow() {
  unlockAudio();
  if (!ctx || !sfxGain || !noiseBuffer) return;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 880;
  filter.Q.value = 0.65;
  const gain = ctx.createGain();
  const t = ctx.currentTime;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.42, t + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.48);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGain);
  src.start(t);
}
