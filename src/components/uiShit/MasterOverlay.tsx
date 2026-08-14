'use client';

import { Planet } from '../../lib/blueprint';
import LeftBar from './leftBar';
import BottomBar from './bottomBar';
import LandmarkPanel from './landmarkPanel';

interface MasterOverlayProps {
  planets: Planet[];
  activePlanetId: string;
  onSelectPlanet: (id: string) => void;
  selectedLandmark?: any;
  onCloseLandmark?: () => void;
}

export default function MasterOverlay({
  planets,
  activePlanetId,
  onSelectPlanet,
  selectedLandmark,
  onCloseLandmark,
}: MasterOverlayProps) {
  const currentPlanet = planets.find((p) => p.id === activePlanetId) || planets[0] || null;

  const dynamicAccentColor =
    currentPlanet?.renderConfig?.procedural?.baseColor || '#00f3ff';

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      
      {/* Landmark UI Panel Wrapper */}
      <div className="pointer-events-auto">
        <LandmarkPanel landmark={selectedLandmark} onClose={onCloseLandmark || (() => {})} />
      </div>

      <div className="w-full h-full flex flex-col p-4">
        <header className="w-full flex justify-between items-center text-xs font-mono">
          <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 border border-slate-800 rounded-md pointer-events-auto text-slate-300 flex items-center gap-2 z-40">
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

          <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 border border-slate-800 rounded-md text-slate-500 z-40">
            ORBITAL_CAM // <span className={selectedLandmark ? "text-orange-400" : "text-emerald-400"}>
              {selectedLandmark ? "LOCKED" : "ONLINE"}
            </span>
          </div>
        </header>

        {/* Flush Side and Bottom Elements */}
        <div className="absolute left-0 top-24 pointer-events-auto z-30">
          <LeftBar
            planets={planets}
            activePlanetId={activePlanetId}
            onSelectPlanet={onSelectPlanet}
            accentColor={dynamicAccentColor}
          />
        </div>

        <div className="absolute bottom-0 left-0 w-full pointer-events-auto z-30">
          <BottomBar planet={currentPlanet} accentColor={dynamicAccentColor} />
        </div>
      </div>
    </div>
  );
}