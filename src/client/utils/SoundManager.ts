export namespace SoundManager {
  const Notes = {
    G3: 196.00,
    A3: 220.00,
    B3: 246.94,
    C4: 261.63,
    D4: 293.66,
    E4: 329.63,
    F4: 349.23,
    G4: 392.00,
    A4: 440.00,
    B4: 493.88,
    C5: 523.25,
    D5: 587.33,
    E5: 659.25,
    F5: 698.46,
    G5: 783.99,
    A5: 880.00,
    B5: 987.77,
    C6: 1046.50,
  } as const;

  type AudioContextCtor = typeof AudioContext;

  let audioCtx: AudioContext | null = null;
  let unlockHandlersAttached = false;

  function getAudioContextCtor(): AudioContextCtor | undefined {
    return window.AudioContext || (window as typeof window & {
      webkitAudioContext?: AudioContextCtor,
    }).webkitAudioContext;
  }

  function setupGainNode(context: AudioContext, time: number, value: number) {
    const gainNode = context.createGain();
    gainNode.connect(context.destination);
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(value, time + 0.01);
    return gainNode;
  }

  function setupOscillator(context: AudioContext, frequency: number, gainNode: GainNode) {
    const oscillator = context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    oscillator.connect(gainNode);
    return oscillator;
  }

  function playSound(context: AudioContext, frequency: number, offset: number, len: number, gainValue: number = 1) {
    const time = context.currentTime + offset;
    const gainNode = setupGainNode(context, time, gainValue);
    const oscillator = setupOscillator(context, frequency, gainNode);

    oscillator.start(time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + len);
    oscillator.stop(time + len);
  }

  function createAudioContext(): AudioContext | null {
    const AudioContextClass = getAudioContextCtor();
    if (!AudioContextClass) {
      console.log('This web browser does not support Web Audio API');
      return null;
    }

    audioCtx = new AudioContextClass();
    console.info('[SoundManager] Created AudioContext', {state: audioCtx.state});
    return audioCtx;
  }

  function getAudioContext(options: {allowCreate: boolean}): AudioContext | null {
    if (audioCtx !== null) {
      return audioCtx;
    }
    if (!options.allowCreate) {
      return null;
    }
    return createAudioContext();
  }

  async function unlockAudioContext(options: {allowCreate: boolean} = {allowCreate: false}): Promise<AudioContext | null> {
    const context = getAudioContext(options);
    if (!context) {
      console.info('[SoundManager] No AudioContext available', options);
      return null;
    }

    if (context.state === 'suspended') {
      console.info('[SoundManager] Resuming AudioContext', {state: context.state});
      try {
        await context.resume();
        console.info('[SoundManager] AudioContext resumed', {state: context.state});
      } catch (err) {
        console.warn('Failed to resume audio context', err);
        return null;
      }
    }

    return context.state === 'running' ? context : null;
  }

  function detachUnlockHandlers() {
    if (!unlockHandlersAttached) {
      return;
    }
    unlockHandlersAttached = false;

    window.removeEventListener('pointerdown', handleUserGestureUnlock);
    window.removeEventListener('touchstart', handleUserGestureUnlock);
    window.removeEventListener('click', handleUserGestureUnlock);
    window.removeEventListener('keydown', handleUserGestureUnlock);
  }

  async function handleUserGestureUnlock() {
    const context = await unlockAudioContext({allowCreate: true});
    if (context?.state === 'running') {
      detachUnlockHandlers();
    }
  }

  export function initialize() {
    if (unlockHandlersAttached) {
      return;
    }

    unlockHandlersAttached = true;
    window.addEventListener('pointerdown', handleUserGestureUnlock, {passive: true});
    window.addEventListener('touchstart', handleUserGestureUnlock, {passive: true});
    window.addEventListener('click', handleUserGestureUnlock, {passive: true});
    window.addEventListener('keydown', handleUserGestureUnlock, {passive: true});
  }

  async function playInContext(cb: (context: AudioContext) => void) {
    // Try to create/resume audio on demand when a sound is requested.
    // This avoids silently dropping the first turn notification if the page
    // never created an AudioContext during an earlier user gesture.
    const context = await unlockAudioContext({allowCreate: true});
    if (!context) {
      initialize();
      return;
    }
    cb(context);
  }

  export function playActivePlayerSound() {
    void playInContext((context) => {
      playSound(context, Notes.C5, 0, 0.4);
      playSound(context, Notes.A4, 0.2, 0.4);
    });
  }

  export function newLog() {
    void playInContext((context) => {
      playSound(context, Notes.G3, 0.02, 0.05, 0.1);
    });
  }
}
