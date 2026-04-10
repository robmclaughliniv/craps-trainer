const audioCtxRef = { current: null };

export const getAudioCtx = () => {
  if (!audioCtxRef.current) {
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
  return audioCtxRef.current;
};

export const playTone = (freq, duration, type, vol) => {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol || 0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
};

export const playDiceRoll = () => {
  try {
    const ctx = getAudioCtx();
    const bufSize = ctx.sampleRate * 0.35;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      const env = 1 - (i / bufSize);
      data[i] = (Math.random() * 2 - 1) * env * env * 0.3;
    }
    const src = ctx.createBufferSource();
    const filt = ctx.createBiquadFilter();
    filt.type = "bandpass";
    filt.frequency.value = 2000;
    filt.Q.value = 0.5;
    src.buffer = buf;
    src.connect(filt);
    filt.connect(ctx.destination);
    src.start();
  } catch (e) {}
};

export const playWinSound = () => {
  playTone(523, 0.12, "sine", 0.15);
  setTimeout(() => playTone(659, 0.12, "sine", 0.15), 80);
  setTimeout(() => playTone(784, 0.2, "sine", 0.12), 160);
};

export const playLoseSound = () => {
  playTone(300, 0.2, "triangle", 0.12);
  setTimeout(() => playTone(220, 0.3, "triangle", 0.1), 150);
};

export const playPointSetSound = () => {
  playTone(440, 0.08, "sine", 0.1);
  setTimeout(() => playTone(660, 0.15, "sine", 0.12), 100);
};

export const playBigWinSound = () => {
  [523, 659, 784, 1047].forEach((f, i) => {
    setTimeout(() => playTone(f, 0.15, "sine", 0.15), i * 100);
  });
};

export const speakCall = (text) => {
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.1;
    u.pitch = 0.9;
    u.volume = 0.8;
    window.speechSynthesis.speak(u);
  } catch (e) {}
};
