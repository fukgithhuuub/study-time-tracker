import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, CloudRain, Wind, Waves, Coffee } from 'lucide-react';
import { cn } from '../lib/utils';

const sounds = [
  { id: 'rain', name: 'Rain', icon: CloudRain, url: 'https://www.soundjay.com/nature/rain-01.mp3' },
  { id: 'wind', name: 'Wind', icon: Wind, url: 'https://www.soundjay.com/nature/wind-01.mp3' },
  { id: 'waves', name: 'Waves', icon: Waves, url: 'https://www.soundjay.com/nature/ocean-waves-1.mp3' },
  { id: 'cafe', name: 'Cafe', icon: Coffee, url: 'https://www.soundjay.com/misc/sounds/coffee-shop-1.mp3' },
];

export function Soundscapes() {
  const [activeSound, setActiveSound] = useState(null);
  const audioRef = useRef(new Audio());

  const toggleSound = (sound) => {
    if (activeSound === sound.id) {
      audioRef.current.pause();
      setActiveSound(null);
    } else {
      audioRef.current.src = sound.url;
      audioRef.current.loop = true;
      audioRef.current.play().catch(e => console.log("Audio play failed", e));
      setActiveSound(sound.id);
    }
  };

  return (
    <div className="bg-zinc-900/40 backdrop-blur-xl p-6 rounded-[2rem] border border-zinc-800/50 shadow-xl max-w-2xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
          <Volume2 size={16} /> Focus Soundscapes
        </h3>
        {activeSound && (
          <span className="text-[10px] font-black text-emerald-500 uppercase animate-pulse">Now Playing</span>
        )}
      </div>
      <div className="grid grid-cols-4 gap-4">
        {sounds.map(sound => (
          <button
            key={sound.id}
            onClick={() => toggleSound(sound)}
            className={cn(
              "flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300 border",
              activeSound === sound.id
                ? "bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                : "bg-zinc-950/50 border-zinc-800 text-zinc-600 hover:text-zinc-300 hover:border-zinc-700"
            )}
          >
            <sound.icon size={24} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{sound.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
