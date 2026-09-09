import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

const LocationMessage = ({ location, isOwn }) => {
  if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
    return <p className="italic text-[10px] opacity-70">Invalid location data</p>;
  }

  const { lat, lng } = location;
  const isValid = lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

  if (!isValid) {
    return <p className="italic text-[10px] opacity-70">Invalid location coordinates</p>;
  }

  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <div className={`space-y-4 p-2 min-w-[220px] ${isOwn ? 'text-white' : 'text-white'}`}>
      <div className="flex items-center gap-3 font-black mb-1">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xl border ${isOwn ? 'bg-white/10 border-white/20' : 'bg-background-dark/50 border-accent-bright/30'}`}>
          <MapPin className={`w-5 h-5 ${isOwn ? 'text-white' : 'text-accent-bright'}`} />
        </div>
        <div className="flex flex-col">
           <span className="text-xs uppercase tracking-widest font-black">Live Coordinates</span>
           <span className="text-[9px] opacity-50 uppercase font-bold tracking-tighter">Secure GPS Ping</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => window.open(googleMapsUrl, "_blank", "noopener,noreferrer")}
        className={`w-full py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-2xl ${
          isOwn
            ? 'bg-white text-accent-orange hover:bg-opacity-90 border-2 border-transparent'
            : 'bg-accent-main text-white hover:bg-accent-bright border-2 border-accent-bright/30 shadow-orange'
        }`}
      >
        <Navigation className="w-4 h-4" />
        Launch Nav
      </button>
    </div>
  );
};

export default LocationMessage;
