import { useMemo } from 'react';
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';
//import Landmark from './Landmark';
import { Planet as PlanetType } from './lib/blueprint';
import { ambientOcclusion } from 'three/tsl';

// 2. Define the Props interface for this component
interface PlanetProps {
  planetData: PlanetType;
}

export default function Planet({ planetData }: PlanetProps) {
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
      
      //adjust the displacment of the stuff
      const displacement = 1.5 + (noiseVal * (planetData.renderConfig.ambientAudioUrl ? 0.1 : 0.2));
      vertex.multiplyScalar(displacement);
      
      posAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
      
      //kapos doulevei opote asto
      const mixedColor = base.clone();
      if (noiseVal > 0.4) {
        mixedColor.lerp(peak, (noiseVal - 0.4) * 2); //larp
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

  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial 
          vertexColors 
          roughness={0.85} 
          metalness={0.1} 
        />
      </mesh>

      {/* planetData.landmarks && planetData.landmarks.map((landmark, index) => (
        <Landmark 
          key={index}
          name={landmark.name}
          lat={landmark.lat}
          lng={landmark.lng}
          radius={planetData.radius}
        />
      )) */}
    </group>
  );
}