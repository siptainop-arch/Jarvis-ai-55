import { AudioStreamer } from './AudioStreamer.ts';

export type LiveState = 'disconnected' | 'connecting' | 'listening' | 'speaking';

export interface ToolCallData {
  id: string;
  name: string;
  args: Record<string, any>;
  timestamp: string;
}

export interface LiveSessionCallbacks {
  onStateChange: (state: LiveState) => void;
  onTranscript: (role: 'user' | 'assistant', text: string) => void;
  onToolCall: (toolCall: ToolCallData) => void;
  onError: (error: string) => void;
}

export class LiveSession {
  private ws: WebSocket | null = null;
  private audioStreamer: AudioStreamer;
  private state: LiveState = 'disconnected';
  private callbacks: LiveSessionCallbacks;
  private speakingTimeout: any = null;

  constructor(callbacks: LiveSessionCallbacks) {
    this.callbacks = callbacks;
    this.audioStreamer = new AudioStreamer();
  }

  public getState(): LiveState {
    return this.state;
  }

  public getAudioStreamer(): AudioStreamer {
    return this.audioStreamer;
  }

  private setState(newState: LiveState) {
    if (this.state !== newState) {
      this.state = newState;
      this.callbacks.onStateChange(newState);
    }
  }

  // Connect to the Gemini Live session on the server
  public async connect(): Promise<void> {
    if (this.state === 'connecting' || this.state === 'listening' || this.state === 'speaking') {
      return;
    }

    this.setState('connecting');

    try {
      // 1. Initialize audio contexts
      await this.audioStreamer.init((base64Pcm16) => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({
            type: 'audio',
            data: base64Pcm16,
          }));
        }
      });

      // 2. Open WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = async () => {
        console.log('[LiveSession] Connected to backend Live WebSocket');
        // Start streaming mic audio to session
        try {
          await this.audioStreamer.startRecording();
          this.setState('listening');
        } catch (micErr: any) {
          console.error('[LiveSession] Mic error:', micErr);
          this.callbacks.onError('Microphone access blocked or unavailable.');
          this.setState('listening');
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          switch (msg.type) {
            case 'connected':
              console.log('[LiveSession] Gemini Live handshake complete:', msg.model);
              break;

            case 'audio':
              // Play incoming 24kHz audio chunk from model
              this.setState('speaking');
              this.audioStreamer.playChunk(msg.data);

              // Reset speaking timer
              if (this.speakingTimeout) clearTimeout(this.speakingTimeout);
              this.speakingTimeout = setTimeout(() => {
                if (!this.audioStreamer.isPlaying()) {
                  this.setState('listening');
                }
              }, 400);
              break;

            case 'transcript':
              if (msg.text) {
                this.callbacks.onTranscript(msg.role || 'assistant', msg.text);
              }
              break;

            case 'interrupted':
              console.log('[LiveSession] Interruption signal received');
              this.audioStreamer.stopPlayback();
              if (this.speakingTimeout) clearTimeout(this.speakingTimeout);
              this.setState('listening');
              break;

            case 'turnComplete':
              setTimeout(() => {
                if (!this.audioStreamer.isPlaying()) {
                  this.setState('listening');
                }
              }, 300);
              break;

            case 'toolCall':
              const toolData: ToolCallData = {
                id: msg.id,
                name: msg.name,
                args: msg.args || {},
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              };
              this.callbacks.onToolCall(toolData);
              break;

            case 'error':
              console.warn('[LiveSession] Server error message:', msg.message);
              this.callbacks.onError(msg.message || 'Live session error');
              break;

            case 'sessionClosed':
              this.disconnect();
              break;
          }
        } catch (err) {
          console.warn('[LiveSession] Error handling message:', err);
        }
      };

      this.ws.onerror = (err) => {
        console.error('[LiveSession] WebSocket error:', err);
        this.callbacks.onError('Connection to AIRA Live Engine failed.');
      };

      this.ws.onclose = () => {
        console.log('[LiveSession] WebSocket closed');
        this.cleanup();
      };
    } catch (err: any) {
      console.error('[LiveSession] Connect error:', err);
      this.callbacks.onError(err?.message || 'Failed to start Live session');
      this.cleanup();
    }
  }

  // Disconnect from session
  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.cleanup();
  }

  // Send text to session
  public sendText(text: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'text',
        text,
      }));
    }
  }

  private cleanup(): void {
    if (this.speakingTimeout) {
      clearTimeout(this.speakingTimeout);
      this.speakingTimeout = null;
    }
    this.audioStreamer.stopRecording();
    this.audioStreamer.stopPlayback();
    this.setState('disconnected');
  }
}
