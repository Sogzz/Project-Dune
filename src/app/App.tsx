import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import Planet from '../Planet';
import { getPlanetById, getAllPlanets } from '../data/loader'; // Assuming loader has getAllPlanets or we build an array
import HUDOverlay from '../uiShit/MasterOverlay';
import { Planet as PlanetType } from '../lib/blueprint';

export default function App() {
  // 1. Manage active planet state
  const [activePlanetId, setActivePlanetId] = useState<string>('arrakis');

  // 2. Load all available planet data for the sidebar list
  // If your loader has a function like getAllPlanets(), use that. Otherwise, load manually:
  const planetsList: PlanetType[] = typeof getAllPlanets === 'function' 
    ? getAllPlanets() 
    : [getPlanetById('arrakis'), getPlanetById('caladan'), getPlanetById('giedi')].filter(Boolean);

  // 3. Retrieve the selected planet data dynamically
  const currentPlanetData = getPlanetById(activePlanetId) || planetsList[0];

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#050505', position: 'relative' }}>
      {/* HUD Layer: HTML DOM sits above the WebGL Canvas */}
      <HUDOverlay
        planets={planetsList}
        activePlanetId={activePlanetId}
        onSelectPlanet={setActivePlanetId}
      />

      {/* 3D WebGL Layer */}
      <Canvas camera={{ position: [0, 0, 12], fov: 45 }} frameloop="always">
        <ambientLight intensity={0.1} />
        <directionalLight position={[10, 5, -5]} intensity={2.5} color="#ffedd6" />
        
        {/* Render the active planet dynamically */}
        {currentPlanetData && (
          <Planet key={activePlanetId} planetData={currentPlanetData} />
        )}
        
        <OrbitControls enablePan={false} enableZoom={true} autoRotate autoRotateSpeed={0.5} />
        <Stars radius={100} depth={40} count={4000} factor={4} saturation={0} fade />
        
        <EffectComposer>
          <Bloom luminanceThreshold={0.9} luminanceSmoothing={0.1} height={300} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}