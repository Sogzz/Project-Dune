import React, { useState } from 'react';

interface LandmarkPanelProps {
  landmark: any | null;
  onClose: () => void;
}

export default function LandmarkPanel({ landmark, onClose }: LandmarkPanelProps) {
  const isVisible = !!landmark;
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleClose = () => {
    setIsFullscreen(false); // Reset fullscreen state when closing
    onClose();
  };

  return (
    <div 
      className={`absolute transition-all duration-300 ease-in-out z-50 flex flex-col bg-[#070b14]/95 backdrop-blur-md border-slate-800 
        ${isVisible ? 'translate-x-0' : 'translate-x-full'}
        ${isFullscreen 
          ? 'top-0 right-0 w-full h-full border-l-0 p-12' 
          : 'top-0 right-0 h-[calc(100%-110px)] w-96 border-l p-6'
        }
      `}
    >
      {isVisible && (
        <>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-orange-500 font-mono tracking-widest text-sm uppercase">
              //LOCATION_DATA
            </h2>
            <div className="flex gap-4 items-center">
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-slate-400 hover:text-cyan-400 font-mono text-xl transition-colors"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? '[-]' : '[+]'}
              </button>
              <button 
                onClick={handleClose}
                className="text-slate-400 hover:text-red-500 font-mono text-xl transition-colors"
              >
                [X]
              </button>
            </div>
          </div>

          <div className="space-y-6 overflow-y-auto pr-2">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-wide uppercase mb-1">
                {landmark.name}
              </h1>
              <p className="text-orange-400 font-mono text-xs mb-4">
                {landmark.subtitle}
              </p>
              <p className="text-slate-400 italic text-sm">
                {landmark.summary}
              </p>
            </div>

            {landmark.gallery && landmark.gallery.length > 0 && (
              <div className="border border-slate-800 p-1">
                <img 
                  src={landmark.gallery[0].url} 
                  alt={landmark.gallery[0].caption}
                  className="w-full h-48 object-cover opacity-80 hover:opacity-100 transition-opacity"
                />
                <p className="text-xs text-slate-500 font-mono mt-2 text-right">
                  {landmark.gallery[0].caption}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#050814] border border-slate-800 p-3 rounded-none">
                <p className="text-xs text-slate-500 font-mono mb-1">CATEGORY</p>
                <p className="text-cyan-400 font-mono text-sm capitalize">{landmark.category}</p>
              </div>
              <div className="bg-[#050814] border border-slate-800 p-3 rounded-none">
                <p className="text-xs text-slate-500 font-mono mb-1">FACTION</p>
                <p className="text-green-500 font-mono text-sm">{landmark.faction}</p>
              </div>
            </div>
            
            {isFullscreen && (
              <div className="bg-[#050814] border border-slate-800 p-4 rounded-none mt-4 animate-fade-in">
                <p className="text-xs text-slate-500 font-mono mb-2">FULL LORE DATABASE</p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {landmark.lore}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}