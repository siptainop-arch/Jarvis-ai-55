/**
 * Procedural Web Audio API sound effects and visualizer audio engine for J.A.R.V.I.S.
 * No external mp3 files needed; 100% reliable in any browser.
 */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let analyserNode: AnalyserNode | null = null;
let isMuted = false;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.8;

    analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 128;
    analyserNode.smoothingTimeConstant = 0.8;

    masterGain.connect(analyserNode);
    analyserNode.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function getAnalyser(): AnalyserNode | null {
  getAudioContext();
  return analyserNode;
}

export function setMuted(muted: boolean) {
  isMuted = muted;
  if (masterGain) {
    masterGain.gain.value = muted ? 0 : 0.8;
  }
}

export function getMuted(): boolean {
  return isMuted;
}

// Play pleasant high-tech J.A.R.V.I.S. chime
export function playChime() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const chimeGain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now); // A5
    osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.15);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6
    osc2.frequency.exponentialRampToValueAtTime(2637, now + 0.25);

    chimeGain.gain.setValueAtTime(0.001, now);
    chimeGain.gain.linearRampToValueAtTime(0.18, now + 0.03);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(chimeGain);
    osc2.connect(chimeGain);
    chimeGain.connect(masterGain!);

    osc1.start(now);
    osc2.start(now + 0.08);
    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
  } catch (err) {
    console.warn('Audio chime error:', err);
  }
}

// Play targeting lock sound
export function playTargetLock() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.setValueAtTime(1200, now + 0.05);
    osc.frequency.setValueAtTime(1800, now + 0.1);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(masterGain!);

    osc.start(now);
    osc.stop(now + 0.22);
  } catch (err) {
    console.warn('Target lock audio error:', err);
  }
}

// Play Stark Protocol warning alarm siren
export function playProtocolAlarm() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    for (let i = 0; i < 3; i++) {
      const startTime = now + i * 0.18;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(520, startTime);
      osc.frequency.linearRampToValueAtTime(880, startTime + 0.12);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.16);

      osc.connect(gain);
      gain.connect(masterGain!);

      osc.start(startTime);
      osc.stop(startTime + 0.17);
    }
  } catch (err) {
    console.warn('Protocol alarm audio error:', err);
  }
}

// Play deep Arc Reactor hum
export function playReactorHum() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const sub = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.8);

    sub.type = 'sine';
    sub.frequency.setValueAtTime(40, now);
    sub.frequency.exponentialRampToValueAtTime(80, now + 0.8);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.linearRampToValueAtTime(800, now + 0.5);
    filter.frequency.exponentialRampToValueAtTime(150, now + 1.2);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(filter);
    sub.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain!);

    osc.start(now);
    sub.start(now);
    osc.stop(now + 1.2);
    sub.stop(now + 1.2);
  } catch (err) {
    console.warn('Reactor hum audio error:', err);
  }
}

// Light futuristic click
export function playClick() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(masterGain!);

    osc.start(now);
    osc.stop(now + 0.04);
  } catch (err) {
    console.warn('Click audio error:', err);
  }
}

// Play audio buffer or data URL through visualizer
export async function playWavThroughVisualizer(base64Wav: string): Promise<HTMLAudioElement> {
  const ctx = getAudioContext();
  const audio = new Audio(`data:audio/wav;base64,${base64Wav}`);
  audio.crossOrigin = 'anonymous';

  try {
    const source = ctx.createMediaElementSource(audio);
    source.connect(masterGain!);
  } catch {
    // If element source cannot attach again, normal play
  }

  await audio.play();
  return audio;
}
