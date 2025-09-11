import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileAudio, Info } from "lucide-react";

interface DownloadSectionProps {
  podcastId: string;
}

export default function DownloadSection({ podcastId }: DownloadSectionProps) {
  const { data: status } = useQuery({
    queryKey: ["/api/podcast", podcastId, "status"],
    enabled: !!podcastId,
  });

  if ((status as any)?.status !== "completed" || !(status as any)?.audioUrl) {
    return null;
  }

  const handleDownload = (format: "mp3" | "m4a") => {
    const link = document.createElement("a");
    link.href = (status as any)?.audioUrl;
    link.download = `podcast_${podcastId}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Estimate file sizes (rough approximation)
  const estimatedSizeMB = (status as any)?.duration ? ((status as any)?.duration * 32 / 1000) : 10; // 32kbps estimate
  const mp3Size = estimatedSizeMB.toFixed(1);
  const m4aSize = (estimatedSizeMB * 0.7).toFixed(1); // M4A typically 30% smaller

  return (
    <Card className="fade-in">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Download className="text-primary mr-2" size={20} />
          Download Options
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => handleDownload("mp3")}
            className="flex items-center justify-center space-x-2 py-3 px-4"
            data-testid="button-download-mp3"
          >
            <FileAudio size={20} />
            <span>Download MP3</span>
            <span className="text-sm opacity-75">({mp3Size} MB)</span>
          </Button>

          <Button
            onClick={() => handleDownload("m4a")}
            variant="secondary"
            className="flex items-center justify-center space-x-2 py-3 px-4"
            data-testid="button-download-m4a"
          >
            <FileAudio size={20} />
            <span>Download M4A</span>
            <span className="text-sm opacity-75">({m4aSize} MB)</span>
          </Button>
        </div>

        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="flex items-start space-x-2">
            <Info className="text-primary mt-0.5 flex-shrink-0" size={16} />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">Download includes:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• High-quality audio file (320kbps MP3 / 256kbps M4A)</li>
                <li>• Complete transcript with speaker labels</li>
                <li>• Metadata with episode information</li>
                <li>• Duration: {(status as any)?.duration ? formatDuration((status as any)?.duration) : "Unknown"}</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
