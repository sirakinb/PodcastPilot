import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Download, Clock } from "lucide-react";
import type { Podcast } from "@shared/schema";

interface RecentGenerationsProps {
  podcasts?: Podcast[];
}

// Shared audio instance to prevent overlapping playback
let globalAudio: HTMLAudioElement | null = null;

export default function RecentGenerations({ podcasts = [] }: RecentGenerationsProps) {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (globalAudio) {
        globalAudio.pause();
        globalAudio = null;
      }
    };
  }, []);

  const handlePlay = (audioUrl: string, podcastId: string) => {
    if (!audioUrl) {
      console.error("No audio URL provided");
      return;
    }

    // If clicking the same audio that's currently playing, pause it
    if (currentlyPlaying === podcastId && globalAudio) {
      globalAudio.pause();
      setCurrentlyPlaying(null);
      return;
    }

    // If clicking the same audio that's paused, resume it
    if (globalAudio && globalAudio.src.includes(audioUrl.split('/').pop() || '')) {
      globalAudio.play().then(() => {
        setCurrentlyPlaying(podcastId);
      }).catch(error => {
        console.error("Failed to resume audio:", error);
        setCurrentlyPlaying(null);
      });
      return;
    }
    
    // Stop any currently playing audio and reset for new audio
    if (globalAudio) {
      globalAudio.pause();
      globalAudio.currentTime = 0;
      globalAudio = null;
    }

    // Create and play new audio
    globalAudio = new Audio(audioUrl);
    globalAudio.onended = () => setCurrentlyPlaying(null);
    globalAudio.onerror = (error) => {
      console.error("Failed to play audio:", error);
      setCurrentlyPlaying(null);
    };

    globalAudio.play().then(() => {
      setCurrentlyPlaying(podcastId);
    }).catch(error => {
      console.error("Failed to play audio:", error);
      setCurrentlyPlaying(null);
    });
  };

  const handleDownload = (podcastId: string, audioUrl: string) => {
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `podcast_${podcastId}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Less than an hour ago";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const truncateTitle = (title: string, maxLength: number = 50) => {
    return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
  };

  const truncateContent = (content: string, maxLength: number = 120) => {
    return content.length > maxLength ? `${content.substring(0, maxLength)}...` : content;
  };

  if (podcasts.length === 0) {
    return (
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-6">Recent Generations</h3>
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="mx-auto mb-4 text-muted-foreground" size={48} />
            <h4 className="font-semibold text-foreground mb-2">No podcasts yet</h4>
            <p className="text-muted-foreground">
              Generate your first AI podcast by pasting an article above and clicking "Generate Podcast".
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-2xl font-bold text-foreground mb-6" data-testid="heading-recent-generations">
        Recent Generations
      </h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {podcasts.map((podcast) => (
          <Card key={podcast.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-foreground" data-testid={`podcast-title-${podcast.id}`}>
                  {truncateTitle(podcast.title)}
                </h4>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2" data-testid={`podcast-time-${podcast.id}`}>
                  {formatTimeAgo(podcast.createdAt)}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2" data-testid={`podcast-content-${podcast.id}`}>
                {truncateContent(podcast.originalContent)}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground" data-testid={`podcast-duration-${podcast.id}`}>
                  {podcast.duration ? formatDuration(podcast.duration) : "Processing..."}
                </span>
                <div className="flex space-x-2">
                  {podcast.status === "completed" && podcast.audioUrl && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePlay(podcast.audioUrl!, podcast.id)}
                        className="text-primary hover:text-primary/80"
                        data-testid={`button-play-${podcast.id}`}
                      >
                        {currentlyPlaying === podcast.id ? <Pause size={16} /> : <Play size={16} />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(podcast.id, podcast.audioUrl!)}
                        className="text-primary hover:text-primary/80"
                        data-testid={`button-download-${podcast.id}`}
                      >
                        <Download size={16} />
                      </Button>
                    </>
                  )}
                  {podcast.status === "processing" && (
                    <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                      Processing...
                    </span>
                  )}
                  {podcast.status === "failed" && (
                    <span className="text-xs text-destructive px-2 py-1 bg-destructive/10 rounded">
                      Failed
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
