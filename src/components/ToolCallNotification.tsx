import React from 'react';
import { ToolCallData } from '../services/LiveSession.ts';
import { ExternalLink, Globe, Music, Search, CheckCircle, Zap } from 'lucide-react';

interface ToolCallNotificationProps {
  toolCalls: ToolCallData[];
  onDismiss?: (id: string) => void;
}

export const ToolCallNotification: React.FC<ToolCallNotificationProps> = ({
  toolCalls,
  onDismiss,
}) => {
  if (toolCalls.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toolCalls.slice(-3).map((call) => {
        let title = 'Tool Executed';
        let desc = '';
        let url = '';
        let Icon = Zap;

        if (call.name === 'openWebsite') {
          title = `Opening ${call.args.siteName || 'Website'}`;
          url = call.args.url || '#';
          desc = `AIRA launched ${call.args.siteName} for you.`;
          Icon = Globe;
        } else if (call.name === 'searchWeb') {
          title = 'Searching the Web';
          url = `https://www.google.com/search?q=${encodeURIComponent(call.args.query || '')}`;
          desc = `Query: "${call.args.query}"`;
          Icon = Search;
        } else if (call.name === 'playMusic') {
          title = `Vibe Track: ${call.args.songOrMood || 'Music'}`;
          url = `https://open.spotify.com/search/${encodeURIComponent(call.args.songOrMood || '')}`;
          desc = `Streaming vibe request: ${call.args.songOrMood}`;
          Icon = Music;
        } else if (call.name === 'systemAction') {
          title = `System Action: ${call.args.action}`;
          desc = `Parameter: ${call.args.parameter || 'applied'}`;
          Icon = Zap;
        }

        return (
          <div
            key={call.id}
            className="pointer-events-auto p-3.5 rounded-xl border border-pink-500/40 bg-zinc-950/95 backdrop-blur-xl shadow-2xl shadow-pink-500/20 text-white flex items-start gap-3 animate-slideUp transition-all"
          >
            <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400 shrink-0">
              <Icon className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-orbitron font-bold text-pink-300 truncate">
                  {title}
                </h4>
                <span className="text-[10px] font-mono text-zinc-500">
                  {call.timestamp}
                </span>
              </div>

              <p className="text-xs font-mono text-zinc-300 mt-0.5 truncate">
                {desc}
              </p>

              {url && (
                <div className="mt-2 flex items-center gap-2">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-pink-600 hover:bg-pink-500 text-white transition-colors"
                  >
                    <span>Launch in New Tab</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Executed
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
