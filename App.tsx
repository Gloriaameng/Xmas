import React, { useState, useCallback } from 'react';
import { ModelType, HandData } from './types';
import Visualizer from './components/Visualizer';
import HandTracker from './components/HandTracker';
import UIControls from './components/UIControls';

const App: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<ModelType>(ModelType.CHRISTMAS_TREE);
  const [particleColor, setParticleColor] = useState<string>('#004411');
  const [handData, setHandData] = useState<HandData>({
    gesture: 'idle',
    rotation: { x: 0, y: 0, z: 0 },
    zoom: 1,
    center: { x: 0.5, y: 0.5 }
  });

  const handleHandUpdate = useCallback((data: HandData) => {
    setHandData(data);
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      <Visualizer 
        model={selectedModel} 
        color={particleColor} 
        handData={handData}
      />

      <div className="absolute top-8 left-8 z-20">
        <HandTracker onUpdate={handleHandUpdate} />
      </div>

      <div className="absolute top-8 right-8 z-20 text-right pointer-events-none">
        <h1 className="text-2xl font-magic tracking-tighter text-white/90">MAGIC CHRISTMAS</h1>
        <p className="text-[10px] text-yellow-500/80 tracking-[0.3em] font-bold mt-1 uppercase">
          打开摄像头手势控制有惊喜
        </p>
      </div>

      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-12 pointer-events-none transition-all duration-500">
        <div className={`flex flex-col items-center gap-1 ${handData.gesture === 'fist' ? 'opacity-100 scale-110' : 'opacity-30'}`}>
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <span className="text-[8px] uppercase tracking-widest text-white">Fist: Compact</span>
        </div>
        <div className={`flex flex-col items-center gap-1 ${handData.gesture === 'open' ? 'opacity-100 scale-110' : 'opacity-30'}`}>
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <span className="text-[8px] uppercase tracking-widest text-white">Palm: Expand</span>
        </div>
        <div className={`flex flex-col items-center gap-1 ${handData.gesture === 'grab' ? 'opacity-100 scale-110' : 'opacity-30'}`}>
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <span className="text-[8px] uppercase tracking-widest text-white">Pinch: Reveal</span>
        </div>
      </div>

      <div className={`absolute inset-0 flex items-center justify-center z-10 pointer-events-none transition-all duration-1000 ${handData.gesture === 'grab' ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        <div className="text-center">
          <h2 className="text-4xl md:text-6xl font-magic text-white/95 drop-shadow-[0_0_30px_rgba(255,255,0,0.4)]">
            Merry Christmas <br/> <span className="text-2xl md:text-3xl opacity-75">Dr. Zhang</span>
          </h2>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-4">
        <UIControls 
          selectedModel={selectedModel} 
          setSelectedModel={setSelectedModel} 
          color={particleColor} 
          setColor={setParticleColor} 
        />
      </div>

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)]"></div>
    </div>
  );
};

export default App;