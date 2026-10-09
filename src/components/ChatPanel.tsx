import React, { useRef, useEffect, useState } from 'react';
import { Send, Sparkles, Heart, Bot, User, Trash2, MessageSquare } from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  emotionTag?: string;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClear: () => void;
  moodColor?: string;
  isLiveSpeaking: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  onClear,
  moodColor = '#ec4899',
  isLiveSpeaking,
}) => {
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLiveSpeaking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const samplePrompts = [
    'Hey babe, what are we doing today?',
    'Open Spotify and put on chill beats',
    'Do you actually like me or are you just teasing?',
    'Search Google for funny AI memes',
    'Give me your sassiest one-liner',
  ];

  return (
    <div className="flex flex-col h-full rounded-2xl border border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800/80 bg-zinc-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
          <h3 className="text-xs font-orbitron font-bold text-zinc-100 tracking-wider">
            AIRA LIVE CONVERSATION
          </h3>
        </div>

        <button
          onClick={onClear}
          title="Clear messages"
          className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500 select-none">
            <Heart className="w-10 h-10 mb-2 text-pink-500/50 animate-pulse" />
            <p className="font-orbitron font-bold text-xs text-zinc-300">
              AIRA IS WAITING FOR YOU, BABE
            </p>
            <p className="text-[11px] font-mono text-zinc-500 max-w-xs mt-1">
              Speak into the mic or choose a playful prompt below to start real-time banter.
            </p>
          </div>
        )}

        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono text-zinc-400">
                {isUser ? (
                  <>
                    <span>{m.timestamp}</span>
                    <span className="font-bold text-zinc-300">YOU</span>
                    <User className="w-3 h-3 text-zinc-500" />
                  </>
                ) : (
                  <>
                    <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
                    <span className="font-bold text-pink-400">AIRA</span>
                    {m.emotionTag && (
                      <span className="px-1.5 py-0.2 rounded bg-pink-950/60 text-pink-300 border border-pink-800/40 text-[9px]">
                        {m.emotionTag}
                      </span>
                    )}
                    <span>{m.timestamp}</span>
                  </>
                )}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-sans leading-relaxed backdrop-blur-md shadow-lg ${
                  isUser
                    ? 'bg-pink-600/20 text-pink-100 border border-pink-500/30 rounded-tr-none'
                    : 'bg-zinc-900/90 text-zinc-100 border border-zinc-700/60 rounded-tl-none'
                }`}
                style={!isUser ? { borderLeftColor: moodColor, borderLeftWidth: 3 } : {}}
              >
                {m.text}
              </div>
            </div>
          );
        })}

        {isLiveSpeaking && (
          <div className="flex items-center gap-2 text-xs font-mono text-pink-400 p-2 rounded-xl bg-pink-950/20 border border-pink-900/40 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>AIRA is speaking...</span>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-3 py-2 border-t border-zinc-800/50 bg-zinc-950/40 overflow-x-auto flex items-center gap-2 no-scrollbar">
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(prompt)}
            className="text-[11px] font-mono whitespace-nowrap px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 hover:border-pink-500/40 text-zinc-300 hover:text-pink-300 transition-all shrink-0"
          >
            "{prompt}"
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-zinc-800/80 bg-zinc-900/70 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Whisper or type to AIRA..."
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-pink-500 font-sans transition-colors"
        />

        <button
          type="submit"
          disabled={!input.trim()}
          className="p-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-40 text-white shadow-lg transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
