import React from 'react';
import { HUD_THEMES, ProtocolState, ProtocolType, ThemeId } from '../types/theme.ts';
import { playClick, playProtocolAlarm, playChime } from '../utils/audioEffects.ts';
import {
  ShieldAlert,
  Satellite,
  Activity,
  Trash2,
  EyeOff,
  Flame,
  CheckCircle2,
  XCircle,
  Sparkles,
  Terminal,
  Radio,
  Cpu
} from 'lucide-react';

interface ProtocolsPanelProps {
  theme: ThemeId;
  activeProtocol: ProtocolState;
  onActivateProtocol: (protocol: ProtocolType, customTitle?: string) => void;
  onSendVoicePrompt: (prompt: string) => void;
}

export const ProtocolsPanel: React.FC<ProtocolsPanelProps> = ({
  theme,
  activeProtocol,
  onActivateProtocol,
  onSendVoicePrompt,
}) => {
  const currentTheme = HUD_THEMES[theme];

  const handleProtocolClick = (protocol: ProtocolType, title: string) => {
    playClick();
    if (protocol === 'house_party' || protocol === 'veronica') {
      playProtocolAlarm();
    } else {
      playChime();
    }
    onActivateProtocol(protocol, title);
  };

  const protocols = [
    {
      id: 'house_party' as ProtocolType,
      title: 'House Party Protocol',
      desc: 'Deploy all autonomous combat Iron Man armors (Mark XVII Heartbreaker, Mark XXXVIII Igor, Mark XXXV Red Snapper).',
      icon: ShieldAlert,
      color: '#ef4444',
      badge: 'COMBAT LEVEL OMEGA',
    },
    {
      id: 'veronica' as ProtocolType,
      title: 'Veronica (Hulkbuster)',
      desc: 'Lock orbital satellite cage in low Earth orbit. Arm heavy hydraulic shock plates and reinforced repulsors.',
      icon: Satellite,
      color: '#10b981',
      badge: 'ORBITAL SATELLITE LINK',
    },
    {
      id: 'diagnostics' as ProtocolType,
      title: 'Tactical Diagnostics',
      desc: 'Deep multi-core telemetry inspection: Arc Reactor flux, nanotech matrix cohesion, neural network latency.',
      icon: Activity,
      color: '#06b6d4',
      badge: 'SYSTEM AUDIT',
    },
    {
      id: 'clean_slate' as ProtocolType,
      title: 'Clean Slate Protocol',
      desc: 'Emergency thermal override sequence and suit detonation safety simulation.',
      icon: Trash2,
      color: '#f97316',
      badge: 'THERMAL PURGE',
    },
    {
      id: 'stealth' as ProtocolType,
      title: 'Silent Sentry Protocol',
      desc: 'Mute acoustic emission, disable visual strobes, enter sub-radar passive telemetry scanning.',
      icon: EyeOff,
      color: '#a855f7',
      badge: 'BLACK-OPS CLOAK',
    },
  ];

  const voiceSamplePrompts = [
    {
      number: '1️⃣',
      text: 'Jarvis, system status report do aur Arc Reactor ka output batao.',
      desc: 'Hindi/Hinglish telemetry status query',
    },
    {
      number: '2️⃣',
      text: 'Jarvis, activate House Party Protocol immediately!',
      desc: 'Voice command protocol trigger',
    },
    {
      number: '3️⃣',
      text: 'Namaste Jarvis, aap kaise ho aur aaj ka kya plan hai?',
      desc: 'Polite Hinglish conversation',
    },
    {
      number: '4️⃣',
      text: 'Jarvis, tell me something witty that Tony Stark would love.',
      desc: 'Signature Stark banter & wit',
    },
    {
      number: '5️⃣',
      text: 'Jarvis, write a Python script for real-time sound analysis.',
      desc: 'Engineering & coding prompt',
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Active Protocol Banner if any */}
      {activeProtocol.active !== 'none' && (
        <div
          className="relative p-4 rounded-lg border bg-slate-950/80 backdrop-blur-md overflow-hidden transition-all duration-300 animate-pulse-glow"
          style={{ borderColor: currentTheme.primaryColor }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
              <div>
                <div className="text-xs font-mono-tech tracking-wider text-slate-400">ACTIVE PROTOCOL:</div>
                <div className="font-orbitron font-bold text-base sm:text-lg text-white">
                  {activeProtocol.title}
                </div>
              </div>
            </div>

            <button
              onClick={() => onActivateProtocol('none')}
              className="text-xs font-mono-tech px-2 py-1 rounded bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 flex items-center gap-1"
            >
              <XCircle className="w-3.5 h-3.5 text-red-400" />
              STANDBY
            </button>
          </div>

          <p className="mt-2 text-xs font-mono-tech text-slate-300">
            {activeProtocol.status}
          </p>

          {/* Simulated Telemetry Cards for House Party */}
          {activeProtocol.active === 'house_party' && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono-tech">
              {[
                { name: 'MK-XVII Heartbreaker', role: 'Artillery', status: 'AIRBORNE' },
                { name: 'MK-XXXVIII Igor', role: 'Heavy Duty', status: 'STANDBY' },
                { name: 'MK-XXXIII Silver Centurion', role: 'Energy Blade', status: 'LOCKED' },
                { name: 'MK-XL Shotgun', role: 'Hyper-Velocity', status: 'READY' },
              ].map((suit, idx) => (
                <div key={idx} className="p-2 rounded bg-slate-900/90 border border-red-500/30 flex flex-col justify-between">
                  <div className="font-bold text-red-400">{suit.name}</div>
                  <div className="text-slate-400">{suit.role}</div>
                  <div className="text-emerald-400 font-bold mt-1">● {suit.status}</div>
                </div>
              ))}
            </div>
          )}

          {/* Simulated Telemetry Cards for Veronica */}
          {activeProtocol.active === 'veronica' && (
            <div className="mt-3 p-2.5 rounded bg-slate-900/90 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono-tech">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-slate-300">VERONICA SATELLITE: ORBIT 408 KM (INCLINATION 51.6°)</span>
              </div>
              <span className="text-emerald-400 font-bold">ARMORED CAGE: DEPLOYMENT READY</span>
            </div>
          )}

          {/* Simulated Telemetry for Diagnostics */}
          {activeProtocol.active === 'diagnostics' && (
            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] font-mono-tech text-slate-300">
              <div className="p-2 bg-slate-900 rounded border border-cyan-500/30">
                <div className="text-cyan-400">NEURAL LINK</div>
                <div className="text-white font-bold">0.42 ms LATENCY</div>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-cyan-500/30">
                <div className="text-cyan-400">NANOMESH</div>
                <div className="text-white font-bold">99.98% COHESION</div>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-cyan-500/30">
                <div className="text-cyan-400">SECURE NODE</div>
                <div className="text-white font-bold">AES-512 STARK-NET</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Protocols Trigger Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4" style={{ color: currentTheme.primaryColor }} />
            <h3 className="font-orbitron text-xs sm:text-sm font-bold tracking-wider uppercase text-white">
              Stark Industries Protocols
            </h3>
          </div>
          <span className="text-[10px] font-mono-tech text-slate-500">AUTH: STARK-TONY-001</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {protocols.map((proto) => {
            const Icon = proto.icon;
            const isCurrentlyActive = activeProtocol.active === proto.id;

            return (
              <button
                key={proto.id}
                onClick={() => handleProtocolClick(proto.id, proto.title)}
                className={`text-left p-3 rounded-lg border transition-all duration-200 backdrop-blur-sm group flex flex-col justify-between ${
                  isCurrentlyActive
                    ? 'bg-slate-900/90 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-600 hover:bg-slate-900/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="p-1.5 rounded-md"
                        style={{ backgroundColor: `${proto.color}18`, color: proto.color }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-orbitron font-semibold text-xs text-white group-hover:text-cyan-300">
                        {proto.title}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] font-mono-tech text-slate-400 line-clamp-2 leading-relaxed">
                    {proto.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono-tech">
                  <span className="text-slate-500">{proto.badge}</span>
                  <span
                    className="font-bold flex items-center gap-1"
                    style={{ color: isCurrentlyActive ? currentTheme.primaryColor : proto.color }}
                  >
                    {isCurrentlyActive ? 'ACTIVE' : 'INITIATE'} →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Voice Prompts Suggestions / Try Saying to Jarvis */}
      <div className="p-3.5 rounded-lg border border-slate-800/90 bg-slate-950/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h4 className="font-orbitron text-xs font-bold tracking-wider text-slate-200 uppercase">
            Try Saying to J.A.R.V.I.S. (English • Hindi • Hinglish)
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {voiceSamplePrompts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                playClick();
                onSendVoicePrompt(item.text);
              }}
              className="text-left p-2.5 rounded border border-slate-800/80 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-600 transition-all group flex items-start gap-2.5"
            >
              <span className="text-base select-none shrink-0">{item.number}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-slate-200 group-hover:text-cyan-300 transition-colors">
                  "{item.text}"
                </div>
                <div className="text-[10px] font-mono-tech text-slate-500 mt-0.5">
                  {item.desc}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
