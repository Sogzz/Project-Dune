'use client';

import { Planet } from '../../lib/blueprint';

interface BottomBarProps {
  planet: Planet | null;
  accentColor: string; // Dynamic hex color from active planet
}

export default function BottomBar({ planet, accentColor }: BottomBarProps) {
  if (!planet) return null;

  const { name, tagline, sector, environment, landmarks } = planet;

  return (
    <footer
      className="pointer-events-auto w-full max-w-7xl mx-auto p-4 bg-slate-950/85 backdrop-blur-xl border-t-2 border-x border-slate-800 rounded-t-xl text-slate-200 font-mono transition-colors duration-300 shadow-2xl"
      style={{ borderTopColor: accentColor }}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Left Column: Title & Tagline */}
        <div className="min-w-[200px]">
          <div className="text-[10px] tracking-widest text-slate-500 uppercase">
            // SECTOR: {sector || 'UNKNOWN'}
          </div>
          <h1
            className="text-xl font-bold tracking-wider uppercase"
            style={{ color: accentColor, textShadow: `0 0 8px ${accentColor}60` }}
          >
            {name}
          </h1>
          {tagline && (
            <p className="text-xs text-amber-300/80 italic font-sans mt-0.5">
              "{tagline}"
            </p>
          )}
        </div>

        {/* Center Column: Surface Landmarks */}
        {landmarks && landmarks.length > 0 && (
          <div className="flex-1 border-y md:border-y-0 md:border-x border-slate-800/80 py-2 md:py-0 md:px-6">
            <div className="text-[15px] text-slate-500 uppercase mb-1">//KNOWN_LANDMARKS</div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-300">
              {landmarks.map((lm) => (
                <span
                  key={lm.id}
                  className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[11px]"
                >
                  {lm.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Right Column */}
        {environment && (
          <div className="flex flex-[0.9] justify-end gap-3 text-xs">
            <div className="px-4 py-1.5 bg-slate-900/90 border border-slate-800 rounded text-center min-w-[85px]">
              <span className="text-slate-400 block text-[11px] tracking-wide mb-0.5">CLIMATE</span>
              <span className="text-amber-400 font-semibold text-[12px]">{environment.climate}</span>
            </div>
            <div className="px-4 py-1.5 bg-slate-900/90 border border-slate-800 rounded text-center min-w-[85px]">
              <span className="text-slate-400 block text-[11px] tracking-wide mb-0.5">EXPORT</span>
              <span className="text-emerald-400 font-semibold text-[12px]">{environment.primaryExport}</span>
            </div>
            <div className="px-4 py-1.5 bg-slate-900/90 border border-slate-800 rounded text-center min-w-[85px]">
              <span className="text-slate-400 block text-[11px] tracking-wide mb-0.5">GRAVITY</span>
              <span style={{ color: accentColor }} className="font-semibold text-[12px]">
                {environment.gravity}
              </span>
            </div>
          </div>
        )}

      </div>
    </footer>
  );
}