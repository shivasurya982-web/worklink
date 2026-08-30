import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

const LocationMessage = ({ location, isOwn }) => {
  if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
    return <p className="italic text-[10px] opacity-70">Invalid location data</p>;
  }

  const { lat, lng } = location;

  // Validation according to requirement #16
  const isValid = lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

  if (!isValid) {
    return <p className="italic text-[10px] opacity-70">Invalid location coordinates</p>;
  }

  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <div className={`space-y-3 p-1 min-w-[200px] ${isOwn ? 'text-white' : 'text-text-primary'}`}>
      <div className="flex items-center gap-2 font-bold mb-1">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isOwn ? 'bg-white/20' : 'bg-amber-50'}`}>
          <MapPin className={`w-4 h-4 ${isOwn ? 'text-white' : 'text-accent-gold'}`} />
        </div>
        <span className="text-sm font-sora">Current Location</span>
      </div>

      <button
        type="button"
        onClick={() => window.open(googleMapsUrl, "_blank", "noopener,noreferrer")}
        className={`w-full py-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
          isOwn
            ? 'bg-white text-accent-gold hover:bg-white/90 shadow-md'
            : 'bg-accent-gold text-text-primary hover:bg-amber-500 shadow-lg shadow-accent-gold/10'
        }`}
      >
        <Navigation className="w-3.5 h-3.5" />
        Open in Google Maps
      </button>
    </div>
  );
};

export default LocationMessage;
