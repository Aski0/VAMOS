import React, { useState, useEffect, useRef, useCallback } from 'react';
import YouTube, { type YouTubeProps, YouTubePlayer } from 'react-youtube'; 
import { Play, Pause, Shuffle, Music, Video as VideoIcon, Volume2, FastForward } from 'lucide-react'; // Ikony
import './App.css'; 

// --- 1. TYPY DANYCH (Zgodne z modelem VaSource z Spring Boot) ---

interface VideoSource {
  id: number;
  youtubeLink: string; 
  title: string;
  artist: string;
  durationSec: number; // Dodajemy czas trwania
  isVideo: boolean; 
}

interface MixResult {
  audioId: string;
  videoId: string;
}

const API_BASE_URL = 'http://localhost:8080/api/mix';

// --- 2. KOMPONENT POMOCNICZY: SelectionList ---

interface SelectionProps {
    sources: VideoSource[];
    title: string;
    type: 'audio' | 'video';
    selectedId: string | null;
    onSelect: (id: string, title: string, type: 'audio' | 'video') => void;
}

const SelectionList: React.FC<SelectionProps> = ({ sources, title, type, selectedId, onSelect }) => {
    // Źródła wideo muszą mieć isVideo=true
    const filteredSources = type === 'video' 
        ? sources.filter(s => s.isVideo)
        : sources; 

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="selection-list-card">
            <div className="selection-header">
                {type === 'audio' ? <Music size={16} /> : <VideoIcon size={16} />}
                <h4>{title}</h4>
            </div>
            <ul>
                {filteredSources.map(source => (
                    <li
                        key={source.youtubeLink}
                        className={source.youtubeLink === selectedId ? 'selected' : ''}
                        onClick={() => onSelect(source.youtubeLink, source.title, type)}
                    >
                        <img 
                            src={`https://img.youtube.com/vi/${source.youtubeLink}/0.jpg`} 
                            alt={source.title}
                            className="list-item-thumbnail"
                        />
                        <div className="list-item-info">
                            <span className="list-item-title">{source.title || 'Brak Tytułu'}</span>
                            <span className="list-item-artist">{source.artist || 'Nieznany Artysta'}</span>
                        </div>
                        <span className="list-item-duration">{formatDuration(source.durationSec || 0)}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// --- 3. GŁÓWNY KOMPONENT APLIKACJI: App ---

function App() {
  const [sources, setSources] = useState<VideoSource[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedAudioTitle, setSelectedAudioTitle] = useState<string | null>(null);
  const [selectedVideoTitle, setSelectedVideoTitle] = useState<string | null>(null);
  const [currentMix, setCurrentMix] = useState<MixResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // NOWY STAN: Kontrola odtwarzania i postępu
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const audioPlayerRef = useRef<YouTubePlayer | null>(null);
  const videoPlayerRef = useRef<YouTubePlayer | null>(null);

  // Pobieranie źródeł (niezmienione)
  useEffect(() => {
    fetch(`${API_BASE_URL}/sources`)
      .then(res => res.json())
      .then(data => setSources(data))
      .catch(() => setError("Błąd połączenia z backendem. Upewnij się, że Spring Boot i PostgreSQL są uruchomione."));
  }, []);
  
  // Ustawienia odtwarzacza YouTube (wspólne)
  const playerOptions: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
        autoplay: 0, // Kontrola przez kod, nie przez URL
        disablekb: 1,      
        modestbranding: 1, 
        rel: 0,
        controls: 0,       // Domyślnie kontrolki ukryte 
    },
  };
    
  // FUNKCJE OBSŁUGI ODTWARZANIA
  
  const handlePlayerReady = useCallback((event: { target: YouTubePlayer }, type: 'audio' | 'video') => {
    if (type === 'audio') {
        audioPlayerRef.current = event.target;
        event.target.setVolume(volume);
        // Wymuś start po załadowaniu obu
        if (isPlaying) event.target.playVideo();
    } else {
        videoPlayerRef.current = event.target;
        // Wymuś prędkość x1.5 na starcie
        event.target.setPlaybackRate(1.5); 
        if (isPlaying) event.target.playVideo();
    }
  }, [isPlaying, volume]);

  const handleMixStart = (mix: MixResult) => {
    setCurrentMix(mix);
    setIsPlaying(true);

    // Zapewnienie, że oba odtwarzacze wystartują z opóźnieniem, aby API YT się załadowało
    setTimeout(() => {
        audioPlayerRef.current?.playVideo();
        videoPlayerRef.current?.playVideo();
    }, 500); // Małe opóźnienie dla synchronizacji
  };
  
  const handleTogglePlay = () => {
    if (!currentMix) return;

    const newState = !isPlaying;
    setIsPlaying(newState);
    
    // Zatrzymywanie/wznawianie obu odtwarzaczy
    if (newState) {
        audioPlayerRef.current?.playVideo();
        videoPlayerRef.current?.playVideo();
    } else {
        audioPlayerRef.current?.pauseVideo();
        videoPlayerRef.current?.pauseVideo();
    }
  };
    
  // Czyszczenie interwału przy odmontowaniu komponentu (nie ma interwału teraz)
  useEffect(() => {
    return () => {};
  }, []);

  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.setVolume(volume);
    }
  }, [volume]);


  // Handlery API (dostosowane do nowej logiki startu)
  const handleRandomMix = () => {
    fetch(`${API_BASE_URL}/random`)
      .then(res => res.json())
      .then((data: MixResult) => handleMixStart(data))
      .catch(() => setError("Brak losowego miksu. Czy baza jest uzupełniona?"));
  };

  const handleCustomMix = () => {
    if (!selectedAudio || !selectedVideo) {
        setError('Wybierz zarówno źródło audio, jak i wideo.');
        return;
    }
    const customMix: MixResult = { audioId: selectedAudio, videoId: selectedVideo };

    fetch(`${API_BASE_URL}/custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customMix),
    })
      .then(res => res.json())
      .then((data: MixResult) => handleMixStart(data))
      .catch(() => setError("Błąd podczas tworzenia niestandardowego miksu."));
  };
    
  const handleSelection = (id: string, title: string, type: 'audio' | 'video') => {
    if (type === 'audio') {
        setSelectedAudio(id);
        setSelectedAudioTitle(title);
    } else {
        setSelectedVideo(id);
        setSelectedVideoTitle(title);
    }
    setError(null);
  };


  return (
    <div className="app-container">
        <header className="header">
            <h1>🎧 VAMOS - Video Audio Mashup OS 📺</h1>
        </header>

        <div className="main-content-area">
            
            {/* 1. KONTENER WIDEO (GŁÓWNY) */}
            <div className="video-player-container">
                {currentMix ? (
                    <div className="video-clip-display">
                        <YouTube 
                            videoId={currentMix.videoId}
                            opts={{
                                ...playerOptions,
                                playerVars: {
                                    ...playerOptions.playerVars,
                                    controls: 1, // Kontrolki widoczne dla wideo
                                    mute: 1,     // DŹWIĘK WYCISZONY (Tylko obraz!)
                                },
                            }}
                            onReady={(e) => handlePlayerReady(e, 'video')}
                        />
                    </div>
                ) : (
                    <div className="video-placeholder">WYŚWIETLACZ YT</div>
                )}
                
                {/* ODTWARZACZ DŹWIĘKU (UKRYTY) */}
                <div className="hidden-player">
                    {currentMix && (
                         <YouTube 
                            videoId={currentMix.audioId}
                            opts={{
                                ...playerOptions,
                                playerVars: {
                                    ...playerOptions.playerVars,
                                    controls: 0, 
                                    mute: 0, // DŹWIĘK WŁĄCZONY
                                    autoplay: 1 // Ponowne upewnienie się
                                },
                            }}
                            onReady={(e) => handlePlayerReady(e, 'audio')}
                        />
                    )}
                </div>
            </div>

            {/* 2. LISTY WYBORU (PANEL PRAWY) */}
            <div className="selection-panel">
                <SelectionList 
                    sources={sources} 
                    title="AUDIO" 
                    type="audio" 
                    selectedId={selectedAudio} 
                    onSelect={(id, title) => handleSelection(id, title, 'audio')}
                />
                <SelectionList 
                    sources={sources} 
                    title="AUDIO-VIDEO" 
                    type="video" 
                    selectedId={selectedVideo} 
                    onSelect={(id, title) => handleSelection(id, title, 'video')}
                />
            </div>
        </div>
        
        {/* 3. KONTROLKI ODTWARZANIA (NA DOLE) */}
        <div className="controls-bar">
            {error && <div className="error-message">{error}</div>}

            <div className="selected-label">
                AUDIO: <span>{selectedAudioTitle || 'UTWÓR1'}</span>
                <div className="progress-indicator"></div>
            </div>
            <div className="selected-label">
                VIDEO: <span>{selectedVideoTitle || 'UTWÓR2'}</span>
                <div className="progress-indicator"></div>
            </div>

            {/* Przycisk Play/Pause */}
            <button 
                onClick={handleTogglePlay} 
                className="play-pause-btn" 
                disabled={!currentMix}
            >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>

            {/* Kontrola głośności */}
            <div className="volume-control">
                <Volume2 size={24} />
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="volume-slider"
                />
            </div>
            
            {/* Przyciski Mix/Random */}
            <button 
                onClick={handleRandomMix} 
                className="btn-random-mix"
            >
                <Shuffle size={18} /> RANDOM MIX
            </button>
            <button 
                onClick={handleCustomMix} 
                className="btn-custom-mix" 
                disabled={!selectedAudio || !selectedVideo}
            >
                <FastForward size={18} /> MIX CHOSEN
            </button>
        </div>
    </div>
  );
}

export default App;