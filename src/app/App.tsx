import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import Planet from '../components/Planet';
import { getPlanetById, getAllPlanets } from '../data/loader';
import HUDOverlay from '../components/uiShit/MasterOverlay';
import { Planet as PlanetType } from '../lib/blueprint';

export default function App() {
  const [activePlanetId, setActivePlanetId] = useState<string>('arrakis');
  const [selectedLandmark, setSelectedLandmark] = useState<any | null>(null);

  const planetsList: PlanetType[] = typeof getAllPlanets === 'function' 
    ? getAllPlanets() 
    : [getPlanetById('arrakis'), getPlanetById('caladan'), getPlanetById('giedi')].filter(Boolean);

  const currentPlanetData = getPlanetById(activePlanetId) || planetsList[0];

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#050505', position: 'relative' }}>
      <HUDOverlay
        planets={planetsList}
        activePlanetId={activePlanetId}
        onSelectPlanet={(id) => {
          setActivePlanetId(id);
          setSelectedLandmark(null); // Close panel when changing planets
        }}
        selectedLandmark={selectedLandmark}
        onCloseLandmark={() => setSelectedLandmark(null)}
      />

      <Canvas camera={{ position: [0, 0, 12], fov: 45 }} frameloop="always">
        <ambientLight intensity={0.1} />
        <directionalLight position={[10, 5, -5]} intensity={2.5} color="#ffedd6" />
        
        {currentPlanetData && (
          <Planet 
            key={activePlanetId} 
            planetData={currentPlanetData} 
            onSelectLandmark={setSelectedLandmark}
          />
        )}
        
        {/* Toggle autoRotate dynamically here */}
        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          autoRotate={!selectedLandmark} 
          autoRotateSpeed={0.5} 
        />
        <Stars radius={150} depth={40} count={4000} factor={4} saturation={0} fade />
        
        <EffectComposer>
          <Bloom luminanceThreshold={0.9} luminanceSmoothing={0.1} height={300} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}