
import React from 'react';

interface CCTVMonitorProps {
  imageUrl?: string;
  location: string;
  status: 'LIVE' | 'OFFLINE' | 'RECORDING';
  isLoading: boolean;
}

const CCTVMonitor: React.FC<CCTVMonitorProps> = ({ imageUrl, location, status, isLoading }) => {
  const timestamp = new Date().toLocaleString();

  return (
    <div className="relative w-full aspect-video bg-black border-4 border-gray-800 rounded-sm overflow-hidden shadow-2xl group">
      <div className="absolute inset-0 scanline opacity-30"></div>
      <div className="absolute inset-0 crt-overlay opacity-50 z-20"></div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-full text-green-500 font-mono">
          <i className="fas fa-circle-notch fa-spin text-4xl mb-4"></i>
          <p className="animate-pulse">CONNECTING TO FEED...</p>
        </div>
      ) : (
        <>
          <img 
            src={imageUrl || 'https://picsum.photos/seed/offline/800/450?grayscale'} 
            className="w-full h-full object-cover filter contrast-125 brightness-90 saturate-50 grayscale-[20%]"
            alt="Surveillance Feed"
          />
          
          {/* HUD Overlay */}
          <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black/50 px-2 py-1 text-xs z-30">
            <div className={`w-2 h-2 rounded-full ${status === 'LIVE' ? 'bg-red-600 animate-pulse' : 'bg-gray-500'}`}></div>
            <span>{status} - {location.toUpperCase()}</span>
          </div>

          <div className="absolute top-4 right-4 bg-black/50 px-2 py-1 text-xs z-30">
            {timestamp}
          </div>

          <div className="absolute bottom-4 left-4 text-[10px] opacity-70 z-30 font-mono">
            REC_ID: {Math.floor(Math.random() * 1000000)}<br/>
            SIGNAL: 98% STABLE
          </div>

          <div className="absolute bottom-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="bg-green-600 text-black px-2 py-1 text-xs font-bold uppercase tracking-wider">
              Channel Select: CAM-04
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default CCTVMonitor;
