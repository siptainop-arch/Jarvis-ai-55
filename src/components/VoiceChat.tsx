import React, { useEffect, useRef, useState } from 'react';
import { HUD_THEMES, ThemeId } from '../types/theme.ts';
import {
  playClick,
  playChime,
  playWavThroughVisualizer,
  getAudioContext,
} from '../utils/audioEffects.ts';
import {
  Mic,
  MicOff,
  Send,
  PhoneCall,
  PhoneOff,
  Volume2,
  VolumeX,
  Settings2,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Sliders,
  Copy,
  Check
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  triggeredProtocol?: string | null;
  audioBase64?: string | null;
}

interface VoiceChatProps {
  theme: ThemeId;
  messages: ChatMessage[];
  isSpeaking: boolean;
  isListening: boolean;
  onSendMessage: (text: string) => Promise<void>;
  setIsSpeaking: (speaking: boolean) => void;
  setIsListening: (listening: boolean) => void;
  onClearChat: () => void;
}

export const VoiceChat: React.FC<VoiceChatProps> = ({
  theme,
  messages,
  isSpeaking,
  isListening,
  onSendMessage,
  setIsSpeaking,
  setIsListening,
  onClearChat,
}) => {
  const currentTheme = HUD_THEMES[theme];
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [inputText, setInputText] = useState('');
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Fenrir');
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const isContinuousRef = useRef(isContinuousMode);
  isContinuousRef.current = isContinuousMode;

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // Supports Hinglish/Hindi accents or code-mixing

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (interimTranscript) {
        setInputText(interimTranscript);
      }

      if (finalTranscript) {
        setInputText(finalTranscript);
        recognition.stop();
        handleVoiceSubmit(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
      if (isContinuousRef.current && event.error !== 'aborted') {
        setTimeout(() => {
          if (isContinuousRef.current) startListening();
        }, 1500);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (isContinuousRef.current && !isSpeaking) {
        setTimeout(() => {
          if (isContinuousRef.current) startListening();
        }, 1200);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSpeaking]);

  const startListening = () => {
    playClick();
    getAudioContext(); // Warm up audio context
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        // Recognition might already be running
      }
    }
  };

  const stopListening = () => {
    playClick();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

  const toggleContinuousCallMode = () => {
    playClick();
    const nextState = !isContinuousMode;
    setIsContinuousMode(nextState);
    isContinuousRef.current = nextState;

    if (nextState) {
      playChime();
      startListening();
    } else {
      stopListening();
    }
  };

  const handleVoiceSubmit = async (text: string) => {
    if (!text.trim()) return;
    setInputText('');
    await onSendMessage(text);

    // If continuous call mode is active, restart listening after assistant finishes speaking
    if (isContinuousRef.current) {
      // The onend listener or speaking state will resume
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const msg = inputText;
    setInputText('');
    onSendMessage(msg);
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    setTimeout(() => setIsCopied(null), 2000);
  };

  return (
    <div className="flex flex-col h-[520px] sm:h-[580px] rounded-lg border bg-slate-950/80 backdrop-blur-md overflow-hidden"
         style={{ borderColor: currentTheme.primaryColor }}>
      {/* Top Bar / Voice Call Controls */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Bot className="w-5 h-5" style={{ color: currentTheme.primaryColor }} />
            {isSpeaking && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            )}
          </div>
          <div>
            <div className="font-orbitron font-bold text-xs tracking-wider text-white flex items-center gap-2">
              <span>J.A.R.V.I.S. VOICE INTERFACE</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono-tech">
                LIVE
              </span>
            </div>
            <div className="text-[10px] font-mono-tech text-slate-400">
              {isSpeaking ? 'TRANSMITTING AUDIO FEED...' : isListening ? 'MICROPHONE ACTIVE • LISTENING...' : 'VOICE STREAM READY'}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Continuous Call Mode Toggle */}
          <button
            onClick={toggleContinuousCallMode}
            title={isContinuousMode ? 'End Live Voice Call' : 'Start Live Hands-Free Voice Call'}
            className={`px-3 py-1.5 rounded-full font-mono-tech text-xs tracking-wider transition-all flex items-center gap-1.5 shadow-sm ${
              isContinuousMode
                ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]'
            }`}
          >
            {isContinuousMode ? <PhoneOff className="w-3.5 h-3.5" /> : <PhoneCall className="w-3.5 h-3.5" />}
            <span className="font-orbitron font-semibold text-[11px]">
              {isContinuousMode ? 'DISCONNECT' : 'LIVE CALL'}
            </span>
          </button>

          {/* Voice Settings */}
          <button
            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            className="p-1.5 rounded border border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 transition-colors"
            title="Configure JARVIS Voice"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Clear Messages */}
          <button
            onClick={onClearChat}
            className="p-1.5 rounded border border-slate-700 bg-slate-900 text-slate-400 hover:text-red-400 hover:border-slate-500 transition-colors"
            title="Clear Terminal Log"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Voice Settings Drawer */}
      {showVoiceSettings && (
        <div className="p-3 border-b border-slate-800 bg-slate-900/90 text-xs font-mono-tech flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">GEMINI TTS VOICE:</span>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="Fenrir">Fenrir (Classic British Butler)</option>
              <option value="Charon">Charon (Crisp Tactical)</option>
              <option value="Zephyr">Zephyr (Smooth Intelligence)</option>
              <option value="Puck">Puck (Witty Quick)</option>
              <option value="Kore">Kore (Articulate Clarinet)</option>
            </select>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span>MULTI-LANG:</span>
            <span className="text-cyan-400 font-bold">ENGLISH • HINDI • HINGLISH</span>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 hud-scanlines">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 select-none opacity-80">
            <div
              className="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center mb-3 animate-spin-slow"
              style={{ borderColor: currentTheme.primaryColor }}
            >
              <Bot className="w-8 h-8" style={{ color: currentTheme.primaryColor }} />
            </div>
            <div className="font-orbitron font-bold text-sm text-slate-200">
              J.A.R.V.I.S. READY FOR TRANSMISSION
            </div>
            <p className="text-xs font-mono-tech text-slate-400 max-w-sm mt-1">
              Tap "Live Call" for hands-free audio conversation, or press the mic button to speak in English, Hindi, or Hinglish.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono-tech text-slate-400">
                {isUser ? (
                  <>
                    <span>{msg.timestamp}</span>
                    <span className="font-bold text-slate-300">SIR (MR. STARK)</span>
                    <User className="w-3 h-3 text-slate-400" />
                  </>
                ) : (
                  <>
                    <Bot className="w-3 h-3" style={{ color: currentTheme.primaryColor }} />
                    <span className="font-bold" style={{ color: currentTheme.primaryColor }}>
                      J.A.R.V.I.S.
                    </span>
                    <span>{msg.timestamp}</span>
                  </>
                )}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-3 text-xs sm:text-sm font-mono-tech leading-relaxed backdrop-blur-md relative ${
                  isUser
                    ? 'bg-cyan-950/40 text-cyan-100 border border-cyan-800/60 rounded-tr-none'
                    : 'bg-slate-900/90 text-slate-100 border border-slate-700/80 rounded-tl-none shadow-md'
                }`}
                style={!isUser ? { borderLeftColor: currentTheme.primaryColor, borderLeftWidth: 3 } : {}}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Protocol Trigger Tag if any */}
                {msg.triggeredProtocol && (
                  <div className="mt-2 pt-1.5 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-cyan-400 font-bold uppercase">
                    <span>PROTOCOL DETECTED: {msg.triggeredProtocol}</span>
                    <Sparkles className="w-3 h-3" />
                  </div>
                )}

                {/* Quick copy button */}
                <button
                  onClick={() => copyMessage(msg.id, msg.content)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white transition-opacity"
                  title="Copy text"
                >
                  {isCopied === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          );
        })}

        {isSpeaking && (
          <div className="flex items-center gap-2 text-xs font-mono-tech text-cyan-400 p-2 rounded bg-cyan-950/30 border border-cyan-800/40 animate-pulse">
            <Volume2 className="w-4 h-4 animate-bounce" />
            <span>JARVIS is speaking... ("Bilkul Sir!")</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/80">
        <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
          {/* Push-to-talk mic button */}
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`p-2.5 rounded-lg border transition-all flex items-center justify-center shrink-0 ${
              isListening
                ? 'bg-red-600 border-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.6)]'
                : 'bg-slate-900 border-slate-700 hover:border-cyan-400 text-cyan-400'
            }`}
            title={isListening ? 'Stop recording' : 'Speak to Jarvis'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isListening
                  ? 'Listening to your voice...'
                  : 'Message J.A.R.V.I.S. (English, Hindi, or Hinglish)...'
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono-tech"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white transition-all shadow-md shrink-0"
            style={{ backgroundColor: currentTheme.primaryColor, color: '#020617' }}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-2 flex items-center justify-between text-[10px] font-mono-tech text-slate-500">
          <div className="flex items-center gap-2">
            <span>MIC: {isListening ? 'OPEN' : 'MUTED'}</span>
            <span>•</span>
            <span>CALL MODE: {isContinuousMode ? 'CONNECTED' : 'STANDBY'}</span>
          </div>
          <span>STARK AI CORE v85.4</span>
        </div>
      </div>
    </div>
  );
};
