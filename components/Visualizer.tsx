import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ModelType, HandData } from '../types';
import { 
  generateDetailedTreePoints, 
  generateCatPoints, 
  generateRingPoints, 
  generateStarPoints,
  generateSpiralPoints,
  getTextPoints 
} from '../utils/shapes';

interface VisualizerProps {
  model: ModelType;
  color: string;
  handData: HandData;
}

const TREE_COUNT = 15000;
const SPIRAL_COUNT = 5000;
const SNOW_COUNT = 3000;
const CAT_COUNT = 6000;
const RING_COUNT = 2000;
const STAR_COUNT = 1500;

const vertexShader = `
  uniform float uTime;
  uniform float uGestureFactor;
  attribute float aSize;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec3 pos = position;
    // Breathing jitter and floating
    float breathe = sin(uTime * 1.5 + position.y * 0.05) * 1.2 * uGestureFactor;
    pos += normalize(position) * breathe;
    pos.y += sin(uTime * 0.8 + position.x) * 1.5;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (450.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = 1.0 - (dist * 2.0);
    alpha = pow(alpha, 3.0);
    gl_FragColor = vec4(vColor, alpha);
  }
`;

const Visualizer: React.FC<VisualizerProps> = ({ model, color, handData }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<THREE.Points | null>(null);
  const spiralRef = useRef<THREE.Points | null>(null);
  const catRef = useRef<THREE.Points | null>(null);
  const ringsRef = useRef<THREE.Points | null>(null);
  const snowRef = useRef<THREE.Points | null>(null);
  const starRef = useRef<THREE.Points | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(0, 60, 450);
    camera.lookAt(0, 20, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    containerRef.current.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0.2;
    bloomPass.strength = 1.4;
    bloomPass.radius = 1.0;
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());
    composerRef.current = composer;

    const createSystem = (count: number, defaultSize: number) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
      geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
      geo.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(count).fill(defaultSize), 1));
      const mat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uGestureFactor: { value: 1.0 } },
        vertexShader, fragmentShader,
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, vertexColors: true
      });
      return new THREE.Points(geo, mat);
    };

    const tree = createSystem(TREE_COUNT, 3.0);
    const spiral = createSystem(SPIRAL_COUNT, 3.5);
    const snow = createSystem(SNOW_COUNT, 2.0);
    const cat = createSystem(CAT_COUNT, 3.5);
    const rings = createSystem(RING_COUNT, 2.5);
    const star = createSystem(STAR_COUNT, 5.0);

    scene.add(tree, spiral, snow, cat, rings, star);
    treeRef.current = tree; spiralRef.current = spiral; catRef.current = cat;
    ringsRef.current = rings; snowRef.current = snow; starRef.current = star;

    const updateAttr = (sys: THREE.Points, data: any[]) => {
      const pos = sys.geometry.attributes.position.array as Float32Array;
      const col = sys.geometry.attributes.color.array as Float32Array;
      const sz = sys.geometry.attributes.aSize.array as Float32Array;
      data.forEach((d, i) => {
        pos[i*3] = d.position.x; pos[i*3+1] = d.position.y; pos[i*3+2] = d.position.z;
        if (d.color) { col[i*3] = d.color.r; col[i*3+1] = d.color.g; col[i*3+2] = d.color.b; }
        if (d.size) sz[i] = d.size;
      });
      sys.geometry.attributes.position.needsUpdate = true;
      sys.geometry.attributes.color.needsUpdate = true;
      sys.geometry.attributes.aSize.needsUpdate = true;
    };

    updateAttr(tree, generateDetailedTreePoints(TREE_COUNT));
    updateAttr(spiral, generateSpiralPoints(SPIRAL_COUNT));
    updateAttr(cat, generateCatPoints(CAT_COUNT));
    updateAttr(rings, generateRingPoints(RING_COUNT));
    updateAttr(star, generateStarPoints(STAR_COUNT));

    const sPos = snow.geometry.attributes.position.array as Float32Array;
    const sCol = snow.geometry.attributes.color.array as Float32Array;
    for(let i=0; i<SNOW_COUNT; i++) {
      sPos[i*3] = (Math.random()-0.5)*1500; sPos[i*3+1] = Math.random()*1000; sPos[i*3+2] = (Math.random()-0.5)*1200;
      const c = Math.random() > 0.8 ? 1.0 : 0.7;
      sCol[i*3] = c; sCol[i*3+1] = c; sCol[i*3+2] = c;
    }

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.016;
      const gFact = handData.gesture === 'fist' ? 0.3 : (handData.gesture === 'open' ? 2.0 : 1.0);
      [tree, spiral, snow, cat, rings, star].forEach(s => {
        (s.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
        (s.material as THREE.ShaderMaterial).uniforms.uGestureFactor.value = gFact;
      });

      for(let i=0; i<SNOW_COUNT; i++) {
        sPos[i*3+1] -= 0.6 + Math.random()*0.5;
        if(sPos[i*3+1] < -300) sPos[i*3+1] = 700;
      }
      snow.geometry.attributes.position.needsUpdate = true;

      tree.rotation.y += 0.003 + handData.rotation.y * 0.05;
      spiral.rotation.y += 0.003 + handData.rotation.y * 0.05;
      rings.rotation.y -= 0.01;
      star.rotation.y += 0.04;

      const tZ = handData.gesture === 'grab' ? 250 : 450 - (handData.zoom * 100);
      camera.position.z += (tZ - camera.position.z) * 0.07;
      camera.position.x += (handData.center.x * 120 - 60 - camera.position.x) * 0.07;

      composer.render();
    };
    animate();

    const resize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      renderer.dispose();
      if(containerRef.current) containerRef.current.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    if (!treeRef.current) return;
    const tree = treeRef.current;
    let targets: THREE.Vector3[] = [];
    if (handData.gesture === 'grab') {
      targets = getTextPoints("Merry Christmas Dr. Zhang", TREE_COUNT);
      [spiralRef.current, catRef.current, ringsRef.current, starRef.current].forEach(r => { if(r) r.visible = false; });
    } else {
      targets = generateDetailedTreePoints(TREE_COUNT).map(p => p.position);
      [spiralRef.current, catRef.current, ringsRef.current, starRef.current].forEach(r => { if(r) r.visible = true; });
    }
    const curr = tree.geometry.attributes.position.array as Float32Array;
    const morph = () => {
      let active = false;
      for (let i = 0; i < TREE_COUNT; i++) {
        const t = targets[i % targets.length];
        const dx = (t.x - curr[i*3]) * 0.08;
        const dy = (t.y - curr[i*3+1]) * 0.08;
        const dz = (t.z - curr[i*3+2]) * 0.08;
        curr[i*3] += dx; curr[i*3+1] += dy; curr[i*3+2] += dz;
        if (Math.abs(dx) > 0.01) active = true;
      }
      tree.geometry.attributes.position.needsUpdate = true;
      if(active) requestAnimationFrame(morph);
    };
    morph();
  }, [handData.gesture]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default Visualizer;