
import React from 'react';
import { ModelType } from '../types';

interface UIControlsProps {
  selectedModel: ModelType;
  setSelectedModel: (m: ModelType) => void;
  color: string;
  setColor: (c: string) => void;
}

const UIControls: React.FC<UIControlsProps> = ({ selectedModel, setSelectedModel, color, setColor }) => {
  const models = Object.values(ModelType);

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 bg-white/10 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/20 shadow-2xl">
      <div className="flex items-center gap-2 overflow-x-auto max-w-[80vw] scrollbar-hide">
        {models.map((m) => (
          <button
            key={m}
            onClick={() => setSelectedModel(m)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              selectedModel === m 
                ? 'bg-white text-black scale-105' 
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            {m}
          </button>
        ))}
      </div>
      
      <div className="h-px md:h-8 w-full md:w-px bg-white/20 mx-2" />

      <div className="flex items-center gap-3">
        <label className="text-[10px] text-white/50 font-bold tracking-widest uppercase">Color</label>
        <input 
          type="color" 
          value={color} 
          onChange={(e) => setColor(e.target.value)}
          className="w-10 h-10 rounded-full border-none bg-transparent cursor-pointer overflow-hidden p-0"
        />
      </div>
    </div>
  );
};

export default UIControls;
