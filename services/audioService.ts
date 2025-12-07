class AudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private isPlaying: boolean = false;

  constructor() {
    // Lazy initialization handled in start()
  }

  public init() {
    if (!this.context) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.context = new AudioContextClass();
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
      this.masterGain.gain.setValueAtTime(0, this.context.currentTime);
    }
  }

  public start() {
    if (this.isPlaying) return;
    this.init();
    
    if (!this.context || !this.masterGain) return;

    // Resume context if suspended (browser policy)
    if (this.context.state === 'suspended') {
      this.context.resume();
    }

    const currentTime = this.context.currentTime;
    
    // Fade in
    this.masterGain.gain.cancelScheduledValues(currentTime);
    this.masterGain.gain.setValueAtTime(0, currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0.3, currentTime + 2); // Soft volume

    // Create Binaural Beat configuration (Theta waves for relaxation/trance)
    // Base frequency: 200Hz
    // Target difference: 6Hz (Theta)
    // Left Ear: 200Hz, Right Ear: 206Hz
    
    this.createOscillator(200, -1); // Left pan
    this.createOscillator(206, 1);  // Right pan
    
    // Add a deep background drone
    this.createOscillator(50, 0, 'triangle', 0.1); 

    this.isPlaying = true;
  }

  private createOscillator(freq: number, pan: number, type: OscillatorType = 'sine', volume: number = 0.5) {
    if (!this.context || !this.masterGain) return;

    const osc = this.context.createOscillator();
    const panner = this.context.createStereoPanner();
    const gain = this.context.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.context.currentTime);
    
    panner.pan.setValueAtTime(pan, this.context.currentTime);
    gain.gain.setValueAtTime(volume, this.context.currentTime);

    osc.connect(gain);
    gain.connect(panner);
    panner.connect(this.masterGain);

    osc.start();
    this.oscillators.push(osc);
  }

  public stop() {
    if (!this.isPlaying || !this.context || !this.masterGain) return;

    const currentTime = this.context.currentTime;
    
    // Fade out
    this.masterGain.gain.cancelScheduledValues(currentTime);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0, currentTime + 1.5);

    setTimeout(() => {
      this.oscillators.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {
          // Ignore errors if already stopped
        }
      });
      this.oscillators = [];
      this.isPlaying = false;
    }, 1500);
  }
}

export const audioService = new AudioEngine();
