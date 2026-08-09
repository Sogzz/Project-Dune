import { Planet } from '../lib/blueprint';
import arrakisRaw from './planets/arrakis.json';
import caladanRaw from './planets/caladan.json';

// Cast untyped JSON imports to strict Planet types
const arrakis = arrakisRaw as Planet;
const caladan = caladanRaw as Planet;

export const PLANETS_REGISTRY: Record<string, Planet> = {
  arrakis,
  caladan,
};

// Get a single planet dataset by its slug ID
export function getPlanetById(id: string): Planet {
  return PLANETS_REGISTRY[id] || arrakis;
}

/* Get a list of all available planets for navigation selectors */
export function getAllPlanets(): Planet[] {
  return Object.values(PLANETS_REGISTRY);
}

//this file loads all the JSON planets