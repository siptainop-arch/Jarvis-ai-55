export type ThemeId = 'cyan' | 'gold' | 'violet' | 'emerald' | 'amber';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  codename: string;
  primaryColor: string; // Tailwind hex or css
  accentColor: string;
  glowClass: string;
  borderClass: string;
  textClass: string;
  bgGlowClass: string;
  badgeBg: string;
  description: string;
}

export const HUD_THEMES: Record<ThemeId, ThemeConfig> = {
  cyan: {
    id: 'cyan',
    name: 'Classic Cyan',
    codename: 'MARK III HUD',
    primaryColor: '#00f0ff',
    accentColor: '#38bdf8',
    glowClass: 'shadow-[0_0_25px_rgba(0,240,255,0.4)]',
    borderClass: 'border-cyan-500/40 hover:border-cyan-400',
    textClass: 'text-cyan-400',
    bgGlowClass: 'bg-cyan-500/10',
    badgeBg: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50',
    description: 'Original holographic interface engineered in Malibu Mansion.',
  },
  gold: {
    id: 'gold',
    name: 'Mark L Gold',
    codename: 'NANOTECH OVERDRIVE',
    primaryColor: '#fbbf24',
    accentColor: '#ef4444',
    glowClass: 'shadow-[0_0_25px_rgba(251,191,36,0.4)]',
    borderClass: 'border-amber-500/40 hover:border-amber-400',
    textClass: 'text-amber-400',
    bgGlowClass: 'bg-amber-500/10',
    badgeBg: 'bg-amber-950/60 text-amber-300 border-amber-500/50',
    description: 'Bleeding edge nanotech gold & crimson combat interface.',
  },
  violet: {
    id: 'violet',
    name: 'Stealth Violet',
    codename: 'NIGHT SENTRY V.3',
    primaryColor: '#c084fc',
    accentColor: '#ec4899',
    glowClass: 'shadow-[0_0_25px_rgba(192,132,252,0.4)]',
    borderClass: 'border-purple-500/40 hover:border-purple-400',
    textClass: 'text-purple-400',
    bgGlowClass: 'bg-purple-500/10',
    badgeBg: 'bg-purple-950/60 text-purple-300 border-purple-500/50',
    description: 'Sub-radar tactical black-ops frequency HUD.',
  },
  emerald: {
    id: 'emerald',
    name: 'Veronica Emerald',
    codename: 'ORBITAL HULKBUSTER',
    primaryColor: '#34d399',
    accentColor: '#10b981',
    glowClass: 'shadow-[0_0_25px_rgba(52,211,153,0.4)]',
    borderClass: 'border-emerald-500/40 hover:border-emerald-400',
    textClass: 'text-emerald-400',
    bgGlowClass: 'bg-emerald-500/10',
    badgeBg: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50',
    description: 'Heavy tactical telemetry linked to satellite cage Veronica.',
  },
  amber: {
    id: 'amber',
    name: 'Solar Amber',
    codename: 'MAX THERMAL CORE',
    primaryColor: '#f97316',
    accentColor: '#facc15',
    glowClass: 'shadow-[0_0_25px_rgba(249,115,22,0.4)]',
    borderClass: 'border-orange-500/40 hover:border-orange-400',
    textClass: 'text-orange-400',
    bgGlowClass: 'bg-orange-500/10',
    badgeBg: 'bg-orange-950/60 text-orange-300 border-orange-500/50',
    description: 'Solar charge overcharge mode for heavy repulsor bursts.',
  },
};

export type ProtocolType = 'none' | 'house_party' | 'veronica' | 'diagnostics' | 'clean_slate' | 'stealth';

export interface ProtocolState {
  active: ProtocolType;
  title: string;
  status: string;
  timestamp?: string;
  data?: any;
}
