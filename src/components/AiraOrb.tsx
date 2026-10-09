import React, { useEffect, useRef, useState } from 'react';
import { LiveState } from '../services/LiveSession.ts';
import { AudioStreamer } from '../services/AudioStreamer.ts';
import { Mic, MicOff, Power, Sparkles, Volume2, Heart } from 'lucide-react';

interface AiraOrbProps {
  state: LiveState;
  audioStreamer: AudioStreamer | null;
  onTogglePower: () => void;
  moodColor?: string;
  moodName?: string;
}

export const AiraOrb: React.FC<AiraOrbProps> = ({
  state,
  audioStreamer,
  onTogglePower,
  moodColor = '#ec4899', // Pink / Magenta
  moodName = 'Flirty & Sassy',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pulseScale, setPulseScale] = useState(1);

  // Real-time canvas waveform and fluid orb animation
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
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Read audio volume
      let vol = 0;
      if (audioStreamer) {
        if (state === 'speaking') {
          vol = audioStreamer.getOutputVolume();
        } else if (state === 'listening') {
          vol = audioStreamer.getInputVolume();
        }
      }

      // Smooth volume scaling
      const normVol = Math.min(1, vol / 120);
      setPulseScale(1 + normVol * 0.35);

      phase += 0.03 + (state === 'speaking' ? 0.05 : state === 'listening' ? 0.03 : 0.01);

      // Render concentric wave rings
      const numRings = state === 'speaking' ? 4 : state === 'listening' ? 3 : 2;
      for (let r = 0; r < numRings; r++) {
        const baseRadius = 80 + r * 22;
        const numPoints = 64;

        ctx.beginPath();
        for (let i = 0; i < numPoints; i++) {
          const angle = (i / numPoints) * Math.PI * 2;
          let wave = 0;

          if (state === 'speaking') {
            wave = Math.sin(angle * 7 + phase * 2 + r) * (14 + normVol * 28);
          } else if (state === 'listening') {
            wave = Math.sin(angle * 5 - phase * 1.5 + r) * (8 + normVol * 22);
          } else if (state === 'connecting') {
            wave = Math.sin(angle * 10 + phase * 4) * 6;
          } else {
            wave = Math.sin(angle * 3 + phase) * 3;
          }

          const radius = baseRadius + wave;
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();

        const alpha = Math.max(0.15, 0.7 - r * 0.18 + (state === 'speaking' ? 0.3 : 0));
        ctx.strokeStyle = moodColor;
        ctx.lineWidth = r === 0 ? 2.5 : 1.5;
        ctx.shadowColor = moodColor;
        ctx.shadowBlur = state === 'speaking' ? 24 : state === 'listening' ? 16 : 8;
        ctx.globalAlpha = alpha;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [state, audioStreamer, moodColor]);

  // Color variables according to state
  const isConnected = state === 'listening' || state === 'speaking';

  return (
    <div className="relative flex flex-col items-center justify-center p-4 select-none">
      {/* Mood Tag */}
      <div className="mb-3 flex items-center gap-2 px-3 py-1 rounded-full border border-pink-500/30 bg-pink-950/40 text-pink-300 text-xs font-mono tracking-wider backdrop-blur-md">
        <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400 animate-pulse" />
        <span>AIRA // {moodName.toUpperCase()}</span>
      </div>

      {/* Main Visualizer Stage */}
      <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">
        {/* Ambient Glow Aura */}
        <div
          className={`absolute inset-6 rounded-full blur-3xl transition-all duration-700 pointer-events-none ${
            state === 'speaking'
              ? 'opacity-85 scale-125'
              : state === 'listening'
              ? 'opacity-70 scale-110'
              : state === 'connecting'
              ? 'opacity-60 animate-pulse'
              : 'opacity-35 scale-95'
          }`}
          style={{
            background: `radial-gradient(circle, ${moodColor} 0%, rgba(147, 51, 234, 0.4) 60%, transparent 100%)`,
          }}
        />

        {/* Outer Particle Wave Canvas */}
        <canvas
          ref={canvasRef}
          width={384}
          height={384}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* Rotating Futuristic Tech Gyro Ring */}
        <div
          className={`absolute inset-8 rounded-full border border-dashed transition-all duration-1000 ${
            state === 'connecting'
              ? 'animate-spin border-pink-400'
              : state === 'speaking'
              ? 'animate-spin-slow border-pink-500/80'
              : 'border-pink-500/30'
          }`}
          style={{ borderColor: moodColor }}
        />

        {/* Central Power & Mic Interactive Sphere */}
        <button
          onClick={onTogglePower}
          title={isConnected ? 'Click to disconnect' : 'Click to start real-time Live voice chat'}
          className="relative z-20 w-32 h-32 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center transition-all duration-300 group cursor-pointer shadow-2xl focus:outline-none"
          style={{
            transform: `scale(${pulseScale})`,
            background: `radial-gradient(circle at 35% 35%, #1e1b4b 0%, #09090b 80%)`,
            border: `2px solid ${isConnected ? moodColor : 'rgba(236, 72, 153, 0.4)'}`,
            boxShadow: isConnected
              ? `0 0 35px ${moodColor}60, inset 0 0 20px ${moodColor}40`
              : `0 0 20px rgba(0,0,0,0.8)`,
          }}
        >
          {/* Inner pulsating avatar/icon */}
          <div className="relative flex flex-col items-center justify-center">
            {state === 'connecting' ? (
              <div className="w-8 h-8 rounded-full border-2 border-t-pink-400 border-r-pink-400 border-b-transparent border-l-transparent animate-spin mb-1" />
            ) : isConnected ? (
              <Mic
                className={`w-9 h-9 mb-1 transition-all ${
                  state === 'speaking'
                    ? 'text-pink-300 animate-bounce'
                    : 'text-pink-400 group-hover:scale-110'
                }`}
                style={{ color: moodColor }}
              />
            ) : (
              <Power className="w-9 h-9 text-pink-400/80 group-hover:text-pink-300 group-hover:scale-110 mb-1 transition-all" />
            )}

            <span className="font-orbitron font-bold text-xs tracking-widest text-white">
              {state === 'disconnected' ? 'CONNECT' : 'AIRA'}
            </span>

            <span className="text-[9px] font-mono tracking-tighter text-pink-300/80 mt-0.5">
              {state.toUpperCase()}
            </span>
          </div>
        </button>
      </div>

      {/* State Status Tag */}
      <div className="mt-2 flex items-center gap-2">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            state === 'speaking'
              ? 'bg-pink-400 animate-ping'
              : state === 'listening'
              ? 'bg-emerald-400 animate-pulse'
              : state === 'connecting'
              ? 'bg-amber-400 animate-spin'
              : 'bg-zinc-600'
          }`}
        />
        <span className="text-xs font-mono text-zinc-300 tracking-wider">
          {state === 'speaking'
            ? 'AIRA IS TALKING...'
            : state === 'listening'
            ? 'LISTENING TO YOU (AUDIO-TO-AUDIO)...'
            : state === 'connecting'
            ? 'CONNECTING GEMINI LIVE SESSION...'
            : 'TAP ORB TO START VOICE CHAT'}
        </span>
      </div>
    </div>
  );
};
