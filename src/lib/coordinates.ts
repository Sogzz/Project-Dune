import * as THREE from 'three';
import { Coordinates } from './blueprint';

/**
 * Converts Latitude/Longitude degrees to a 3D Vector position on a sphere surface.
 * @param coords { lat, lng }
 * @param radius Radius of the 3D globe mesh
 */
export function latLngToVector3(coords: Coordinates, radius: number): THREE.Vector3 {
    const phi = (90 - coords.lat) * (Math.PI / 180);
    const theta = (coords.lng + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
}