'use client';

import { Planet } from '../lib/blueprint';

interface LeftBarProps {
  planets: Planet[];
  activePlanetId: string;
  onSelectPlanet: (id: string) => void;
  accentColor: string; // Dynamic hex color from active planet
}

export default function LeftBar({
  planets,
  activePlanetId,
  onSelectPlanet,
  accentColor,
}: LeftBarProps) {
  return (
    <aside className="pointer-events-auto flex flex-col gap-2 w-56 p-3 bg-slate-950/85 backdrop-blur-xl border-r border-y border-slate-800/80 rounded-r-md text-slate-300 font-mono shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[10px] tracking-widest text-slate-400">
        <span>// SELECT_TARGET</span>
        <span
          className="h-2 w-2 rounded-full animate-pulse"
          style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
        />
      </div>

      {/* Planet Selection List */}
      <nav className="flex flex-col gap-1.5">
        {planets.map((planet) => {
          const isActive = planet.id === activePlanetId;
          const planetColor = planet.renderConfig?.procedural?.basinColor || '#00f3ff';

          return (
            <button
              key={planet.id}
              onClick={() => onSelectPlanet(planet.id)}
              className={`group relative flex items-center justify-between px-3 py-2 text-left transition-all duration-150 rounded-sm border ${
                isActive
                  ? 'bg-slate-900/80 text-slate-100'
                  : 'bg-slate-900/20 border-transparent text-slate-400 hover:border-slate-800 hover:text-slate-200'
              }`}
              style={{
                borderColor: isActive ? planetColor : 'transparent',
                boxShadow: isActive ? `inset 0 0 10px ${planetColor}20` : 'none',
              }}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div
                  className="absolute left-0 top-1 bottom-1 w-0.5"
                  style={{ backgroundColor: planetColor, boxShadow: `0 0 10px ${planetColor}` }}
                />
              )}

              <div className="flex flex-col pl-1">
                <span className="text-xs font-semibold tracking-wide uppercase">{planet.name}</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  {planet.sector || 'UNKNOWN'}
                </span>
              </div>
              
              <span
                className="text-[10px] font-mono"
                style={{ color: isActive ? planetColor : undefined }}
              >
                {isActive ? '▶' : ''}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}