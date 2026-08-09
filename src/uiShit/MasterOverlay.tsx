'use client';

import { Planet } from '../lib/blueprint';
import LeftBar from './leftBar';
import BottomBar from './bottomBar';

interface MasterOverlayProps {
  planets: Planet[];
  activePlanetId: string;
  onSelectPlanet: (id: string) => void;
}

export default function MasterOverlay({
  planets,
  activePlanetId,
  onSelectPlanet,
}: MasterOverlayProps) {
  const currentPlanet = planets.find((p) => p.id === activePlanetId) || planets[0] || null;

  //Extract base color from planet procedural config, defaulting to cyan if unavailable
  const dynamicAccentColor =
    currentPlanet?.renderConfig?.procedural?.baseColor || '#00f3ff';

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex flex-col justify-between p-4 overflow-hidden">
      {/* Top Header Bar */}
      <header className="w-full flex justify-between items-center text-xs font-mono">
        <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 border border-slate-800 rounded-md pointer-events-auto text-slate-300 flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full animate-ping"
            style={{ backgroundColor: dynamicAccentColor }}
          />
          <span className="font-bold tracking-wider" style={{ color: dynamicAccentColor }}>
            PROJECT DUNE
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">v1.0</span>
        </div>

        <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 border border-slate-800 rounded-md text-slate-500">
          ORBITAL_CAM // <span className="text-emerald-400">ONLINE</span>
        </div>
      </header>

      {/* Middle Body: Sidebar Pinned Left */}
      <div className="w-full flex-1 flex items-start justify-start my-4">
        <LeftBar
          planets={planets}
          activePlanetId={activePlanetId}
          onSelectPlanet={onSelectPlanet}
          accentColor={dynamicAccentColor}
        />
      </div>

      {/* Bottom Area: Full-Width Stretched Telemetry Bar */}
      <div className="w-full flex justify-center items-end">
        <BottomBar planet={currentPlanet} accentColor={dynamicAccentColor} />
      </div>
    </div>
  );
}