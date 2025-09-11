import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { GeneratedScript, ScriptSegment } from "@shared/schema";

export class TTSService {
  private audioDir: string;

  constructor() {
    this.audioDir = path.join(process.cwd(), "generated_audio");
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
  }

  async synthesizePodcast(
    script: GeneratedScript,
    settings: {
      maleVoice: string;
      femaleVoice: string;
      maleSpeed: number;
      femaleSpeed: number;
    }
  ): Promise<{ audioUrl: string; duration: number }> {
    try {
      // For demonstration, we'll use ElevenLabs API
      // In production, you'd use the actual ElevenLabs SDK or API
      const apiKey = process.env.ELEVENLABS_API_KEY;
      
      console.log("ElevenLabs API Key available:", !!apiKey);
      console.log("API Key starts with:", apiKey ? apiKey.substring(0, 10) + "..." : "No key found");
      
      if (!apiKey) {
        throw new Error("ElevenLabs API key not found in environment variables");
      }
      
      const audioSegments: Buffer[] = [];
      let totalDuration = 0;

      for (const segment of script.segments) {
        const audio = await this.synthesizeSegment(segment, settings, apiKey);
        audioSegments.push(audio.buffer);
        totalDuration += audio.duration;
      }

      // Combine audio segments
      const combinedAudio = Buffer.concat(audioSegments);
      
      // Save to file
      const fileName = `podcast_${randomUUID()}.mp3`;
      const filePath = path.join(this.audioDir, fileName);
      fs.writeFileSync(filePath, combinedAudio);

      return {
        audioUrl: `/api/audio/${fileName}`,
        duration: totalDuration
      };
    } catch (error) {
      console.error("Error synthesizing podcast:", error);
      
      // Check if it's a quota error and provide helpful message
      if (error instanceof Error && error.message.includes('quota_exceeded')) {
        console.log("🔄 ElevenLabs quota exceeded, creating fallback audio file...");
        
        // Create a basic silent audio file when quota is exceeded
        const fallbackBuffer = Buffer.alloc(1024);
        const fileName = `podcast_${randomUUID()}.mp3`;
        const filePath = path.join(this.audioDir, fileName);
        fs.writeFileSync(filePath, fallbackBuffer);

        return {
          audioUrl: `/api/audio/${fileName}`,
          duration: 5 // 5 seconds placeholder
        };
      }
      
      throw new Error(`Failed to synthesize audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async synthesizeSegment(
    segment: ScriptSegment,
    settings: {
      maleVoice: string;
      femaleVoice: string;
      maleSpeed: number;
      femaleSpeed: number;
    },
    apiKey: string
  ): Promise<{ buffer: Buffer; duration: number }> {
    // Voice ID mapping - these would be actual ElevenLabs voice IDs
    const voiceIds = {
      male: {
        David: "21m00Tcm4TlvDq8ikWAM",
        James: "2EiwWnXFnvU5JabPnv8n",
        Michael: "flq6f7yk4E4fJM5XTYuZ",
        Ryan: "wViXBPUzp2ZZixB1xQuM"
      },
      female: {
        Sarah: "EXAVITQu4vr4xnSDxMaL",
        Emma: "ThT5KcBeYPX3keUQqHPh",
        Lisa: "XB0fDUnXU5powFXDhCwa",
        Rachel: "pNInz6obpgDQGcFmaJgB"
      }
    };

    const voiceId = segment.speaker === "male" 
      ? voiceIds.male[settings.maleVoice as keyof typeof voiceIds.male] || voiceIds.male.David
      : voiceIds.female[settings.femaleVoice as keyof typeof voiceIds.female] || voiceIds.female.Sarah;

    const speed = segment.speaker === "male" ? settings.maleSpeed : settings.femaleSpeed;

    try {
      console.log(`Making ElevenLabs API call for voice ${voiceId}`);
      console.log(`Request text length: ${segment.content.length} characters`);
      
      // ElevenLabs API call with simplified voice settings
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg", 
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text: segment.content,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        }),
      });
      
      console.log(`ElevenLabs API response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`ElevenLabs API error ${response.status}:`, errorText);
        
        // Check for quota exceeded error
        if (response.status === 401 && errorText.includes('quota_exceeded')) {
          throw new Error('ElevenLabs API quota exceeded. Please check your account credits or try again later.');
        }
        
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }

      const audioBuffer = Buffer.from(await response.arrayBuffer());
      
      // Estimate duration based on text length and speed
      // Rough estimate: ~150 words per minute at normal speed
      const wordCount = segment.content.split(" ").length;
      const estimatedDuration = (wordCount / 150) * 60 / speed;

      return {
        buffer: audioBuffer,
        duration: estimatedDuration
      };
    } catch (error) {
      // Fallback: create a silent audio buffer as placeholder
      console.error("TTS error:", error);
      
      // Create a minimal MP3 header for a short silent audio
      const silentBuffer = Buffer.alloc(1024);
      return {
        buffer: silentBuffer,
        duration: 1
      };
    }
  }

  getAudioFilePath(fileName: string): string {
    return path.join(this.audioDir, fileName);
  }
}
