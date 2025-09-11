import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import ContentInput from "@/components/ContentInput";
import VoiceSettings from "@/components/VoiceSettings";
import GenerationSettings from "@/components/GenerationSettings";
import ProcessingStatus from "@/components/ProcessingStatus";
import ScriptPreview from "@/components/ScriptPreview";
import AudioPlayer from "@/components/AudioPlayer";
import DownloadSection from "@/components/DownloadSection";
import RecentGenerations from "@/components/RecentGenerations";
import type { PodcastGenerationRequest } from "@shared/schema";

export default function Home() {
  const [content, setContent] = useState("");
  const [currentPodcastId, setCurrentPodcastId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Omit<PodcastGenerationRequest, 'content'>>({
    maleVoice: "David",
    femaleVoice: "Sarah",
    maleSpeed: 1.0,
    femaleSpeed: 1.0,
    targetLength: "standard",
    tone: "conversational",
    includeIntro: true,
    addMusic: false,
  });

  const { data: recentPodcasts } = useQuery({
    queryKey: ["/api/podcasts/recent"],
    refetchInterval: 30000,
  });

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  const handleSettingsChange = useCallback((newSettings: Partial<typeof settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!content.trim() || content.length < 100) {
      return;
    }

    try {
      const response = await fetch("/api/generate-podcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, ...settings }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate podcast");
      }

      const result = await response.json();
      setCurrentPodcastId(result.podcastId);
    } catch (error) {
      console.error("Generation error:", error);
    }
  }, [content, settings]);

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
                <h1 className="text-xl font-bold text-foreground" data-testid="app-title">PodcastAI</h1>
                <p className="text-sm text-muted-foreground">AI-Generated Podcasts</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Examples</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            </nav>
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
              disabled={!content.trim() || content.length < 100}
              className="w-full bg-primary text-primary-foreground py-4 px-6 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-generate"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
              </svg>
              <span>Generate Podcast</span>
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

        {/* Recent Generations */}
        <div className="mt-12">
          <RecentGenerations podcasts={recentPodcasts as any} />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">© 2024 PodcastAI. Transform articles into engaging conversations.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
