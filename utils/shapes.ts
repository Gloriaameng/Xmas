import * as THREE from 'three';
import { ModelType } from '../types';

export interface ParticleData {
  position: THREE.Vector3;
  color: THREE.Color;
  size: number;
}

export const generateDetailedTreePoints = (count: number): ParticleData[] => {
  const data: ParticleData[] = [];
  const dGreen = new THREE.Color('#003311');
  const bGreen = new THREE.Color('#008844');
  const red = new THREE.Color('#ee2222');
  const white = new THREE.Color('#ffffff');

  for (let i = 0; i < count; i++) {
    const t = Math.random();
    const height = t * 180 - 80;
    const radiusAtHeight = (1 - t) * 80 + 3;
    const angle = Math.random() * Math.PI * 2;
    
    const pos = new THREE.Vector3(
      Math.cos(angle) * radiusAtHeight,
      height,
      Math.sin(angle) * radiusAtHeight
    );

    let col;
    let sz = Math.random() * 2.5 + 1.5;
    const r = Math.random();

    if (r < 0.8) {
      col = dGreen.clone().lerp(bGreen, Math.random());
      if (Math.random() > 0.98) col = white.clone();
    } else if (r < 0.92) {
      col = red.clone();
      sz *= 1.4;
    } else {
      col = new THREE.Color('#ffcc33');
      sz *= 1.2;
    }

    data.push({ position: pos, color: col, size: sz });
  }
  return data;
};

export const generateSpiralPoints = (count: number): ParticleData[] => {
  const data: ParticleData[] = [];
  const gold = new THREE.Color('#ffcc33');
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const height = t * 180 - 80;
    const radius = (1 - t) * 82 + 5;
    const angle = t * Math.PI * 12; // 6 turns
    
    const jitter = 3;
    const pos = new THREE.Vector3(
      Math.cos(angle) * radius + (Math.random() - 0.5) * jitter,
      height + (Math.random() - 0.5) * jitter,
      Math.sin(angle) * radius + (Math.random() - 0.5) * jitter
    );

    data.push({ position: pos, color: gold, size: Math.random() * 3 + 1 });
  }
  return data;
};

export const generateStarPoints = (count: number): ParticleData[] => {
  const data: ParticleData[] = [];
  const yellow = new THREE.Color('#ffff00');
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const p = (angle / (Math.PI * 2) * 5) % 1;
    const outerR = 15;
    const innerR = 6;
    const r = p < 0.5 ? THREE.MathUtils.lerp(outerR, innerR, p * 2) : THREE.MathUtils.lerp(innerR, outerR, (p - 0.5) * 2);
    const pos = new THREE.Vector3(
      Math.cos(angle) * r,
      Math.sin(angle) * r + 105,
      (Math.random() - 0.5) * 6
    );
    data.push({ position: pos, color: yellow, size: 4 });
  }
  return data;
};

export const generateCatPoints = (count: number): ParticleData[] => {
  const data: ParticleData[] = [];
  const black = new THREE.Color('#020202');
  const gold = new THREE.Color('#ccaa22');

  for (let i = 0; i < count; i++) {
    let x, y, z;
    const r = Math.random();
    if (r > 0.8) { // Head
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI;
      const rad = 12;
      x = rad * Math.sin(v) * Math.cos(u);
      y = rad * Math.sin(v) * Math.sin(u) + 20;
      z = rad * Math.cos(v);
    } else { // Body
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI;
      const rx = 20, ry = 30, rz = 20;
      x = rx * Math.sin(v) * Math.cos(u);
      y = ry * Math.sin(v) * Math.sin(u);
      z = rz * Math.cos(v);
    }

    const pos = new THREE.Vector3(x - 110, y - 70, z + 40);
    const col = Math.random() > 0.8 ? gold : black;
    data.push({ position: pos, color: col, size: 3 });
  }
  return data;
};

export const generateRingPoints = (count: number): ParticleData[] => {
  const data: ParticleData[] = [];
  const gold = new THREE.Color('#ffcc33');
  for (let i = 0; i < count; i++) {
    const ringIdx = Math.floor(Math.random() * 3);
    const radius = 115 + ringIdx * 15;
    const angle = Math.random() * Math.PI * 2;
    data.push({
      position: new THREE.Vector3(Math.cos(angle) * radius, -95, Math.sin(angle) * radius),
      color: gold,
      size: 1.5
    });
  }
  return data;
};

export const getTextPoints = (text: string, count: number): THREE.Vector3[] => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];
  canvas.width = 1200; canvas.height = 400;
  ctx.fillStyle = 'white';
  ctx.font = 'bold 60px Cinzel';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const words = text.split(' ');
  ctx.fillText(words.slice(0, 2).join(' '), 600, 150);
  ctx.fillText(words.slice(2).join(' '), 600, 250);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const pts: THREE.Vector3[] = [];
  for (let y = 0; y < canvas.height; y += 4) {
    for (let x = 0; x < canvas.width; x += 4) {
      if (imgData[(y * canvas.width + x) * 4 + 3] > 128) {
        pts.push(new THREE.Vector3((x - 600) * 0.8, -(y - 200) * 0.8, (Math.random()-0.5)*10));
      }
    }
  }
  const result: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const s = pts[i % pts.length] || new THREE.Vector3();
    result.push(s.clone().add(new THREE.Vector3((Math.random()-0.5)*2, (Math.random()-0.5)*2, (Math.random()-0.5)*2)));
  }
  return result;
};

// Legacy compatibility
export const generateShapePoints = (type: ModelType, count: number): THREE.Vector3[] => {
  return generateDetailedTreePoints(count).map(p => p.position);
};
