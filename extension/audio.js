function tone(ac, freq, when, dur, type, gain, freqEnd) {
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, when);
  if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, when + dur);
  amp.gain.setValueAtTime(0.0001, when);
  amp.gain.exponentialRampToValueAtTime(gain, when + 0.03);
  amp.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  osc.connect(amp);
  amp.connect(ac.destination);
  osc.start(when);
  osc.stop(when + dur + 0.02);
}

function noiseBuf(ac, seconds) {
  const n = Math.floor(ac.sampleRate * seconds);
  const buf = ac.createBuffer(1, n, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function whoosh(ac, when, dur, gain) {
  const src = ac.createBufferSource();
  src.buffer = noiseBuf(ac, dur);
  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(280, when);
  filter.frequency.exponentialRampToValueAtTime(2200, when + dur);
  const amp = ac.createGain();
  amp.gain.setValueAtTime(gain, when);
  amp.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  src.connect(filter);
  filter.connect(amp);
  amp.connect(ac.destination);
  src.start(when);
}

const GrandioseAudio = (() => {
  let ctx = null;

  function audio() {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  }

  const stings = {
    save(ac, t) {
      whoosh(ac, t, 0.55, 0.035);
      tone(ac, 49, t, 0.4, "sine", 0.07);
      tone(ac, 73.4, t + 0.12, 0.35, "triangle", 0.04);
      tone(ac, 174.6, t + 0.28, 0.5, "triangle", 0.035);
      tone(ac, 261.6, t + 0.55, 0.45, "sine", 0.04);
    },
    fanfare(ac, t) {
      whoosh(ac, t, 0.4, 0.04);
      tone(ac, 174.6, t, 0.9, "triangle", 0.05);
      tone(ac, 233.1, t + 0.08, 0.85, "triangle", 0.045);
      tone(ac, 349.2, t + 0.16, 0.7, "sine", 0.04);
      tone(ac, 466.2, t + 0.28, 0.55, "sine", 0.03);
      tone(ac, 98, t, 1.1, "sine", 0.06);
    },
    mission(ac, t) {
      whoosh(ac, t, 0.35, 0.05);
      tone(ac, 196, t, 0.22, "sawtooth", 0.025);
      tone(ac, 311.1, t + 0.18, 0.35, "triangle", 0.045);
      tone(ac, 277.2, t + 0.42, 0.55, "sine", 0.04);
      tone(ac, 98, t + 0.18, 0.7, "sine", 0.05);
    },
    ceremony(ac, t) {
      tone(ac, 73.4, t, 1.8, "sine", 0.06);
      tone(ac, 87.3, t + 0.4, 1.6, "triangle", 0.035);
      tone(ac, 110, t + 0.9, 1.4, "sine", 0.03);
      tone(ac, 130.8, t + 1.5, 1.8, "triangle", 0.025, 65.4);
      whoosh(ac, t + 0.2, 1.2, 0.02);
    },
    tick(ac, t) {
      tone(ac, 840, t, 0.05, "sine", 0.03);
      tone(ac, 1260, t + 0.02, 0.04, "triangle", 0.018);
    },
  };

  return {
    resume() {
      audio();
    },
    playSting(kind) {
      const ac = audio();
      const fn = stings[kind];
      if (fn) fn(ac, ac.currentTime);
    },
  };
})();
