let audioCtx;

function getContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playKnock(ctx, time, gainValue) {
  const baseFreq = 90 + Math.random() * 120; // warm, woody low tone

  // Main body "tok"
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(baseFreq, time);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, time + 0.06);

  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(gainValue, time);
  oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);

  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.08);

  // Faint overtone for a bit of body
  const overtone = ctx.createOscillator();
  overtone.type = 'triangle';
  overtone.frequency.value = baseFreq * 2.4;

  const overtoneGain = ctx.createGain();
  overtoneGain.gain.setValueAtTime(gainValue * 0.22, time);
  overtoneGain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

  overtone.connect(overtoneGain);
  overtoneGain.connect(ctx.destination);
  overtone.start(time);
  overtone.stop(time + 0.04);

  // Barely-there attack tick (much subtler than raw noise)
  const clickDuration = 0.006;
  const bufferSize = Math.floor(ctx.sampleRate * clickDuration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.value = 2200;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(gainValue * 0.18, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, time + clickDuration);

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noiseSource.start(time);
  noiseSource.stop(time + clickDuration);
}

export function playCritSuccess(volume = 0.35) {
  try {
    const ctx = getContext();
    const now = ctx.currentTime;
    [0, 0.09, 0.18].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      const freq = 660 * 1.5 ** i;
      osc.frequency.setValueAtTime(freq, now + delay);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume * 0.5, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.16);
    });
  } catch {
    // Web Audio unavailable or blocked — fail silently
  }
}

export function playCritFail(volume = 0.35) {
  try {
    const ctx = getContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.35);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.42);
  } catch {
    // Web Audio unavailable or blocked — fail silently
  }
}

// Short two-note chime for incoming chat — deliberately quiet and quick so it
// doesn't cut across whatever music the GM has playing.
export function playChatPing(volume = 0.3) {
  try {
    const ctx = getContext();
    const now = ctx.currentTime;
    [
      { freq: 880, delay: 0 },
      { freq: 1170, delay: 0.07 },
    ].forEach(({ freq, delay }) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now + delay);
      gain.gain.exponentialRampToValueAtTime(volume * 0.35, now + delay + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.18);
    });
  } catch {
    // Web Audio unavailable or blocked — fail silently
  }
}

export function playDiceRattle(durationMs = 1000, volume = 0.35) {
  try {
    const ctx = getContext();
    const now = ctx.currentTime;
    const totalSeconds = durationMs / 1000;

    // Bounce physics: knocks start spaced & loud, accelerate and quiet down as the die settles
    let t = 0;
    let interval = 0.16;
    let amp = 1;
    const knocks = [];
    while (t < totalSeconds) {
      knocks.push({ t, amp });
      interval *= 0.78;
      amp *= 0.82;
      t += Math.max(interval, 0.045);
    }

    knocks.forEach(({ t: knockTime, amp: knockAmp }) => {
      playKnock(ctx, now + knockTime, volume * knockAmp * (0.85 + Math.random() * 0.3));
    });
  } catch {
    // Web Audio unavailable or blocked — fail silently
  }
}
