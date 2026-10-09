import React from 'react';
import { HUD_THEMES, ThemeId } from '../types/theme.ts';
import {
  Shield,
  Zap,
  Activity,
  Cpu,
  Layers,
  Thermometer,
  Crosshair,
  Radio,
  Sparkles
} from 'lucide-react';

interface TelemetrySidebarProps {
  theme: ThemeId;
  reactorOutput?: number;
}

export const TelemetrySidebar: React.FC<TelemetrySidebarProps> = ({
  theme,
  reactorOutput = 100,
}) => {
  const currentTheme = HUD_THEMES[theme];

  return (
    <div className="flex flex-col gap-4">
      {/* Suit Status Card */}
      <div
        className="p-3.5 rounded-lg border bg-slate-950/80 backdrop-blur-md"
        style={{ borderColor: currentTheme.primaryColor }}
      >
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: currentTheme.primaryColor }} />
            <span className="font-orbitron font-bold text-xs text-white">
              MARK LXXXV TELEMETRY
            </span>
          </div>
          <span className="text-[10px] font-mono-tech text-emerald-400 font-bold">
            ● ARMORED
          </span>
        </div>

        {/* Status bars */}
        <div className="space-y-2.5 text-xs font-mono-tech">
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>NANOMESH INTEGRITY</span>
              <span className="text-white font-bold">99.8%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: '99.8%', backgroundColor: currentTheme.primaryColor }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>REPULSOR CAPACITORS</span>
              <span className="text-white font-bold">100% ARMED</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: '100%', backgroundColor: currentTheme.accentColor }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>CLEAN ENERGY RESERVE</span>
              <span className="text-white font-bold">{reactorOutput}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(reactorOutput, 100)}%`, backgroundColor: currentTheme.primaryColor }}
              />
            </div>
          </div>
        </div>

        {/* Subsystems grid */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px] font-mono-tech">
          <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 block">UNIBEAM</span>
            <span className="text-cyan-400 font-bold">ONLINE (100%)</span>
          </div>
          <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 block">HUD TRACKING</span>
            <span className="text-emerald-400 font-bold">LOCKED (60 FPS)</span>
          </div>
          <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 block">FLIGHT STABILIZER</span>
            <span className="text-cyan-400 font-bold">NOMINAL</span>
          </div>
          <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 block">SATELLITE SYNC</span>
            <span className="text-amber-400 font-bold">408 KM LOW ORBIT</span>
          </div>
        </div>
      </div>

      {/* Multilingual Voice Engine Matrix */}
      <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/70 text-xs font-mono-tech">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="font-orbitron font-bold text-slate-200">
            VOICE ENGINE MATRIX
          </span>
        </div>

        <p className="text-slate-400 leading-relaxed text-[11px] mb-2.5">
          J.A.R.V.I.S. is calibrated for natural trilingual conversational intelligence with polite British Stark cadence.
        </p>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-300">English (Global/British)</span>
            <span className="text-emerald-400 font-bold">FLUID</span>
          </div>
          <div className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-300">Hindi (हिन्दी)</span>
            <span className="text-emerald-400 font-bold">FLUID</span>
          </div>
          <div className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-300">Hinglish ("Bilkul Sir!")</span>
            <span className="text-cyan-400 font-bold">NATIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
