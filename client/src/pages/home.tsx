import { useState, useCallback } from "react";
import ContentInput from "@/components/ContentInput";
import VoiceSettings from "@/components/VoiceSettings";
import GenerationSettings from "@/components/GenerationSettings";
import ProcessingStatus from "@/components/ProcessingStatus";
import ScriptPreview from "@/components/ScriptPreview";
import AudioPlayer from "@/components/AudioPlayer";
import DownloadSection from "@/components/DownloadSection";
import { useToast } from "@/hooks/use-toast";
import type { PodcastGenerationRequest } from "@shared/schema";

export default function Home() {
  const [content, setContent] = useState("");
  const [currentPodcastId, setCurrentPodcastId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const [settings, setSettings] = useState<Omit<PodcastGenerationRequest, 'content'>>({
    maleVoice: "David",
    femaleVoice: "Sarah",
    maleSpeed: 1.0,
    femaleSpeed: 1.0,
    targetLength: "standard",
    tone: "conversational",
  });


  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  const handleSettingsChange = useCallback((newSettings: Partial<typeof settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!content.trim() || content.length < 100) {
      toast({
        title: "Content too short",
        description: "Please provide at least 100 characters of content to generate a podcast.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate-podcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, ...settings }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to generate podcast" }));
        throw new Error(errorData.error || "Failed to generate podcast");
      }

      const result = await response.json();
      setCurrentPodcastId(result.podcastId);
      
      toast({
        title: "Podcast generation started!",
        description: "Your podcast is being generated. This may take a few minutes.",
      });
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate podcast. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [content, settings, toast]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-primary to-purple-600 p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z"/>
                  <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5H10.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground" data-testid="app-title">PodcastPilot</h1>
                <p className="text-sm text-muted-foreground">AI-Generated Podcasts</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4" data-testid="hero-title">
            Transform Articles into Engaging Podcasts
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Paste any article or upload a document, and our AI will generate a natural conversation between two hosts 
            discussing the content in an engaging podcast format.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <ContentInput 
              content={content} 
              onContentChange={handleContentChange} 
            />
            
            <VoiceSettings 
              settings={settings} 
              onSettingsChange={handleSettingsChange} 
            />
            
            <GenerationSettings 
              settings={settings} 
              onSettingsChange={handleSettingsChange} 
            />

            <button 
              onClick={handleGenerate}
              disabled={!content.trim() || content.length < 100 || isGenerating}
              className="w-full bg-primary text-primary-foreground py-4 px-6 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-generate"
            >
              {isGenerating ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                  </svg>
                  <span>Generate Podcast</span>
                </>
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <ProcessingStatus podcastId={currentPodcastId} />
            
            {currentPodcastId && (
              <>
                <ScriptPreview podcastId={currentPodcastId} />
                <AudioPlayer podcastId={currentPodcastId} />
                <DownloadSection podcastId={currentPodcastId} />
              </>
            )}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">© 2025 PodcastPilot. Transform articles into engaging conversations.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
