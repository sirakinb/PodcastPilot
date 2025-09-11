import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Volume2, User } from "lucide-react";
import type { PodcastGenerationRequest } from "@shared/schema";

interface VoiceSettingsProps {
  settings: Omit<PodcastGenerationRequest, 'content'>;
  onSettingsChange: (settings: Partial<Omit<PodcastGenerationRequest, 'content'>>) => void;
}

const maleVoices = [
  { id: "David", name: "David (Professional)" },
  { id: "James", name: "James (Conversational)" },
  { id: "Michael", name: "Michael (Authoritative)" },
  { id: "Ryan", name: "Ryan (Friendly)" },
];

const femaleVoices = [
  { id: "Sarah", name: "Sarah (Professional)" },
  { id: "Emma", name: "Emma (Engaging)" },
  { id: "Lisa", name: "Lisa (Warm)" },
  { id: "Rachel", name: "Rachel (Enthusiastic)" },
];

export default function VoiceSettings({ settings, onSettingsChange }: VoiceSettingsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Volume2 className="text-primary mr-2" size={20} />
          Voice Settings
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Male Host */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground flex items-center">
              <User className="text-blue-500 mr-2" size={16} />
              Male Host Voice
            </Label>
            <Select
              value={settings.maleVoice}
              onValueChange={(value) => onSettingsChange({ maleVoice: value })}
            >
              <SelectTrigger data-testid="select-male-voice">
                <SelectValue placeholder="Select male voice" />
              </SelectTrigger>
              <SelectContent>
                {maleVoices.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    {voice.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Label className="text-sm text-muted-foreground">Speed:</Label>
              <Slider
                value={[settings.maleSpeed]}
                onValueChange={(value) => onSettingsChange({ maleSpeed: value[0] })}
                min={0.7}
                max={1.3}
                step={0.1}
                className="flex-1"
                data-testid="slider-male-speed"
              />
              <span className="text-sm text-muted-foreground w-12 text-right" data-testid="text-male-speed">
                {settings.maleSpeed.toFixed(1)}x
              </span>
            </div>
          </div>

          {/* Female Host */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground flex items-center">
              <User className="text-pink-500 mr-2" size={16} />
              Female Host Voice
            </Label>
            <Select
              value={settings.femaleVoice}
              onValueChange={(value) => onSettingsChange({ femaleVoice: value })}
            >
              <SelectTrigger data-testid="select-female-voice">
                <SelectValue placeholder="Select female voice" />
              </SelectTrigger>
              <SelectContent>
                {femaleVoices.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    {voice.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Label className="text-sm text-muted-foreground">Speed:</Label>
              <Slider
                value={[settings.femaleSpeed]}
                onValueChange={(value) => onSettingsChange({ femaleSpeed: value[0] })}
                min={0.7}
                max={1.3}
                step={0.1}
                className="flex-1"
                data-testid="slider-female-speed"
              />
              <span className="text-sm text-muted-foreground w-12 text-right" data-testid="text-female-speed">
                {settings.femaleSpeed.toFixed(1)}x
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
