/**
 * AudioStreamer: Manages Web Audio API for PCM16 16kHz microphone capture
 * and 24kHz audio response playback with gapless scheduling and interruption handling.
 */

export class AudioStreamer {
  private inputContext: AudioContext | null = null;
  private outputContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private inputProcessor: ScriptProcessorNode | null = null;
  private inputAnalyser: AnalyserNode | null = null;
  private outputAnalyser: AnalyserNode | null = null;

  private nextPlayTime: number = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private onAudioChunkCallback: ((base64Pcm: string) => void) | null = null;
  private isCapturing: boolean = false;

  constructor() {}

  // Initialize Audio Contexts on user interaction
  public async init(onAudioChunk: (base64Pcm: string) => void): Promise<void> {
    this.onAudioChunkCallback = onAudioChunk;

    // Output AudioContext at 24kHz (Gemini Live standard output)
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!this.outputContext) {
      this.outputContext = new AudioContextClass({ sampleRate: 24000 });
      this.outputAnalyser = this.outputContext.createAnalyser();
      this.outputAnalyser.fftSize = 128;
      this.outputAnalyser.smoothingTimeConstant = 0.8;
      this.outputAnalyser.connect(this.outputContext.destination);
    }

    if (this.outputContext.state === 'suspended') {
      await this.outputContext.resume();
    }

    // Input AudioContext for microphone
    if (!this.inputContext) {
      this.inputContext = new AudioContextClass({ sampleRate: 16000 });
      this.inputAnalyser = this.inputContext.createAnalyser();
      this.inputAnalyser.fftSize = 128;
      this.inputAnalyser.smoothingTimeConstant = 0.8;
    }

    if (this.inputContext.state === 'suspended') {
      await this.inputContext.resume();
    }
  }

  // Start capturing user microphone
  public async startRecording(): Promise<void> {
    if (this.isCapturing) return;

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      if (!this.inputContext) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.inputContext = new AudioContextClass({ sampleRate: 16000 });
      }

      const source = this.inputContext.createMediaStreamSource(this.mediaStream);

      // Connect to analyser for mic visualizer
      if (this.inputAnalyser) {
        source.connect(this.inputAnalyser);
      }

      // ScriptProcessor for 16kHz PCM chunk extraction
      const bufferSize = 4096;
      this.inputProcessor = this.inputContext.createScriptProcessor(bufferSize, 1, 1);

      this.inputProcessor.onaudioprocess = (e) => {
        if (!this.isCapturing) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16Base64 = this.floatTo16BitPCMBase64(inputData);
        if (this.onAudioChunkCallback && pcm16Base64) {
          this.onAudioChunkCallback(pcm16Base64);
        }
      };

      source.connect(this.inputProcessor);
      this.inputProcessor.connect(this.inputContext.destination);
      this.isCapturing = true;
    } catch (err) {
      console.error('[AudioStreamer] Microphone start failed:', err);
      throw err;
    }
  }

  // Stop capturing microphone
  public stopRecording(): void {
    this.isCapturing = false;
    if (this.inputProcessor) {
      this.inputProcessor.disconnect();
      this.inputProcessor = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
  }

  // Playback base64 PCM chunk from Gemini Live (24kHz)
  public playChunk(base64Pcm: string): void {
    if (!this.outputContext || !this.outputAnalyser) return;

    try {
      const rawBytes = this.base64ToUint8Array(base64Pcm);
      const float32Array = this.pcm16ToFloat32(rawBytes);

      const buffer = this.outputContext.createBuffer(1, float32Array.length, 24000);
      buffer.getChannelData(0).set(float32Array);

      const source = this.outputContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.outputAnalyser);

      const currentTime = this.outputContext.currentTime;
      if (this.nextPlayTime < currentTime) {
        this.nextPlayTime = currentTime;
      }

      source.start(this.nextPlayTime);
      this.nextPlayTime += buffer.duration;
      this.activeSources.push(source);

      source.onended = () => {
        const index = this.activeSources.indexOf(source);
        if (index > -1) {
          this.activeSources.splice(index, 1);
        }
      };
    } catch (err) {
      console.warn('[AudioStreamer] Playback error:', err);
    }
  }

  // Immediate interruption: stop all currently scheduled and playing audio
  public stopPlayback(): void {
    for (const source of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch {}
    }
    this.activeSources = [];
    if (this.outputContext) {
      this.nextPlayTime = this.outputContext.currentTime;
    }
  }

  // Check if assistant audio is currently playing
  public isPlaying(): boolean {
    return this.activeSources.length > 0;
  }

  // Get current mic volume (0 to 255)
  public getInputVolume(): number {
    if (!this.inputAnalyser) return 0;
    const array = new Uint8Array(this.inputAnalyser.frequencyBinCount);
    this.inputAnalyser.getByteFrequencyData(array as any);
    let sum = 0;
    for (let i = 0; i < array.length; i++) sum += array[i];
    return sum / array.length;
  }

  // Get current assistant voice output volume (0 to 255)
  public getOutputVolume(): number {
    if (!this.outputAnalyser) return 0;
    const array = new Uint8Array(this.outputAnalyser.frequencyBinCount);
    this.outputAnalyser.getByteFrequencyData(array as any);
    let sum = 0;
    for (let i = 0; i < array.length; i++) sum += array[i];
    return sum / array.length;
  }

  // Conversion helpers
  private floatTo16BitPCMBase64(input: Float32Array): string {
    const buffer = new ArrayBuffer(input.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < input.length; i++) {
      let s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  private pcm16ToFloat32(bytes: Uint8Array): Float32Array {
    const int16 = new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768.0;
    }
    return float32;
  }

  public cleanup(): void {
    this.stopRecording();
    this.stopPlayback();
    if (this.inputContext) {
      this.inputContext.close();
      this.inputContext = null;
    }
    if (this.outputContext) {
      this.outputContext.close();
      this.outputContext = null;
    }
  }
}
