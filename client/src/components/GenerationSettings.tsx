import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings } from "lucide-react";
import type { PodcastGenerationRequest } from "@shared/schema";

interface GenerationSettingsProps {
  settings: Omit<PodcastGenerationRequest, 'content'>;
  onSettingsChange: (settings: Partial<Omit<PodcastGenerationRequest, 'content'>>) => void;
}

const lengthOptions = [
  { value: "brief", label: "3-5 minutes (Brief)" },
  { value: "standard", label: "5-8 minutes (Standard)" },
  { value: "detailed", label: "8-12 minutes (Detailed)" },
  { value: "indepth", label: "12-15 minutes (In-depth)" },
] as const;

const toneOptions = [
  { value: "professional", label: "Professional & Informative" },
  { value: "conversational", label: "Conversational & Engaging" },
  { value: "casual", label: "Casual & Friendly" },
  { value: "academic", label: "Academic & Analytical" },
] as const;

export default function GenerationSettings({ settings, onSettingsChange }: GenerationSettingsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Settings className="text-primary mr-2" size={20} />
          Podcast Settings
        </h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="podcast-length" className="block text-sm font-medium text-foreground mb-2">
              Target Length
            </Label>
            <Select
              value={settings.targetLength}
              onValueChange={(value: typeof settings.targetLength) => onSettingsChange({ targetLength: value })}
            >
              <SelectTrigger data-testid="select-target-length">
                <SelectValue placeholder="Select target length" />
              </SelectTrigger>
              <SelectContent>
                {lengthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="discussion-tone" className="block text-sm font-medium text-foreground mb-2">
              Discussion Tone
            </Label>
            <Select
              value={settings.tone}
              onValueChange={(value: typeof settings.tone) => onSettingsChange({ tone: value })}
            >
              <SelectTrigger data-testid="select-discussion-tone">
                <SelectValue placeholder="Select discussion tone" />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-intro"
              checked={settings.includeIntro}
              onCheckedChange={(checked) => onSettingsChange({ includeIntro: !!checked })}
              data-testid="checkbox-include-intro"
            />
            <Label htmlFor="include-intro" className="text-sm text-foreground">
              Include intro and outro
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="add-music"
              checked={settings.addMusic}
              onCheckedChange={(checked) => onSettingsChange({ addMusic: !!checked })}
              data-testid="checkbox-add-music"
            />
            <Label htmlFor="add-music" className="text-sm text-foreground">
              Add background music
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
