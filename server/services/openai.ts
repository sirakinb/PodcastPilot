import OpenAI from "openai";
import type { PodcastGenerationRequest, GeneratedScript } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export class OpenAIService {
  async generatePodcastScript(content: string, settings: PodcastGenerationRequest): Promise<GeneratedScript> {
    const lengthInstructions = {
      brief: "3-5 minutes (about 450-750 words)",
      standard: "5-8 minutes (about 750-1200 words)",
      detailed: "8-12 minutes (about 1200-1800 words)",
      indepth: "12-15 minutes (about 1800-2250 words)"
    };

    const toneInstructions = {
      professional: "professional and informative tone with authoritative delivery",
      conversational: "conversational and engaging tone with natural flow",
      casual: "casual and friendly tone with relaxed interaction",
      academic: "academic and analytical tone with detailed explanations"
    };

    const prompt = `You are an expert podcast script writer. Create an engaging dialogue between two podcast hosts discussing the following article content.

ARTICLE CONTENT:
${content}

REQUIREMENTS:
- Target length: ${lengthInstructions[settings.targetLength]}
- Discussion tone: ${toneInstructions[settings.tone]}
- Male host voice: ${settings.maleVoice}
- Female host voice: ${settings.femaleVoice}
- Include intro and outro: ${settings.includeIntro}

SCRIPT FORMAT:
- Create natural, engaging dialogue between the two hosts
- The male host should be knowledgeable and provide context
- The female host should ask insightful questions and provide analysis
- Include natural transitions, pauses, and conversational elements
- Make sure the discussion covers the key points from the article
- Keep the conversation flowing naturally without being repetitive

${settings.includeIntro ? 'Start with a brief intro where hosts introduce themselves and the topic.' : ''}
${settings.includeIntro ? 'End with a brief outro and closing remarks.' : ''}

Return the response as JSON in this exact format:
{
  "segments": [
    {
      "speaker": "male",
      "name": "${settings.maleVoice}",
      "content": "Welcome to our podcast..."
    },
    {
      "speaker": "female", 
      "name": "${settings.femaleVoice}",
      "content": "Thank you, and today we're discussing..."
    }
  ],
  "estimatedDuration": 360
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are an expert podcast script writer who creates engaging, natural conversations between two hosts. Always respond with valid JSON in the specified format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 1.0,
        max_completion_tokens: 4000,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      if (!result.segments || !Array.isArray(result.segments)) {
        throw new Error("Invalid script format returned from OpenAI");
      }

      return result as GeneratedScript;
    } catch (error) {
      console.error("Error generating podcast script:", error);
      throw new Error(`Failed to generate podcast script: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async analyzeContent(content: string): Promise<{ title: string; summary: string; keyPoints: string[] }> {
    const prompt = `Analyze the following content and provide a title, summary, and key points for a podcast discussion.

CONTENT:
${content}

Return the response as JSON in this exact format:
{
  "title": "Brief, engaging title for the podcast episode",
  "summary": "2-3 sentence summary of the main topic",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are an expert content analyst. Always respond with valid JSON in the specified format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 1.0,
        max_completion_tokens: 500,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result;
    } catch (error) {
      console.error("Error analyzing content:", error);
      throw new Error(`Failed to analyze content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
