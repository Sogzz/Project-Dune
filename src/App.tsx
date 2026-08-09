import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import Planet from './Planet';
import { getPlanetById } from './data/loader';

export default function App() {
  // Fetch the data dynamically
  const arrakisData = getPlanetById('arrakis');
  const caladanData = getPlanetById('caladan');

  //rendering the 3d canvas
  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#050505' }}>
      <Canvas camera={{ position: [0, 0, 12], fov: 45 }} frameloop="always">
        <ambientLight intensity={0.1} />
        <directionalLight position={[10, 5, -5]} intensity={2.5} color="#ffedd6" />
        
        {/* Pass the data to the Planet component */}
        <Planet planetData={arrakisData} />
        
        <OrbitControls enablePan={false} enableZoom={true} autoRotate autoRotateSpeed={0.5} />
        
        <EffectComposer>
          <Bloom luminanceThreshold={0.9} luminanceSmoothing={0.1} height={300} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}