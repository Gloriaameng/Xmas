
export type GestureState = 'open' | 'fist' | 'grab' | 'idle';

export enum ModelType {
  CHRISTMAS_TREE = 'Christmas Tree',
  HEART = 'Heart',
  FLOWER = 'Flower',
  SATURN = 'Saturn',
  BUDDHA = 'Buddha',
  FIREWORKS = 'Fireworks'
}

export interface ParticleConfig {
  color: string;
  count: number;
  size: number;
}

export interface HandData {
  gesture: GestureState;
  rotation: { x: number; y: number; z: number };
  zoom: number;
  center: { x: number; y: number };
}
