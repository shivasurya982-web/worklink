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
    <div className={`space-y-3 p-1 min-w-[200px] ${isOwn ? 'text-white' : 'text-text-primary'}`}>
      <div className="flex items-center gap-3 font-bold mb-1">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs border ${isOwn ? 'bg-white/20 border-white/30' : 'bg-blue-50 border-blue-100'}`}>
          <MapPin className={`w-4 h-4 ${isOwn ? 'text-white' : 'text-accent-main'}`} />
        </div>
        <div className="flex flex-col">
           <span className="text-xs uppercase tracking-wider font-extrabold">Live Location</span>
           <span className="text-[9px] opacity-70 uppercase font-semibold">GPS Coordinates</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => window.open(googleMapsUrl, "_blank", "noopener,noreferrer")}
        className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xs cursor-pointer ${
          isOwn
            ? 'bg-white text-accent-main hover:bg-blue-50'
            : 'bg-accent-main text-white hover:bg-blue-700'
        }`}
      >
        <Navigation className="w-3.5 h-3.5" />
        Open Map
      </button>
    </div>
  );
};

export default LocationMessage;
