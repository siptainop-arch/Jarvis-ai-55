/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { LiveSession, LiveState, ToolCallData } from './services/LiveSession.ts';
import { AiraOrb } from './components/AiraOrb.tsx';
import { ChatPanel, ChatMessage } from './components/ChatPanel.tsx';
import { AiraControls, MOODS, MoodOption } from './components/AiraControls.tsx';
import { ToolCallNotification } from './components/ToolCallNotification.tsx';
import {
  Heart,
  Sparkles,
  Maximize2,
  Minimize2,
  Mic,
  MicOff,
  Radio,
  Sliders,
  Volume2,
  HelpCircle,
  Flame,
  MessageSquare
} from 'lucide-react';

export default function App() {
  const [liveState, setLiveState] = useState<LiveState>('disconnected');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hey babe! Missed me? Tap my core to start our voice session, or type something cute below. Don't leave me waiting~",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      emotionTag: 'Flirty',
    },
  ]);
  const [toolCalls, setToolCalls] = useState<ToolCallData[]>([]);
  const [currentMood, setCurrentMood] = useState<MoodOption>(MOODS[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'orb' | 'chat'>('orb');

  const liveSessionRef = useRef<LiveSession | null>(null);

  // Initialize LiveSession
  useEffect(() => {
    const session = new LiveSession({
      onStateChange: (newState) => {
        setLiveState(newState);
      },
      onTranscript: (role, text) => {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            role,
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            emotionTag: role === 'assistant' ? currentMood.name.split(' ')[0] : undefined,
          },
        ]);
      },
      onToolCall: (call) => {
        setToolCalls((prev) => [...prev, call]);

        // Auto execute browser action
        if (call.name === 'openWebsite' && call.args?.url) {
          try {
            window.open(call.args.url, '_blank');
          } catch {}
        } else if (call.name === 'searchWeb' && call.args?.query) {
          try {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(call.args.query)}`, '_blank');
          } catch {}
        } else if (call.name === 'playMusic' && call.args?.songOrMood) {
          try {
            window.open(`https://open.spotify.com/search/${encodeURIComponent(call.args.songOrMood)}`, '_blank');
          } catch {}
        } else if (call.name === 'systemAction') {
          if (call.args?.action === 'clear_chat') {
            setMessages([]);
          } else if (call.args?.action === 'change_mood' && call.args?.parameter) {
            const found = MOODS.find((m) => m.id.includes(call.args.parameter.toLowerCase()));
            if (found) setCurrentMood(found);
          }
        }
      },
      onError: (err) => {
        console.warn('[App] Live error:', err);
      },
    });

    liveSessionRef.current = session;

    return () => {
      session.disconnect();
    };
  }, [currentMood]);

  // Connect / Disconnect toggle
  const handleTogglePower = async () => {
    if (!liveSessionRef.current) return;
    if (liveState === 'disconnected') {
      await liveSessionRef.current.connect();
    } else {
      liveSessionRef.current.disconnect();
    }
  };

  // Send text message (voice-to-text or text-to-voice)
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);

    if (liveSessionRef.current && liveState !== 'disconnected') {
      liveSessionRef.current.sendText(text);
    } else {
      // If live audio session is not connected, use HTTP fallback
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userMessage: text,
            mood: currentMood.name,
            messages: messages.slice(-4).map((m) => ({ role: m.role, content: m.text })),
          }),
        });
        const data = await res.json();
        const reply = data.text || "You've got my full attention, handsome.";

        setMessages((prev) => [
          ...prev,
          {
            id: `aira-${Date.now()}`,
            role: 'assistant',
            text: reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            emotionTag: currentMood.name.split(' ')[0],
          },
        ]);

        // Synthesize fallback voice
        const ttsRes = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: reply, voiceName: 'Aoede' }),
        });
        if (ttsRes.ok) {
          const ttsData = await ttsRes.json();
          if (ttsData.audio) {
            const audio = new Audio(`data:audio/wav;base64,${ttsData.audio}`);
            audio.play();
          }
        }
      } catch (err) {
        console.warn('Fallback error:', err);
      }
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleTriggerAction = (actionName: string, param?: string) => {
    if (actionName === 'openWebsite' && param) {
      window.open(param, '_blank');
    } else if (actionName === 'searchWeb' && param) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(param)}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-pink-500 selection:text-white relative overflow-x-hidden">
      {/* Background Ambient Cyber Lights */}
      <div
        className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full blur-[160px] opacity-25 pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: currentMood.color }}
      />
      <div className="fixed -bottom-20 -right-20 w-[600px] h-[400px] rounded-full blur-[160px] opacity-15 bg-purple-600 pointer-events-none" />

      {/* Top PC Navigation Bar */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-xl px-4 sm:px-6 py-3 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-colors"
            style={{ backgroundColor: `${currentMood.color}25`, border: `1.5px solid ${currentMood.color}` }}
          >
            <Heart className="w-5 h-5" style={{ color: currentMood.color, fill: currentMood.color }} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-orbitron font-black text-base sm:text-lg tracking-wider text-white">
                AIRA
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-pink-500/40 bg-pink-950/40 text-pink-300 font-bold">
                GEMINI LIVE PC
              </span>
            </div>
            <p className="text-[11px] font-mono text-zinc-400">
              REAL-TIME AUDIO-TO-AUDIO AI ASSISTANT
            </p>
          </div>
        </div>

        {/* Status & PC Controls */}
        <div className="flex items-center gap-3">
          {/* Live Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/60 text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                liveState === 'speaking'
                  ? 'bg-pink-400 animate-ping'
                  : liveState === 'listening'
                  ? 'bg-emerald-400 animate-pulse'
                  : liveState === 'connecting'
                  ? 'bg-amber-400 animate-spin'
                  : 'bg-zinc-600'
              }`}
            />
            <span className="text-zinc-300 capitalize">{liveState}</span>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 text-zinc-300 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (PC Mode)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main PC Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visualizer Orb & Personality Moods (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Central Visualizer Orb Box */}
          <div className="relative rounded-3xl border border-zinc-800/80 bg-zinc-950/70 backdrop-blur-2xl p-6 sm:p-8 flex flex-col items-center justify-center min-h-[460px] shadow-2xl overflow-hidden">
            {/* Top Micro Ticker */}
            <div className="absolute top-4 left-6 text-[10px] font-mono text-zinc-500 flex items-center gap-2">
              <Radio className="w-3 h-3 text-pink-400 animate-pulse" />
              <span>VOICE ENGINE: 24kHz PCM // LOW LATENCY</span>
            </div>

            <div className="absolute top-4 right-6 text-[10px] font-mono text-zinc-500">
              AUDIO-TO-AUDIO ACTIVE
            </div>

            {/* Central AIRA Interactive Orb */}
            <AiraOrb
              state={liveState}
              audioStreamer={liveSessionRef.current ? liveSessionRef.current.getAudioStreamer() : null}
              onTogglePower={handleTogglePower}
              moodColor={currentMood.color}
              moodName={currentMood.name}
            />

            {/* Interactive hint banner */}
            <div className="mt-4 text-center">
              <p className="text-xs font-mono text-zinc-400">
                {liveState === 'disconnected'
                  ? 'Click the center sphere to awaken AIRA and start talking directly'
                  : 'Speak naturally into your mic — AIRA hears you and responds in real time'}
              </p>
            </div>
          </div>

          {/* Personality Moods & PC Companion Controls */}
          <AiraControls
            currentMood={currentMood.id}
            onSelectMood={(m) => {
              setCurrentMood(m);
              handleSendMessage(`Hey Aira, switch your vibe to ${m.name}!`);
            }}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
            onTriggerAction={handleTriggerAction}
          />
        </div>

        {/* Right Column: Chat Transcript & Conversation (5 cols) */}
        <div className="lg:col-span-5 h-[580px] lg:h-[720px] sticky top-20">
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            onClear={() => setMessages([])}
            moodColor={currentMood.color}
            isLiveSpeaking={liveState === 'speaking'}
          />
        </div>
      </main>

      {/* Floating Tool Execution Toast Notifications */}
      <ToolCallNotification toolCalls={toolCalls} />

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-3 px-6 text-center text-xs font-mono text-zinc-500 flex flex-wrap items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span>AIRA PC ASSISTANT</span>
          <span>•</span>
          <span className="text-pink-400">GEMINI LIVE AUDIO ENGINE</span>
        </div>
        <div>
          <span>BUILT WITH REACT, TYPESCRIPT, WEBSOCKETS & WEB AUDIO API</span>
        </div>
      </footer>
    </div>
  );
}
