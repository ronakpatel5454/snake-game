// Web Audio API Synthesized Sound Effects Engine
// 100% self-contained, offline-ready, zero-latency, premium sound design.

let audioCtx = null;
let isMuted = (() => {
  try {
    const saved = localStorage.getItem("snake_game_audio_muted");
    return saved ? JSON.parse(saved) : false;
  } catch {
    return false;
  }
})();

// Lazy initialize the audio context to comply with browser autoplay policies
const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
};

export const getMutedState = () => isMuted;

export const toggleMute = () => {
  isMuted = !isMuted;
  try {
    localStorage.setItem("snake_game_audio_muted", JSON.stringify(isMuted));
  } catch (e) {
    console.error("Failed to save mute state", e);
  }
  return isMuted;
};

// --- SYNTHESIZED SOUND EFFECTS ---

// 1. Roll Dice: A quick succession of clicky taps simulating plastic dice rolling
export const playDiceRollSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Schedule 4 quick click taps spaced 80ms apart
  for (let i = 0; i < 5; i++) {
    const tapTime = now + i * 0.08;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Mix of low and mid clicks to sound organic
    const freq = 120 + Math.random() * 180 + (i * 20);
    osc.frequency.setValueAtTime(freq, tapTime);
    osc.type = "triangle"; // Nice organic wooden/plastic click
    
    // Quick volume envelope
    gain.gain.setValueAtTime(0, tapTime);
    gain.gain.linearRampToValueAtTime(0.3, tapTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, tapTime + 0.05);
    
    osc.start(tapTime);
    osc.stop(tapTime + 0.06);
  }
};

// 2. Cookie Hop / Step: A sweet bubble pop/hop arpeggio
export const playMoveSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = "sine";
  // Pitch sweep upwards to simulate a hop / jump arpeggio
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(450, now + 0.09);
  
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.35, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  
  osc.start(now);
  osc.stop(now + 0.13);
};

// 3. Snake Bite: A slide pitch downwards representing sliding down a snake's body
export const playSnakeBiteSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = "sawtooth"; // Rasp / buzz waveform representing a snake bite
  
  // Dramatic falling frequency
  osc.frequency.setValueAtTime(650, now);
  osc.frequency.exponentialRampToValueAtTime(100, now + 0.6);
  
  // Tremolo effect to make it sound buzzy/scary
  for (let i = 0; i < 10; i++) {
    gain.gain.setValueAtTime(0.18, now + i * 0.06);
    gain.gain.linearRampToValueAtTime(0.02, now + i * 0.06 + 0.03);
  }
  
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
  
  osc.start(now);
  osc.stop(now + 0.7);
};

// 4. Ladder Climbing: An arpeggio of 4 bright ascending steps
export const playLadderSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  const scale = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 arpeggio
  
  scale.forEach((freq, idx) => {
    const noteTime = now + idx * 0.09;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, noteTime);
    
    // Settle / shimmer ring effect
    gain.gain.setValueAtTime(0, noteTime);
    gain.gain.linearRampToValueAtTime(0.25, noteTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.16);
    
    osc.start(noteTime);
    osc.stop(noteTime + 0.18);
  });
};

// 5. Got a Six: A bright dual chime for C5 & E5 keys
export const playSixSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  const notes = [523.25, 659.25]; // C5 and E5
  
  notes.forEach((freq, idx) => {
    const noteTime = now + idx * 0.08;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = "triangle"; // Smooth chime note
    osc.frequency.setValueAtTime(freq, noteTime);
    
    gain.gain.setValueAtTime(0, noteTime);
    gain.gain.linearRampToValueAtTime(0.3, noteTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);
    
    osc.start(noteTime);
    osc.stop(noteTime + 0.4);
  });
};

// 6. Clash / Hunt Cookie: A metallic crunch / collision chime sound
export const playClashSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Metallic collision: Triangle at 120Hz with a quick pitch modulation
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  
  osc1.type = "sawtooth";
  osc1.frequency.setValueAtTime(450, now);
  osc1.frequency.linearRampToValueAtTime(80, now + 0.18);
  
  gain1.gain.setValueAtTime(0.25, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  
  osc1.start(now);
  osc1.stop(now + 0.22);
  
  // Secondary ring chime representing the hit
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(950, now + 0.03);
  
  gain2.gain.setValueAtTime(0, now + 0.03);
  gain2.gain.linearRampToValueAtTime(0.2, now + 0.04);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
  
  osc2.start(now + 0.03);
  osc2.stop(now + 0.4);
};

// 7. Victory Fanfare: A rich multi-chord arpeggio ending in a full C-major chord
export const playVictorySound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Ascending arpeggio: C4, E4, G4, C5, E5, G5, C6
  const scale = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
  
  scale.forEach((freq, idx) => {
    const noteTime = now + idx * 0.09;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, noteTime);
    
    // Sustained notes for the ending
    const duration = idx === scale.length - 1 ? 1.5 : 0.45;
    
    gain.gain.setValueAtTime(0, noteTime);
    gain.gain.linearRampToValueAtTime(0.2, noteTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + duration);
    
    osc.start(noteTime);
    osc.stop(noteTime + duration + 0.05);
  });
};

// 8. Teleport / Warp: A cool sci-fi frequency sweep with high reverb-like fade
export const playTeleportSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = "sine";
  // Sci-fi warp sweep: low to high then back down quickly
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(1200, now + 0.25);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.5);
  
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
  
  osc.start(now);
  osc.stop(now + 0.6);
};

