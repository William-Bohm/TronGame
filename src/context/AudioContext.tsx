import React, {createContext, useContext, useRef, useState, useEffect} from 'react';

// types.ts
export interface SoundContextType {
    // Music controls
    isMusicPlaying: boolean;
    musicVolume: number;
    isMusicEnabled: boolean;
    toggleMusic: () => void;
    setMusicVolume: (volume: number) => void;
    toggleMusicEnabled: () => void;

    // Sound effects controls
    isSoundEffectsEnabled: boolean;
    soundEffectsVolume: number;
    toggleSoundEffects: () => void;
    setSoundEffectsVolume: (volume: number) => void;

    // Sound playing functions
    withSound: (onClick: () => void, soundPath?: string, volume?: number) => () => void;
}


const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [hasInteracted, setHasInteracted] = useState(false);

    // Music states
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const [musicVolume, setMusicVolume] = useState(0.4);
    const [isMusicEnabled, setIsMusicEnabled] = useState(true);

    // Sound effects states
    const [isSoundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
    const [soundEffectsVolume, setSoundEffectsVolume] = useState(1.0);

    const toggleMusic = () => {
        if (audioRef.current) {
            if (isMusicPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsMusicPlaying(!isMusicPlaying);
        }
    };

    const toggleMusicEnabled = () => {
        setIsMusicEnabled(!isMusicEnabled);
        if (audioRef.current) {
            audioRef.current.volume = !isMusicEnabled ? musicVolume : 0;
        }
    };

    const toggleSoundEffects = () => {
        setSoundEffectsEnabled(!isSoundEffectsEnabled);
    };

    // Handle first interaction for music autoplay
    useEffect(() => {
        const handleFirstInteraction = () => {
            if (audioRef.current && !hasInteracted) {
                toggleMusic();
                setHasInteracted(true);
                document.removeEventListener('click', handleFirstInteraction);
                document.removeEventListener('keydown', handleFirstInteraction);
            }
        };

        document.addEventListener('click', handleFirstInteraction);
        document.addEventListener('keydown', handleFirstInteraction);

        return () => {
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
        };
    }, [hasInteracted]);

    // Update music volume when it changes
    useEffect(() => {
        if (audioRef.current && isMusicEnabled) {
            audioRef.current.volume = musicVolume;
        }
    }, [musicVolume, isMusicEnabled]);

    const withSound = (
        onClick: () => void,
        soundPath: string = '/sound/button_sound_effect.mp3',
        volume: number = 1.0
    ) => () => {
        if (isSoundEffectsEnabled) {
            const audio = new Audio(soundPath);
            // Combine the individual sound volume with the global sound effects volume
            const finalVolume = Math.min(1.0, Math.max(0, volume * soundEffectsVolume));
            audio.volume = finalVolume;
            audio.play().catch(err => console.log('Audio play failed:', err));
        }
        onClick();
    };

    const value: SoundContextType = {
        isMusicPlaying,
        musicVolume,
        isMusicEnabled,
        toggleMusic,
        setMusicVolume,
        toggleMusicEnabled,
        isSoundEffectsEnabled,
        soundEffectsVolume,
        toggleSoundEffects,
        setSoundEffectsVolume,
        withSound,
    };

    return (
        <SoundContext.Provider value={value}>
            {isMusicEnabled && (
                <audio
                    ref={audioRef}
                    src="/sound/gradient-148888.mp3"
                    loop
                    preload="auto"
                />
            )}

            {children}
        </SoundContext.Provider>
    );
};

// Custom hook to use the sound context
export const useSound = () => {
    const context = useContext(SoundContext);
    if (context === undefined) {
        throw new Error('useSound must be used within a SoundProvider');
    }
    return context;
};