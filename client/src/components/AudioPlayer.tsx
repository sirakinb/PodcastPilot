import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { PlayCircle, PauseCircle, Volume2 } from "lucide-react";

interface AudioPlayerProps {
  podcastId: string;
}

export default function AudioPlayer({ podcastId }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(75);
  const [playbackRate, setPlaybackRate] = useState(1);

  const { data: status } = useQuery({
    queryKey: ["/api/podcast", podcastId, "status"],
    enabled: !!podcastId,
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [(status as any)?.audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  if ((status as any)?.status !== "completed" || !(status as any)?.audioUrl) {
    return null;
  }

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = (value[0] / 100) * duration;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const playbackProgress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const speedOptions = [0.75, 1, 1.25, 1.5];

  return (
    <Card className="fade-in">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <PlayCircle className="text-primary mr-2" size={20} />
          Generated Podcast
        </h3>

        <audio ref={audioRef} preload="metadata">
          <source src={(status as any)?.audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>

        {/* Waveform Visualization */}
        <div className="bg-muted rounded-lg p-6 mb-4">
          <div className="flex items-center justify-center space-x-1 h-16">
            {/* Animated waveform bars */}
            {[20, 35, 45, 30, 55, 40, 25, 60, 35, 25, 45, 30].map((height, index) => (
              <div
                key={index}
                className={`w-1 rounded-full transition-all duration-300 ${
                  isPlaying ? 'bg-primary animate-pulse' : 'bg-primary/60'
                }`}
                style={{ height: `${height}px` }}
              />
            ))}
          </div>
          <div className="bg-gradient-to-r from-primary to-accent h-0.5 w-full mt-2 rounded-full" />
        </div>

        {/* Player Controls */}
        <div className="flex items-center space-x-4">
          <Button
            onClick={togglePlayback}
            size="lg"
            className="w-12 h-12 rounded-full p-0"
            data-testid="button-play-pause"
          >
            {isPlaying ? (
              <PauseCircle size={24} />
            ) : (
              <PlayCircle size={24} />
            )}
          </Button>

          <div className="flex-1">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
              <span data-testid="text-current-time">{formatTime(currentTime)}</span>
              <span data-testid="text-total-duration">{formatTime(duration)}</span>
            </div>
            <Slider
              value={[playbackProgress]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="w-full"
              data-testid="slider-progress"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Volume2 className="text-muted-foreground" size={20} />
            <Slider
              value={[volume]}
              onValueChange={(value) => setVolume(value[0])}
              max={100}
              step={1}
              className="w-20"
              data-testid="slider-volume"
            />
          </div>
        </div>

        {/* Playback Speed */}
        <div className="flex items-center justify-center space-x-2 mt-4">
          <span className="text-sm text-muted-foreground">Speed:</span>
          {speedOptions.map((speed) => (
            <Button
              key={speed}
              variant={playbackRate === speed ? "default" : "outline"}
              size="sm"
              onClick={() => setPlaybackRate(speed)}
              className="px-2 py-1 text-sm"
              data-testid={`button-speed-${speed}`}
            >
              {speed}x
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
