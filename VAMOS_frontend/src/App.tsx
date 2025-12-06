import React, { useState, useEffect, useRef, useCallback } from 'react';
import YouTube, { type YouTubeProps, YouTubePlayer } from 'react-youtube';
import {
  Play,
  Pause,
  Shuffle,
  Music,
  Video as VideoIcon,
  Volume2,
  FastForward,
  Square,
} from 'lucide-react';
import './App.css';

interface VideoSource {
  id: number;
  youtubeLink: string;
  title: string;
  artist: string;
  durationSec: number;
  isVideo: boolean;
}

interface MixResult {
  audioId: string;
  videoId: string;
}

const API_BASE_URL = 'http://localhost:8080/api/mix';

interface SelectionProps {
  sources: VideoSource[];
  title: string;
  type: 'audio' | 'video';
  selectedId: string | null;
  onSelect: (id: string, title: string, type: 'audio' | 'video') => void;
}

const SelectionList: React.FC<SelectionProps> = ({
  sources,
  title,
  type,
  selectedId,
  onSelect,
}) => {
  const filteredSources =
    type === 'video' ? sources.filter((s) => s.isVideo) : sources;

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
        {filteredSources.map((source) => (
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
              <span className="list-item-title">
                {source.title || 'Brak Tytułu'}
              </span>
              <span className="list-item-artist">
                {source.artist || 'Nieznany Artysta'}
              </span>
            </div>
            <span className="list-item-duration">
              {formatDuration(source.durationSec || 0)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

function App() {
  const [sources, setSources] = useState<VideoSource[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedAudioTitle, setSelectedAudioTitle] = useState<string | null>(
    null,
  );
  const [selectedVideoTitle, setSelectedVideoTitle] = useState<string | null>(
    null,
  );
  const [currentMix, setCurrentMix] = useState<MixResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);

  // AUDIO – czas i długość
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);

  // VIDEO – czas i długość
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);

  const audioPlayerRef = useRef<YouTubePlayer | null>(null);
  const videoPlayerRef = useRef<YouTubePlayer | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/sources`)
      .then((res) => res.json())
      .then((data) => setSources(data))
      .catch(() =>
        setError(
          'Błąd połączenia z backendem. Upewnij się, że Spring Boot i PostgreSQL są uruchomione.',
        ),
      );
  }, []);

  const playerOptions: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      disablekb: 1,
      modestbranding: 1,
      rel: 0,
      controls: 0,
    },
  };

  const formatTime = (seconds: number): string => {
    if (!seconds || Number.isNaN(seconds)) return '0:00';
    const whole = Math.floor(seconds);
    const m = Math.floor(whole / 60);
    const s = whole % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handlePlayerReady = useCallback(
    (event: { target: YouTubePlayer }, type: 'audio' | 'video') => {
      if (type === 'audio') {
        audioPlayerRef.current = event.target;
        event.target.setVolume(volume);

        const duration = event.target.getDuration();
        if (typeof duration === 'number' && !Number.isNaN(duration)) {
          setAudioDuration(duration);
        }
        const current = event.target.getCurrentTime();
        if (typeof current === 'number') {
          setAudioCurrentTime(current);
        }

        if (isPlaying) event.target.playVideo();
      } else {
        videoPlayerRef.current = event.target;
        event.target.setPlaybackRate(1.5); // prędkość 1.5x

        const duration = event.target.getDuration();
        if (typeof duration === 'number' && !Number.isNaN(duration)) {
          setVideoDuration(duration);
        }
        const current = event.target.getCurrentTime();
        if (typeof current === 'number') {
          setVideoCurrentTime(current);
        }

        if (isPlaying) event.target.playVideo();
      }
    },
    [isPlaying, volume],
  );

  const handleMixStart = (mix: MixResult) => {
    setCurrentMix(mix);
    setIsPlaying(true);
    setAudioCurrentTime(0);
    setVideoCurrentTime(0);
    setAudioDuration(0);
    setVideoDuration(0);

    setTimeout(() => {
      audioPlayerRef.current?.playVideo();
      videoPlayerRef.current?.playVideo();
      if (videoPlayerRef.current) {
        videoPlayerRef.current.setPlaybackRate(1.5);
      }
    }, 500);
  };

  const handleTogglePlay = () => {
    if (!currentMix) return;

    const newState = !isPlaying;
    setIsPlaying(newState);

    if (newState) {
      audioPlayerRef.current?.playVideo();
      videoPlayerRef.current?.playVideo();
    } else {
      audioPlayerRef.current?.pauseVideo();
      videoPlayerRef.current?.pauseVideo();
    }
  };

  const handleStop = () => {
    if (!currentMix) return;
    setIsPlaying(false);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pauseVideo();
      audioPlayerRef.current.seekTo(0, true);
    }
    if (videoPlayerRef.current) {
      videoPlayerRef.current.pauseVideo();
      videoPlayerRef.current.seekTo(0, true);
    }
    setAudioCurrentTime(0);
    setVideoCurrentTime(0);
  };

  // aktualizacja czasów
  useEffect(() => {
    if (!isPlaying) return;

    const id = window.setInterval(() => {
      if (audioPlayerRef.current) {
        const c = audioPlayerRef.current.getCurrentTime();
        const d = audioPlayerRef.current.getDuration();
        if (typeof c === 'number') setAudioCurrentTime(c);
        if (typeof d === 'number' && d && !Number.isNaN(d))
          setAudioDuration(d);
      }
      if (videoPlayerRef.current) {
        const c = videoPlayerRef.current.getCurrentTime();
        const d = videoPlayerRef.current.getDuration();
        if (typeof c === 'number') setVideoCurrentTime(c);
        if (typeof d === 'number' && d && !Number.isNaN(d))
          setVideoDuration(d);
      }
    }, 500);

    return () => window.clearInterval(id);
  }, [isPlaying]);

  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.setVolume(volume);
    }
  }, [volume]);

  const handleAudioSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setAudioCurrentTime(newTime);
    audioPlayerRef.current?.seekTo(newTime, true);
  };

  const handleVideoSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setVideoCurrentTime(newTime);
    videoPlayerRef.current?.seekTo(newTime, true);
  };

  const handleRandomMix = () => {
    fetch(`${API_BASE_URL}/random`)
      .then((res) => res.json())
      .then((data: MixResult) => handleMixStart(data))
      .catch(() =>
        setError('Brak losowego miksu. Czy baza jest uzupełniona?'),
      );
  };

  const handleCustomMix = () => {
    if (!selectedAudio || !selectedVideo) {
      setError('Wybierz zarówno źródło audio, jak i wideo.');
      return;
    }
    const customMix: MixResult = {
      audioId: selectedAudio,
      videoId: selectedVideo,
    };

    fetch(`${API_BASE_URL}/custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customMix),
    })
      .then((res) => res.json())
      .then((data: MixResult) => handleMixStart(data))
      .catch(() =>
        setError('Błąd podczas tworzenia niestandardowego miksu.'),
      );
  };

  const handleSelection = (
    id: string,
    title: string,
    type: 'audio' | 'video',
  ) => {
    if (type === 'audio') {
      setSelectedAudio(id);
      setSelectedAudioTitle(title);
    } else {
      setSelectedVideo(id);
      setSelectedVideoTitle(title);
    }
    setError(null);
  };

  // tytuły aktualnego miksu
  const nowPlayingAudioTitle =
    currentMix &&
    sources.find((s) => s.youtubeLink === currentMix.audioId)?.title;
  const nowPlayingVideoTitle =
    currentMix &&
    sources.find((s) => s.youtubeLink === currentMix.videoId)?.title;

  const audioTitleToShow =
    nowPlayingAudioTitle || selectedAudioTitle || 'UTWÓR1';
  const videoTitleToShow =
    nowPlayingVideoTitle || selectedVideoTitle || 'UTWÓR2';

  return (
    <div className="app-container">
      <header className="header">
        <h1>🎧 VAMOS - Video Audio Mashup OS 📺</h1>
      </header>

      <div className="main-content-area">
        {/* LEWY PLAYER */}
        <div className="video-player-container">
          {currentMix ? (
            <div className="video-clip-display">
              <YouTube
                className="youtube-player"
                videoId={currentMix.videoId}
                opts={{
                  ...playerOptions,
                  playerVars: {
                    ...playerOptions.playerVars,
                    controls: 1,
                    mute: 1,
                  },
                }}
                onReady={(e) => handlePlayerReady(e, 'video')}
              />
            </div>
          ) : (
            <div className="video-placeholder">WYŚWIETLACZ YT</div>
          )}

          {/* UKRYTY AUDIO PLAYER */}
          <div className="hidden-player">
            {currentMix && (
              <YouTube
                className="youtube-player"
                videoId={currentMix.audioId}
                opts={{
                  ...playerOptions,
                  playerVars: {
                    ...playerOptions.playerVars,
                    controls: 0,
                    mute: 0,
                    autoplay: 1,
                  },
                }}
                onReady={(e) => handlePlayerReady(e, 'audio')}
              />
            )}
          </div>
        </div>

        {/* PRAWA STRONA LIST */}
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
            title="VIDEO"
            type="video"
            selectedId={selectedVideo}
            onSelect={(id, title) => handleSelection(id, title, 'video')}
          />
        </div>
      </div>

      {/* DOLNY PASEK */}
      <div className="controls-bar">
        {error && <div className="error-message">{error}</div>}

        {/* AUDIO BLOK */}
        <div className="selected-block">
          <div className="selected-label">
            AUDIO: <span>{audioTitleToShow}</span>
          </div>
          <div className="progress-row">
            <span className="time-label">
              {formatTime(audioCurrentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={audioDuration || 0}
              step="0.1"
              value={audioCurrentTime}
              onChange={handleAudioSeek}
              className="progress-slider"
            />
            <span className="time-label">
              {formatTime(audioDuration)}
            </span>
          </div>
        </div>

        {/* VIDEO BLOK */}
        <div className="selected-block">
          <div className="selected-label">
            VIDEO: <span>{videoTitleToShow}</span>
          </div>
          <div className="progress-row">
            <span className="time-label">
              {formatTime(videoCurrentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={videoDuration || 0}
              step="0.1"
              value={videoCurrentTime}
              onChange={handleVideoSeek}
              className="progress-slider"
            />
            <span className="time-label">
              {formatTime(videoDuration)}
            </span>
          </div>
        </div>

        {/* PLAY/PAUSE */}
        <button
          onClick={handleTogglePlay}
          className="play-pause-btn"
          disabled={!currentMix}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>

        {/* STOP */}
        <button
          onClick={handleStop}
          className="stop-btn"
          disabled={!currentMix}
        >
          <Square size={20} />
        </button>

        {/* GŁOŚNOŚĆ */}
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

        {/* MIXY */}
        <button onClick={handleRandomMix} className="btn-random-mix">
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
