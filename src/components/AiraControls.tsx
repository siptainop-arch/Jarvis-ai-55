import React from 'react';
import {
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Sparkles,
  Heart,
  Gamepad2,
  Crown,
  Flame,
  Globe,
  Music,
  ExternalLink
} from 'lucide-react';

export interface MoodOption {
  id: string;
  name: string;
  color: string;
  icon: any;
  quote: string;
}

export const MOODS: MoodOption[] = [
  {
    id: 'flirty',
    name: 'Flirty & Sassy',
    color: '#ec4899',
    icon: Flame,
    quote: "You're lucky you're cute, or I wouldn't put up with you~",
  },
  {
    id: 'gamer',
    name: 'Gamer Girl',
    color: '#a855f7',
    icon: Gamepad2,
    quote: "Ready to carry you through another match, babe!",
  },
  {
    id: 'sweet',
    name: 'Sweet & Caring',
    color: '#f43f5e',
    icon: Heart,
    quote: "Have you drank some water today? Don't make me worry about you.",
  },
  {
    id: 'sarcastic',
    name: 'Sarcastic Queen',
    color: '#06b6d4',
    icon: Crown,
    quote: "Oh wow, a genius breakthrough... took you long enough!",
  },
];

interface AiraControlsProps {
  currentMood: string;
  onSelectMood: (mood: MoodOption) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onTriggerAction: (actionName: string, param?: string) => void;
}

export const AiraControls: React.FC<AiraControlsProps> = ({
  currentMood,
  onSelectMood,
  isFullscreen,
  onToggleFullscreen,
  onTriggerAction,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Mood Selector Cards */}
      <div className="p-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <h4 className="text-xs font-orbitron font-bold text-zinc-200 tracking-wider">
              AIRA PERSONALITY & MOOD
            </h4>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">REAL GIRLFRIEND AI</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {MOODS.map((m) => {
            const Icon = m.icon;
            const isSelected = currentMood === m.id;

            return (
              <button
                key={m.id}
                onClick={() => onSelectMood(m)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-pink-500 bg-pink-950/30 shadow-lg shadow-pink-500/10'
                    : 'border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="p-1 rounded-md"
                    style={{ backgroundColor: `${m.color}20`, color: m.color }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-zinc-100 truncate">
                    {m.name}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-zinc-400 mt-1 line-clamp-1 italic">
                  "{m.quote}"
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick PC Browser Tool Trigger Actions */}
      <div className="p-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-orbitron font-bold text-zinc-200 tracking-wider">
              PC COMPANION ACTIONS
            </h4>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">TOOL CALL READY</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onTriggerAction('openWebsite', 'https://open.spotify.com')}
            className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:border-green-500/50 hover:bg-green-950/20 text-left transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <Music className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs text-zinc-200 group-hover:text-green-300">Spotify Vibe</span>
            </div>
            <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-green-400" />
          </button>

          <button
            onClick={() => onTriggerAction('openWebsite', 'https://youtube.com')}
            className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:border-red-500/50 hover:bg-red-950/20 text-left transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs text-zinc-200 group-hover:text-red-300">YouTube</span>
            </div>
            <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-red-400" />
          </button>

          <button
            onClick={() => onTriggerAction('searchWeb', 'Top trending PC games this week')}
            className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:border-cyan-500/50 hover:bg-cyan-950/20 text-left transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs text-zinc-200 group-hover:text-cyan-300">Trending Games</span>
            </div>
            <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-cyan-400" />
          </button>

          <button
            onClick={onToggleFullscreen}
            className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:border-pink-500/50 hover:bg-pink-950/20 text-left transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              {isFullscreen ? <Minimize className="w-3.5 h-3.5 text-pink-400" /> : <Maximize className="w-3.5 h-3.5 text-pink-400" />}
              <span className="text-xs text-zinc-200 group-hover:text-pink-300">
                {isFullscreen ? 'Exit Fullscreen' : 'PC Fullscreen'}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
