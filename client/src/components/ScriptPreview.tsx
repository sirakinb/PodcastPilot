import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, User } from "lucide-react";
import type { GeneratedScript } from "@shared/schema";

interface ScriptPreviewProps {
  podcastId: string;
}

export default function ScriptPreview({ podcastId }: ScriptPreviewProps) {
  const { data: status } = useQuery({
    queryKey: ["/api/podcast", podcastId, "status"],
    enabled: !!podcastId,
  });

  if (!(status as any)?.generatedScript?.segments?.length) {
    return null;
  }

  const script = (status as any)?.generatedScript as GeneratedScript;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="fade-in">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <FileText className="text-primary mr-2" size={20} />
          Generated Script Preview
        </h3>

        <ScrollArea className="max-h-96 border border-border rounded-lg p-4 bg-muted/30">
          <div className="space-y-4" data-testid="script-segments">
            {script.segments.map((segment, index) => (
              <div key={index} className="flex space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  segment.speaker === "male" 
                    ? "bg-blue-500" 
                    : "bg-pink-500"
                }`}>
                  <User className="text-white" size={16} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground" data-testid={`speaker-name-${index}`}>
                    {segment.name}
                  </p>
                  <p className="text-sm text-muted-foreground" data-testid={`speaker-content-${index}`}>
                    {segment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="mt-4">
          <span className="text-sm text-muted-foreground" data-testid="text-script-duration">
            Script length: ~{formatDuration(script.estimatedDuration)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
