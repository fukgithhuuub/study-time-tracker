import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, CloudRain, Wind, Waves, Coffee } from 'lucide-react';
import './AmbientSounds.css';

const SOUNDS = [
    {
        id: 'rain',
        label: 'Rain',
        icon: CloudRain,
        // Use free ambient sound URLs
        url: 'https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3',
    },
    {
        id: 'wind',
        label: 'Wind',
        icon: Wind,
        url: 'https://assets.mixkit.co/active_storage/sfx/2523/2523-preview.mp3',
    },
    {
        id: 'waves',
        label: 'Waves',
        icon: Waves,
        url: 'https://assets.mixkit.co/active_storage/sfx/2516/2516-preview.mp3',
    },
    {
        id: 'cafe',
        label: 'Café',
        icon: Coffee,
        url: 'https://assets.mixkit.co/active_storage/sfx/2519/2519-preview.mp3',
    },
];

const AmbientSounds = () => {
    const [activeSound, setActiveSound] = useState(null);
    const [volume, setVolume] = useState(50);
    const [isLoading, setIsLoading] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
        }
    }, [volume]);

    const handleSoundToggle = (sound) => {
        if (activeSound === sound.id) {
            // Stop current sound
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            setActiveSound(null);
            return;
        }

        // Stop existing
        if (audioRef.current) {
            audioRef.current.pause();
        }

        setIsLoading(true);
        const audio = new Audio(sound.url);
        audio.loop = true;
        audio.volume = volume / 100;
        audio.addEventListener('canplaythrough', () => {
            setIsLoading(false);
        }, { once: true });
        audio.addEventListener('error', () => {
            setIsLoading(false);
            setActiveSound(null);
        });
        audio.play().catch(() => {
            setIsLoading(false);
        });
        audioRef.current = audio;
        setActiveSound(sound.id);
    };

    const handleStop = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setActiveSound(null);
    };

    return (
        <div className="ambient-sounds glass-panel animate-fade-in">
            <div className="ambient-header">
                <h3 className="ambient-title">
                    {activeSound ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    Focus Sounds
                </h3>
                {activeSound && (
                    <button className="ambient-stop-btn" onClick={handleStop}>
                        Stop
                    </button>
                )}
            </div>

            <div className="sound-buttons">
                {SOUNDS.map(sound => {
                    const Icon = sound.icon;
                    const isPlaying = activeSound === sound.id;
                    return (
                        <button
                            key={sound.id}
                            className={`sound-btn ${isPlaying ? 'active' : ''}`}
                            onClick={() => handleSoundToggle(sound)}
                            disabled={isLoading}
                        >
                            <Icon size={20} />
                            <span>{sound.label}</span>
                            {isPlaying && <span className="sound-playing-dot" />}
                        </button>
                    );
                })}
            </div>

            {activeSound && (
                <div className="volume-control animate-fade-in">
                    <VolumeX size={14} />
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => setVolume(parseInt(e.target.value))}
                        className="volume-slider"
                    />
                    <Volume2 size={14} />
                </div>
            )}
        </div>
    );
};

export default AmbientSounds;
