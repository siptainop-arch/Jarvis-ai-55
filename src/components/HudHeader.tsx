import React, { useEffect, useState } from 'react';
import { HUD_THEMES, ThemeId } from '../types/theme.ts';
import { playClick, getMuted, setMuted } from '../utils/audioEffects.ts';
import {
  Shield,
  Volume2,
  VolumeX,
  Palette,
  Radio,
  Zap,
  Cpu,
  Layers
} from 'lucide-react';

interface HudHeaderProps {
  currentTheme: ThemeId;
  onThemeSelect: (theme: ThemeId) => void;
  activeProtocolName?: string;
}

export const HudHeader: React.FC<HudHeaderProps> = ({
  currentTheme,
  onThemeSelect,
  activeProtocolName,
}) => {
  const theme = HUD_THEMES[currentTheme];
  const [timeStr, setTimeStr] = useState('');
  const [muted, setLocalMuted] = useState(getMuted());

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleMuteToggle = () => {
    playClick();
    const next = !muted;
    setLocalMuted(next);
    setMuted(next);
  };

  const themesList: ThemeId[] = ['cyan', 'gold', 'violet', 'emerald', 'amber'];

  return (
    <header className="relative w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md z-30">
      {/* Top micro ticker */}
      <div className="px-4 py-1 border-b border-slate-900 flex items-center justify-between text-[10px] font-mono-tech text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="text-slate-300">ORBITAL UPLINK: VERONICA-1.4A // SECURE</span>
          </div>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline text-cyan-400">PALLADIUM CORE FLUX: STABLE</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-300 font-bold tracking-widest">{timeStr || '00:00:00'}</span>
          <span className="hidden md:inline text-slate-500">STARK INDUSTRIES AI</span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Branding & Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all duration-300 shadow-md"
            style={{
              borderColor: theme.primaryColor,
              backgroundColor: `${theme.primaryColor}15`,
            }}
          >
            <Shield className="w-6 h-6" style={{ color: theme.primaryColor }} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-orbitron font-black text-lg sm:text-xl tracking-wider text-white">
                J.A.R.V.I.S.
              </h1>
              <span
                className="text-[10px] font-mono-tech px-2 py-0.5 rounded border uppercase tracking-wider font-bold"
                style={{
                  backgroundColor: `${theme.primaryColor}15`,
                  borderColor: theme.primaryColor,
                  color: theme.primaryColor,
                }}
              >
                {theme.codename}
              </span>
            </div>
            <p className="text-[11px] font-mono-tech text-slate-400">
              STARK INDUSTRIES • TONY STARK VOICE PROTOCOL MATRIX
            </p>
          </div>
        </div>

        {/* 5 HUD Themes Selector & Quick Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Themes Pill Selector */}
          <div className="flex items-center gap-1 p-1 rounded-lg border border-slate-800 bg-slate-900/80">
            <Palette className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
            {themesList.map((tId) => {
              const th = HUD_THEMES[tId];
              const isSelected = currentTheme === tId;
              return (
                <button
                  key={tId}
                  onClick={() => {
                    playClick();
                    onThemeSelect(tId);
                  }}
                  title={th.name}
                  className={`px-2 py-1 rounded text-[11px] font-mono-tech transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  style={isSelected ? { color: th.primaryColor, border: `1px solid ${th.primaryColor}40` } : {}}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: th.primaryColor }}
                  />
                  <span className="hidden lg:inline">{th.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Mute Audio SFX */}
          <button
            onClick={handleMuteToggle}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-600 transition-colors"
            title={muted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
