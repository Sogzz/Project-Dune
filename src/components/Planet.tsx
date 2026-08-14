import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';
import { useFrame } from '@react-three/fiber';
import { Planet as PlanetType } from '../lib/blueprint';
import { latLngToVector3 } from '../lib/coordinates';

interface PlanetProps {
  planetData: PlanetType;
  onSelectLandmark?: (landmark: any) => void;
}

function LandmarkMarker({ data, radius, onSelect }: { data: any, radius: number, onSelect: any }) {
  const markerRef = useRef<THREE.Mesh>(null);
  
  // Use your dedicated coordinate converter here
  const position = latLngToVector3(data.coordinates, radius + 0.2);

  // Slowly rotate the marker object itself
  useFrame((state, delta) => {
    if (markerRef.current) markerRef.current.rotation.y += delta * 2;
  });

  return (
    <mesh 
      position={position} 
      ref={markerRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(data);
      }}
      onPointerOver={() => document.body.style.cursor = 'pointer'}
      onPointerOut={() => document.body.style.cursor = 'auto'}
    >
      <octahedronGeometry args={[0.15, 0]} />
      <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={2} />
    </mesh>
  );
}

export default function Planet({ planetData, onSelectLandmark }: PlanetProps) {
  const geometry = useMemo(() => {
    const { radius } = planetData.renderConfig;    
    const geo = new THREE.IcosahedronGeometry(radius, 64);
    
    const posAttribute = geo.attributes.position;
    const vertexCount = posAttribute.count;
    const colors = new Float32Array(vertexCount * 3);
    
    const noise3D = createNoise3D();
    const base = new THREE.Color(planetData.renderConfig.procedural?.baseColor || '#888888');
    const peak = new THREE.Color(planetData.renderConfig.procedural?.peakColor);
    const basin = new THREE.Color(planetData.renderConfig.procedural?.basinColor);
    
    const vertex = new THREE.Vector3();
    
    for (let i = 0; i < vertexCount; i++) {
      vertex.fromBufferAttribute(posAttribute, i);
      
      const dir = vertex.clone().normalize();
      const noiseVal = noise3D(dir.x * 1.2, dir.y * 1.2, dir.z * 1.2);
      
      const displacement = 1.5 + (noiseVal * (planetData.renderConfig.ambientAudioUrl ? 0.1 : 0.2));
      vertex.multiplyScalar(displacement);
      
      posAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
      
      const mixedColor = base.clone();
      if (noiseVal > 0.4) {
        mixedColor.lerp(peak, (noiseVal - 0.4) * 2);
      } else if (noiseVal < -0.6) {
        mixedColor.lerp(basin, Math.abs(noiseVal));
      }
      
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }
    
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    
    return geo;
  }, [planetData]);

  // We multiply your radius by 1.5 here to account for the displacement multiplier in your vertex shader logic
  const surfaceRadius = planetData.renderConfig.radius * 1.5;

  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial 
          vertexColors 
          roughness={0.85} 
          metalness={0.1} 
        />
      </mesh>

      {planetData.landmarks && planetData.landmarks.map((landmark, index) => (
        <LandmarkMarker 
          key={index} 
          data={landmark} 
          radius={surfaceRadius} 
          onSelect={onSelectLandmark} 
        />
      ))}
    </group>
  );
}