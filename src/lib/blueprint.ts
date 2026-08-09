export type Faction = 'Atreides' | 'Harkonnen' | 'Fremen' | 'Imperial' | 'Guild' | 'Neutral';
export type LandmarkCategory = 'city' | 'sietch' | 'fortress' | 'geographical' | 'outpost';


export interface Planet {
    id: string;
    name: string;
    tagline: string;
    sector: string;
    environment: {
        climate: string;
        primaryExport: string;
        gravity: string;
    };
    renderConfig: RenderConfig;
    landmarks: Landmark[];
}

export interface Landmark {
    id: string;
    name: string;
    subtitle: string;
    category: LandmarkCategory;
    faction: Faction;
    coordinates: Coordinates;
    customModelUrl?: string; // Optional custom 3D mesh GLTF file
    summary: string;
    lore: string;
    gallery: GalleryMedia[];
}

export interface GalleryMedia {
  id: string;
  url: string;
  caption: string;
  type: 'image' | 'video';
  credit?: string;
}

export interface Coordinates {
  lat: number; //-90 to +90
  lng: number; //-180 to +180
}

export interface RenderConfig {
    radius: number;
    rotationSpeed: number;
    // Add procedural generation properties
    procedural?: {
        baseColor: string;
        peakColor: string;
        basinColor: string;
        noiseScale: number;
    };
    textures: {
        diffuseUrl: string;
        bumpUrl?: string;
    };
    atmosphere: {
        color: string;
        intensity: number;
    };
    ambientAudioUrl?: string;
}