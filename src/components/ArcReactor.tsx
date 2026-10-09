import React, { useEffect, useRef, useState } from 'react';
import { HUD_THEMES, ThemeId } from '../types/theme.ts';
import { getAnalyser, playClick, playReactorHum } from '../utils/audioEffects.ts';
import { Zap, Flame, Activity, ShieldCheck } from 'lucide-react';

interface ArcReactorProps {
  theme: ThemeId;
  isSpeaking: boolean;
  isListening: boolean;
  reactorOutput?: number;
  onOverdriveToggle?: () => void;
}

export const ArcReactor: React.FC<ArcReactorProps> = ({
  theme,
  isSpeaking,
  isListening,
  reactorOutput = 100,
  onOverdriveToggle,
}) => {
  const currentTheme = HUD_THEMES[theme];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isOverdrive, setIsOverdrive] = useState(false);
  const [coreTemp, setCoreTemp] = useState(452);
  const [fluxJitter, setFluxJitter] = useState(3.82);

  // Core telemetry jitter for realistic live Stark HUD effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCoreTemp(prev => +(450 + Math.random() * 8 + (isSpeaking ? 14 : 0) + (isOverdrive ? 45 : 0)).toFixed(1));
      setFluxJitter(prev => +(3.8 + Math.random() * 0.15 + (isOverdrive ? 1.4 : 0)).toFixed(2));
    }, 450);
    return () => clearInterval(interval);
  }, [isSpeaking, isOverdrive]);

  // Audio wave visualizer canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Get real audio frequency data if available
      const analyser = getAnalyser();
      let frequencyData: Uint8Array | null = null;
      let avgVolume = 0;

      if (analyser) {
        frequencyData = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
        analyser.getByteFrequencyData(frequencyData as any);
        let sum = 0;
        for (let i = 0; i < frequencyData.length; i++) {
          sum += frequencyData[i];
        }
        avgVolume = sum / frequencyData.length;
      }

      // If active audio is detected (speaking or listening)
      const isActive = isSpeaking || isListening || avgVolume > 8;
      const amplitudeMultiplier = isActive ? (avgVolume > 10 ? avgVolume / 35 : 2.5) : 1;

      phase += 0.04 * (isActive ? 2 : 1);

      // Draw circular waveform rings
      const points = 64;
      const baseRadius = 86;

      ctx.save();
      ctx.translate(centerX, centerY);

      // Dynamic glowing waveform polygon
      ctx.beginPath();
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        let waveOffset = Math.sin(angle * 6 + phase) * 4;

        if (frequencyData && frequencyData.length > 0) {
          const freqIndex = Math.floor((i / points) * (frequencyData.length / 2));
          waveOffset += (frequencyData[freqIndex] / 255) * 22;
        } else if (isActive) {
          waveOffset += Math.sin(angle * 12 - phase * 2) * 8 * amplitudeMultiplier;
        }

        const r = baseRadius + waveOffset;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      ctx.strokeStyle = currentTheme.primaryColor;
      ctx.lineWidth = isActive ? 2.5 : 1.5;
      ctx.shadowBlur = isActive ? 18 : 8;
      ctx.shadowColor = currentTheme.primaryColor;
      ctx.stroke();

      // Inner reverse pulse circle
      ctx.beginPath();
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        let innerOffset = Math.cos(angle * 4 - phase * 1.5) * 3;
        if (isActive) {
          innerOffset += Math.sin(angle * 8 + phase) * 6;
        }
        const r = 52 + innerOffset;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = currentTheme.accentColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [theme, isSpeaking, isListening, currentTheme]);

  const handleReactorClick = () => {
    playReactorHum();
    playClick();
    setIsOverdrive(prev => !prev);
    if (onOverdriveToggle) onOverdriveToggle();
  };

  const coils = Array.from({ length: 10 });

  return (
    <div className="relative flex flex-col items-center justify-center p-2 select-none">
      {/* Surrounding Tech Telemetry Panels */}
      <div className="w-full max-w-sm flex items-center justify-between text-xs font-mono-tech px-2 mb-2 text-slate-400">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" style={{ color: currentTheme.primaryColor }} />
          <span>OUTPUT:</span>
          <span className="font-bold text-white tracking-wider">
            {isOverdrive ? '128.4%' : `${reactorOutput}.0%`}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5" style={{ color: currentTheme.accentColor }} />
          <span>CORE:</span>
          <span className="font-bold text-white tracking-wider">{coreTemp} K</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" style={{ color: currentTheme.primaryColor }} />
          <span>FLUX:</span>
          <span className="font-bold text-white tracking-wider">{fluxJitter} GJ/s</span>
        </div>
      </div>

      {/* Main Holographic Reactor Stage */}
      <div
        onClick={handleReactorClick}
        title="Click to pulse Arc Reactor Overdrive"
        className="relative w-72 h-72 sm:w-84 sm:h-84 flex items-center justify-center cursor-pointer group"
      >
        {/* Ambient Back Glow Ring */}
        <div
          className={`absolute inset-4 rounded-full transition-all duration-700 blur-2xl opacity-40 group-hover:opacity-75 ${
            isSpeaking ? 'opacity-90 scale-105' : ''
          }`}
          style={{ backgroundColor: currentTheme.primaryColor }}
        />

        {/* Outer Tech Degree Ring */}
        <div
          className="absolute inset-0 rounded-full border border-dashed animate-spin-slow opacity-60"
          style={{ borderColor: currentTheme.primaryColor }}
        >
          {/* Degree Ticks */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-mono-tech opacity-70" style={{ color: currentTheme.primaryColor }}>
            000°
          </div>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-mono-tech opacity-70" style={{ color: currentTheme.primaryColor }}>
            180°
          </div>
          <div className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] font-mono-tech opacity-70" style={{ color: currentTheme.primaryColor }}>
            270°
          </div>
          <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-mono-tech opacity-70" style={{ color: currentTheme.primaryColor }}>
            090°
          </div>
        </div>

        {/* Counter-Rotating Gyroscopic Ring */}
        <div
          className="absolute inset-5 rounded-full border border-dotted animate-spin-reverse opacity-70"
          style={{ borderColor: currentTheme.accentColor }}
        />

        {/* Segmented Arc Brackets */}
        <div className="absolute inset-8 rounded-full border-2 border-transparent border-t-cyan-400/80 border-b-cyan-400/80 animate-spin-fast opacity-80"
             style={{ borderTopColor: currentTheme.primaryColor, borderBottomColor: currentTheme.primaryColor }} />

        {/* 10 Palladium / Vibranium Magnetic Coils */}
        <div className="absolute inset-10 rounded-full">
          {coils.map((_, i) => {
            const rot = i * 36;
            return (
              <div
                key={i}
                className="absolute top-0 left-1/2 w-4 h-6 -translate-x-1/2 origin-bottom transition-all duration-300"
                style={{
                  transform: `rotate(${rot}deg) translateY(0px)`,
                  transformOrigin: '50% 120px',
                }}
              >
                <div
                  className="w-full h-full rounded-sm border shadow-sm transition-all duration-300 group-hover:brightness-125"
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    borderColor: currentTheme.primaryColor,
                    boxShadow: isSpeaking
                      ? `0 0 10px ${currentTheme.primaryColor}`
                      : `0 0 4px ${currentTheme.primaryColor}`,
                  }}
                >
                  <div
                    className="w-full h-1/2 border-b"
                    style={{ borderColor: currentTheme.accentColor }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Real-time Waveform Canvas */}
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* Glowing Central Triangular/Circular Core */}
        <div className="relative z-20 flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 bg-slate-950/90 shadow-inner backdrop-blur-md transition-transform duration-300 group-hover:scale-105"
             style={{ borderColor: currentTheme.primaryColor }}>
          {/* Inner pulsating core element */}
          <div
            className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full flex flex-col items-center justify-center transition-all duration-300 ${
              isSpeaking ? 'animate-pulse scale-110' : ''
            }`}
            style={{
              background: `radial-gradient(circle, ${currentTheme.primaryColor} 0%, rgba(2,6,23,0.95) 75%)`,
              boxShadow: `0 0 25px ${currentTheme.primaryColor}`,
            }}
          >
            <div className="font-orbitron font-black text-xs sm:text-sm tracking-widest text-slate-950">
              STARK
            </div>
            <div className="text-[9px] font-mono-tech tracking-tighter text-slate-900 font-bold">
              MK-LXXXV
            </div>
          </div>

          {/* Sub-label */}
          <span className="text-[9px] font-mono-tech tracking-wider mt-1 text-slate-400">
            {isSpeaking ? 'VOICE ACTIVE' : isListening ? 'LISTENING...' : 'ONLINE'}
          </span>
        </div>

        {/* Corner Reticle Accents */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: currentTheme.primaryColor }} />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: currentTheme.primaryColor }} />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: currentTheme.primaryColor }} />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: currentTheme.primaryColor }} />
      </div>

      {/* Core status badge */}
      <div className="mt-3 flex items-center gap-3">
        <div
          className={`px-3 py-1 rounded border text-xs font-mono-tech tracking-wider uppercase transition-all duration-300 flex items-center gap-2 ${
            isSpeaking
              ? 'bg-cyan-500/20 text-white border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
              : 'bg-slate-900/80 text-slate-300 border-slate-700/60'
          }`}
          style={isSpeaking ? { borderColor: currentTheme.primaryColor, color: currentTheme.primaryColor } : {}}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isSpeaking ? 'animate-ping bg-cyan-400' : isListening ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
            }`}
          />
          {isSpeaking ? 'J.A.R.V.I.S. VOCALIZING' : isListening ? 'TRANSCRIBING AUDIO' : 'STANDBY • READY'}
        </div>

        <button
          onClick={handleReactorClick}
          className="text-[11px] font-mono-tech px-2.5 py-1 rounded border border-slate-700 bg-slate-900 hover:border-slate-500 text-slate-300 transition-colors flex items-center gap-1.5"
        >
          <ShieldCheck className="w-3 h-3 text-cyan-400" />
          <span>{isOverdrive ? 'PULSE STABILIZED' : 'OVERDRIVE PULSE'}</span>
        </button>
      </div>
    </div>
  );
};
