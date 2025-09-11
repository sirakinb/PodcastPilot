import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import mammoth from "mammoth";
import { storage } from "./storage";
import { OpenAIService } from "./services/openai";
import { TTSService } from "./services/tts";
import { podcastGenerationRequestSchema } from "@shared/schema";
import path from "path";
import fs from "fs";

const upload = multer({ dest: "uploads/" });
const openaiService = new OpenAIService();
const ttsService = new TTSService();

export async function registerRoutes(app: Express): Promise<Server> {
  // File upload endpoint for document processing
  app.post("/api/upload-document", upload.single("document"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      let content: string;

      if (req.file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        // Handle .docx files
        const result = await mammoth.extractRawText({ path: req.file.path });
        content = result.value;
      } else if (req.file.mimetype === "text/plain") {
        // Handle .txt files
        content = fs.readFileSync(req.file.path, "utf-8");
      } else {
        return res.status(400).json({ error: "Unsupported file type. Please upload .docx or .txt files." });
      }

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      if (content.length < 100) {
        return res.status(400).json({ error: "Document content is too short. Please provide at least 100 characters." });
      }

      res.json({ content });
    } catch (error) {
      console.error("Document upload error:", error);
      res.status(500).json({ error: "Failed to process document" });
    }
  });

  // Content analysis endpoint
  app.post("/api/analyze-content", async (req, res) => {
    try {
      const { content } = req.body;

      if (!content || typeof content !== "string" || content.length < 100) {
        return res.status(400).json({ error: "Content must be at least 100 characters long" });
      }

      const analysis = await openaiService.analyzeContent(content);
      res.json(analysis);
    } catch (error) {
      console.error("Content analysis error:", error);
      res.status(500).json({ error: "Failed to analyze content" });
    }
  });

  // Podcast generation endpoint
  app.post("/api/generate-podcast", async (req, res) => {
    try {
      const validatedData = podcastGenerationRequestSchema.parse(req.body);

      // Create podcast record
      const podcast = await storage.createPodcast({
        title: "Generated Podcast",
        originalContent: validatedData.content,
        generatedScript: { segments: [], estimatedDuration: 0 },
        audioUrl: null,
        duration: null,
        settings: validatedData,
        status: "processing"
      });

      // Start async generation process
      generatePodcastAsync(podcast.id, validatedData);

      res.json({ podcastId: podcast.id, status: "processing" });
    } catch (error) {
      console.error("Podcast generation error:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid request data", details: error.message });
      }
      res.status(500).json({ error: "Failed to start podcast generation" });
    }
  });

  // Podcast status endpoint
  app.get("/api/podcast/:id/status", async (req, res) => {
    try {
      const podcast = await storage.getPodcast(req.params.id);
      if (!podcast) {
        return res.status(404).json({ error: "Podcast not found" });
      }

      res.json({
        id: podcast.id,
        status: podcast.status,
        title: podcast.title,
        generatedScript: podcast.generatedScript,
        audioUrl: podcast.audioUrl,
        duration: podcast.duration
      });
    } catch (error) {
      console.error("Status check error:", error);
      res.status(500).json({ error: "Failed to get podcast status" });
    }
  });

  // Audio serving endpoint
  app.get("/api/audio/:fileName", (req, res) => {
    try {
      const fileName = req.params.fileName;
      const filePath = ttsService.getAudioFilePath(fileName);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Audio file not found" });
      }

      const stat = fs.statSync(filePath);
      res.writeHead(200, {
        "Content-Type": "audio/mpeg",
        "Content-Length": stat.size,
        "Cache-Control": "public, max-age=3600",
      });

      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);
    } catch (error) {
      console.error("Audio serving error:", error);
      res.status(500).json({ error: "Failed to serve audio file" });
    }
  });

  // Get recent podcasts
  app.get("/api/podcasts/recent", async (req, res) => {
    try {
      const podcasts = await storage.getRecentPodcasts();
      res.json(podcasts);
    } catch (error) {
      console.error("Recent podcasts error:", error);
      res.status(500).json({ error: "Failed to get recent podcasts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Async function to handle podcast generation
async function generatePodcastAsync(podcastId: string, settings: any) {
  try {
    // Update status to script generation
    await storage.updatePodcastStatus(podcastId, "generating_script");

    // Generate script
    const script = await openaiService.generatePodcastScript(settings.content, settings);
    
    // Update with generated script
    await storage.updatePodcast(podcastId, {
      generatedScript: script,
      status: "generating_audio"
    });

    // Generate audio
    const audioResult = await ttsService.synthesizePodcast(script, {
      maleVoice: settings.maleVoice,
      femaleVoice: settings.femaleVoice,
      maleSpeed: settings.maleSpeed,
      femaleSpeed: settings.femaleSpeed
    });

    // Update with completed audio
    await storage.updatePodcast(podcastId, {
      audioUrl: audioResult.audioUrl,
      duration: Math.round(audioResult.duration),
      status: "completed"
    });

  } catch (error) {
    console.error("Async generation error:", error);
    await storage.updatePodcastStatus(podcastId, "failed");
  }
}
